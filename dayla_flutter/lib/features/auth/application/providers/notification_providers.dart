import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/socket_service.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_providers.dart';
import 'package:dayla_flutter/features/auth/data/models/user_model.dart';

typedef NotificationsState = ({
  List<NotificationModel> notifications,
  int unreadCount,
});

/// Notifications with live refresh: refetches whenever the backend pushes
/// `notification:new`, `friend:request_sent` or `friend:request_accepted`
/// to this user's socket room (mirrors App.tsx on the web).
final notificationsProvider =
    AsyncNotifierProvider<NotificationsNotifier, NotificationsState>(
        NotificationsNotifier.new);

class NotificationsNotifier extends AsyncNotifier<NotificationsState> {
  @override
  Future<NotificationsState> build() async {
    final socket = ref.watch(socketServiceProvider);

    void onEvent(dynamic _) => refresh();
    socket.on('notification:new', onEvent);
    socket.on('friend:request_sent', onEvent);
    socket.on('friend:request_accepted', onEvent);
    ref.onDispose(() {
      socket.off('notification:new', onEvent);
      socket.off('friend:request_sent', onEvent);
      socket.off('friend:request_accepted', onEvent);
    });

    return ref.read(authRepositoryProvider).getNotifications();
  }

  Future<void> refresh() async {
    final result = await ref.read(authRepositoryProvider).getNotifications();
    state = AsyncValue.data(result);
  }

  Future<void> markAllRead() async {
    await ref.read(authRepositoryProvider).markNotificationsRead();
    final current = state.valueOrNull;
    if (current != null) {
      state = AsyncValue.data(
        (notifications: current.notifications, unreadCount: 0),
      );
    }
  }
}

/// Unread badge count for the shell navigation.
final unreadNotificationCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).valueOrNull?.unreadCount ?? 0;
});
