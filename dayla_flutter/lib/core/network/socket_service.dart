import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'package:dayla_flutter/core/network/api_config.dart';
import 'package:dayla_flutter/core/network/auth_token_provider.dart';

/// Socket.io client speaking the backend's protocol (socket.service.js):
/// rooms via `join_room`/`leave_room` with a roomType, typing via
/// `typing_start`/`typing_stop`, and server events like `new_message`,
/// `notification:new`, `user_joined`, `post:liked`, `comment:added`.
class SocketService {
  io.Socket? _socket;

  bool get isConnected => _socket?.connected ?? false;

  void connect(String baseUrl, String token) {
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .build(),
    );
  }

  // ── Rooms ──
  void joinRoom(String roomId, String roomType) {
    _socket?.emit('join_room', {'roomId': roomId, 'roomType': roomType});
  }

  void leaveRoom(String roomId, String roomType) {
    _socket?.emit('leave_room', {'roomId': roomId, 'roomType': roomType});
  }

  void joinConversation(String conversationId) =>
      joinRoom(conversationId, 'conversation');

  void leaveConversation(String conversationId) =>
      leaveRoom(conversationId, 'conversation');

  void joinDashboard(String dashboardId) => joinRoom(dashboardId, 'dashboard');

  void leaveDashboard(String dashboardId) =>
      leaveRoom(dashboardId, 'dashboard');

  // ── Chat ──
  void sendMessage(String conversationId, String content) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
    });
  }

  void startTyping(String conversationId) {
    _socket?.emit('typing_start', {'conversationId': conversationId});
  }

  void stopTyping(String conversationId) {
    _socket?.emit('typing_stop', {'conversationId': conversationId});
  }

  // ── Generic event listeners ──
  void on(String event, void Function(dynamic data) callback) {
    _socket?.on(event, callback);
  }

  void off(String event, [void Function(dynamic data)? callback]) {
    if (callback != null) {
      _socket?.off(event, callback);
    } else {
      _socket?.off(event);
    }
  }

  void onConnect(void Function() callback) {
    _socket?.onConnect((_) => callback());
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}

final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService();
  final token = ref.watch(authTokenProvider);

  if (token != null && token.isNotEmpty) {
    service.connect(ApiConfig.baseUrl, token);
  }

  ref.onDispose(() => service.disconnect());
  return service;
});
