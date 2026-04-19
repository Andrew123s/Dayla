import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/chat/application/providers/chat_providers.dart';
import 'package:dayla_flutter/features/chat/data/models/chat_model.dart';
import 'package:dayla_flutter/features/chat/presentation/screens/conversation_screen.dart';

class ChatScreen extends ConsumerWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationsProvider);
    final currentUser = ref.watch(authSessionProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                ref.read(conversationsProvider.notifier).refresh(),
          ),
        ],
      ),
      body: conversationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
              const SizedBox(height: 12),
              Text('Failed to load conversations',
                  style: TextStyle(color: Colors.grey.shade600)),
              const SizedBox(height: 12),
              FilledButton.tonal(
                onPressed: () =>
                    ref.read(conversationsProvider.notifier).refresh(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (conversations) {
          if (conversations.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.forum_outlined,
                      size: 64, color: AppColors.sage.withValues(alpha: 0.5)),
                  const SizedBox(height: 16),
                  Text(
                    'No conversations yet',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Add friends to start chatting',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                ref.read(conversationsProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: conversations.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 1, indent: 72),
              itemBuilder: (context, index) {
                final convo = conversations[index];
                return _ConversationTile(
                  conversation: convo,
                  currentUserId: currentUser?.id,
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _ConversationTile extends StatelessWidget {
  const _ConversationTile({
    required this.conversation,
    this.currentUserId,
  });

  final ConversationModel conversation;
  final String? currentUserId;

  @override
  Widget build(BuildContext context) {
    final displayName = _getDisplayName();
    final lastMsg = conversation.lastMessage;

    return ListTile(
      leading: CircleAvatar(
        radius: 24,
        backgroundColor: AppColors.sage.withValues(alpha: 0.3),
        backgroundImage: _getAvatar() != null
            ? NetworkImage(_getAvatar()!)
            : null,
        child: _getAvatar() == null
            ? Text(
                displayName.isNotEmpty ? displayName[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  fontSize: 18,
                ),
              )
            : null,
      ),
      title: Text(
        displayName,
        style: const TextStyle(fontWeight: FontWeight.w600),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: lastMsg?.content != null
          ? Text(
              '${lastMsg!.sender?.name ?? ''}: ${lastMsg.content}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            )
          : Text(
              conversation.isGroup ? 'Group chat' : 'Start a conversation',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
            ),
      trailing: lastMsg?.createdAt != null
          ? Text(
              _formatTime(lastMsg!.createdAt!),
              style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
            )
          : null,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ConversationScreen(
              conversationId: conversation.id,
              title: displayName,
            ),
          ),
        );
      },
    );
  }

  String _getDisplayName() {
    if (conversation.isGroup && conversation.name != null) {
      return conversation.name!;
    }
    final other = conversation.participants
        .where((p) => p.user.id != currentUserId)
        .toList();
    if (other.isNotEmpty) return other.first.user.name;
    return conversation.name ?? 'Chat';
  }

  String? _getAvatar() {
    if (conversation.avatar != null) return conversation.avatar;
    final other = conversation.participants
        .where((p) => p.user.id != currentUserId)
        .toList();
    if (other.isNotEmpty) return other.first.user.avatar;
    return null;
  }

  String _formatTime(String iso) {
    try {
      return timeago.format(DateTime.parse(iso), locale: 'en_short');
    } catch (_) {
      return '';
    }
  }
}
