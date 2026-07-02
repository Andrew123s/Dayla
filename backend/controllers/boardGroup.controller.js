const Dashboard = require('../models/dashboard.model');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Board group-decision controller (Piko Layer 3).
//
// Group-scoped route votes, the collaborative "Selected Route", and role tasks —
// all stored on the trip's Dashboard and broadcast to its socket room so every
// collaborator updates live. Separate from board.controller.js to keep the core
// dashboard logic untouched. Everything is scoped to dashboard membership.
// ─────────────────────────────────────────────────────────────────────────────

async function loadMember(boardId, userId) {
  const dashboard = await Dashboard.findById(boardId);
  if (!dashboard) return { dashboard: null, member: false, owner: false };
  const uid = userId.toString();
  const owner = dashboard.owner.toString() === uid;
  const collab = (dashboard.collaborators || []).some((c) => c.user && c.user.toString() === uid);
  return { dashboard, member: owner || collab, owner };
}

function emit(req, dashboardId, event, payload) {
  try {
    const io = req.app.get('io');
    if (io) io.to(dashboardId.toString()).emit(event, payload);
  } catch (error) {
    logger.error(`Failed to emit ${event}:`, error);
  }
}

// @route POST /api/boards/:boardId/routes/:routeId/group-vote   body { value: 1|-1|0 }
const groupVoteRoute = async (req, res) => {
  try {
    const { value } = req.body;
    if (![1, -1, 0].includes(value)) return res.status(400).json({ success: false, message: 'Invalid vote value' });
    const { dashboard, member } = await loadMember(req.params.boardId, req.user._id);
    if (!dashboard) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not a member of this plan' });

    const routeId = String(req.params.routeId);
    const uid = req.user._id.toString();
    const votes = dashboard.routeVotes || {};
    if (!votes[routeId]) votes[routeId] = {};
    if (value === 0) delete votes[routeId][uid];
    else votes[routeId][uid] = value;
    dashboard.routeVotes = votes;
    dashboard.markModified('routeVotes'); // Mixed field
    await dashboard.save();

    const voteScore = Object.values(votes[routeId] || {}).reduce((s, v) => s + v, 0);
    emit(req, dashboard._id, 'route:groupVote', { dashboardId: dashboard._id.toString(), routeId, voteScore });
    res.status(200).json({ success: true, data: { routeId, voteScore, userVote: value } });
  } catch (error) {
    logger.error('groupVoteRoute error:', error);
    res.status(500).json({ success: false, message: 'Failed to vote', error: error.message });
  }
};

/**
 * Layer 4: guarded auto-packing. When the group locks a route, regenerate the
 * trip's Ntelipak list through the EXISTING /api/packing/:tripId/generate
 * endpoint (proven persistence — we never write packing items directly). The
 * call is fire-and-forget with the caller's own auth forwarded, so a packing
 * failure can never break route selection. Skippable via body { autoPack:false }.
 */
function triggerAutoPacking(req, dashboard, routeId) {
  (async () => {
    try {
      if (!dashboard.tripId || !routeId) return;
      const note = (dashboard.notes || []).find(
        (n) => n.type === 'route' && n.metadata && String(n.metadata.routeId) === String(routeId)
      );
      const m = (note && note.metadata) || {};
      // Route-derived inputs: difficulty → activities, location → destination.
      const activities = ['hiking'];
      if (m.difficulty === 'hard') activities.push('camping');
      const tags = Array.isArray(m.tags) ? m.tags.map((t) => String(t).toLowerCase()) : [];
      if (tags.some((t) => /coast|beach|lake|hot spring/.test(t))) activities.push('swimming');

      const port = process.env.PORT || 5000;
      const headers = { 'Content-Type': 'application/json' };
      if (req.headers.authorization) headers.Authorization = req.headers.authorization;
      if (req.headers.cookie) headers.Cookie = req.headers.cookie;
      const resp = await fetch(`http://127.0.0.1:${port}/api/packing/${dashboard.tripId}/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ activities, destination: m.location || undefined }),
      });
      logger.info(`Auto-packing for trip ${dashboard.tripId} after route lock → ${resp.status}`);
      if (resp.ok) emit(req, dashboard._id, 'packing:regenerated', { dashboardId: dashboard._id.toString(), routeId });
    } catch (e) {
      logger.warn('Auto-packing trigger failed (non-fatal):', e.message);
    }
  })();
}

// @route POST /api/boards/:boardId/select-route   body { routeId, autoPack? }
const selectRoute = async (req, res) => {
  try {
    const { dashboard, member } = await loadMember(req.params.boardId, req.user._id);
    if (!dashboard) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not a member of this plan' });

    dashboard.selectedRouteId = req.body.routeId ? String(req.body.routeId) : null;
    await dashboard.save();
    emit(req, dashboard._id, 'route:selected', {
      dashboardId: dashboard._id.toString(),
      routeId: dashboard.selectedRouteId,
    });

    // Auto-generate the packing list for the newly locked route (guarded).
    if (dashboard.selectedRouteId && req.body.autoPack !== false) {
      triggerAutoPacking(req, dashboard, dashboard.selectedRouteId);
    }

    res.status(200).json({ success: true, data: { selectedRouteId: dashboard.selectedRouteId } });
  } catch (error) {
    logger.error('selectRoute error:', error);
    res.status(500).json({ success: false, message: 'Failed to select route', error: error.message });
  }
};

// @route POST /api/boards/:boardId/tasks   body { label }
const addGroupTask = async (req, res) => {
  try {
    const label = (req.body.label || '').trim();
    if (!label) return res.status(400).json({ success: false, message: 'Task label is required' });
    const { dashboard, member } = await loadMember(req.params.boardId, req.user._id);
    if (!dashboard) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not a member of this plan' });

    const task = { id: `task-${Date.now()}`, label, assignee: null };
    dashboard.groupTasks.push(task);
    await dashboard.save();
    emit(req, dashboard._id, 'task:updated', { dashboardId: dashboard._id.toString(), tasks: dashboard.groupTasks });
    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    logger.error('addGroupTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
  }
};

// @route PATCH /api/boards/:boardId/tasks/:taskId   body { assignee: userId | null }
const assignGroupTask = async (req, res) => {
  try {
    const { dashboard, member } = await loadMember(req.params.boardId, req.user._id);
    if (!dashboard) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not a member of this plan' });

    // Upsert by id so the client's default role tasks (stable ids) work without
    // a separate create step.
    let task = dashboard.groupTasks.find((t) => t.id === req.params.taskId);
    if (!task) {
      dashboard.groupTasks.push({ id: req.params.taskId, label: req.body.label || req.params.taskId, assignee: null });
      task = dashboard.groupTasks[dashboard.groupTasks.length - 1];
    }
    task.assignee = req.body.assignee || null;
    await dashboard.save();
    emit(req, dashboard._id, 'task:updated', { dashboardId: dashboard._id.toString(), tasks: dashboard.groupTasks });
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    logger.error('assignGroupTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign task', error: error.message });
  }
};

module.exports = { groupVoteRoute, selectRoute, addGroupTask, assignGroupTask };
