import 'dart:async';
import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/core/utils/app_router.dart';
import 'package:dayla_flutter/features/auth/application/providers/notification_providers.dart';

/// FCM push notifications.
///
/// Android reads `android/app/google-services.json`; iOS additionally needs
/// `GoogleService-Info.plist` + an APNs key (Mac/Xcode). Everything here is
/// best-effort: if Firebase isn't configured for the platform, calls no-op
/// so the rest of the app is unaffected.
///
/// Backgrounded/terminated app: FCM displays the notification itself (the
/// backend sends a `notification` payload). Foreground: the socket layer is
/// already live, so we just refresh the in-app notification list.
final pushServiceProvider = Provider<PushService>((ref) {
  return PushService(ref);
});

class PushService {
  PushService(this._ref);

  final Ref _ref;
  bool _firebaseReady = false;
  String? _token;
  StreamSubscription<String>? _refreshSub;
  StreamSubscription<RemoteMessage>? _foregroundSub;
  StreamSubscription<RemoteMessage>? _openedSub;

  bool get _supportedPlatform =>
      !kIsWeb && (Platform.isAndroid || Platform.isIOS);

  /// Call after login: asks permission, registers this device's token.
  Future<void> register() async {
    if (!_supportedPlatform) return;
    try {
      if (!_firebaseReady) {
        await Firebase.initializeApp();
        _firebaseReady = true;
      }
      final messaging = FirebaseMessaging.instance;

      final settings = await messaging.requestPermission();
      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        return;
      }

      final token = await messaging.getToken();
      if (token != null) {
        _token = token;
        await _sendToken(token);
      }

      _refreshSub ??= messaging.onTokenRefresh.listen((t) {
        _token = t;
        _sendToken(t);
      });
      _foregroundSub ??= FirebaseMessaging.onMessage.listen((_) {
        // In-app: refresh the notifications list/badge.
        _ref.read(notificationsProvider.notifier).refresh();
      });

      // Deep links: tapping a push opens the relevant screen.
      _openedSub ??=
          FirebaseMessaging.onMessageOpenedApp.listen(_handleTap);
      final initial = await messaging.getInitialMessage();
      if (initial != null) _handleTap(initial);
    } catch (e) {
      debugPrint('Push registration skipped: $e');
    }
  }

  void _handleTap(RemoteMessage message) {
    final data = message.data;
    final router = _ref.read(goRouterProvider);
    switch (data['type']) {
      case 'memory':
        final id = data['memoryId'];
        if (id != null) router.push('/memories/$id');
      case 'board_invite':
        final id = data['invitationId'];
        if (id != null) router.push('/invitation?invitationId=$id');
      case 'message':
        router.go('/chat');
      case 'like':
      case 'comment':
        router.go('/community');
    }
  }

  /// Call on logout: stop pushes to this device for the old account.
  Future<void> unregister() async {
    if (!_supportedPlatform || !_firebaseReady) return;
    try {
      final token = _token;
      if (token != null) {
        await _ref.read(dioProvider).delete(
          '/api/auth/push-token',
          data: {'token': token},
        );
      }
      await FirebaseMessaging.instance.deleteToken();
      _token = null;
    } catch (e) {
      debugPrint('Push unregister skipped: $e');
    }
  }

  Future<void> _sendToken(String token) async {
    try {
      await _ref.read(dioProvider).post(
        '/api/auth/push-token',
        data: {'token': token},
      );
    } catch (e) {
      debugPrint('Push token sync failed: $e');
    }
  }
}
