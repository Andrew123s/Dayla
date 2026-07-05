import type { SubscriptionSnapshot, User } from '../types';

/**
 * Frontend mirror of backend/utils/permissions.js. This is for UX only — every
 * Pro action is re-checked server-side; the UI just avoids showing users doors
 * they can't open. Keep these rules in sync with the backend.
 */

export function isPro(sub?: SubscriptionSnapshot | null): boolean {
  if (!sub || sub.type !== 'pro') return false;
  const now = Date.now();
  const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() : 0;
  if (sub.status === 'active' || sub.status === 'trialing') return true;
  // Grace: past-due or scheduled-cancel keeps Pro until the paid period ends.
  if ((sub.status === 'past_due' || sub.cancelAtPeriodEnd) && end > now) return true;
  return false;
}

export const FEATURES = {
  FOOTPRINT: 'footprint',
  TRAILS_CREATE: 'trailsCreate',
  TRAILS_BROWSE: 'trailsBrowse',
  COLLABORATORS: 'collaborators',
  NTELIPAK: 'ntelipak',
  WEATHER: 'weather',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

/** Free plan feature map (Pro = everything true). Mirrors config/plans.js. */
const FREE_FEATURES: Record<string, boolean> = {
  [FEATURES.FOOTPRINT]: false,
  [FEATURES.TRAILS_CREATE]: false,
  [FEATURES.TRAILS_BROWSE]: true,
  [FEATURES.COLLABORATORS]: true,
  [FEATURES.NTELIPAK]: true,
  [FEATURES.WEATHER]: true,
};

export function canUse(feature: FeatureKey, sub?: SubscriptionSnapshot | null): boolean {
  if (isPro(sub)) return true;
  return !!FREE_FEATURES[feature];
}

export const FREE_COLLABORATOR_LIMIT = 2;

/** Max NON-owner collaborators allowed (Infinity for Pro). */
export function collaboratorLimit(sub?: SubscriptionSnapshot | null): number {
  return isPro(sub) ? Infinity : FREE_COLLABORATOR_LIMIT;
}

/** Convenience: read the plan off a user object. */
export function userIsPro(user?: User | null): boolean {
  return isPro(user?.subscription);
}
