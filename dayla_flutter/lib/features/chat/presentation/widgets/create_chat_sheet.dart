import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_providers.dart';
import 'package:dayla_flutter/features/auth/data/models/user_model.dart';
import 'package:dayla_flutter/features/chat/application/providers/chat_providers.dart';

class CreateChatSheet extends ConsumerStatefulWidget {
  const CreateChatSheet({super.key});

  @override
  ConsumerState<CreateChatSheet> createState() => _CreateChatSheetState();
}

class _CreateChatSheetState extends ConsumerState<CreateChatSheet> {
  bool _isGroup = false;
  bool _loading = true;
  bool _creating = false;
  List<FriendRequestUser> _friends = [];
  final Set<String> _selected = {};
  final _groupNameCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadFriends();
  }

  @override
  void dispose() {
    _groupNameCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadFriends() async {
    final repo = ref.read(authRepositoryProvider);
    final friends = await repo.getFriends();
    if (mounted) setState(() { _friends = friends; _loading = false; });
  }

  Future<void> _create() async {
    if (_selected.isEmpty) return;
    if (_isGroup && _groupNameCtrl.text.trim().isEmpty) return;

    setState(() => _creating = true);
    final repo = ref.read(chatRepositoryProvider);
    final result = await repo.createConversation(
      participantIds: _selected.toList(),
      isGroup: _isGroup,
      name: _isGroup ? _groupNameCtrl.text.trim() : null,
    );

    if (result != null && mounted) {
      ref.read(conversationsProvider.notifier).refresh();
      Navigator.pop(context);
    } else {
      setState(() => _creating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 20, 20, MediaQuery.viewInsetsOf(context).bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('New Conversation',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            children: [
              ChoiceChip(
                label: const Text('Direct Message'),
                selected: !_isGroup,
                onSelected: (_) => setState(() {
                  _isGroup = false;
                  _selected.clear();
                }),
                selectedColor: AppColors.primary.withValues(alpha: 0.15),
                side: BorderSide(
                    color: !_isGroup
                        ? AppColors.primary
                        : Colors.grey.shade300),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Group'),
                selected: _isGroup,
                onSelected: (_) => setState(() {
                  _isGroup = true;
                  _selected.clear();
                }),
                selectedColor: AppColors.primary.withValues(alpha: 0.15),
                side: BorderSide(
                    color: _isGroup
                        ? AppColors.primary
                        : Colors.grey.shade300),
              ),
            ],
          ),
          if (_isGroup) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _groupNameCtrl,
              decoration: InputDecoration(
                hintText: 'Group name',
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide:
                      const BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          const Text('Select friends',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 8),
          SizedBox(
            height: 250,
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _friends.isEmpty
                    ? Center(
                        child: Text('No friends yet. Add friends first!',
                            style: TextStyle(color: Colors.grey.shade500)),
                      )
                    : ListView.builder(
                        itemCount: _friends.length,
                        itemBuilder: (ctx, i) {
                          final f = _friends[i];
                          final selected = _selected.contains(f.id);
                          return CheckboxListTile(
                            contentPadding: EdgeInsets.zero,
                            value: selected,
                            activeColor: AppColors.primary,
                            onChanged: (v) {
                              setState(() {
                                if (!_isGroup) _selected.clear();
                                if (v == true) {
                                  _selected.add(f.id);
                                } else {
                                  _selected.remove(f.id);
                                }
                              });
                            },
                            secondary: CircleAvatar(
                              radius: 18,
                              backgroundColor:
                                  AppColors.sage.withValues(alpha: 0.3),
                              backgroundImage: f.avatar != null
                                  ? NetworkImage(f.avatar!)
                                  : null,
                              child: f.avatar == null
                                  ? Text(f.name[0].toUpperCase(),
                                      style: const TextStyle(fontSize: 14))
                                  : null,
                            ),
                            title: Text(f.name),
                          );
                        },
                      ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _creating || _selected.isEmpty ? null : _create,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              child: Text(_creating
                  ? 'Creating...'
                  : _isGroup
                      ? 'Create Group'
                      : 'Start Chat'),
            ),
          ),
        ],
      ),
    );
  }
}
