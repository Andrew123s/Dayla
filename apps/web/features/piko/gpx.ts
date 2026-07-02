import { NewRouteInput } from './types';
import { lineDistanceKm, elevationGainM, scoreDifficulty, estimateDurationMins } from './geo';

export interface ParsedGpx {
  name: string;
  coordinates: number[][]; // [lng, lat, ele?]
  distanceKm: number;
  elevationGainM: number;
}

/**
 * Parse a GPX file (track, route, or waypoints) into geometry + auto-computed
 * distance and elevation gain. Fully internal — no external service.
 */
export function parseGpx(xml: string): ParsedGpx {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('That file isn’t valid GPX.');

  // Prefer track points, then route points, then standalone waypoints.
  let pts = Array.from(doc.getElementsByTagName('trkpt'));
  if (pts.length === 0) pts = Array.from(doc.getElementsByTagName('rtept'));
  if (pts.length === 0) pts = Array.from(doc.getElementsByTagName('wpt'));
  if (pts.length < 2) throw new Error('No usable track found in this GPX file.');

  const coordinates: number[][] = [];
  for (const p of pts) {
    const lat = parseFloat(p.getAttribute('lat') || '');
    const lng = parseFloat(p.getAttribute('lon') || '');
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
    const eleEl = p.getElementsByTagName('ele')[0];
    const ele = eleEl ? parseFloat(eleEl.textContent || '') : NaN;
    coordinates.push(Number.isNaN(ele) ? [lng, lat] : [lng, lat, ele]);
  }
  if (coordinates.length < 2) throw new Error('No usable coordinates in this GPX file.');

  const nameEl = doc.querySelector('trk > name, rte > name, metadata > name, name');
  const name = (nameEl?.textContent || '').trim() || 'Imported route';

  return {
    name,
    coordinates,
    distanceKm: lineDistanceKm(coordinates),
    elevationGainM: elevationGainM(coordinates),
  };
}

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&q=80&w=1200',
];

/** Turn a parsed GPX file into a ready-to-save user route with derived metadata. */
export function gpxToRouteInput(parsed: ParsedGpx): NewRouteInput {
  const difficulty = scoreDifficulty(parsed.distanceKm, parsed.elevationGainM);
  return {
    title: parsed.name,
    description: 'Imported from a GPX file. Add a description, photos and tags to share it.',
    difficulty,
    distanceKm: parsed.distanceKm,
    elevationGainM: parsed.elevationGainM,
    estimatedDurationMins: estimateDurationMins(parsed.distanceKm, parsed.elevationGainM),
    geometry: { type: 'LineString', coordinates: parsed.coordinates },
    photos: FALLBACK_PHOTOS,
    tags: ['User route', 'GPX'],
    ecoScore: 75,
    weatherScore: 70,
    accessibilityScore: 50,
    ecoImpact: { transportMode: 'Your own way there', co2EstimateKg: 0, greenerAlternatives: [] },
  };
}
