// ─────────────────────────────────────────────────────────────────────────────
// GraphHopper routing service — the one place the GRAPHHOPPER_KEY is used.
//
// Snaps hand-placed waypoints (draw) or a GPS track to real trails and returns
// geometry + distance + elevation. The key stays server-side; the browser only
// ever calls POST /api/piko/route. Uses Node's global fetch (Node 18+).
// ─────────────────────────────────────────────────────────────────────────────

const GH_URL = 'https://graphhopper.com/api/1/route';

async function snapRoute(body) {
  const apiKey = process.env.GRAPHHOPPER_KEY;
  if (!apiKey) {
    const e = new Error('Routing is not configured (missing GRAPHHOPPER_KEY on the server).');
    e.status = 503;
    throw e;
  }
  const points = body && body.points;
  if (!Array.isArray(points) || points.length < 2) {
    const e = new Error('At least two waypoints are required.');
    e.status = 400;
    throw e;
  }
  const allowed = new Set(['foot', 'hike', 'bike', 'mtb']);
  const profile = allowed.has(body.profile) ? body.profile : 'foot';
  const elevation = body.elevation !== false;

  const res = await fetch(`${GH_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      points, // [[lng, lat], …]
      points_encoded: false,
      elevation,
      instructions: false,
      calc_points: true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error((data && data.message) || `GraphHopper error (${res.status}).`);
    e.status = res.status === 401 ? 502 : res.status;
    throw e;
  }
  const path = data && data.paths && data.paths[0];
  if (!path || !path.points || !Array.isArray(path.points.coordinates) || !path.points.coordinates.length) {
    const e = new Error('No walkable route found between those points.');
    e.status = 422;
    throw e;
  }
  return {
    geometry: { type: 'LineString', coordinates: path.points.coordinates },
    distanceKm: Math.round((path.distance / 1000) * 10) / 10,
    elevationGainM: Math.round(path.ascend || 0),
    durationMins: Math.round((path.time || 0) / 60000),
  };
}

module.exports = { snapRoute };
