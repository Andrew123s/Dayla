@Tags(['integration'])
library;

/// End-to-end proof of the chat data pipeline: runs the app's REAL
/// datasource, repository and models against the PRODUCTION API with the
/// Play-review test account. If this passes, every layer below the widgets
/// (HTTP client, auth header, endpoints, payloads, JSON parsing, models)
/// is verified against reality — not against assumptions.
///
/// Run: flutter test test/integration --tags integration
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/features/chat/data/datasources/chat_remote_datasource.dart';
import 'package:dayla_flutter/features/chat/data/repositories/chat_repository.dart';

const _base = 'https://dayla.onrender.com';
const _email = 'playreview@daylapp.com';
const _password = 'DaylaReview2026!';

void main() {
  late ChatRepository repo;

  setUpAll(() async {
    final login = await Dio(BaseOptions(
      baseUrl: _base,
      connectTimeout: const Duration(seconds: 90),
      receiveTimeout: const Duration(seconds: 90),
    )).post('/api/auth/login',
        data: {'email': _email, 'password': _password});
    final token = login.data['data']['token'] as String;
    expect(token, isNotEmpty, reason: 'login must issue a JWT');

    // Same shape as core/network/dio_provider.dart.
    final dio = Dio(BaseOptions(
      baseUrl: _base,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    ));
    repo = ChatRepository(ChatRemoteDatasource(dio));
  });

  test('conversations load and parse', () async {
    final conversations = await repo.getConversations();
    expect(conversations, isNotEmpty,
        reason: 'the reviewer account has at least one conversation');
    final c = conversations.first;
    expect(c.id, isNotEmpty);
    expect(c.participants, isNotEmpty,
        reason: 'participants must survive parsing');
  });

  test('messages load, send, and reload with the new message', () async {
    final conversations = await repo.getConversations();
    final convId = conversations.first.id;

    final before = await repo.getMessages(convId);
    expect(before, isNotEmpty,
        reason: 'existing messages must load and parse');
    for (final m in before) {
      expect(m.id, isNotEmpty);
      expect(m.senderId, isNotEmpty,
          reason: 'senderId must be derived from the sender object');
    }

    final marker =
        'integration ${DateTime.now().millisecondsSinceEpoch}';
    final sent = await repo.sendMessage(convId, marker);
    expect(sent, isNotNull, reason: 'sendMessage must not fail silently');
    expect(sent!.content, marker);

    final after = await repo.getMessages(convId);
    expect(after.any((m) => m.content == marker), isTrue,
        reason: 'the sent message must appear on reload');
  });
}
