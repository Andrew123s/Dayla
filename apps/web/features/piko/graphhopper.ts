/**
 * GraphHopper client (browser side).
 *
 * SECURITY: this NEVER calls GraphHopper directly — it calls our own
 * `/api/piko/route` proxy, which injects the secret key server-side. In the
 * standalone sandbox that proxy is the Vite dev middleware (see vite.config.ts);
 * inside Dayla it will be the Express `/api/piko/route` route. Either way the
 * key stays off the client.
 */

import { RouteGeometry } from './types';

export type GhProfile = 'foot' | 'hike' | 'bike' | 'mtb';

export interface SnappedRoute {
  geometry: RouteGeometry; // coordinates are [lng, lat, ele]
  distanceKm: number;
  elevationGainM: number;
  durationMins: number;
}

/**
 * Snap hand-placed waypoints to real trails. `points` are [lng, lat] pairs.
 * `apiBase` lets the Dayla host point at its own backend; defaults to relative.
 */
export async function snapRoute(
  points: number[][],
  opts: { profile?: GhProfile; apiBase?: string; signal?: AbortSignal } = {}
): Promise<SnappedRoute> {
  const { profile = 'foot', apiBase = '', signal } = opts;
  const res = await fetch(`${apiBase}/api/piko/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points, profile, elevation: true }),
    signal,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Routing failed (${res.status})`);
  }
  return body.data as SnappedRoute;
}
