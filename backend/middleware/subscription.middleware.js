/**
 * Subscription/feature gate middleware. Runs AFTER `protect`, so `req.user` is
 * the DB user (server-side truth — frontend state is never trusted). Returns a
 * structured 403 the frontend can render into an upgrade prompt.
 *
 * NOTE: These are wired onto routes in Phase 2, alongside the upgrade UI, so the
 * lock and the way to pay for it ship together.
 */
const permissions = require('../utils/permissions');

function upgradeError(res, feature) {
  return res.status(403).json({
    success: false,
    code: 'UPGRADE_REQUIRED',
    message: 'This feature is available on Dayla Pro.',
    feature: feature || null,
    requiredPlan: 'pro',
  });
}

/** Require an active (incl. grace) Pro subscription. */
const requirePro = (feature) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!permissions.isPro(req.user)) {
    return upgradeError(res, feature);
  }
  next();
};

/** Require a specific feature flag to be enabled for the user's plan. */
const requireFeature = (featureKey) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const access = permissions.featureAccess(req.user);
  if (!access.features[featureKey]) {
    return upgradeError(res, featureKey);
  }
  next();
};

/** Require a specific plan tier ('free' | 'pro'). */
const requireSubscription = (plan) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (plan === 'pro' && !permissions.isPro(req.user)) {
    return upgradeError(res);
  }
  next();
};

module.exports = { requirePro, requireFeature, requireSubscription };
