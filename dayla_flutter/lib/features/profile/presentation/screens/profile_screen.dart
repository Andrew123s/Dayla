import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_providers.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/auth/data/models/user_model.dart' hide Badge;

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  List<FriendRequest> _pendingRequests = [];

  @override
  void initState() {
    super.initState();
    _loadExtras();
  }

  Future<void> _loadExtras() async {
    final repo = ref.read(authRepositoryProvider);
    final results = await Future.wait([
      repo.getNotifications(),
      repo.getPendingFriendRequests(),
    ]);
    final notifResult =
        results[0] as ({List<NotificationModel> notifications, int unreadCount});
    if (mounted) {
      setState(() {
        _notifications = notifResult.notifications;
        _unreadCount = notifResult.unreadCount;
        _pendingRequests = results[1] as List<FriendRequest>;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authSessionProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          if (_unreadCount > 0 || _pendingRequests.isNotEmpty)
            Badge(
              label: Text('${_unreadCount + _pendingRequests.length}'),
              child: IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => _showNotifications(context),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => _showNotifications(context),
            ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => _showSettings(context),
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                await ref.read(authSessionProvider.notifier).refreshUser();
                await _loadExtras();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildAvatarSection(user),
                    const SizedBox(height: 16),
                    Text(user.name,
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(user.email,
                        style: TextStyle(color: Colors.grey.shade600)),
                    if (user.bio.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(user.bio,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium),
                    ],
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _StatTile(
                            label: 'Trips', value: '${user.tripCount}'),
                        _StatTile(
                            label: 'Posts', value: '${user.postCount}'),
                        _StatTile(
                            label: 'Eco Score',
                            value: '${user.ecoScore.toInt()}'),
                      ],
                    ),
                    const SizedBox(height: 24),
                    _buildActionCards(context),
                    if (user.interests.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Interests',
                            style: Theme.of(context).textTheme.titleMedium),
                      ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: user.interests
                              .map((i) => Chip(
                                    label: Text(i),
                                    backgroundColor:
                                        AppColors.sage.withValues(alpha: 0.2),
                                    side: BorderSide.none,
                                  ))
                              .toList(),
                        ),
                      ),
                    ],
                    if (user.badges.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Badges',
                            style: Theme.of(context).textTheme.titleMedium),
                      ),
                      const SizedBox(height: 8),
                      ...user.badges.map((badge) => ListTile(
                            leading: const Icon(Icons.military_tech,
                                color: AppColors.sand),
                            title: Text(badge.name),
                            subtitle: badge.description.isNotEmpty
                                ? Text(badge.description)
                                : null,
                            contentPadding: EdgeInsets.zero,
                          )),
                    ],
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          await ref
                              .read(authSessionProvider.notifier)
                              .logout();
                          if (context.mounted) context.go(RoutePaths.auth);
                        },
                        icon: const Icon(Icons.logout, color: Colors.red),
                        label: const Text('Log Out',
                            style: TextStyle(color: Colors.red)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildAvatarSection(UserModel user) {
    return GestureDetector(
      onTap: () => _pickAvatar(),
      child: Stack(
        children: [
          CircleAvatar(
            radius: 48,
            backgroundColor: AppColors.sage.withValues(alpha: 0.3),
            backgroundImage:
                user.avatar != null ? NetworkImage(user.avatar!) : null,
            child: user.avatar == null
                ? Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                    style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary),
                  )
                : null,
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child:
                  const Icon(Icons.camera_alt, size: 14, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
        source: ImageSource.gallery, maxWidth: 512, maxHeight: 512);
    if (image == null) return;

    final bytes = await image.readAsBytes();
    final repo = ref.read(authRepositoryProvider);
    final avatarUrl = await repo.uploadAvatar(bytes, image.name);
    if (avatarUrl != null && mounted) {
      ref.read(authSessionProvider.notifier).refreshUser();
    }
  }

  Widget _buildActionCards(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionTile(
            icon: Icons.edit,
            label: 'Edit Profile',
            onTap: () => _showEditProfile(context),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionTile(
            icon: Icons.people,
            label: 'Friends',
            badge: _pendingRequests.isNotEmpty
                ? '${_pendingRequests.length}'
                : null,
            onTap: () => _showFriends(context),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionTile(
            icon: Icons.person_search,
            label: 'Find People',
            onTap: () => _showFindFriends(context),
          ),
        ),
      ],
    );
  }

  void _showEditProfile(BuildContext context) {
    final user = ref.read(authSessionProvider).user!;
    final nameCtrl = TextEditingController(text: user.name);
    final bioCtrl = TextEditingController(text: user.bio);
    final interestsCtrl =
        TextEditingController(text: user.interests.join(', '));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        bool saving = false;
        return StatefulBuilder(
          builder: (ctx, setModalState) => Padding(
            padding: EdgeInsets.fromLTRB(
                20, 20, 20, MediaQuery.viewInsetsOf(ctx).bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Edit Profile',
                        style: Theme.of(ctx).textTheme.titleLarge),
                    IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  decoration: _fieldDecoration('Name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: bioCtrl,
                  maxLines: 3,
                  decoration: _fieldDecoration('Bio'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: interestsCtrl,
                  decoration:
                      _fieldDecoration('Interests (comma separated)'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: saving
                        ? null
                        : () async {
                            setModalState(() => saving = true);
                            final interests = interestsCtrl.text
                                .split(',')
                                .map((e) => e.trim())
                                .where((e) => e.isNotEmpty)
                                .toList();
                            final repo = ref.read(authRepositoryProvider);
                            await repo.updateProfile(
                              name: nameCtrl.text.trim(),
                              bio: bioCtrl.text.trim(),
                              interests: interests,
                            );
                            ref
                                .read(authSessionProvider.notifier)
                                .refreshUser();
                            if (ctx.mounted) Navigator.pop(ctx);
                          },
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(saving ? 'Saving...' : 'Save Changes'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showFriends(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return _FriendsSheet(
          pendingRequests: _pendingRequests,
          onAction: () {
            _loadExtras();
          },
        );
      },
    );
  }

  void _showFindFriends(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => const _FindFriendsSheet(),
    );
  }

  void _showNotifications(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return _NotificationsSheet(
          notifications: _notifications,
          onMarkRead: () async {
            final repo = ref.read(authRepositoryProvider);
            await repo.markNotificationsRead();
            _loadExtras();
          },
        );
      },
    );
  }

  void _showSettings(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _SettingsSheet(
        onDeactivate: () async {
          final repo = ref.read(authRepositoryProvider);
          await repo.deactivateAccount();
          await ref.read(authSessionProvider.notifier).logout();
          if (context.mounted) context.go(RoutePaths.auth);
        },
        onChangePassword: () {
          Navigator.pop(ctx);
          _showChangePassword(context);
        },
      ),
    );
  }

  void _showChangePassword(BuildContext context) {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        bool saving = false;
        String? error;
        return StatefulBuilder(
          builder: (ctx, setModalState) => Padding(
            padding: EdgeInsets.fromLTRB(
                20, 20, 20, MediaQuery.viewInsetsOf(ctx).bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Change Password',
                    style: Theme.of(ctx).textTheme.titleLarge),
                const SizedBox(height: 16),
                TextField(
                  controller: currentCtrl,
                  obscureText: true,
                  decoration: _fieldDecoration('Current Password'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newCtrl,
                  obscureText: true,
                  decoration: _fieldDecoration('New Password'),
                ),
                if (error != null) ...[
                  const SizedBox(height: 8),
                  Text(error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                ],
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: saving
                        ? null
                        : () async {
                            setModalState(() {
                              saving = true;
                              error = null;
                            });
                            final repo = ref.read(authRepositoryProvider);
                            final result = await repo.changePassword(
                              currentPassword: currentCtrl.text,
                              newPassword: newCtrl.text,
                            );
                            if (result.success) {
                              if (ctx.mounted) Navigator.pop(ctx);
                            } else {
                              setModalState(() {
                                saving = false;
                                error = result.message;
                              });
                            }
                          },
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(saving ? 'Saving...' : 'Update Password'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  InputDecoration _fieldDecoration(String label) {
    return InputDecoration(
      labelText: label,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: Colors.grey.shade600)),
      ],
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.badge,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.sage.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.sage.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            badge != null
                ? Badge(
                    label: Text(badge!),
                    child: Icon(icon, color: AppColors.primary),
                  )
                : Icon(icon, color: AppColors.primary),
            const SizedBox(height: 6),
            Text(label,
                style: const TextStyle(fontSize: 12, color: AppColors.primary)),
          ],
        ),
      ),
    );
  }
}

class _FriendsSheet extends ConsumerStatefulWidget {
  const _FriendsSheet({required this.pendingRequests, required this.onAction});
  final List<FriendRequest> pendingRequests;
  final VoidCallback onAction;

  @override
  ConsumerState<_FriendsSheet> createState() => _FriendsSheetState();
}

class _FriendsSheetState extends ConsumerState<_FriendsSheet> {
  List<FriendRequestUser> _friends = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFriends();
  }

  Future<void> _loadFriends() async {
    final repo = ref.read(authRepositoryProvider);
    final friends = await repo.getFriends();
    if (mounted) setState(() { _friends = friends; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.3,
      expand: false,
      builder: (ctx, scrollCtrl) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Friends', style: Theme.of(ctx).textTheme.titleLarge),
            if (widget.pendingRequests.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text('Pending Requests (${widget.pendingRequests.length})',
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, color: Colors.orange)),
              const SizedBox(height: 8),
              ...widget.pendingRequests.map((req) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: AppColors.sage.withValues(alpha: 0.3),
                      child: Text(req.from.name[0].toUpperCase()),
                    ),
                    title: Text(req.from.name),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.check, color: Colors.green),
                          onPressed: () async {
                            final repo = ref.read(authRepositoryProvider);
                            await repo.acceptFriendRequest(req.from.id);
                            widget.onAction();
                            _loadFriends();
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.red),
                          onPressed: () async {
                            final repo = ref.read(authRepositoryProvider);
                            await repo.declineFriendRequest(req.from.id);
                            widget.onAction();
                          },
                        ),
                      ],
                    ),
                  )),
              const Divider(),
            ],
            const SizedBox(height: 8),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _friends.isEmpty
                      ? Center(
                          child: Text('No friends yet',
                              style: TextStyle(color: Colors.grey.shade500)),
                        )
                      : ListView.builder(
                          controller: scrollCtrl,
                          itemCount: _friends.length,
                          itemBuilder: (ctx, i) {
                            final f = _friends[i];
                            return ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: CircleAvatar(
                                backgroundColor:
                                    AppColors.sage.withValues(alpha: 0.3),
                                backgroundImage: f.avatar != null
                                    ? NetworkImage(f.avatar!)
                                    : null,
                                child: f.avatar == null
                                    ? Text(f.name[0].toUpperCase())
                                    : null,
                              ),
                              title: Text(f.name),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FindFriendsSheet extends ConsumerStatefulWidget {
  const _FindFriendsSheet();

  @override
  ConsumerState<_FindFriendsSheet> createState() => _FindFriendsSheetState();
}

class _FindFriendsSheetState extends ConsumerState<_FindFriendsSheet> {
  final _searchCtrl = TextEditingController();
  List<SearchedUser> _results = [];
  bool _searching = false;
  String? _sentTo;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final q = _searchCtrl.text.trim();
    if (q.length < 2) return;
    setState(() => _searching = true);
    final repo = ref.read(authRepositoryProvider);
    final results = await repo.searchUsers(q);
    if (mounted) setState(() { _results = results; _searching = false; });
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
          Text('Find People', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: 'Search by name or email...',
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: _searching
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : null,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14)),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
            onSubmitted: (_) => _search(),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 300,
            child: _results.isEmpty
                ? Center(
                    child: Text(
                      _searchCtrl.text.isEmpty
                          ? 'Search for people to add as friends'
                          : 'No results found',
                      style: TextStyle(color: Colors.grey.shade500),
                    ),
                  )
                : ListView.builder(
                    itemCount: _results.length,
                    itemBuilder: (ctx, i) {
                      final u = _results[i];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor:
                              AppColors.sage.withValues(alpha: 0.3),
                          backgroundImage: u.avatar != null
                              ? NetworkImage(u.avatar!)
                              : null,
                          child: u.avatar == null
                              ? Text(u.name[0].toUpperCase())
                              : null,
                        ),
                        title: Text(u.name),
                        subtitle:
                            u.email != null ? Text(u.email!) : null,
                        trailing: _sentTo == u.id
                            ? const Icon(Icons.check, color: Colors.green)
                            : IconButton(
                                icon: const Icon(Icons.person_add,
                                    color: AppColors.primary),
                                onPressed: () async {
                                  final repo =
                                      ref.read(authRepositoryProvider);
                                  await repo.sendFriendRequest(u.id);
                                  setState(() => _sentTo = u.id);
                                },
                              ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _NotificationsSheet extends StatelessWidget {
  const _NotificationsSheet(
      {required this.notifications, required this.onMarkRead});
  final List<NotificationModel> notifications;
  final VoidCallback onMarkRead;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.3,
      expand: false,
      builder: (ctx, scrollCtrl) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Notifications',
                    style: Theme.of(ctx).textTheme.titleLarge),
                TextButton(
                    onPressed: onMarkRead,
                    child: const Text('Mark all read')),
              ],
            ),
            const SizedBox(height: 12),
            Expanded(
              child: notifications.isEmpty
                  ? Center(
                      child: Text('No notifications',
                          style: TextStyle(color: Colors.grey.shade500)),
                    )
                  : ListView.separated(
                      controller: scrollCtrl,
                      itemCount: notifications.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1),
                      itemBuilder: (ctx, i) {
                        final n = notifications[i];
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            radius: 18,
                            backgroundColor:
                                n.read
                                    ? Colors.grey.shade200
                                    : AppColors.primary.withValues(alpha: 0.15),
                            child: Icon(
                              _notifIcon(n.type),
                              size: 18,
                              color: n.read
                                  ? Colors.grey
                                  : AppColors.primary,
                            ),
                          ),
                          title: Text(n.message,
                              style: TextStyle(
                                fontWeight:
                                    n.read ? FontWeight.normal : FontWeight.w600,
                                fontSize: 14,
                              )),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _notifIcon(String type) {
    return switch (type) {
      'friend_request' => Icons.person_add,
      'friend_accepted' => Icons.people,
      'trip_invite' => Icons.flight,
      'post_like' => Icons.favorite,
      'post_comment' => Icons.comment,
      'message' => Icons.chat,
      _ => Icons.notifications,
    };
  }
}

class _SettingsSheet extends StatelessWidget {
  const _SettingsSheet(
      {required this.onDeactivate, required this.onChangePassword});
  final VoidCallback onDeactivate;
  final VoidCallback onChangePassword;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('Change Password'),
            trailing: const Icon(Icons.chevron_right, size: 20),
            onTap: onChangePassword,
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text('Deactivate Account',
                style: TextStyle(color: Colors.red)),
            onTap: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Deactivate Account'),
                  content: const Text(
                      'This will permanently deactivate your account. Are you sure?'),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('Cancel')),
                    FilledButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      style: FilledButton.styleFrom(
                          backgroundColor: Colors.red),
                      child: const Text('Deactivate'),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                if (context.mounted) Navigator.pop(context);
                onDeactivate();
              }
            },
          ),
        ],
      ),
    );
  }
}
