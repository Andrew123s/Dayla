import 'package:dio/dio.dart';

class ChatRemoteDatasource {
  ChatRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> getConversations() async {
    final response = await _dio.get('/api/chat/conversations');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getConversation(String id) async {
    final response = await _dio.get('/api/chat/conversations/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createConversation({
    required List<String> participantIds,
    bool isGroup = false,
    String? name,
  }) async {
    final response = await _dio.post(
      '/api/chat/conversations',
      data: {
        'participants': participantIds,
        'isGroup': isGroup,
        if (name != null) 'name': name,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMessages(
    String conversationId, {
    int? limit,
    int? skip,
  }) async {
    final response = await _dio.get(
      '/api/chat/conversations/$conversationId/messages',
      queryParameters: {
        if (limit != null) 'limit': limit,
        if (skip != null) 'skip': skip,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendMessage(
    String conversationId,
    String content,
  ) async {
    final response = await _dio.post(
      '/api/chat/conversations/$conversationId/messages',
      data: {'content': content},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deleteMessage(String messageId) async {
    final response = await _dio.delete('/api/chat/messages/$messageId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addReaction(
    String messageId,
    String emoji,
  ) async {
    final response = await _dio.post(
      '/api/chat/messages/$messageId/reactions',
      data: {'emoji': emoji},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> removeReaction(
    String messageId,
    String emoji,
  ) async {
    final response =
        await _dio.delete('/api/chat/messages/$messageId/reactions/$emoji');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markAsRead(String conversationId) async {
    final response =
        await _dio.put('/api/chat/conversations/$conversationId/read');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> generateInviteLink(
    String conversationId,
  ) async {
    final response = await _dio
        .post('/api/chat/conversations/$conversationId/invite-link');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> joinViaInvite(String inviteCode) async {
    final response = await _dio.post('/api/chat/join/$inviteCode');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addMembers(
    String conversationId,
    List<String> memberIds,
  ) async {
    final response = await _dio.post(
      '/api/chat/conversations/$conversationId/members',
      data: {'members': memberIds},
    );
    return response.data as Map<String, dynamic>;
  }
}
