const Trip = require('../models/trip.model');
const Dashboard = require('../models/dashboard.model');
const Route = require('../models/route.model');
const User = require('../models/user.model');
const gemini = require('../services/gemini.service');
const permissions = require('../utils/permissions');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Dayla Compass — the AI trip co-pilot. One call turns an empty board into a
// starting point the group argues about: a day-by-day plan as sticky notes,
// matching Piko trail candidates as route notes (ready for the group vote),
// a budget skeleton and a packing seed. Compass drafts; the group decides.
//
// Monetization: the first draft is free for everyone (the "taste"); further
// drafts require Pro. The counter lives on the user (compassDraftsUsed).
// ─────────────────────────────────────────────────────────────────────────────

const VIBE_DIFFICULTY = {
  relaxed: 'easy',
  balanced: 'moderate',
  adventurous: 'hard',
};

function daysBetween(dates) {
  if (!dates || !dates.startDate) return 3;
  const s = new Date(dates.startDate);
  const e = dates.endDate ? new Date(dates.endDate) : s;
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

// Sticky-note grid layout: Compass lays its notes out like a tidy board,
// leaving row 0 free for whatever the group had already placed.
function gridPosition(index, columns = 3) {
  return {
    x: 40 + (index % columns) * 250,
    y: 240 + Math.floor(index / columns) * 210,
  };
}

// @desc  Draft a trip onto its board
// @route POST /api/compass/draft   body { tripId, vibe?, interests?: [] }
const draftTrip = async (req, res) => {
  try {
    const { tripId, vibe = 'balanced' } = req.body;
    const interests = Array.isArray(req.body.interests) ? req.body.interests.slice(0, 8) : [];

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    const uid = req.user._id.toString();
    const isMember =
      trip.owner.toString() === uid ||
      (trip.collaborators || []).some((c) => c.toString() === uid);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized for this trip' });
    }

    const dashboard = await Dashboard.findOne({ tripId: trip._id });
    if (!dashboard) {
      return res.status(404).json({ success: false, message: 'No board found for this trip' });
    }

    // First draft free; after that, Pro.
    const used = req.user.compassDraftsUsed || 0;
    if (!permissions.isPro(req.user) && used >= 1) {
      return res.status(403).json({
        success: false,
        code: 'UPGRADE_REQUIRED',
        feature: 'compass',
        requiredPlan: 'pro',
        message: 'Your free Compass draft is used. Upgrade to Pro for unlimited drafting.',
      });
    }

    const destination = (trip.destination && trip.destination.name) || trip.name;
    const duration = daysBetween(trip.dates);
    const groupSize = 1 + (trip.collaborators || []).length;

    // ── 1. Gemini drafts the plan ──
    const plan = await gemini.generateTripPlan({
      destination,
      duration,
      budget: (trip.budget && trip.budget.total) ? `${trip.budget.total} ${trip.budget.currency || 'EUR'}` : 'flexible',
      interests: [...interests, `${vibe} pace`],
      groupSize,
    });

    // ── 2. Matching Piko trail candidates (same country first, then any) ──
    const difficulty = VIBE_DIFFICULTY[vibe] || 'moderate';
    const routeQuery = { 'moderation.status': 'approved', difficulty };
    let candidates = [];
    const country = trip.destination && trip.destination.country;
    if (country) {
      candidates = await Route.find({ ...routeQuery, country: new RegExp(`^${country}$`, 'i') }).limit(3);
    }
    if (candidates.length === 0) {
      candidates = await Route.find(routeQuery).limit(3);
    }

    // ── 3. Build the board notes ──
    const stamp = Date.now();
    const notes = [];
    let slot = 0;
    const addNote = (note) =>
      notes.push({
        id: `compass-${stamp}-${notes.length}`,
        width: 230,
        height: 170,
        createdBy: { userId: req.user._id, name: 'Dayla Compass' },
        ...gridPosition(slot++),
        ...note,
      });

    if (plan.overview) {
      addNote({ type: 'text', color: '#fefae0', content: `🧭 ${plan.overview}` });
    }

    for (const day of (plan.itinerary || []).slice(0, Math.min(duration, 7))) {
      const activities = (day.activities || []).slice(0, 4).map((a) => `• ${a}`).join('\n');
      addNote({
        type: 'schedule',
        color: '#e9edc9',
        content: `Day ${day.day}${day.title ? ` — ${day.title}` : ''}\n${activities}`,
      });
    }

    if (plan.budget && plan.budget.breakdown) {
      const b = plan.budget.breakdown;
      addNote({
        type: 'budget',
        color: '#faedcd',
        content:
          `Budget sketch (${plan.budget.currency || 'EUR'})\n` +
          `• Stay: ${b.accommodation || 0}\n` +
          `• Food: ${b.food || 0}\n` +
          `• Activities: ${b.activities || 0}\n` +
          `• Transport: ${b.transportation || 0}`,
      });
    }

    if (Array.isArray(plan.ecoTips) && plan.ecoTips.length) {
      addNote({
        type: 'sustainability',
        color: '#ccd5ae',
        content: `🌱 Travel lighter\n${plan.ecoTips.slice(0, 3).map((t) => `• ${t}`).join('\n')}`,
      });
    }

    if (Array.isArray(plan.packingList) && plan.packingList.length) {
      addNote({
        type: 'text',
        color: '#d8e2dc',
        content: `🎒 Don't forget\n${plan.packingList.slice(0, 6).map((i) => `• ${i}`).join('\n')}`,
      });
    }

    for (const route of candidates) {
      addNote({
        type: 'route',
        color: '#e8f2e6',
        height: 150,
        content: route.title,
        metadata: {
          routeId: route.slug || route._id.toString(),
          title: route.title,
          location: route.location,
          distanceKm: route.distanceKm,
          elevationGainM: route.elevationGainM,
          difficulty: route.difficulty,
          ecoScore: route.ecoScore,
          thumbnail: (route.photos || [])[0] || null,
          startPoint:
            route.startPoint && Array.isArray(route.startPoint.coordinates)
              ? route.startPoint.coordinates
              : null,
          tags: route.tags || [],
        },
      });
    }

    await Dashboard.findByIdAndUpdate(dashboard._id, {
      $push: { notes: { $each: notes } },
      $set: { lastModified: new Date() },
    });

    // Fill the trip's budget skeleton only when the group hasn't set one.
    if (plan.budget && plan.budget.total && !(trip.budget && trip.budget.total)) {
      const b = plan.budget.breakdown || {};
      await Trip.findByIdAndUpdate(trip._id, {
        $set: {
          budget: {
            total: plan.budget.total,
            currency: plan.budget.currency || 'EUR',
            categories: {
              accommodation: b.accommodation || 0,
              transportation: b.transportation || 0,
              food: b.food || 0,
              activities: b.activities || 0,
              other: b.misc || 0,
            },
          },
        },
      });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { compassDraftsUsed: 1 } });

    // Live boards refresh for everyone who has it open.
    try {
      req.app.get('io')?.to(dashboard._id.toString()).emit('note_updated', {
        noteId: notes[0] && notes[0].id,
        updatedBy: { userId: req.user._id, userName: 'Dayla Compass' },
        timestamp: new Date(),
      });
    } catch (_) { /* socket optional */ }

    logger.info(`Compass drafted trip ${trip._id}: ${notes.length} notes, ${candidates.length} trails`);
    res.status(201).json({
      success: true,
      message: 'Compass drafted your trip',
      data: {
        notesAdded: notes.length,
        trailCandidates: candidates.length,
        overview: plan.overview || '',
      },
    });
  } catch (error) {
    logger.error('Compass draft error:', error);
    const notConfigured = /api key|API_KEY|not configured/i.test(error.message || '');
    res.status(notConfigured ? 503 : 500).json({
      success: false,
      message: notConfigured
        ? 'Compass is not available right now (AI service not configured).'
        : 'Compass could not draft this trip. Try again in a moment.',
      // Underlying cause (model errors, quota) — shown in logs/clients so
      // failures are diagnosable instead of a blank shrug.
      detail: (error.message || '').slice(0, 300),
    });
  }
};

module.exports = { draftTrip };
