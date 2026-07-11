import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;

import 'package:dayla_flutter/core/network/socket_service.dart';
import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/chat/application/providers/chat_providers.dart';
import 'package:dayla_flutter/features/chat/data/models/chat_model.dart';

class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({
    super.key,
    required this.conversationId,
    required this.title,
  });

  final String conversationId;
  final String title;

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _sending = false;
  List<MessageModel> _messages = [];
  bool _loaded = false;
  String? _typingUser;
  Timer? _typingStopTimer;

  @override
  void initState() {
    super.initState();
    ref.read(chatRepositoryProvider).markAsRead(widget.conversationId);
    _setupSocket();
  }

  void _setupSocket() {
    final socket = ref.read(socketServiceProvider);
    socket.joinConversation(widget.conversationId);
    socket.on('new_message', _handleNewMessage);
    socket.on('user_typing', _handleTyping);
    socket.on('user_stopped_typing', _handleStoppedTyping);
  }

  void _handleNewMessage(dynamic data) {
    if (!mounted) return;
    if (data is Map) {
      final map = Map<String, dynamic>.from(data);
      final msgConvoId = map['conversationId'] as String?;
      if (msgConvoId == widget.conversationId) {
        try {
          final msg = MessageModel.fromJson(map);
          // The sender already appended this message locally.
          final currentUserId = ref.read(authSessionProvider).user?.id;
          final isMine = msg.senderId == currentUserId ||
              msg.sender?.id == currentUserId;
          if (!isMine && !_messages.any((m) => m.id == msg.id)) {
            setState(() => _messages.insert(0, msg));
          }
          ref.read(chatRepositoryProvider).markAsRead(widget.conversationId);
        } catch (_) {
          ref.invalidate(messagesProvider(widget.conversationId));
        }
      }
    }
  }

  void _handleTyping(dynamic data) {
    if (!mounted || data is! Map) return;
    if (data['conversationId'] != widget.conversationId) return;
    final name = data['userName'] as String?;
    final currentUser = ref.read(authSessionProvider).user;
    if (name == null || name == currentUser?.name) return;
    setState(() => _typingUser = name);
  }

  void _handleStoppedTyping(dynamic data) {
    if (!mounted || data is! Map) return;
    if (data['conversationId'] != widget.conversationId) return;
    setState(() => _typingUser = null);
  }

  void _onTextChanged(String value) {
    final socket = ref.read(socketServiceProvider);
    socket.startTyping(widget.conversationId);
    _typingStopTimer?.cancel();
    _typingStopTimer = Timer(const Duration(seconds: 2), () {
      socket.stopTyping(widget.conversationId);
    });
  }

  @override
  void dispose() {
    _typingStopTimer?.cancel();
    final socket = ref.read(socketServiceProvider);
    socket.stopTyping(widget.conversationId);
    socket.leaveConversation(widget.conversationId);
    socket.off('new_message', _handleNewMessage);
    socket.off('user_typing', _handleTyping);
    socket.off('user_stopped_typing', _handleStoppedTyping);
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _sending) return;

    setState(() => _sending = true);
    _messageController.clear();

    _typingStopTimer?.cancel();
    ref.read(socketServiceProvider).stopTyping(widget.conversationId);

    final repo = ref.read(chatRepositoryProvider);
    final sent = await repo.sendMessage(widget.conversationId, text);

    if (sent == null) {
      // Give the text back instead of silently eating it.
      if (mounted) {
        _messageController.text = text;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Message not sent — try again')));
        setState(() => _sending = false);
      }
      return;
    }

    // Repopulate the local list from the refetch so the sent message shows.
    _loaded = false;
    ref.invalidate(messagesProvider(widget.conversationId));
    ref.read(conversationsProvider.notifier).refresh();

    setState(() => _sending = false);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(messagesProvider(widget.conversationId));
    final currentUserId = ref.watch(authSessionProvider).user?.id;

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Text('Failed to load messages',
                    style: TextStyle(color: Colors.grey.shade600)),
              ),
              data: (fetchedMessages) {
                if (!_loaded) {
                  _messages = List.from(fetchedMessages);
                  _loaded = true;
                }
                final messages = _messages;
                if (messages.isEmpty) {
                  return Center(
                    child: Text(
                      'No messages yet. Say hi!',
                      style: TextStyle(color: Colors.grey.shade500),
                    ),
                  );
                }
                return ListView.builder(
                  controller: _scrollController,
                  reverse: true,
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe = msg.senderId == currentUserId ||
                        msg.sender?.id == currentUserId;
                    return _MessageBubble(message: msg, isMe: isMe);
                  },
                );
              },
            ),
          ),
          if (_typingUser != null)
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 6),
                child: Text(
                  '$_typingUser is typing…',
                  style: TextStyle(
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
            ),
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              border: Border(
                top: BorderSide(color: Colors.grey.shade200),
              ),
            ),
            padding: EdgeInsets.fromLTRB(
              12,
              8,
              8,
              MediaQuery.paddingOf(context).bottom + 8,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    onChanged: _onTextChanged,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide:
                            BorderSide(color: Colors.grey.shade300),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide:
                            BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: const BorderSide(
                            color: AppColors.primary, width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sending ? null : _sendMessage,
                  icon: _sending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send, size: 20),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message, required this.isMe});

  final MessageModel message;
  final bool isMe;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.75,
        ),
        margin: const EdgeInsets.symmetric(vertical: 3),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMe
              ? AppColors.primary
              : AppColors.sage.withValues(alpha: 0.2),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isMe
                ? const Radius.circular(16)
                : const Radius.circular(4),
            bottomRight: isMe
                ? const Radius.circular(4)
                : const Radius.circular(16),
          ),
        ),
        child: Column(
          crossAxisAlignment:
              isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isMe && message.sender != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  message.sender!.name,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            Text(
              message.content,
              style: TextStyle(
                color: isMe ? Colors.white : Colors.grey.shade800,
                fontSize: 14,
              ),
            ),
            if (message.createdAt != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  _formatTime(message.createdAt!),
                  style: TextStyle(
                    fontSize: 10,
                    color: isMe
                        ? Colors.white.withValues(alpha: 0.7)
                        : Colors.grey.shade500,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String iso) {
    try {
      return timeago.format(DateTime.parse(iso));
    } catch (_) {
      return '';
    }
  }
}
