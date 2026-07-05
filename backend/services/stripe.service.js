const Stripe = require('stripe');
const config = require('../config/env.config');
const logger = require('../utils/logger');

/**
 * Thin Stripe wrapper. The client is created lazily and only when billing is
 * configured, so importing this module never crashes an unconfigured deploy.
 * Callers should guard with `isConfigured()` (or handle the thrown error).
 */
let client = null;

function isConfigured() {
  return config.stripe.isConfigured;
}

function getClient() {
  if (!isConfigured()) {
    const err = new Error('Billing is not configured');
    err.code = 'BILLING_NOT_CONFIGURED';
    throw err;
  }
  if (!client) {
    client = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-06-20',
      appInfo: { name: 'Dayla', url: config.frontendUrl },
    });
  }
  return client;
}

/**
 * Get-or-create the Stripe customer for a user, reusing a stored id so repeat
 * checkouts never create duplicate customers. Returns the customer id and
 * whether it was newly created (caller persists it).
 */
async function ensureCustomer(user) {
  const stripe = getClient();
  if (user.stripeCustomerId) {
    // Verify it still exists (a deleted customer would 404 on checkout).
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (existing && !existing.deleted) return { customerId: existing.id, created: false };
    } catch (e) {
      logger.warn(`Stored Stripe customer ${user.stripeCustomerId} not retrievable; creating a new one.`);
    }
  }
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
  return { customerId: customer.id, created: true };
}

/**
 * Create a subscription Checkout Session for a customer + price.
 * `successUrl`/`cancelUrl` come from the caller (built off FRONTEND_URL).
 */
async function createCheckoutSession({ customerId, priceId, userId, successUrl, cancelUrl }) {
  const stripe = getClient();
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    client_reference_id: userId.toString(),
    subscription_data: { metadata: { userId: userId.toString() } },
    metadata: { userId: userId.toString() },
  });
}

/** Create a Billing Portal session so the user can manage/cancel their plan. */
async function createPortalSession({ customerId, returnUrl }) {
  const stripe = getClient();
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

/** Verify + construct a webhook event from the raw body and signature header. */
function constructWebhookEvent(rawBody, signature) {
  const stripe = getClient();
  return stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
}

/** Fetch a subscription (used by webhook handlers needing full detail). */
async function retrieveSubscription(subscriptionId) {
  const stripe = getClient();
  return stripe.subscriptions.retrieve(subscriptionId);
}

module.exports = {
  isConfigured,
  getClient,
  ensureCustomer,
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  retrieveSubscription,
};
