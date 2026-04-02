import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

const SOCKET_URL = API_BASE_URL || window.location.origin;

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    withCredentials: true, // Send cookies with the WebSocket handshake
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('join_room', {
      roomId: conversationId,
      roomType: 'conversation'
    });
  }
};

export const leaveConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('leave_room', {
      roomId: conversationId,
      roomType: 'conversation'
    });
  }
};

export const sendMessage = (data: {
  conversationId: string;
  content: string;
  messageType?: string;
  attachments?: any[];
  replyTo?: string;
}) => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const startTyping = (conversationId: string) => {
  if (socket) {
    socket.emit('typing_start', { conversationId });
  }
};

export const stopTyping = (conversationId: string) => {
  if (socket) {
    socket.emit('typing_stop', { conversationId });
  }
};
