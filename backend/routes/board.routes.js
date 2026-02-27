const express = require('express');
const {
  getDashboard,
  getActiveUsers,
  joinDashboard,
  leaveDashboard,
  updateActivity,
  inviteUser,
  acceptInvitation,
  declineInvitation,
} = require('../controllers/board.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Dashboard routes
router.get('/:boardId', getDashboard);
router.get('/:boardId/active-users', getActiveUsers);
router.post('/:boardId/join', joinDashboard);
router.post('/:boardId/leave', leaveDashboard);
router.put('/:boardId/activity', updateActivity);

// Invitation routes
router.post('/:boardId/invite', inviteUser);
router.post('/invitations/:invitationId/accept', acceptInvitation);
router.post('/invitations/:invitationId/decline', declineInvitation);

module.exports = router;
