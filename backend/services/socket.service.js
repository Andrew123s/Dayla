const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const User = require('../models/user.model');
const Dashboard = require('../models/dashboard.model');
const Conversation = require('../models/conversation.model');
const logger = require('../utils/logger');

// Connected users map (socketId -> userId)
const connectedUsers = new Map();
// Room mappings (roomId -> Set of socketIds)
const rooms = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Invalid token or inactive user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`User ${user.email} connected with socket ${socket.id}`);

    // Store connected user
    connectedUsers.set(socket.id, user._id);

    // Handle user joining a room (dashboard or conversation)
    socket.on('join_room', async (data) => {
      try {
        const { roomId, roomType } = data; // roomType: 'dashboard' or 'conversation'

        // Leave previous rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        socket.join(roomId);

        // Add to rooms map
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        logger.info(`User ${user.email} joined ${roomType} room: ${roomId}`);

        // Handle room-specific logic
        if (roomType === 'dashboard') {
          // Add user to active users in dashboard
          const dashboard = await Dashboard.findById(roomId);
          if (dashboard) {
            await dashboard.addActiveUser({
              userId: user._id,
              name: user.name,
              avatar: user.avatar,
              currentNote: null
            });

            // Notify others in the room
            socket.to(roomId).emit('user_joined', {
              userId: user._id,
              name: user.name,
              avatar: user.avatar,
              timestamp: new Date()
            });
          }
        } else if (roomType === 'conversation') {
          // Mark messages as read
          const conversation = await Conversation.findById(roomId);
          if (conversation) {
            await conversation.markAsRead(user._id);
          }
        }

        socket.emit('room_joined', { roomId, roomType });

      } catch (error) {
        logger.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle user leaving a room
    socket.on('leave_room', async (data) => {
      try {
        const { roomId, roomType } = data;

        socket.leave(roomId);

        // Remove from rooms map
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
          }
        }

        logger.info(`User ${user.email} left ${roomType} room: ${roomId}`);

        // Handle room-specific logic
        if (roomType === 'dashboard') {
          // Remove user from active users in dashboard
          const dashboard = await Dashboard.findById(roomId);
          if (dashboard) {
            await dashboard.removeActiveUser(user._id);

            // Notify others in the room
            socket.to(roomId).emit('user_left', {
              userId: user._id,
              timestamp: new Date()
            });
          }
        }

      } catch (error) {
        logger.error('Leave room error:', error);
      }
    });

    // Handle note editing start
    socket.on('start_editing', (data) => {
      const { roomId, noteId } = data;

      socket.to(roomId).emit('user_editing', {
        userId: user._id,
        userName: user.name,
        avatar: user.avatar,
        noteId,
        timestamp: new Date()
      });
    });

    // Handle note editing end
    socket.on('stop_editing', (data) => {
      const { roomId, noteId } = data;

      socket.to(roomId).emit('user_stopped_editing', {
        userId: user._id,
        noteId,
        timestamp: new Date()
      });
    });

    // Handle cursor position updates
    socket.on('cursor_move', (data) => {
      const { roomId, x, y, noteId } = data;

      socket.to(roomId).emit('user_cursor', {
        userId: user._id,
        userName: user.name,
        avatar: user.avatar,
        x,
        y,
        noteId,
        timestamp: new Date()
      });
    });

    // Handle note updates (real-time sync)
    socket.on('note_update', async (data) => {
      try {
        const { roomId, noteId, updates } = data;

        // Update note in database
        const dashboard = await Dashboard.findOneAndUpdate(
          { _id: roomId, 'notes.id': noteId },
          {
            $set: {
              'notes.$': { ...updates, id: noteId },
              lastModified: new Date()
            }
          },
          { new: true }
        );

        if (dashboard) {
          // Broadcast update to other users in room
          socket.to(roomId).emit('note_updated', {
            noteId,
            updates,
            updatedBy: {
              userId: user._id,
              userName: user.name,
              avatar: user.avatar
            },
            timestamp: new Date()
          });
        }
      } catch (error) {
        logger.error('Note update error:', error);
        socket.emit('error', { message: 'Failed to update note' });
      }
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType, attachments, replyTo } = data;

        const Message = require('../models/message.model');

        // Check if conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(
          p => p.user.toString() === user._id.toString()
        );

        if (!isParticipant) {
          return socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
        }

        // Create message in database
        const message = await Message.create({
          conversation: conversationId,
          sender: user._id,
          content,
          messageType: messageType || 'text',
          attachments: attachments || [],
          replyTo
        });

        // Populate sender details
        await message.populate('sender', 'name avatar');
        if (replyTo) {
          await message.populate('replyTo');
        }

        // Update conversation's lastMessage
        conversation.lastMessage = message._id;
        conversation.messageCount = (conversation.messageCount || 0) + 1;
        await conversation.save();

        // Broadcast to all users in conversation room
        io.to(conversationId).emit('new_message', {
          _id: message._id,
          conversationId,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            avatar: message.sender.avatar
          },
          content: message.content,
          messageType: message.messageType,
          attachments: message.attachments,
          replyTo: message.replyTo,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        });

        logger.info(`Message sent in conversation ${conversationId} by ${user.email}`);

      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_typing', {
        userId: user._id,
        userName: user.name,
        timestamp: new Date()
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('user_stopped_typing', {
        userId: user._id,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`User ${user.email} disconnected`);

      // Remove from connected users
      connectedUsers.delete(socket.id);

      // Remove from all active rooms
      for (const [roomId, sockets] of rooms.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);

          // Handle dashboard-specific cleanup
          try {
            const dashboard = await Dashboard.findById(roomId);
            if (dashboard) {
              await dashboard.removeActiveUser(user._id);

              // Notify others in the room
              socket.to(roomId).emit('user_left', {
                userId: user._id,
                timestamp: new Date()
              });
            }
          } catch (error) {
            logger.error('Disconnect cleanup error:', error);
          }

          if (sockets.size === 0) {
            rooms.delete(roomId);
          }
        }
      }
    });

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
};

// Utility functions
const getConnectedUsers = () => {
  return Array.from(connectedUsers.values());
};

const getRoomUsers = (roomId) => {
  return rooms.get(roomId) || new Set();
};

const isUserOnline = (userId) => {
  return Array.from(connectedUsers.values()).includes(userId);
};

const broadcastToRoom = (roomId, event, data) => {
  const io = require('../app').io; // This would need to be set up properly
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getConnectedUsers,
  getRoomUsers,
  isUserOnline,
  broadcastToRoom
};
