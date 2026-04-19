import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'package:dayla_flutter/core/network/api_config.dart';
import 'package:dayla_flutter/core/network/auth_token_provider.dart';

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

    _socket!.onConnect((_) {});
    _socket!.onDisconnect((_) {});
  }

  void joinConversation(String conversationId) {
    _socket?.emit('join_conversation', {'conversationId': conversationId});
  }

  void leaveConversation(String conversationId) {
    _socket?.emit('leave_conversation', {'conversationId': conversationId});
  }

  void sendMessage(String conversationId, String content) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
    });
  }

  void onNewMessage(void Function(dynamic data) callback) {
    _socket?.on('new_message', callback);
  }

  void offNewMessage() {
    _socket?.off('new_message');
  }

  void onTyping(void Function(dynamic data) callback) {
    _socket?.on('user_typing', callback);
  }

  void offTyping() {
    _socket?.off('user_typing');
  }

  void emitTyping(String conversationId) {
    _socket?.emit('typing', {'conversationId': conversationId});
  }

  void onNotification(void Function(dynamic data) callback) {
    _socket?.on('notification', callback);
  }

  void offNotification() {
    _socket?.off('notification');
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
