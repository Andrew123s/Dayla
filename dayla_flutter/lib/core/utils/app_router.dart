import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/utils/main_shell.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/auth/presentation/screens/auth_screen.dart';
import 'package:dayla_flutter/features/auth/presentation/screens/onboarding_screen.dart';
import 'package:dayla_flutter/features/chat/presentation/screens/chat_screen.dart';
import 'package:dayla_flutter/features/community/presentation/screens/community_screen.dart';
import 'package:dayla_flutter/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:dayla_flutter/features/invitation/presentation/screens/invitation_screen.dart';
import 'package:dayla_flutter/features/climatiq/presentation/screens/climatiq_screen.dart';
import 'package:dayla_flutter/features/dashboard/presentation/screens/trip_detail_screen.dart';
import 'package:dayla_flutter/features/dashboard/presentation/screens/budget_screen.dart';
import 'package:dayla_flutter/features/dashboard/presentation/screens/weather_screen.dart';
import 'package:dayla_flutter/features/packing/presentation/screens/packing_screen.dart';
import 'package:dayla_flutter/features/profile/presentation/screens/profile_screen.dart';
import 'package:dayla_flutter/features/verify_email/presentation/screens/verify_email_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authSessionProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RoutePaths.auth,
    redirect: (context, state) {
      final status = authState.status;
      final path = state.uri.path;

      final publicPaths = [
        RoutePaths.auth,
        RoutePaths.verifyEmail,
        RoutePaths.invitation,
      ];
      final isPublic = publicPaths.contains(path);

      if (status == AuthStatus.unknown) return null;

      if (status == AuthStatus.unauthenticated) {
        if (isPublic) return null;
        return RoutePaths.auth;
      }

      if (status == AuthStatus.onboarding) {
        if (path == RoutePaths.onboarding) return null;
        return RoutePaths.onboarding;
      }

      if (status == AuthStatus.authenticated) {
        if (path == RoutePaths.auth || path == RoutePaths.onboarding) {
          return RoutePaths.dashboard;
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: RoutePaths.auth,
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: RoutePaths.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: RoutePaths.verifyEmail,
        builder: (context, state) => const VerifyEmailScreen(),
      ),
      GoRoute(
        path: RoutePaths.invitation,
        builder: (context, state) => const InvitationScreen(),
      ),
      GoRoute(
        path: RoutePaths.tripDetail,
        builder: (context, state) {
          final tripId = state.pathParameters['tripId']!;
          return TripDetailScreen(tripId: tripId);
        },
      ),
      GoRoute(
        path: RoutePaths.packing,
        builder: (context, state) {
          final tripId = state.pathParameters['tripId']!;
          final tripName =
              state.uri.queryParameters['name'] ?? 'Trip';
          return PackingScreen(tripId: tripId, tripName: tripName);
        },
      ),
      GoRoute(
        path: RoutePaths.climatiq,
        builder: (context, state) {
          final tripId = state.pathParameters['tripId']!;
          final tripName =
              state.uri.queryParameters['name'] ?? 'Trip';
          return ClimatiqScreen(tripId: tripId, tripName: tripName);
        },
      ),
      GoRoute(
        path: RoutePaths.budget,
        builder: (context, state) {
          final tripId = state.pathParameters['tripId']!;
          final tripName =
              state.uri.queryParameters['name'] ?? 'Trip';
          return BudgetScreen(tripId: tripId, tripName: tripName);
        },
      ),
      GoRoute(
        path: RoutePaths.weather,
        builder: (context, state) {
          final tripName =
              state.uri.queryParameters['name'] ?? 'Trip';
          final location =
              state.uri.queryParameters['location'];
          return WeatherScreen(
            tripName: tripName,
            defaultLocation: location,
          );
        },
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
