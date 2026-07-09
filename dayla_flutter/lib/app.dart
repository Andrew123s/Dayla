import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/utils/app_router.dart';
import 'package:dayla_flutter/core/theme/app_theme.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/auth/application/providers/push_provider.dart';
import 'package:dayla_flutter/features/billing/data/services/revenuecat_service.dart';

class DaylaApp extends ConsumerWidget {
  const DaylaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);

    // On sign-in: register this device for push notifications and identify
    // the user with RevenueCat (in-app purchases) so store subscriptions map
    // to their Dayla account. (Unregistering happens inside logout().)
    ref.listen(authSessionProvider, (previous, next) {
      if (next.status == AuthStatus.authenticated &&
          previous?.status != AuthStatus.authenticated) {
        ref.read(pushServiceProvider).register();
        final userId = next.user?.id;
        if (userId != null) RevenueCatBilling.logIn(userId);
      }
    });

    return MaterialApp.router(
      title: 'Dayla',
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
