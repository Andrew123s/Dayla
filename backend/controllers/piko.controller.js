const mongoose = require('mongoose');
const Route = require('../models/route.model');
const Dashboard = require('../models/dashboard.model');
const graphhopper = require('../services/graphhopper.service');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Piko controller — trails discovery + engagement (global popularity).
//
// The group *decision* (candidates → group votes → selected route) lives on the
// Dashboard; this controller owns the shared content: browse, detail, save,
// vote, comment, create (UGC → moderation), and add-to-plan (drops a `route`
// sticky note onto a trip's dashboard). All routes are auth-protected.
// ─────────────────────────────────────────────────────────────────────────────

// Look up by curated slug OR Mongo id.
async function findRoute(idOrSlug) {
  const or = [{ slug: idOrSlug }];
  if (mongoose.isValidObjectId(idOrSlug)) or.push({ _id: idOrSlug });
  return Route.findOne({ $or: or });
}

// @desc  List routes (filter / search / geo / sort / paginate)
// @route GET /api/piko/routes
const listRoutes = async (req, res) => {
  try {
    const { country, difficulty, filter, q, lat, lng, radiusKm, sort } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    const query = { 'moderation.status': 'approved' };
    if (country && country !== 'all') query.country = country;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (filter === 'eco') query.ecoScore = { $gte: 85 };
    if (filter === 'group') query.tags = { $in: ['Group Friendly', 'Family', 'Public Transport'] };
    if (q) query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];
    if (lat && lng) {
      query.startPoint = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (parseFloat(radiusKm) || 50) * 1000,
        },
      };
    }

    const sortMap = { recent: { createdAt: -1 }, eco: { ecoScore: -1 }, popular: { createdAt: -1 } };
    let queryBuilder = Route.find(query).limit(limit).skip(skip);
    if (!query.startPoint) queryBuilder = queryBuilder.sort(sortMap[sort] || sortMap.recent);

    const routes = await queryBuilder;
    res.status(200).json({ success: true, data: routes.map((r) => r.toClient(req.user._id)) });
  } catch (error) {
    logger.error('Piko listRoutes error:', error);
    res.status(500).json({ success: false, message: 'Failed to list routes', error: error.message });
  }
};

// @desc  Get one route (by id or slug)
// @route GET /api/piko/routes/:id
const getRoute = async (req, res) => {
  try {
    const route = await findRoute(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.status(200).json({ success: true, data: route.toClient(req.user._id) });
  } catch (error) {
    logger.error('Piko getRoute error:', error);
    res.status(500).json({ success: false, message: 'Failed to get route', error: error.message });
  }
};

// @desc  Create a user-generated route (enters moderation)
// @route POST /api/piko/routes
const createRoute = async (req, res) => {
  try {
    const b = req.body;
    const coords = b.geometry && Array.isArray(b.geometry.coordinates) ? b.geometry.coordinates : null;
    const start = coords && coords.length ? coords[0] : null;
    const route = await Route.create({
      type: 'user_generated',
      title: b.title,
      country: b.country || '',
      location: b.location || 'Your route',
      description: b.description || '',
      difficulty: b.difficulty || 'moderate',
      distanceKm: b.distanceKm || 0,
      elevationGainM: b.elevationGainM || 0,
      estimatedDurationMins: b.estimatedDurationMins || 0,
      photos: b.photos || [],
      tags: b.tags || [],
      ecoScore: b.ecoScore ?? 75,
      weatherScore: b.weatherScore ?? 70,
      accessibilityScore: b.accessibilityScore ?? 50,
      ecoImpact: b.ecoImpact || { transportMode: '', co2EstimateKg: 0, greenerAlternatives: [] },
      geometry: coords ? { type: 'LineString', coordinates: coords } : undefined,
      startPoint: start && start.length >= 2 ? { type: 'Point', coordinates: [start[0], start[1]] } : undefined,
      creator: req.user._id,
      creatorName: req.user.name || 'You',
      moderation: { status: 'pending', reports: [] },
    });
    res.status(201).json({ success: true, data: route.toClient(req.user._id) });
  } catch (error) {
    logger.error('Piko createRoute error:', error);
    res.status(500).json({ success: false, message: 'Failed to create route', error: error.message });
  }
};

// @desc  Toggle save / bookmark
// @route POST /api/piko/routes/:id/save
const toggleSave = async (req, res) => {
  try {
    const route = await findRoute(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const uid = req.user._id.toString();
    const has = (route.savedBy || []).some((u) => u.toString() === uid);
    route.savedBy = has ? route.savedBy.filter((u) => u.toString() !== uid) : [...route.savedBy, req.user._id];
    await route.save();
    res.status(200).json({ success: true, data: { isSaved: !has, saveCount: route.savedBy.length } });
  } catch (error) {
    logger.error('Piko toggleSave error:', error);
    res.status(500).json({ success: false, message: 'Failed to update saved routes', error: error.message });
  }
};

// @desc  My saved routes
// @route GET /api/piko/saved
const getSaved = async (req, res) => {
  try {
    const routes = await Route.find({ savedBy: req.user._id });
    res.status(200).json({ success: true, data: routes.map((r) => r.toClient(req.user._id)) });
  } catch (error) {
    logger.error('Piko getSaved error:', error);
    res.status(500).json({ success: false, message: 'Failed to get saved routes', error: error.message });
  }
};

// @desc  Vote a route (global popularity). value: 1 | -1 | 0 (clear)
// @route POST /api/piko/routes/:id/vote
const vote = async (req, res) => {
  try {
    const value = req.body.value;
    if (![1, -1, 0].includes(value)) return res.status(400).json({ success: false, message: 'Invalid vote value' });
    const route = await findRoute(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const uid = req.user._id.toString();
    route.votes = (route.votes || []).filter((v) => v.user && v.user.toString() !== uid);
    if (value === 1 || value === -1) route.votes.push({ user: req.user._id, value });
    await route.save();
    const voteScore = route.votes.reduce((s, v) => s + v.value, 0);
    // Best-effort live update to anyone viewing this route.
    try {
      req.app.get('io')?.to(`route:${route._id}`).emit('route:voteScore', { routeId: route.slug || route._id.toString(), voteScore });
    } catch (_) { /* socket optional */ }
    res.status(200).json({ success: true, data: { voteScore, userVote: value } });
  } catch (error) {
    logger.error('Piko vote error:', error);
    res.status(500).json({ success: false, message: 'Failed to vote', error: error.message });
  }
};

// @desc  Comments
// @route GET /api/piko/routes/:id/comments
const listComments = async (req, res) => {
  try {
    const route = await findRoute(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const comments = (route.comments || []).map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt,
    }));
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    logger.error('Piko listComments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get comments', error: error.message });
  }
};

// @route POST /api/piko/routes/:id/comments
const addComment = async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    const route = await findRoute(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const comment = {
      id: `c-${Date.now()}`,
      user: req.user._id,
      author: req.user.name || 'You',
      content,
      createdAt: new Date(),
    };
    route.comments.push(comment);
    await route.save();
    const payload = { id: comment.id, author: comment.author, content: comment.content, createdAt: comment.createdAt };
    try {
      req.app.get('io')?.to(`route:${route._id}`).emit('route:comment', { routeId: route.slug || route._id.toString(), comment: payload });
    } catch (_) { /* socket optional */ }
    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    logger.error('Piko addComment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
};

// @desc  Add a route to a trip's dashboard as a `route` sticky note
// @route POST /api/piko/routes/:id/add-to-plan   body: { dashboardId }
const addToPlan = async (req, res) => {
  try {
    const route = await findRoute(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });

    const dashboard = await Dashboard.findById(req.body.dashboardId);
    if (!dashboard) return res.status(404).json({ success: false, message: 'Plan not found' });

    const uid = req.user._id.toString();
    const isMember =
      dashboard.owner.toString() === uid ||
      (dashboard.collaborators || []).some((c) => c.user && c.user.toString() === uid);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member of this plan' });

    const startPoint =
      route.startPoint && Array.isArray(route.startPoint.coordinates) && route.startPoint.coordinates.length === 2
        ? route.startPoint.coordinates
        : null;

    // Real eco impact (Layer 4): compute the trip-base → trailhead journey CO2
    // via Climatiq ONCE and cache it in the note metadata. Gated behind an
    // explicit env key so it no-ops cleanly when unset; falls back to the
    // route's static estimate on any failure.
    let co2EstimateKg = route.ecoImpact ? route.ecoImpact.co2EstimateKg : 0;
    let co2Source = 'static';
    if (process.env.CLIMATIQ_API_KEY && startPoint) {
      try {
        const Trip = require('../models/trip.model');
        const trip = await Trip.findById(dashboard.tripId).select('destination');
        const base = trip && trip.destination && trip.destination.coordinates;
        if (base && typeof base.lat === 'number' && typeof base.lng === 'number') {
          const toRad = (d) => (d * Math.PI) / 180;
          const dLat = toRad(startPoint[1] - base.lat);
          const dLng = toRad(startPoint[0] - base.lng);
          const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(base.lat)) * Math.cos(toRad(startPoint[1])) * Math.sin(dLng / 2) ** 2;
          const distanceKm = Math.round(2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h))));
          if (distanceKm > 1) {
            const transport = ((route.ecoImpact && route.ecoImpact.transportMode) || '').toLowerCase();
            const mode = /train|rail/.test(transport) ? 'train' : /bus|shuttle|coach/.test(transport) ? 'bus' : 'car';
            const climatiq = require('../services/climatiq.service');
            const passengers = 1 + (dashboard.collaborators || []).length;
            const co2 = await climatiq.calculateTransportEmissions({ mode, distance: distanceKm, passengers });
            if (typeof co2 === 'number' && Number.isFinite(co2)) {
              co2EstimateKg = Math.round(co2 * 10) / 10;
              co2Source = 'climatiq';
            }
          }
        }
      } catch (e) {
        logger.warn('Climatiq eco estimate failed (using static):', e.message);
      }
    }

    const note = {
      id: `route-${route._id}-${Date.now()}`,
      type: 'route',
      x: 40,
      y: 40,
      width: 220,
      height: 150,
      content: route.title,
      color: '#e8f2e6',
      metadata: {
        routeId: route.slug || route._id.toString(),
        title: route.title,
        location: route.location,
        distanceKm: route.distanceKm,
        elevationGainM: route.elevationGainM,
        difficulty: route.difficulty,
        ecoScore: route.ecoScore,
        thumbnail: (route.photos || [])[0] || null,
        // Layer 4: trailhead for group-date weather + cached eco estimate.
        startPoint,
        co2EstimateKg,
        co2Source,
        tags: route.tags || [],
      },
      createdBy: { userId: req.user._id, name: req.user.name || 'You' },
    };
    dashboard.notes.push(note);
    await dashboard.save();

    try {
      req.app.get('io')?.to(dashboard._id.toString()).emit('route:added', {
        dashboardId: dashboard._id.toString(),
        note,
      });
    } catch (_) { /* socket optional */ }

    res.status(201).json({ success: true, message: 'Added to plan', data: { note } });
  } catch (error) {
    logger.error('Piko addToPlan error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to plan', error: error.message });
  }
};

// @desc  Snap drawn/recorded waypoints to real trails (Draw + Record flows)
// @route POST /api/piko/route   body: { points, profile, elevation }
const routeSnap = async (req, res) => {
  try {
    const result = await graphhopper.snapRoute(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Routing failed' });
  }
};

module.exports = {
  listRoutes,
  getRoute,
  createRoute,
  toggleSave,
  getSaved,
  routeSnap,
  vote,
  listComments,
  addComment,
  addToPlan,
};
