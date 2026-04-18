import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/routing/main_shell.dart';
import 'package:dayla_flutter/features/auth/presentation/screens/auth_screen.dart';
import 'package:dayla_flutter/features/chat/presentation/screens/chat_screen.dart';
import 'package:dayla_flutter/features/community/presentation/screens/community_screen.dart';
import 'package:dayla_flutter/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:dayla_flutter/features/invitation/presentation/screens/invitation_screen.dart';
import 'package:dayla_flutter/features/profile/presentation/screens/profile_screen.dart';
import 'package:dayla_flutter/features/verify_email/presentation/screens/verify_email_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RoutePaths.auth,
    routes: [
      GoRoute(
        path: RoutePaths.auth,
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: RoutePaths.verifyEmail,
        builder: (context, state) => const VerifyEmailScreen(),
      ),
      GoRoute(
        path: RoutePaths.invitation,
        builder: (context, state) => const InvitationScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.dashboard,
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.community,
                builder: (context, state) => const CommunityScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.chat,
                builder: (context, state) => const ChatScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.profile,
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
