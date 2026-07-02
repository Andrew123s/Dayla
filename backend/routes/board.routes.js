const express = require('express');
const {
  getDashboard,
  getDashboardByTrip,
  getActiveUsers,
  joinDashboard,
  leaveDashboard,
  updateActivity,
  inviteUser,
  acceptInvitation,
  declineInvitation,
} = require('../controllers/board.controller');
const {
  groupVoteRoute,
  selectRoute,
  addGroupTask,
  assignGroupTask,
} = require('../controllers/boardGroup.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Dashboard routes
router.get('/by-trip/:tripId', getDashboardByTrip);
router.get('/:boardId', getDashboard);
router.get('/:boardId/active-users', getActiveUsers);
router.post('/:boardId/join', joinDashboard);
router.post('/:boardId/leave', leaveDashboard);
router.put('/:boardId/activity', updateActivity);

// Piko group decision (Layer 3) — group-scoped votes, selected route, role tasks
router.post('/:boardId/routes/:routeId/group-vote', groupVoteRoute);
router.post('/:boardId/select-route', selectRoute);
router.post('/:boardId/tasks', addGroupTask);
router.patch('/:boardId/tasks/:taskId', assignGroupTask);

// Invitation routes
router.post('/:boardId/invite', inviteUser);
router.post('/invitations/:invitationId/accept', acceptInvitation);
router.post('/invitations/:invitationId/decline', declineInvitation);

module.exports = router;
