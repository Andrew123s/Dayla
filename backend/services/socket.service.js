const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const User = require('../models/user.model');
const Dashboard = require('../models/dashboard.model');
const Conversation = require('../models/conversation.model');
const Notification = require('../models/notification.model');
const logger = require('../utils/logger');

// Connected users map (socketId -> userId)
const connectedUsers = new Map();
// Room mappings (roomId -> Set of socketIds)
const rooms = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token;
      if (!token) {
        const cookieHeader = socket.handshake.headers.cookie || '';
        const match = cookieHeader.match(/auth_token=([^;]+)/);
        if (match) token = match[1];
      }
      if (!token) return next(new Error('Authentication token required'));
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('Invalid token or inactive user'));
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

    connectedUsers.set(socket.id, user._id);

    // Join personal room for targeted notification delivery
    const userRoom = `user:${user._id.toString()}`;
    socket.join(userRoom);

    socket.on('join_room', async (data) => {
      try {
        const { roomId, roomType } = data;

        // Leave previous non-personal rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id && room !== userRoom) socket.leave(room);
        });

        socket.join(roomId);
        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(socket.id);

        logger.info(`User ${user.email} joined ${roomType} room: ${roomId}`);

        if (roomType === 'dashboard') {
          const dashboard = await Dashboard.findById(roomId);
          if (dashboard) {
            await dashboard.addActiveUser({ userId: user._id, name: user.name, avatar: user.avatar, currentNote: null });
            socket.to(roomId).emit('user_joined', { userId: user._id, name: user.name, avatar: user.avatar, timestamp: new Date() });
          }
        } else if (roomType === 'conversation') {
          const conversation = await Conversation.findById(roomId);
          if (conversation) await conversation.markAsRead(user._id);
        }

        socket.emit('room_joined', { roomId, roomType });
      } catch (error) {
        logger.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leave_room', async (data) => {
      try {
        const { roomId, roomType } = data;
        socket.leave(roomId);
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) rooms.delete(roomId);
        }
        if (roomType === 'dashboard') {
          const dashboard = await Dashboard.findById(roomId);
          if (dashboard) {
            await dashboard.removeActiveUser(user._id);
            socket.to(roomId).emit('user_left', { userId: user._id, timestamp: new Date() });
          }
        }
      } catch (error) {
        logger.error('Leave room error:', error);
      }
    });

    socket.on('start_editing', (data) => {
      socket.to(data.roomId).emit('user_editing', { userId: user._id, userName: user.name, avatar: user.avatar, noteId: data.noteId, timestamp: new Date() });
    });

    socket.on('stop_editing', (data) => {
      socket.to(data.roomId).emit('user_stopped_editing', { userId: user._id, noteId: data.noteId, timestamp: new Date() });
    });

    socket.on('cursor_move', (data) => {
      socket.to(data.roomId).emit('user_cursor', { userId: user._id, userName: user.name, avatar: user.avatar, x: data.x, y: data.y, noteId: data.noteId, timestamp: new Date() });
    });

    socket.on('note_update', async (data) => {
      try {
        const { roomId, noteId, updates } = data;
        const dashboard = await Dashboard.findOneAndUpdate(
          { _id: roomId, 'notes.id': noteId },
          { $set: { 'notes.$': { ...updates, id: noteId }, lastModified: new Date() } },
          { new: true }
        );
        if (dashboard) {
          socket.to(roomId).emit('note_updated', { noteId, updates, updatedBy: { userId: user._id, userName: user.name, avatar: user.avatar }, timestamp: new Date() });
        }
      } catch (error) {
        logger.error('Note update error:', error);
        socket.emit('error', { message: 'Failed to update note' });
      }
    });

    socket.on('note_deleted', async (data) => {
      try {
        const { roomId, noteId } = data;
        await Dashboard.findByIdAndUpdate(roomId, { $pull: { notes: { id: noteId } }, $set: { lastModified: new Date() } });
        socket.to(roomId).emit('note_deleted', { noteId, deletedBy: { userId: user._id, userName: user.name }, timestamp: new Date() });
      } catch (error) {
        logger.error('Note delete error:', error);
        socket.emit('error', { message: 'Failed to delete note' });
      }
    });

    // ── send_message — create notification for offline/backgrounded participants ──
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType, attachments, replyTo } = data;
        const Message = require('../models/message.model');

        const conversation = await Conversation.findById(conversationId)
          .populate('participants.user', 'name avatar');

        if (!conversation) return socket.emit('error', { message: 'Conversation not found' });

        const isParticipant = conversation.participants.some(
          p => p.user._id.toString() === user._id.toString()
        );
        if (!isParticipant) return socket.emit('error', { message: 'Not authorized to send messages in this conversation' });

        const message = await Message.create({
          conversation: conversationId,
          sender: user._id,
          content,
          messageType: messageType || 'text',
          attachments: attachments || [],
          replyTo
        });

        await message.populate('sender', 'name avatar');
        if (replyTo) await message.populate('replyTo');

        conversation.lastMessage = message._id;
        conversation.messageCount = (conversation.messageCount || 0) + 1;
        await conversation.save();

        const messagePayload = {
          _id: message._id,
          conversationId,
          sender: { _id: message.sender._id, name: message.sender.name, avatar: message.sender.avatar },
          content: message.content,
          messageType: message.messageType,
          attachments: message.attachments,
          replyTo: message.replyTo,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        };

        io.to(conversationId).emit('new_message', messagePayload);

        // Notify other participants via their personal rooms
        const preview = content.substring(0, 60) + (content.length > 60 ? '\u2026' : '');
        for (const participant of conversation.participants) {
          const participantId = participant.user._id.toString();
          if (participantId === user._id.toString()) continue;
          try {
            await Notification.create({
              recipient: participant.user._id,
              sender: user._id,
              type: 'message',
              message: `${user.name}: ${preview}`
            });
            io.to(`user:${participantId}`).emit('notification:new', {
              recipientId: participantId,
              type: 'message',
              senderName: user.name,
              senderAvatar: user.avatar,
              conversationId,
              preview,
              timestamp: new Date()
            });
          } catch (notifErr) {
            logger.error('Failed to create message notification:', notifErr);
          }
        }

        logger.info(`Message sent in conversation ${conversationId} by ${user.email}`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Packing events ────────────────────────────────────────────────
    socket.on('packing:item_added', (data) => {
      socket.to(data.roomId).emit('packing:item_added', { item: data.item, addedBy: { userId: user._id, name: user.name, avatar: user.avatar }, timestamp: new Date() });
    });
    socket.on('packing:item_packed', (data) => {
      socket.to(data.roomId).emit('packing:item_packed', { itemId: data.itemId, packed: data.packed, packedBy: { userId: user._id, name: user.name, avatar: user.avatar }, timestamp: new Date() });
    });
    socket.on('packing:member_assigned', (data) => {
      socket.to(data.roomId).emit('packing:member_assigned', { itemId: data.itemId, assignedTo: data.assignedTo, assignedBy: { userId: user._id, name: user.name, avatar: user.avatar }, timestamp: new Date() });
    });
    socket.on('packing:duplicate_detected', (data) => {
      socket.to(data.roomId).emit('packing:duplicate_detected', { duplicates: data.duplicates, detectedBy: { userId: user._id, name: user.name }, timestamp: new Date() });
    });
    socket.on('packing:template_applied', (data) => {
      socket.to(data.roomId).emit('packing:template_applied', { templateName: data.templateName, addedCount: data.addedCount, appliedBy: { userId: user._id, name: user.name, avatar: user.avatar }, timestamp: new Date() });
    });
    socket.on('packing:item_removed', (data) => {
      socket.to(data.roomId).emit('packing:item_removed', { itemId: data.itemId, itemName: data.itemName, removedBy: { userId: user._id, name: user.name, avatar: user.avatar }, timestamp: new Date() });
    });

    // ── Typing ────────────────────────────────────────────────────────
    socket.on('typing_start', (data) => {
      socket.to(data.conversationId).emit('user_typing', { userId: user._id, userName: user.name, timestamp: new Date() });
    });
    socket.on('typing_stop', (data) => {
      socket.to(data.conversationId).emit('user_stopped_typing', { userId: user._id, timestamp: new Date() });
    });

    socket.on('disconnect', async () => {
      logger.info(`User ${user.email} disconnected`);
      connectedUsers.delete(socket.id);
      for (const [roomId, sockets] of rooms.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          try {
            const dashboard = await Dashboard.findById(roomId);
            if (dashboard) {
              await dashboard.removeActiveUser(user._id);
              socket.to(roomId).emit('user_left', { userId: user._id, timestamp: new Date() });
            }
          } catch (error) {
            logger.error('Disconnect cleanup error:', error);
          }
          if (sockets.size === 0) rooms.delete(roomId);
        }
      }
    });

    socket.on('ping', () => socket.emit('pong'));
  });
};

const getConnectedUsers = () => Array.from(connectedUsers.values());
const getRoomUsers = (roomId) => rooms.get(roomId) || new Set();
const isUserOnline = (userId) => Array.from(connectedUsers.values()).some(id => id.toString() === userId.toString());

module.exports = { initializeSocket, getConnectedUsers, getRoomUsers, isUserOnline };
