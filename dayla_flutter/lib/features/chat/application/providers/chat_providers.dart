import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/core/network/socket_service.dart';
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

/// The live message feed for one conversation. This provider OWNS the whole
/// data lifecycle so the screen is a pure renderer:
///   - fetches the history over REST,
///   - joins the conversation's socket room and folds incoming messages in
///     (deduplicated by id, so own echoes are harmless),
///   - exposes send() which appends the confirmed message,
///   - marks the conversation read on open and on every incoming message,
///   - leaves the room and unhooks listeners when the screen goes away.
/// State is newest-first (the list view renders reversed).
final conversationMessagesProvider = AsyncNotifierProvider.autoDispose
    .family<ConversationMessagesNotifier, List<MessageModel>, String>(
        ConversationMessagesNotifier.new);

class ConversationMessagesNotifier
    extends AutoDisposeFamilyAsyncNotifier<List<MessageModel>, String> {
  @override
  Future<List<MessageModel>> build(String arg) async {
    final socket = ref.watch(socketServiceProvider);
    socket.joinConversation(arg);

    void onNewMessage(dynamic data) {
      if (data is! Map) return;
      final map = Map<String, dynamic>.from(data);
      if (map['conversationId'] != arg) return;
      try {
        final message = MessageModel.fromJson(map);
        final current = state.valueOrNull ?? [];
        if (current.any((m) => m.id == message.id)) return;
        state = AsyncValue.data([message, ...current]);
        ref.read(chatRepositoryProvider).markAsRead(arg);
      } catch (_) {
        // Unparseable socket payload — recover with an authoritative fetch.
        reload();
      }
    }

    socket.on('new_message', onNewMessage);
    ref.onDispose(() {
      socket.off('new_message', onNewMessage);
      socket.leaveConversation(arg);
    });

    final repo = ref.watch(chatRepositoryProvider);
    final messages = await repo.getMessages(arg);
    repo.markAsRead(arg);
    return messages;
  }

  /// Sends [content]; returns false when it failed (caller restores input).
  Future<bool> send(String content) async {
    final sent =
        await ref.read(chatRepositoryProvider).sendMessage(arg, content);
    if (sent == null) return false;
    final current = state.valueOrNull ?? [];
    if (!current.any((m) => m.id == sent.id)) {
      state = AsyncValue.data([sent, ...current]);
    }
    ref.read(conversationsProvider.notifier).refresh();
    return true;
  }

  /// Authoritative refetch (pull-to-refresh / recovery).
  Future<void> reload() async {
    final messages =
        await ref.read(chatRepositoryProvider).getMessages(arg);
    state = AsyncValue.data(messages);
  }
}
