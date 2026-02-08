const Dashboard = require('../models/dashboard.model');
const User = require('../models/user.model');
const { sendInvitationEmail } = require('../services/email.service');
const logger = require('../utils/logger');

// @desc    Get active users for a dashboard
// @route   GET /api/boards/:boardId/active-users
// @access  Private
const getActiveUsers = async (req, res) => {
  try {
    const { boardId } = req.params;

    const dashboard = await Dashboard.findById(boardId)
      .populate('activeUsers.userId', 'name avatar')
      .select('activeUsers');

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check if user has access to this dashboard
    const isCollaborator = dashboard.collaborators.some(c =>
      c.user.toString() === req.user._id.toString()
    );
    const isOwner = dashboard.owner.toString() === req.user._id.toString();

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this dashboard'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activeUsers: dashboard.activeUsers,
        count: dashboard.activeUsers.length
      }
    });
  } catch (error) {
    logger.error('Get active users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active users',
      error: error.message
    });
  }
};

// @desc    User joins dashboard (becomes active)
// @route   POST /api/boards/:boardId/join
// @access  Private
const joinDashboard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const dashboard = await Dashboard.findById(boardId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check if user has access to this dashboard
    const isCollaborator = dashboard.collaborators.some(c =>
      c.user.toString() === req.user._id.toString()
    );
    const isOwner = dashboard.owner.toString() === req.user._id.toString();

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to join this dashboard'
      });
    }

    // Add user to active users
    await dashboard.addActiveUser({
      userId: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      currentNote: null
    });

    logger.info(`User ${req.user.email} joined dashboard ${boardId}`);

    res.status(200).json({
      success: true,
      message: 'Successfully joined dashboard',
      data: {
        activeUsers: dashboard.activeUsers,
        count: dashboard.activeUsers.length
      }
    });
  } catch (error) {
    logger.error('Join dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join dashboard',
      error: error.message
    });
  }
};

// @desc    User leaves dashboard (removes from active)
// @route   POST /api/boards/:boardId/leave
// @access  Private
const leaveDashboard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const dashboard = await Dashboard.findById(boardId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    await dashboard.removeActiveUser(req.user._id);

    logger.info(`User ${req.user.email} left dashboard ${boardId}`);

    res.status(200).json({
      success: true,
      message: 'Successfully left dashboard'
    });
  } catch (error) {
    logger.error('Leave dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave dashboard',
      error: error.message
    });
  }
};

// @desc    Update user's current activity on dashboard
// @route   PUT /api/boards/:boardId/activity
// @access  Private
const updateActivity = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { currentNote, cursorPosition } = req.body;

    const dashboard = await Dashboard.findById(boardId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Find and update the active user
    const activeUserIndex = dashboard.activeUsers.findIndex(
      user => user.userId.toString() === req.user._id.toString()
    );

    if (activeUserIndex > -1) {
      dashboard.activeUsers[activeUserIndex].currentNote = currentNote;
      dashboard.activeUsers[activeUserIndex].cursorPosition = cursorPosition;
      dashboard.activeUsers[activeUserIndex].lastActive = new Date();
      await dashboard.save();
    }

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully'
    });
  } catch (error) {
    logger.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
};

// @desc    Invite user to dashboard
// @route   POST /api/boards/:boardId/invite
// @access  Private
const inviteUser = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email, role = 'editor' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const dashboard = await Dashboard.findById(boardId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    // Check if user is owner or admin
    const isOwner = dashboard.owner.toString() === req.user._id.toString();
    const collaborator = dashboard.collaborators.find(c =>
      c.user.toString() === req.user._id.toString()
    );
    const isAdmin = collaborator && collaborator.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to invite users'
      });
    }

    // Check if user is already invited or is a collaborator
    const existingInvitation = dashboard.invitations.find(inv =>
      inv.email === email && inv.status === 'pending'
    );
    const existingCollaborator = dashboard.collaborators.find(c =>
      c.user.email === email // This would need user population
    );

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'User is already invited'
      });
    }

    // Create invitation
    const invitation = dashboard.createInvitation(email, req.user._id);
    await dashboard.save();

    // Build invitation URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const invitationUrl = `${frontendUrl}/accept-invitation?invitationId=${invitation.id}`;

    // Send email invitation
    try {
      await sendInvitationEmail(email, req.user.name, dashboard.name, invitationUrl);
      logger.info(`Invitation email sent to ${email} for dashboard ${boardId}`);
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
      // Continue with invitation even if email fails
    }

    logger.info(`User ${req.user.email} invited ${email} to dashboard ${boardId}`);

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt
        }
      }
    });
  } catch (error) {
    logger.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: error.message
    });
  }
};

// @desc    Accept invitation to dashboard
// @route   POST /api/invitations/:invitationId/accept
// @access  Private
const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Find dashboard with this invitation
    const dashboard = await Dashboard.findOne({
      'invitations.id': invitationId,
      'invitations.email': req.user.email
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    const invitation = dashboard.invitations.find(inv => inv.id === invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is no longer valid'
      });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await dashboard.save();
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired'
      });
    }

    // Add user as collaborator
    dashboard.addCollaborator(req.user._id, 'editor');
    invitation.status = 'accepted';

    await dashboard.save();

    logger.info(`User ${req.user.email} accepted invitation to dashboard ${dashboard._id}`);

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        dashboard: {
          id: dashboard._id,
          name: dashboard.name,
          role: 'editor'
        }
      }
    });
  } catch (error) {
    logger.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
      error: error.message
    });
  }
};

// @desc    Decline invitation to dashboard
// @route   POST /api/invitations/:invitationId/decline
// @access  Private
const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const dashboard = await Dashboard.findOne({
      'invitations.id': invitationId,
      'invitations.email': req.user.email
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    const invitation = dashboard.invitations.find(inv => inv.id === invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    invitation.status = 'declined';
    await dashboard.save();

    logger.info(`User ${req.user.email} declined invitation to dashboard ${dashboard._id}`);

    res.status(200).json({
      success: true,
      message: 'Invitation declined successfully'
    });
  } catch (error) {
    logger.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline invitation',
      error: error.message
    });
  }
};

// @desc    Get user's pending invitations
// @route   GET /api/invitations/pending
// @access  Private
const getPendingInvitations = async (req, res) => {
  try {
    const dashboards = await Dashboard.find({
      'invitations.email': req.user.email,
      'invitations.status': 'pending'
    }).select('name owner invitations');

    const pendingInvitations = [];

    dashboards.forEach(dashboard => {
      const invitations = dashboard.invitations.filter(
        inv => inv.email === req.user.email && inv.status === 'pending'
      );

      invitations.forEach(invitation => {
        if (new Date() <= invitation.expiresAt) {
          pendingInvitations.push({
            id: invitation.id,
            dashboardId: dashboard._id,
            dashboardName: dashboard.name,
            invitedBy: invitation.invitedBy,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        invitations: pendingInvitations,
        count: pendingInvitations.length
      }
    });
  } catch (error) {
    logger.error('Get pending invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending invitations',
      error: error.message
    });
  }
};

module.exports = {
  getActiveUsers,
  joinDashboard,
  leaveDashboard,
  updateActivity,
  inviteUser,
  acceptInvitation,
  declineInvitation,
  getPendingInvitations
};