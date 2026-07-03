/**
 * Piko — Dayla's collaborative trails feature.
 * Type definitions. Piko is a PAGE embedded in the Dayla app, not a standalone app.
 */

export type RouteDifficulty = 'easy' | 'moderate' | 'hard';
export type RouteType = 'curated' | 'user_generated';
export type ModerationStatus = 'approved' | 'pending' | 'flagged' | 'removed';

/** Sub-views inside the Piko page. */
export type PikoTab = 'discover' | 'map' | 'saved';

/** Filter chips on the Discover feed. */
export type RouteFilter = 'all' | 'eco' | 'group' | 'easy' | 'hard';

export interface EcoImpact {
  transportMode: string;
  co2EstimateKg: number;
  greenerAlternatives: string[];
}

/** GeoJSON-style path. Coordinates are [lng, lat] (optionally with a 3rd elevation value). */
export interface RouteGeometry {
  type?: 'LineString';
  coordinates: number[][];
}

export interface Route {
  id: string;
  /** Mongo id when backed by the API; absent for local seed data. */
  _id?: string;
  type: RouteType;
  title: string;
  /** Country used by the location selector (e.g. "Italy", "United States"). */
  country: string;
  /** Human-readable place, usually "Area · Country". */
  location: string;
  description: string;
  difficulty: RouteDifficulty;
  distanceKm: number;
  elevationGainM: number;
  estimatedDurationMins: number;
  photos: string[];
  tags: string[];
  /** Route characteristics (0–100). Not engagement metrics. */
  ecoScore: number;
  weatherScore: number;
  accessibilityScore: number;
  ecoImpact: EcoImpact;

  /** Real geometry — drives the map + elevation preview. */
  geometry?: RouteGeometry;
  /** Trailhead [lng, lat]; used for maps, weather and "near me". */
  startPoint?: [number, number] | null;

  /** Who made it (curated routes read "Dayla"). */
  creatorName?: string;
  /** Set on user-generated routes awaiting / failing moderation. */
  moderationStatus?: ModerationStatus;
  /** True when the viewer created this route (API source only). */
  isMine?: boolean;

  /** Group engagement (present when backed by the API). */
  isSaved?: boolean;
  saveCount?: number;
  voteScore?: number;
  userVote?: -1 | 0 | 1;
  commentCount?: number;
  popularityScore?: number;
}

/** A group plan (Dayla trip / dashboard) a route can be added to. */
export interface PikoPlan {
  id: string;
  name: string;
  /** Context line, e.g. "4 friends · Jun 12–16". */
  subtitle?: string;
}

/** A comment on a route. */
export interface RouteComment {
  id: string;
  author: string;
  content: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** A member of the planning group (Dayla trip collaborators, mocked standalone). */
export interface GroupMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  /** Presence — from the socket in Dayla; mocked in the sandbox. */
  online: boolean;
  you?: boolean;
}

/** A shared trip task that can be assigned to a group member. */
export interface GroupTask {
  id: string;
  label: string;
  /** Assigned member id, or null when unassigned. */
  assignee: string | null;
}

/** Payload for creating a user-generated route (GPX upload, draw, record). */
export interface NewRouteInput {
  title: string;
  description?: string;
  country?: string;
  location?: string;
  difficulty: RouteDifficulty;
  distanceKm: number;
  elevationGainM: number;
  estimatedDurationMins: number;
  geometry?: RouteGeometry;
  photos?: string[];
  tags?: string[];
  ecoScore?: number;
  weatherScore?: number;
  accessibilityScore?: number;
  ecoImpact?: EcoImpact;
}
