const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// @desc    Create conversation
// @route   POST /api/chat/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { name, description, isGroup, participants = [] } = req.body;

    // Start with current user as the creator
    const participantIds = [req.user._id.toString()];

    // Add other participants if provided (filter out current user to avoid duplicates)
    if (participants && participants.length > 0) {
      const validParticipants = participants.filter(p => p && p !== req.user._id.toString());
      
      // Validate additional participants exist
      if (validParticipants.length > 0) {
        const existingUsers = await User.find({ _id: { $in: validParticipants } });
        const existingIds = existingUsers.map(u => u._id.toString());
        
        // Only add participants that exist
        validParticipants.forEach(p => {
          if (existingIds.includes(p)) {
            participantIds.push(p);
          }
        });
      }
    }

    // Create participants array with user objects
    const participantObjects = participantIds.map(userId => ({
      user: userId,
      role: userId === req.user._id.toString() ? 'admin' : 'member',
      joinedAt: new Date(),
      lastReadAt: new Date()
    }));

    const conversation = await Conversation.create({
      name,
      description,
      isGroup,
      participants: participantObjects,
      createdBy: req.user._id
    });

    logger.info(`Conversation created: ${conversation.name || 'Unnamed'} by ${req.user.email}`);

    // Refetch the conversation with populated participants
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants.user', 'name avatar email')
      .populate('createdBy', 'name avatar email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation: populatedConversation }
    });
  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
};

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.user': req.user._id,
      participants: { $exists: true, $ne: [] }
    })
    .populate('participants.user', 'name avatar')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name avatar' }
    })
    .sort({ updatedAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      data: {
        conversations,
        count: conversations.length
      }
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

// @desc    Get single conversation
// @route   GET /api/chat/conversations/:id
// @access  Private
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.user', 'name avatar')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    res.status(200).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message
    });
  }
};

// @desc    Update conversation
// @route   PUT /api/chat/conversations/:id
// @access  Private
const updateConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is admin
    const participant = conversation.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant || participant.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this conversation'
      });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('participants.user', 'name avatar');

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('group:profile_updated', {
        conversationId: req.params.id,
        name: updatedConversation.name,
        avatar: updatedConversation.avatar,
        timestamp: new Date()
      });
      logger.info(`Group profile updated event emitted for conversation ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Conversation updated successfully',
      data: { conversation: updatedConversation }
    });
  } catch (error) {
    logger.error('Update conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update conversation',
      error: error.message
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/chat/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is admin
    const participant = conversation.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant || participant.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: req.params.id });

    // Delete conversation
    await Conversation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content, messageType, attachments, replyTo } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
      replyTo
    });

    await message.populate('sender', 'name avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get conversation messages
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .populate('reactions.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ conversation: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:messageId/reactions
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(emoji, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully'
    });
  } catch (error) {
    logger.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
};

// @desc    Remove reaction from message
// @route   DELETE /api/chat/messages/:messageId/reactions/:emoji
// @access  Private
const removeReaction = async (req, res) => {
  try {
    const { emoji } = req.params;

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.removeReaction(emoji, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    logger.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error.message
    });
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await conversation.markAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.softDelete();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// @desc    Upload group avatar
// @route   POST /api/chat/conversations/:id/avatar
// @access  Private
const uploadGroupAvatar = async (req, res) => {
  try {
    const { uploadFile } = require('../services/cloud.service');

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Can only set avatar for group conversations'
      });
    }

    // Check if user is admin
    const participant = conversation.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant || participant.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can update the avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary using buffer from multer
    const uploadResult = await uploadFile(req.file.buffer, {
      folder: 'dayla/group_avatars',
      resource_type: 'image'
    });

    // Use the secure_url directly
    const avatarUrl = uploadResult.url;

    // Update conversation avatar
    conversation.avatar = avatarUrl;
    await conversation.save();

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('group:profile_updated', {
        conversationId: req.params.id,
        name: conversation.name,
        avatar: avatarUrl,
        timestamp: new Date()
      });
      logger.info(`Group avatar updated event emitted for conversation ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Group avatar updated successfully',
      data: { avatar: avatarUrl }
    });

  } catch (error) {
    logger.error('Upload group avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// @desc    Generate invite link
// @route   POST /api/chat/conversations/:id/invite-link
// @access  Private
const generateInviteLink = async (req, res) => {
  try {
    const crypto = require('crypto');

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Can only generate invite links for group conversations'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate invite link'
      });
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex');

    // Store invite code in conversation (you may want to add this field to schema)
    conversation.inviteCode = inviteCode;
    conversation.inviteCodeExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await conversation.save();

    logger.info(`Invite link generated for conversation ${req.params.id}: ${inviteCode}`);

    res.status(200).json({
      success: true,
      message: 'Invite link generated successfully',
      data: { inviteCode }
    });

  } catch (error) {
    logger.error('Generate invite link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invite link',
      error: error.message
    });
  }
};

// @desc    Join group via invite link
// @route   POST /api/chat/join/:inviteCode
// @access  Private
const joinViaInvite = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const conversation = await Conversation.findOne({
      inviteCode,
      inviteCodeExpires: { $gt: new Date() }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invite link'
      });
    }

    // Check if user is already a participant
    const isParticipant = conversation.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Add user as participant
    conversation.participants.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date(),
      lastReadAt: new Date()
    });

    await conversation.save();

    // Populate user details
    await conversation.populate('participants.user', 'name avatar email');

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(conversation._id.toString()).emit('group:member_joined', {
        conversationId: conversation._id,
        user: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar,
          email: req.user.email
        },
        timestamp: new Date()
      });
      logger.info(`Group member joined event emitted: ${req.user.email} joined conversation ${conversation._id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully joined the group',
      data: { conversation }
    });

  } catch (error) {
    logger.error('Join via invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
      error: error.message
    });
  }
};

// @desc    Add members to group
// @route   POST /api/chat/conversations/:id/members
// @access  Private
const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Can only add members to group conversations'
      });
    }

    // Check if user is participant (any member can add)
    const isParticipant = conversation.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members'
      });
    }

    // Verify all users exist
    const usersToAdd = await User.find({ _id: { $in: userIds } });
    
    if (usersToAdd.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some users were not found'
      });
    }

    // Add each user to conversation
    const addedUsers = [];
    for (const userToAdd of usersToAdd) {
      // Check if already a participant
      const isAlreadyMember = conversation.participants.some(
        p => p.user.toString() === userToAdd._id.toString()
      );

      if (!isAlreadyMember) {
        conversation.participants.push({
          user: userToAdd._id,
          role: 'member',
          joinedAt: new Date(),
          lastReadAt: new Date()
        });
        addedUsers.push({
          _id: userToAdd._id,
          name: userToAdd.name,
          avatar: userToAdd.avatar,
          email: userToAdd.email
        });
      }
    }

    if (addedUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All users are already members'
      });
    }

    await conversation.save();

    // Emit WebSocket event for each added user
    const io = req.app.get('io');
    if (io) {
      addedUsers.forEach(addedUser => {
        io.to(conversation._id.toString()).emit('group:member_added', {
          conversationId: conversation._id,
          user: addedUser,
          addedBy: {
            _id: req.user._id,
            name: req.user.name,
            avatar: req.user.avatar
          },
          timestamp: new Date()
        });
        logger.info(`Group member added event emitted: ${addedUser.email} added to conversation ${conversation._id}`);
      });
    }

    logger.info(`Added ${addedUsers.length} members to conversation ${conversation._id}`);

    res.status(200).json({
      success: true,
      message: `Successfully added ${addedUsers.length} member${addedUsers.length > 1 ? 's' : ''}`,
      data: { addedUsers }
    });

  } catch (error) {
    logger.error('Add members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add members',
      error: error.message
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  sendMessage,
  getMessages,
  addReaction,
  removeReaction,
  markAsRead,
  deleteMessage,
  uploadGroupAvatar,
  generateInviteLink,
  joinViaInvite,
  addMembers
};
