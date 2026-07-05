const config = require('../config/env.config');
const logger = require('../utils/logger');
const stripeService = require('../services/stripe.service');
const permissions = require('../utils/permissions');
const plans = require('../config/plans');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const BillingEvent = require('../models/billingEvent.model');

// ── helpers ─────────────────────────────────────────────────────────────────

function notConfigured(res) {
  return res.status(503).json({
    success: false,
    code: 'BILLING_NOT_CONFIGURED',
    message: 'Billing is not available right now.',
  });
}

// Billing metrics are for admins only (reuses the ADMIN_EMAILS list).
function isAdmin(user) {
  return config.adminEmails.includes(((user && user.email) || '').toLowerCase());
}

// Stripe subscription.status → our status enum.
function mapStatus(stripeStatus) {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'unpaid': return 'past_due';
    case 'canceled': return 'canceled';
    case 'incomplete': return 'incomplete';
    case 'incomplete_expired': return 'inactive';
    case 'paused': return 'inactive';
    default: return 'inactive';
  }
}

// Whether a subscription in this state should grant the user the 'pro' snapshot.
function deriveType(status, cancelAtPeriodEnd, periodEndMs) {
  if (status === 'active' || status === 'trialing' || status === 'past_due') return 'pro';
  if (status === 'canceled' && cancelAtPeriodEnd && periodEndMs > Date.now()) return 'pro';
  return 'free';
}

function toDate(seconds) {
  return seconds ? new Date(seconds * 1000) : null;
}

/**
 * Apply a full Stripe subscription object to our ledger + user snapshot.
 * Idempotent and order-safe: stale events (older than the last applied) are
 * ignored via `lastStripeEventAt`.
 */
async function applySubscription(sub, eventCreatedAt) {
  const priceObj = sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price;
  const priceId = priceObj ? priceObj.id : null;
  const plan = plans.planForPriceId(priceId);

  // Resolve the owning user.
  let userId = sub.metadata && sub.metadata.userId;
  let user = null;
  if (userId) user = await User.findById(userId);
  if (!user) {
    const existing = await Subscription.findOne({ stripeSubscriptionId: sub.id });
    if (existing) user = await User.findById(existing.user);
  }
  if (!user && sub.customer) user = await User.findOne({ stripeCustomerId: sub.customer });
  if (!user) {
    logger.warn(`Webhook: could not attribute subscription ${sub.id} to a user`);
    return null;
  }

  const status = mapStatus(sub.status);
  const periodStart = toDate(sub.current_period_start);
  const periodEnd = toDate(sub.current_period_end);
  const cancelAtPeriodEnd = !!sub.cancel_at_period_end;
  const billingCycle = plan ? plan.billingCycle : null;

  // Ledger upsert with staleness guard.
  const existing = await Subscription.findOne({ stripeSubscriptionId: sub.id });
  if (existing && existing.lastStripeEventAt > eventCreatedAt) {
    logger.info(`Webhook: ignoring stale event for subscription ${sub.id}`);
    return user;
  }

  const ledger = existing || new Subscription({ user: user._id, stripeSubscriptionId: sub.id });
  ledger.user = user._id;
  ledger.planType = 'pro';
  ledger.status = status;
  ledger.billingCycle = billingCycle;
  ledger.stripeCustomerId = sub.customer || ledger.stripeCustomerId;
  ledger.stripePriceId = priceId;
  ledger.amount = priceObj ? (priceObj.unit_amount || 0) : ledger.amount;
  ledger.currency = priceObj ? (priceObj.currency || 'eur') : ledger.currency;
  ledger.currentPeriodStart = periodStart;
  ledger.currentPeriodEnd = periodEnd;
  ledger.cancelAtPeriodEnd = cancelAtPeriodEnd;
  ledger.canceledAt = sub.canceled_at ? toDate(sub.canceled_at) : ledger.canceledAt;
  ledger.lastStripeEventAt = eventCreatedAt;
  await ledger.save();

  // Sync the user snapshot.
  const type = deriveType(status, cancelAtPeriodEnd, periodEnd ? periodEnd.getTime() : 0);
  user.subscriptionType = type;
  user.subscriptionStatus = status;
  user.billingCycle = billingCycle;
  user.cancelAtPeriodEnd = cancelAtPeriodEnd;
  user.stripeCustomerId = sub.customer || user.stripeCustomerId;
  user.stripeSubscriptionId = sub.id;
  user.currentPeriodStart = periodStart;
  user.currentPeriodEnd = periodEnd;
  await user.save({ validateBeforeSave: false });

  return user;
}

// ── endpoints ───────────────────────────────────────────────────────────────

// @desc  Public plan catalogue for the pricing page
// @route GET /api/billing/plans
const getPlans = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { plans: plans.publicCatalogue(), billingEnabled: stripeService.isConfigured() },
  });
};

// @desc  Current user's subscription + feature access
// @route GET /api/billing/subscription
const getSubscription = async (req, res) => {
  try {
    const ledger = await Subscription.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: {
        subscription: req.user.subscriptionSnapshot,
        access: permissions.featureAccess(req.user),
        billing: ledger
          ? {
              amount: ledger.amount,
              currency: ledger.currency,
              billingCycle: ledger.billingCycle,
              currentPeriodEnd: ledger.currentPeriodEnd,
              cancelAtPeriodEnd: ledger.cancelAtPeriodEnd,
              status: ledger.status,
            }
          : null,
        billingEnabled: stripeService.isConfigured(),
      },
    });
  } catch (error) {
    logger.error('getSubscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to load subscription' });
  }
};

// @desc  Start a Stripe Checkout Session
// @route POST /api/billing/create-checkout-session   body { cycle: 'monthly'|'annual' }
const createCheckoutSession = async (req, res) => {
  try {
    if (!stripeService.isConfigured()) return notConfigured(res);

    const cycle = req.body.cycle === 'annual' ? 'annual' : 'monthly';
    const priceId = plans.priceIdForCycle(cycle);
    if (!priceId) return notConfigured(res);

    // Already Pro? Send them to the portal instead of a second subscription.
    if (permissions.isPro(req.user)) {
      return res.status(400).json({
        success: false,
        code: 'ALREADY_PRO',
        message: 'You already have an active Pro subscription.',
      });
    }

    const { customerId, created } = await stripeService.ensureCustomer(req.user);
    if (created || req.user.stripeCustomerId !== customerId) {
      req.user.stripeCustomerId = customerId;
      await req.user.save({ validateBeforeSave: false });
    }

    const base = config.frontendUrl.replace(/\/$/, '');
    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId,
      userId: req.user._id,
      successUrl: `${base}/?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/?billing=cancel`,
    });

    // Record the session creation (best-effort) so admin analytics can compute
    // checkout conversion = completed / created. The Stripe session id (cs_…) is
    // unique, so it doubles as the idempotency key.
    try {
      await BillingEvent.create({
        stripeEventId: session.id,
        type: 'checkout.session.created',
        stripeCustomerId: customerId,
        user: req.user._id,
        summary: `checkout session created (${cycle})`,
        eventCreatedAt: Math.floor(Date.now() / 1000),
      });
    } catch (e) {
      /* never block checkout on analytics */
    }

    res.status(200).json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (error) {
    logger.error('createCheckoutSession error:', error);
    res.status(500).json({ success: false, message: 'Could not start checkout' });
  }
};

// @desc  Open the Stripe Billing Portal
// @route POST /api/billing/customer-portal
const createCustomerPortal = async (req, res) => {
  try {
    if (!stripeService.isConfigured()) return notConfigured(res);
    if (!req.user.stripeCustomerId) {
      return res.status(400).json({ success: false, message: 'No billing account yet. Upgrade to Pro first.' });
    }
    const base = config.frontendUrl.replace(/\/$/, '');
    const session = await stripeService.createPortalSession({
      customerId: req.user.stripeCustomerId,
      returnUrl: `${base}/?billing=portal_return`,
    });
    res.status(200).json({ success: true, data: { url: session.url } });
  } catch (error) {
    logger.error('createCustomerPortal error:', error);
    res.status(500).json({ success: false, message: 'Could not open the billing portal' });
  }
};

// @desc  Stripe webhook (raw body, unauthenticated, signature-verified)
// @route POST /api/billing/webhook
const handleWebhook = async (req, res) => {
  if (!stripeService.isConfigured() || !config.stripe.webhookSecret) {
    return res.status(503).send('Billing not configured');
  }

  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, req.headers['stripe-signature']);
  } catch (err) {
    logger.warn(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: a duplicate delivery is a no-op success.
  const already = await BillingEvent.findOne({ stripeEventId: event.id });
  if (already) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    let user = null;
    let summary = '';
    const obj = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        if (obj.subscription) {
          const sub = await stripeService.retrieveSubscription(obj.subscription);
          if (!sub.metadata) sub.metadata = {};
          if (!sub.metadata.userId && obj.client_reference_id) sub.metadata.userId = obj.client_reference_id;
          user = await applySubscription(sub, event.created);
          summary = `checkout complete → ${sub.status}`;
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        user = await applySubscription(obj, event.created);
        summary = `subscription ${event.type.split('.').pop()} → ${obj.status}`;
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const subId = obj.subscription;
        if (subId) {
          const sub = await stripeService.retrieveSubscription(subId);
          user = await applySubscription(sub, event.created);
        }
        summary = `${event.type} → ${obj.status || ''}`;
        break;
      }
      default:
        summary = 'ignored';
    }

    // Record the event (also completes the idempotency contract).
    await BillingEvent.create({
      stripeEventId: event.id,
      type: event.type,
      stripeCustomerId: (event.data.object && event.data.object.customer) || null,
      stripeSubscriptionId:
        (event.data.object && (event.data.object.subscription || event.data.object.id)) || null,
      user: user ? user._id : null,
      summary,
      eventCreatedAt: event.created,
    });

    logger.info(`Webhook processed: ${event.type} (${event.id}) — ${summary}`);
    return res.status(200).json({ received: true });
  } catch (error) {
    // A duplicate insert (concurrent retry) means another worker handled it.
    if (error && error.code === 11000) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    logger.error(`Webhook handler error for ${event.type}:`, error);
    // 500 tells Stripe to retry later.
    return res.status(500).json({ received: false });
  }
};

// @desc  Admin subscription/revenue analytics
// @route GET /api/billing/admin/metrics   (ADMIN_EMAILS only)
const getAdminMetrics = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 86400000);
    const ago30 = new Date(now.getTime() - 30 * 86400000);

    const [total, active, trialing, pastDue, canceled, newLast30, churnedLast30, createdCheckouts, completedCheckouts] =
      await Promise.all([
        Subscription.countDocuments({}),
        Subscription.countDocuments({ status: 'active' }),
        Subscription.countDocuments({ status: 'trialing' }),
        Subscription.countDocuments({ status: 'past_due' }),
        Subscription.countDocuments({ status: 'canceled' }),
        Subscription.countDocuments({ createdAt: { $gte: ago30 } }),
        Subscription.countDocuments({ status: 'canceled', canceledAt: { $gte: ago30 } }),
        BillingEvent.countDocuments({ type: 'checkout.session.created' }),
        BillingEvent.countDocuments({ type: 'checkout.session.completed' }),
      ]);

    // MRR: normalize each active/trialing subscription to a monthly figure.
    const revenueSubs = await Subscription.find({ status: { $in: ['active', 'trialing'] } }).select('amount billingCycle');
    let mrrCents = 0;
    for (const s of revenueSubs) {
      mrrCents += s.billingCycle === 'annual' ? (s.amount || 0) / 12 : (s.amount || 0);
    }
    const mrr = Math.round(mrrCents) / 100;
    const arr = Math.round(mrrCents * 12) / 100;

    // 30-day churn: canceled in the window over (currently active + those churned).
    const churnRate = active + churnedLast30 > 0 ? churnedLast30 / (active + churnedLast30) : 0;

    // Upcoming renewals (next 7 days, not scheduled to cancel).
    const renewalDocs = await Subscription.find({
      status: { $in: ['active', 'trialing'] },
      cancelAtPeriodEnd: false,
      currentPeriodEnd: { $gte: now, $lte: in7 },
    })
      .populate('user', 'name email')
      .sort({ currentPeriodEnd: 1 })
      .limit(50);

    const renewals = renewalDocs.map((s) => ({
      name: s.user ? s.user.name : null,
      email: s.user ? s.user.email : null,
      billingCycle: s.billingCycle,
      currentPeriodEnd: s.currentPeriodEnd,
      amount: (s.amount || 0) / 100,
    }));

    const conversionRate = createdCheckouts > 0 ? completedCheckouts / createdCheckouts : 0;

    res.status(200).json({
      success: true,
      data: {
        currency: 'eur',
        subscribers: { total, active, trialing, pastDue, canceled },
        revenue: { mrr, arr },
        growth: { newLast30Days: newLast30 },
        churn: { last30Days: churnedLast30, rate: Math.round(churnRate * 1000) / 1000 },
        renewals: { next7Days: renewals.length, items: renewals },
        checkout: {
          created: createdCheckouts,
          completed: completedCheckouts,
          conversionRate: Math.round(conversionRate * 1000) / 1000,
        },
        generatedAt: now,
      },
    });
  } catch (error) {
    logger.error('getAdminMetrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load metrics' });
  }
};

module.exports = {
  getPlans,
  getSubscription,
  createCheckoutSession,
  createCustomerPortal,
  handleWebhook,
  getAdminMetrics,
};
