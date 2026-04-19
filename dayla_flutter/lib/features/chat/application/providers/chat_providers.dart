import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/chat/data/datasources/chat_remote_datasource.dart';
import 'package:dayla_flutter/features/chat/data/models/chat_model.dart';
import 'package:dayla_flutter/features/chat/data/repositories/chat_repository.dart';

final chatRemoteDatasourceProvider = Provider<ChatRemoteDatasource>((ref) {
  return ChatRemoteDatasource(ref.watch(dioProvider));
});

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(ref.watch(chatRemoteDatasourceProvider));
});

final conversationsProvider =
    AsyncNotifierProvider<ConversationsNotifier, List<ConversationModel>>(
        ConversationsNotifier.new);

class ConversationsNotifier extends AsyncNotifier<List<ConversationModel>> {
  @override
  Future<List<ConversationModel>> build() async {
    final repo = ref.watch(chatRepositoryProvider);
    return repo.getConversations();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() {
      return ref.read(chatRepositoryProvider).getConversations();
    });
  }
}

final messagesProvider = FutureProvider.family<List<MessageModel>, String>(
  (ref, conversationId) async {
    final repo = ref.watch(chatRepositoryProvider);
    return repo.getMessages(conversationId);
  },
);
