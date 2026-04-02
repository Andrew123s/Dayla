import { io, type Socket } from 'socket.io-client';

import { API_BASE_URL } from './api';

let socket: Socket | null = null;
let activeToken: string | null = null;

export function initializeSocket(token: string): Socket {
  if (socket?.connected && activeToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  activeToken = token;
  socket = io(API_BASE_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  activeToken = null;
}

/** Join a chat conversation room (server: `join_room`). */
export function joinConversation(id: string): void {
  socket?.emit('join_room', { roomId: id, roomType: 'conversation' });
}

/** Leave a chat conversation room (server: `leave_room`). */
export function leaveConversation(id: string): void {
  socket?.emit('leave_room', { roomId: id, roomType: 'conversation' });
}

/** Send a chat message (server: `send_message`). */
export function sendMessage(data: {
  conversationId: string;
  content: string;
  messageType?: string;
  attachments?: unknown[];
  replyTo?: string;
}): void {
  socket?.emit('send_message', data);
}

export function startTyping(conversationId: string): void {
  socket?.emit('typing_start', { conversationId });
}

export function stopTyping(conversationId: string): void {
  socket?.emit('typing_stop', { conversationId });
}
