const Memory = require('../models/memory.model');
const Trip = require('../models/trip.model');
const Post = require('../models/post.model');
const logger = require('../utils/logger');
const { assembleMemoryForTrip } = require('../services/memory.service');

// ─────────────────────────────────────────────────────────────────────────────
// Mriz memories — list / view / generate / share. All auth-protected; a
// memory is visible to its owner and trip participants.
// ─────────────────────────────────────────────────────────────────────────────

function canView(memory, userId) {
  const uid = userId.toString();
  return (
    memory.owner.toString() === uid ||
    (memory.participants || []).some((p) => p.toString() === uid)
  );
}

// @desc  My memories (owner or participant), newest first
// @route GET /api/memories
const listMemories = async (req, res) => {
  try {
    const memories = await Memory.find({
      $or: [{ owner: req.user._id }, { participants: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: { memories } });
  } catch (error) {
    logger.error('List memories error:', error);
    res.status(500).json({ success: false, message: 'Failed to load memories' });
  }
};

// @desc  One memory
// @route GET /api/memories/:id
const getMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('owner', 'name avatar');
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }
    if (!canView(memory, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: { memory } });
  } catch (error) {
    logger.error('Get memory error:', error);
    res.status(500).json({ success: false, message: 'Failed to load memory' });
  }
};

// @desc  Generate (or refresh) the memory for a trip — owner/collaborator.
//        Also serves as backfill for trips completed before Mriz existed.
// @route POST /api/memories/generate/:tripId
const generateMemory = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    const uid = req.user._id.toString();
    const isMember =
      trip.owner.toString() === uid ||
      (trip.collaborators || []).some((c) => c.toString() === uid);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existing = await Memory.findOne({ tripId: trip._id });
    const memory = await assembleMemoryForTrip(trip._id, {
      // Only notify the group on FIRST assembly — refreshes stay quiet.
      notify: !existing,
      io: req.app.get('io'),
    });
    res.status(200).json({ success: true, data: { memory } });
  } catch (error) {
    logger.error('Generate memory error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate memory' });
  }
};

// @desc  Share the story card into the community feed
// @route POST /api/memories/:id/share
const shareMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }
    if (!canView(memory, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const s = memory.stats || {};
    const statLine = [
      s.distanceKm ? `${s.distanceKm} km` : null,
      s.elevationGainM ? `${s.elevationGainM} m up` : null,
      `${s.days || 1} day${(s.days || 1) === 1 ? '' : 's'}`,
    ]
      .filter(Boolean)
      .join(' · ');

    const post = await Post.create({
      author: req.user._id,
      content: `${memory.title} — ${statLine}${
        memory.moodTags.length ? `\n${memory.moodTags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' ')}` : ''
      }`,
      images: memory.coverPhoto ? [{ url: memory.coverPhoto }] : [],
      location: { name: memory.title },
    });

    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    logger.error('Share memory error:', error);
    res.status(500).json({ success: false, message: 'Failed to share memory' });
  }
};

module.exports = { listMemories, getMemory, generateMemory, shareMemory };
