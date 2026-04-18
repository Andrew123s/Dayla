import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/routing/app_router.dart';
import 'package:dayla_flutter/core/theme/app_theme.dart';

class DaylaApp extends ConsumerWidget {
  const DaylaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);
    return MaterialApp.router(
      title: 'Dayla',
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
