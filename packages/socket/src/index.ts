import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '@dayla/config';

let socket: Socket | null = null;

export const initializeSocket = (token: string, overrideUrl?: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = overrideUrl || getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '');

  socket = io(socketUrl, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
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

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId: string) => {
  socket?.emit('join_room', { roomId: conversationId, roomType: 'conversation' });
};

export const leaveConversation = (conversationId: string) => {
  socket?.emit('leave_room', { roomId: conversationId, roomType: 'conversation' });
};

export const sendMessage = (data: {
  conversationId: string;
  content: string;
  messageType?: string;
  attachments?: any[];
  replyTo?: string;
}) => {
  socket?.emit('send_message', data);
};

export const startTyping = (conversationId: string) => {
  socket?.emit('typing_start', { conversationId });
};

export const stopTyping = (conversationId: string) => {
  socket?.emit('typing_stop', { conversationId });
};

export type { Socket } from 'socket.io-client';
