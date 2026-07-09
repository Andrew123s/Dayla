/**
 * Mriz memory assembly — turns a completed trip into a story (Memory doc).
 *
 * Called when a trip's status transitions to `completed` (trip.controller)
 * and from POST /api/memories/generate/:tripId (manual / backfill).
 * Idempotent: re-assembling refreshes the existing memory in place.
 *
 * Data sources, all best-effort (a missing piece never blocks assembly):
 *  - Trip: title, dates → season/days, destination, eco score, collaborators
 *  - Board notes: image notes → media (EXIF coords/time from note.metadata),
 *    route notes → geometry + distance/elevation via the Piko route
 *  - Weather: current conditions at the destination via weatherapi.com
 *    (historical weather isn't retro-fetchable on the free tier, so this is
 *    a snapshot around trip end — labeled as such in the model)
 */
const Memory = require('../models/memory.model');
const Trip = require('../models/trip.model');
const Dashboard = require('../models/dashboard.model');
const Notification = require('../models/notification.model');
const logger = require('../utils/logger');
const push = require('./push.service');

const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

function seasonOf(date) {
  const m = (date || new Date()).getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

function daysBetween(start, end) {
  if (!start) return 1;
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

// Rotating, real-data notification copy (no placeholders — every variant is
// built from the trip's own fields).
function notificationBody(trip, participants) {
  const place = (trip.destination && trip.destination.name) || trip.name;
  const variants = [
    `Your ${trip.name} days are ready to relive.`,
    `${place} is now a memory — see how it unfolded.`,
    participants > 0
      ? `You and ${participants} friend${participants === 1 ? '' : 's'} — your ${trip.name} story is ready.`
      : `Your ${trip.name} story is ready. Take a look back.`,
  ];
  // Stable pick per trip so everyone in the group reads the same line.
  const idx = Math.abs(String(trip._id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % variants.length;
  return variants[idx];
}

async function fetchWeatherSnapshot(locationName) {
  const key = process.env.WEATHER_API_KEY;
  if (!key || !locationName) return [];
  try {
    const url = `${WEATHER_API_BASE}/current.json?key=${encodeURIComponent(key)}&q=${encodeURIComponent(locationName)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const c = data && data.current;
    if (!c) return [];
    return [
      {
        date: new Date(),
        condition: (c.condition && c.condition.text) || '',
        tempC: c.temp_c,
        icon: (c.condition && c.condition.icon) || '',
      },
    ];
  } catch (e) {
    logger.warn(`Memory weather snapshot failed: ${e.message}`);
    return [];
  }
}

function deriveMoodTags({ trip, weatherDays, stats }) {
  const tags = new Set();
  const condition = ((weatherDays[0] || {}).condition || '').toLowerCase();
  if (/sun|clear/.test(condition)) tags.add('sunny');
  if (/rain|drizzle|storm/.test(condition)) tags.add('rain-washed');
  if (/snow|sleet/.test(condition)) tags.add('snowy');
  if (stats.elevationGainM >= 500) tags.add('challenging');
  else if (stats.distanceKm > 0) tags.add('peaceful');
  if (stats.companions > 0) tags.add('together');
  else tags.add('solo');
  if ((trip.ecoScore || 0) >= 70) tags.add('green');
  if (stats.days >= 4) tags.add('slow travel');
  return [...tags].slice(0, 4);
}

/**
 * Story-driven milestones (Phase 4): quiet superlatives computed against the
 * user's OWN history — no points, no badges, just lines for the story.
 */
function computeMilestones({ trip, stats, season, country, previous }) {
  const lines = [];

  if (previous.length === 0) {
    lines.push('Your first Dayla story');
  } else {
    const maxDistance = Math.max(...previous.map((m) => (m.stats && m.stats.distanceKm) || 0));
    if (stats.distanceKm > 0 && stats.distanceKm > maxDistance) {
      lines.push('Your longest adventure yet');
    }

    const climbedHighBefore = previous.some((m) => ((m.stats && m.stats.elevationGainM) || 0) >= 1000);
    if (stats.elevationGainM >= 1000 && !climbedHighBefore) {
      lines.push('First time climbing 1,000 m in one trip');
    }

    const knownCountries = previous.map((m) => (m.country || '').toLowerCase()).filter(Boolean);
    if (country && knownCountries.length && !knownCountries.includes(country.toLowerCase())) {
      lines.push(`Your first story from ${country}`);
    }

    if (!previous.some((m) => m.season === season)) {
      lines.push(`Your first ${season} story`);
    }

    const sharedBefore = previous.some((m) => ((m.stats && m.stats.companions) || 0) > 0);
    if (stats.companions > 0 && !sharedBefore) {
      lines.push('Your first shared story');
    }

    const greenestBefore = Math.max(...previous.map((m) => m.ecoScore || 0), 0);
    if ((trip.ecoScore || 0) >= 70 && (trip.ecoScore || 0) > greenestBefore) {
      lines.push('Your greenest trip yet');
    }
  }

  return lines.slice(0, 3);
}

/**
 * Assemble (or refresh) the memory for a trip. Returns the Memory doc, or
 * null when the trip doesn't exist.
 * @param {string} tripId
 * @param {{notify?: boolean, io?: import('socket.io').Server}} options
 */
async function assembleMemoryForTrip(tripId, { notify = false, io = null } = {}) {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;

  const dashboard = await Dashboard.findOne({ tripId: trip._id });

  // ── Media: image notes on the board (EXIF stashed in note.metadata) ──
  const media = [];
  let geometry;
  let routeStats = { distanceKm: 0, elevationGainM: 0 };
  if (dashboard) {
    for (const note of dashboard.notes || []) {
      if (note.type === 'image' && typeof note.content === 'string' && note.content.startsWith('http')) {
        const meta = note.metadata || {};
        media.push({
          url: note.content,
          takenAt: meta.takenAt ? new Date(meta.takenAt) : null,
          coords:
            typeof meta.lat === 'number' && typeof meta.lng === 'number'
              ? { lat: meta.lat, lng: meta.lng }
              : undefined,
          byUser: note.createdBy && note.createdBy.userId ? note.createdBy.userId : undefined,
        });
      }
      // First route note on the board provides the replay geometry.
      if (!geometry && note.type === 'route' && note.metadata && note.metadata.routeId) {
        try {
          const Route = require('../models/route.model');
          const route = await Route.findOne({
            $or: [{ slug: note.metadata.routeId }, ...(require('mongoose').isValidObjectId(note.metadata.routeId) ? [{ _id: note.metadata.routeId }] : [])],
          });
          if (route && route.geometry && Array.isArray(route.geometry.coordinates) && route.geometry.coordinates.length > 1) {
            geometry = { type: 'LineString', coordinates: route.geometry.coordinates };
            routeStats = {
              distanceKm: route.distanceKm || 0,
              elevationGainM: route.elevationGainM || 0,
            };
          }
        } catch (e) {
          logger.warn(`Memory route lookup failed: ${e.message}`);
        }
      }
    }
  }

  const startDate = trip.dates && trip.dates.startDate;
  const collaborators = (trip.collaborators || []).length;
  const stats = {
    distanceKm: routeStats.distanceKm,
    elevationGainM: routeStats.elevationGainM,
    days: daysBetween(startDate, trip.dates && trip.dates.endDate),
    companions: collaborators,
  };

  const weatherDays = await fetchWeatherSnapshot(
    (trip.destination && trip.destination.name) || null
  );

  const season = seasonOf(startDate ? new Date(startDate) : new Date());
  const country = (trip.destination && trip.destination.country) || '';

  // Milestones compare against the user's OTHER memories (exclude this trip's).
  const previous = await Memory.find({
    owner: trip.owner,
    tripId: { $ne: trip._id },
  }).select('stats season country ecoScore');
  const milestones = computeMilestones({ trip, stats, season, country, previous });

  const doc = {
    tripId: trip._id,
    owner: trip.owner,
    participants: trip.collaborators || [],
    status: 'ready',
    title: (trip.destination && trip.destination.name) || trip.name,
    coverPhoto: trip.coverImage || (media[0] && media[0].url) || null,
    country,
    ecoScore: trip.ecoScore || 0,
    season,
    stats,
    moodTags: deriveMoodTags({ trip, weatherDays, stats }),
    milestones,
    media,
    ...(geometry ? { routeGeometry: geometry } : {}),
    weatherDays,
  };

  const memory = await Memory.findOneAndUpdate(
    { tripId: trip._id },
    { $set: doc },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (notify) {
    const body = notificationBody(trip, collaborators);
    const recipients = [trip.owner, ...(trip.collaborators || [])];
    for (const userId of recipients) {
      try {
        await Notification.create({
          recipient: userId,
          sender: trip.owner,
          type: 'memory',
          message: body,
          memoryId: memory._id.toString(),
        });
        if (io) {
          io.to(`user:${userId.toString()}`).emit('notification:new', {
            recipientId: userId.toString(),
            type: 'memory',
            memoryId: memory._id.toString(),
            timestamp: new Date(),
          });
        }
        push.sendToUser(userId, {
          title: 'Dayla',
          body,
          data: { type: 'memory', memoryId: memory._id.toString() },
        });
      } catch (notifErr) {
        logger.error('Memory notification failed:', notifErr);
      }
    }
  }

  logger.info(`Memory assembled for trip ${trip._id} (${media.length} media, geometry: ${!!geometry})`);
  return memory;
}

module.exports = { assembleMemoryForTrip };
