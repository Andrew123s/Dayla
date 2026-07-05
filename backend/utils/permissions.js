/**
 * Centralized permission layer — the ONLY place plan access is decided.
 *
 * Never check `user.subscriptionType` directly elsewhere; always call these
 * helpers. Access is computed at read time from the user's snapshot, so
 * downgrades and grace periods are automatic with no scheduled job:
 *   - active / trialing            → Pro
 *   - past_due (grace)             → Pro until currentPeriodEnd
 *   - cancelAtPeriodEnd (canceled  → Pro until currentPeriodEnd
 *     but still in paid period)
 *   - anything else / period ended → Free
 */
const { planForType, FEATURES, UNLIMITED } = require('../config/plans');

function isPro(user) {
  if (!user || user.subscriptionType !== 'pro') return false;
  const status = user.subscriptionStatus;
  const now = Date.now();
  const periodEnd = user.currentPeriodEnd ? new Date(user.currentPeriodEnd).getTime() : 0;

  if (status === 'active' || status === 'trialing') return true;
  // Grace: a past-due account or one scheduled to cancel keeps Pro until the
  // paid period actually ends.
  if ((status === 'past_due' || user.cancelAtPeriodEnd) && periodEnd > now) return true;
  return false;
}

/** The effective plan (free/pro) a user is entitled to right now. */
function effectivePlan(user) {
  return planForType(isPro(user) ? 'pro' : 'free');
}

function can(user, feature) {
  return !!effectivePlan(user).features[feature];
}

// ── Feature helpers (use these; never scatter plan checks) ──────────────────
const canAccessFootprintCalculator = (user) => can(user, FEATURES.FOOTPRINT);
const canCreateTrails = (user) => can(user, FEATURES.TRAILS_CREATE);
const canBrowseTrails = (user) => can(user, FEATURES.TRAILS_BROWSE);
const canAccessNtelipak = (user) => can(user, FEATURES.NTELIPAK);
const canAccessWeatherInsights = (user) => can(user, FEATURES.WEATHER);

/** Max collaborators the owner may have (UNLIMITED = -1). */
function collaboratorLimit(user) {
  return effectivePlan(user).limits.collaborators;
}

/** Can this owner invite ANOTHER collaborator given the current count? */
function canInviteCollaborators(user, currentCount) {
  const limit = collaboratorLimit(user);
  if (limit === UNLIMITED) return true;
  return currentCount < limit;
}

/**
 * Full access map for a user — returned by GET /api/billing/subscription so the
 * frontend can mirror gating for UX (server always re-checks on the endpoint).
 */
function featureAccess(user) {
  const plan = effectivePlan(user);
  return {
    isPro: isPro(user),
    plan: plan.id === 'free' ? 'free' : 'pro',
    collaboratorLimit: plan.limits.collaborators,
    features: { ...plan.features },
  };
}

module.exports = {
  isPro,
  effectivePlan,
  canAccessFootprintCalculator,
  canCreateTrails,
  canBrowseTrails,
  canAccessNtelipak,
  canAccessWeatherInsights,
  collaboratorLimit,
  canInviteCollaborators,
  featureAccess,
  UNLIMITED,
};
