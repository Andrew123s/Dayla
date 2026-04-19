import 'package:dio/dio.dart';
import 'package:dayla_flutter/features/chat/data/datasources/chat_remote_datasource.dart';
import 'package:dayla_flutter/features/chat/data/models/chat_model.dart';

class ChatRepository {
  ChatRepository(this._remote);

  final ChatRemoteDatasource _remote;

  Future<List<ConversationModel>> getConversations() async {
    try {
      final json = await _remote.getConversations();
      final convos = (json['data']?['conversations'] as List?) ?? [];
      return convos
          .map((c) => ConversationModel.fromJson(c as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<ConversationModel?> getConversation(String id) async {
    try {
      final json = await _remote.getConversation(id);
      final data = json['data']?['conversation'];
      if (data != null) {
        return ConversationModel.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<ConversationModel?> createConversation({
    required List<String> participantIds,
    bool isGroup = false,
    String? name,
  }) async {
    try {
      final json = await _remote.createConversation(
        participantIds: participantIds,
        isGroup: isGroup,
        name: name,
      );
      final data = json['data']?['conversation'];
      if (data != null) {
        return ConversationModel.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<List<MessageModel>> getMessages(
    String conversationId, {
    int? limit,
    int? skip,
  }) async {
    try {
      final json = await _remote.getMessages(
        conversationId,
        limit: limit,
        skip: skip,
      );
      final messages = (json['data']?['messages'] as List?) ?? [];
      return messages
          .map((m) => MessageModel.fromJson(m as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<MessageModel?> sendMessage(
    String conversationId,
    String content,
  ) async {
    try {
      final json = await _remote.sendMessage(conversationId, content);
      final data = json['data']?['message'];
      if (data != null) {
        return MessageModel.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<bool> deleteMessage(String messageId) async {
    try {
      final json = await _remote.deleteMessage(messageId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> addReaction(String messageId, String emoji) async {
    try {
      final json = await _remote.addReaction(messageId, emoji);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> markAsRead(String conversationId) async {
    try {
      final json = await _remote.markAsRead(conversationId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }
}
