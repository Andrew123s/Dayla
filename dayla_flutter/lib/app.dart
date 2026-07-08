import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/utils/app_router.dart';
import 'package:dayla_flutter/core/theme/app_theme.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/auth/application/providers/push_provider.dart';

class DaylaApp extends ConsumerWidget {
  const DaylaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);

    // Register this device for push notifications when the user signs in.
    // (Unregistering happens inside logout(), while the JWT is still valid.)
    ref.listen(authSessionProvider, (previous, next) {
      if (next.status == AuthStatus.authenticated &&
          previous?.status != AuthStatus.authenticated) {
        ref.read(pushServiceProvider).register();
      }
    });

    return MaterialApp.router(
      title: 'Dayla',
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
