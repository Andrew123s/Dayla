/**
 * Map (basemap) configuration for Piko.
 *
 * SECURITY NOTE — MapTiler keys are *client* keys by design: the browser must
 * send them to load tiles, so they cannot be hidden. The correct protection is
 * to lock the key to your allowed origins (Account → Keys → "Allowed origins")
 * and rely on MapTiler's per-key rate limits — NOT to keep it secret. That is
 * why this one is exposed via a `VITE_` var. (The GraphHopper routing key is the
 * opposite — it stays server-side; see `graphhopper.ts`.)
 */

const KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
// Full style-URL override wins if provided (e.g. a self-hosted / Stadia style).
const STYLE_OVERRIDE = import.meta.env.VITE_MAP_STYLE_URL as string | undefined;

// MapTiler's "outdoor" style — contour lines + trails, ideal for hiking.
export const MAP_STYLE_URL =
  STYLE_OVERRIDE ||
  (KEY ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${KEY}` : '');

/** True when a basemap provider is configured; UIs fall back gracefully if not. */
export const isMapConfigured = (): boolean => !!MAP_STYLE_URL;

export const MAP_ATTRIBUTION =
  '© MapTiler © OpenStreetMap contributors';

// Brand colours reused across map layers.
export const TRAIL_COLOR = '#059669'; // emerald-600
export const TRAIL_COLOR_SOFT = '#34d399'; // emerald-400
export const START_COLOR = '#10b981';
export const END_COLOR = '#0f172a';
