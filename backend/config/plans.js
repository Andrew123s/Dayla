/**
 * Plan catalogue — the ONE place plans, prices, limits and the feature matrix
 * live. Everything else (permissions, middleware, the frontend pricing page via
 * GET /api/billing/plans) reads from here, so a new plan is a config entry, not
 * a code hunt.
 *
 * Stripe price IDs come from env (never hardcoded); a plan whose price env is
 * unset simply won't be purchasable until it's configured.
 */
const config = require('./env.config');

// Feature keys used across backend permissions and the frontend matrix.
const FEATURES = {
  DASHBOARD_CREATE: 'dashboardCreate',
  COLLABORATORS: 'collaborators',
  NTELIPAK: 'ntelipak',
  WEATHER: 'weather',
  FOOTPRINT: 'footprint',
  TRAILS_BROWSE: 'trailsBrowse',
  TRAILS_CREATE: 'trailsCreate',
  PRIORITY: 'priority',
};

const UNLIMITED = -1;

/**
 * Plans. `limits.collaborators` is the MAX collaborators an owner on this plan
 * may invite (UNLIMITED = no cap). `features` is the on/off matrix. Ntelipak and
 * weather are `true` for both today (switches built, left open) per product.
 */
const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'eur',
    billingCycle: null,
    stripePriceId: null,
    limits: { collaborators: 2 },
    features: {
      [FEATURES.DASHBOARD_CREATE]: true,
      [FEATURES.COLLABORATORS]: true,
      [FEATURES.NTELIPAK]: true,
      [FEATURES.WEATHER]: true,
      [FEATURES.FOOTPRINT]: false,
      [FEATURES.TRAILS_BROWSE]: true,
      [FEATURES.TRAILS_CREATE]: false,
      [FEATURES.PRIORITY]: false,
    },
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    planType: 'pro',
    price: 15,
    currency: 'eur',
    billingCycle: 'monthly',
    get stripePriceId() { return config.stripe.monthlyPriceId || null; },
    limits: { collaborators: UNLIMITED },
    features: proFeatures(),
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    planType: 'pro',
    price: 180,
    currency: 'eur',
    billingCycle: 'annual',
    get stripePriceId() { return config.stripe.annualPriceId || null; },
    limits: { collaborators: UNLIMITED },
    features: proFeatures(),
  },
};

function proFeatures() {
  return {
    [FEATURES.DASHBOARD_CREATE]: true,
    [FEATURES.COLLABORATORS]: true,
    [FEATURES.NTELIPAK]: true,
    [FEATURES.WEATHER]: true,
    [FEATURES.FOOTPRINT]: true,
    [FEATURES.TRAILS_BROWSE]: true,
    [FEATURES.TRAILS_CREATE]: true,
    [FEATURES.PRIORITY]: true,
  };
}

/** Map a subscriptionType ('free' | 'pro') to the effective feature/limit set. */
function planForType(subscriptionType) {
  return subscriptionType === 'pro' ? PLANS.pro_monthly : PLANS.free;
}

/** Resolve which plan a Stripe price id belongs to (webhook → billingCycle). */
function planForPriceId(priceId) {
  if (!priceId) return null;
  if (PLANS.pro_monthly.stripePriceId === priceId) return PLANS.pro_monthly;
  if (PLANS.pro_annual.stripePriceId === priceId) return PLANS.pro_annual;
  return null;
}

/** The billing cycle → Stripe price id (checkout). */
function priceIdForCycle(cycle) {
  if (cycle === 'annual') return PLANS.pro_annual.stripePriceId;
  if (cycle === 'monthly') return PLANS.pro_monthly.stripePriceId;
  return null;
}

/** Public catalogue for the frontend pricing page (no secrets). */
function publicCatalogue() {
  const strip = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    currency: p.currency,
    billingCycle: p.billingCycle,
    limits: p.limits,
    features: p.features,
    purchasable: !!p.stripePriceId,
  });
  return {
    free: strip(PLANS.free),
    proMonthly: strip(PLANS.pro_monthly),
    proAnnual: strip(PLANS.pro_annual),
    featureKeys: FEATURES,
  };
}

module.exports = {
  FEATURES,
  UNLIMITED,
  PLANS,
  planForType,
  planForPriceId,
  priceIdForCycle,
  publicCatalogue,
};
