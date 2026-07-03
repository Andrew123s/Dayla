import { Route, NewRouteInput, PikoPlan, RouteComment } from './types';
import { pikoRoutes } from './data';
import { estimateDurationMins } from './geo';

/**
 * A pluggable backend for Piko. The feature talks only to this interface, so it
 * runs identically against local seed data (standalone dev) or Dayla's REST API.
 */
export interface PikoDataSource {
  listRoutes(): Promise<Route[]>;
  getSavedIds(): Promise<Set<string>>;
  /** Returns the new saved state. */
  toggleSave(id: string): Promise<boolean>;
  createRoute(input: NewRouteInput): Promise<Route>;
  /** Optional — up/down vote a route. */
  vote?(id: string, value: -1 | 0 | 1): Promise<{ voteScore: number; userVote: -1 | 0 | 1 }>;
  /** Optional — comments on a route. */
  listComments?(id: string): Promise<RouteComment[]>;
  addComment?(id: string, content: string): Promise<RouteComment>;
  /** Optional — the group plans (Dayla trips) a route can be added to. */
  listPlans?(): Promise<PikoPlan[]>;
  /** Optional — attach a route to a Dayla plan (dashboard). */
  addToPlan?(id: string, planId: string): Promise<void>;
  /** Optional — report a route for moderation review. */
  reportRoute?(id: string, reason?: string): Promise<void>;
  /**
   * Optional — upload the creator's OWN photo (keeps imagery licensed: the
   * uploader owns it) and attach it to their route. Returns the updated route.
   */
  addRoutePhoto?(id: string, file: File): Promise<Route>;
}

// ──────────────────────────────────────────────────────────────────────────
// Local source — seed data + localStorage. Used standalone and as offline mode.
// ──────────────────────────────────────────────────────────────────────────

const SAVED_KEY = 'piko_saved_ids';
const CREATED_KEY = 'piko_created_routes';
const PLAN_ROUTES_KEY = 'piko_plan_routes';
const VOTES_KEY = 'piko_votes';
const COMMENTS_KEY = 'piko_comments';

function readJsonMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeJsonMap<T>(key: string, map: Record<string, T>) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* fail soft */
  }
}

// Demo plans so the add-to-plan picker is exercisable in the sandbox. In Dayla
// these come from the user's real trips via the API source.
const DEMO_PLANS: PikoPlan[] = [
  { id: 'plan-tatra', name: 'Tatra Weekend', subtitle: '4 friends · this month' },
  { id: 'plan-dolomites', name: 'Dolomites Trip', subtitle: '2 friends · planning' },
  { id: 'plan-solo', name: 'Solo scrambles', subtitle: 'Just me' },
];

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* storage may be unavailable (private mode) — fail soft */
  }
}

function readCreated(): Route[] {
  try {
    const raw = localStorage.getItem(CREATED_KEY);
    return raw ? (JSON.parse(raw) as Route[]) : [];
  } catch {
    return [];
  }
}

export function createLocalDataSource(): PikoDataSource {
  let created = readCreated();

  return {
    async listRoutes() {
      const saved = readSet(SAVED_KEY);
      const votes = readJsonMap<-1 | 0 | 1>(VOTES_KEY);
      const comments = readJsonMap<RouteComment[]>(COMMENTS_KEY);
      // Single-user sandbox: the score is just this user's own vote; engagement
      // starts at zero and accrues for real once the API source is used.
      return [...created, ...pikoRoutes].map((r) => ({
        ...r,
        isSaved: saved.has(r.id),
        userVote: votes[r.id] ?? 0,
        voteScore: votes[r.id] ?? 0,
        commentCount: comments[r.id]?.length ?? 0,
      }));
    },
    async getSavedIds() {
      return readSet(SAVED_KEY);
    },
    async toggleSave(id) {
      const saved = readSet(SAVED_KEY);
      const next = !saved.has(id);
      if (next) saved.add(id);
      else saved.delete(id);
      writeSet(SAVED_KEY, saved);
      return next;
    },
    async createRoute(input) {
      const id = `user-${Date.now()}`;
      const route: Route = {
        id,
        type: 'user_generated',
        title: input.title,
        country: input.country ?? '',
        location: input.location ?? 'Your route',
        description: input.description ?? '',
        difficulty: input.difficulty,
        distanceKm: input.distanceKm,
        elevationGainM: input.elevationGainM,
        estimatedDurationMins:
          input.estimatedDurationMins ?? estimateDurationMins(input.distanceKm, input.elevationGainM),
        photos: input.photos ?? [],
        tags: input.tags ?? [],
        ecoScore: input.ecoScore ?? 75,
        weatherScore: input.weatherScore ?? 70,
        accessibilityScore: input.accessibilityScore ?? 50,
        ecoImpact: input.ecoImpact ?? { transportMode: '', co2EstimateKg: 0, greenerAlternatives: [] },
        geometry: input.geometry,
        startPoint: input.geometry?.coordinates?.[0] as [number, number] | undefined,
        creatorName: 'You',
        moderationStatus: 'pending',
        isSaved: false,
      };
      created = [route, ...created];
      try {
        localStorage.setItem(CREATED_KEY, JSON.stringify(created));
      } catch {
        /* fail soft */
      }
      return route;
    },
    async vote(id, value) {
      const votes = readJsonMap<-1 | 0 | 1>(VOTES_KEY);
      votes[id] = value;
      writeJsonMap(VOTES_KEY, votes);
      return { voteScore: value, userVote: value };
    },
    async listComments(id) {
      return readJsonMap<RouteComment[]>(COMMENTS_KEY)[id] ?? [];
    },
    async addComment(id, content) {
      const map = readJsonMap<RouteComment[]>(COMMENTS_KEY);
      const comment: RouteComment = {
        id: `c-${Date.now()}`,
        author: 'You',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      map[id] = [...(map[id] ?? []), comment];
      writeJsonMap(COMMENTS_KEY, map);
      return comment;
    },
    async listPlans() {
      return DEMO_PLANS;
    },
    async addToPlan(routeId, planId) {
      // Persist the association so "added" survives a refresh in the sandbox.
      try {
        const raw = localStorage.getItem(PLAN_ROUTES_KEY);
        const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
        const list = new Set(map[planId] ?? []);
        list.add(routeId);
        map[planId] = [...list];
        localStorage.setItem(PLAN_ROUTES_KEY, JSON.stringify(map));
      } catch {
        /* fail soft */
      }
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────
// API source — Dayla's REST backend. `fetcher` is the host's authFetch.
// ──────────────────────────────────────────────────────────────────────────

export type Fetcher = (url: string, options?: RequestInit) => Promise<Response>;

export function createApiDataSource(
  fetcher: Fetcher = (u, o) => fetch(u, o),
  apiBase = ''
): PikoDataSource {
  const base = `${apiBase}/api/piko`;
  const json = async (res: Response) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) {
      throw new Error(body.message || `Request failed (${res.status})`);
    }
    return body;
  };

  return {
    async listRoutes() {
      const body = await json(await fetcher(`${base}/routes?limit=100`));
      return body.data as Route[];
    },
    async getSavedIds() {
      const body = await json(await fetcher(`${base}/saved`));
      return new Set((body.data as Route[]).map((r) => r.id));
    },
    async toggleSave(id) {
      const body = await json(await fetcher(`${base}/routes/${id}/save`, { method: 'POST' }));
      return !!body.data.isSaved;
    },
    async createRoute(input) {
      const body = await json(
        await fetcher(`${base}/routes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
      );
      return body.data as Route;
    },
    async vote(id, value) {
      const body = await json(
        await fetcher(`${base}/routes/${id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        })
      );
      return body.data;
    },
    async listComments(id) {
      const body = await json(await fetcher(`${base}/routes/${id}/comments`));
      return body.data as RouteComment[];
    },
    async addComment(id, content) {
      const body = await json(
        await fetcher(`${base}/routes/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
      );
      return body.data as RouteComment;
    },
    async listPlans() {
      // Dayla's trips endpoint (outside /api/piko). Shape is normalised
      // defensively; confirm the trip↔dashboard mapping when wiring at integration.
      const res = await fetcher(`${apiBase}/api/trips`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) throw new Error(body.message || 'Could not load plans');
      const trips = Array.isArray(body.data) ? body.data : body.data?.trips ?? [];
      return (trips as Array<Record<string, any>>).map((t) => ({
        id: String(t._id ?? t.id),
        name: t.name ?? 'Untitled trip',
        subtitle: t.destination?.name ?? undefined,
      })) as PikoPlan[];
    },
    async addToPlan(id, planId) {
      // The backend endpoint takes `dashboardId`; a trip and its dashboard are
      // 1:1, so the trip/plan id maps through here (finalised at integration).
      await json(
        await fetcher(`${base}/routes/${id}/add-to-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dashboardId: planId }),
        })
      );
    },
    async reportRoute(id, reason) {
      await json(
        await fetcher(`${base}/routes/${id}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason || '' }),
        })
      );
    },
    async addRoutePhoto(id, file) {
      // 1) Upload through Dayla's existing Cloudinary pipeline (the uploader
      //    owns the photo — licensed imagery), 2) attach the URL to the route.
      const fd = new FormData();
      fd.append('image', file);
      const up = await json(await fetcher(`${apiBase}/api/upload/images`, { method: 'POST', body: fd }));
      const url = up.data?.url as string | undefined;
      if (!url) throw new Error('Photo upload failed');
      const body = await json(
        await fetcher(`${base}/routes/${id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
      );
      return body.data as Route;
    },
  };
}
