import { RouteDifficulty, RouteGeometry } from './types';

/** Great-circle distance in km between two [lng, lat] points. */
export function haversineKm(a: number[], b: number[]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of a polyline ([lng, lat][]) in km. */
export function lineDistanceKm(coords: number[][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += haversineKm(coords[i - 1], coords[i]);
  return Math.round(total * 10) / 10;
}

/** Cumulative positive elevation change from [lng, lat, ele][] points, in metres. */
export function elevationGainM(coords: number[][]): number {
  let gain = 0;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1][2];
    const cur = coords[i][2];
    if (typeof prev === 'number' && typeof cur === 'number' && cur > prev) gain += cur - prev;
  }
  return Math.round(gain);
}

/**
 * Internal difficulty scoring (no external API). Blends distance and climb the
 * way hiking guides do — a short steep grind and a long flat walk can both be
 * "hard". Mirrors the categories used across Piko.
 */
export function scoreDifficulty(distanceKm: number, elevationGainM: number): RouteDifficulty {
  // Effort points ≈ 1 per km + 1 per 100 m of ascent (Naismith-flavoured).
  const effort = distanceKm + elevationGainM / 100;
  if (effort >= 16) return 'hard';
  if (effort >= 8) return 'moderate';
  return 'easy';
}

/**
 * Estimated walking time in minutes (Naismith's rule: ~12 min/km on the flat,
 * plus ~10 min per 100 m of ascent).
 */
export function estimateDurationMins(distanceKm: number, elevationGainM: number): number {
  return Math.round(distanceKm * 12 + (elevationGainM / 100) * 10);
}

/**
 * Deterministic pseudo-random trail shape from a trailhead [lat, lng], so seed
 * routes have geometry to draw before real OSM/GPX data is wired in.
 * Returns GeoJSON-style [lng, lat] coordinates.
 */
export function makeLine([lat, lng]: [number, number], seedStr: string): RouteGeometry {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = (Math.imul(h ^ seedStr.charCodeAt(i), 16777619)) >>> 0;
  const rand = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
  const pts: number[][] = [[lng, lat]];
  let clng = lng;
  let clat = lat;
  for (let i = 0; i < 13; i++) {
    clng += (rand() - 0.45) * 0.004;
    clat += (rand() - 0.4) * 0.004;
    pts.push([Number(clng.toFixed(5)), Number(clat.toFixed(5))]);
  }
  return { type: 'LineString', coordinates: pts };
}
