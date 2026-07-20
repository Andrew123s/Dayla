import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dayla_flutter/core/network/auth_token_provider.dart';
import 'package:dayla_flutter/core/network/token_storage.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_providers.dart';
import 'package:dayla_flutter/features/auth/application/providers/push_provider.dart';
import 'package:dayla_flutter/features/auth/data/models/user_model.dart';
import 'package:dayla_flutter/features/billing/data/services/revenuecat_service.dart';
import 'package:dayla_flutter/features/auth/data/repositories/auth_repository.dart';

enum AuthStatus { unknown, unauthenticated, authenticated, onboarding }

class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.error,
    this.isLoading = false,
    this.successMessage,
    this.requiresVerification = false,
    this.verificationEmail,
  });

  final AuthStatus status;
  final UserModel? user;
  final String? error;
  final bool isLoading;
  final String? successMessage;
  final bool requiresVerification;
  final String? verificationEmail;

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? error,
    bool? isLoading,
    String? successMessage,
    bool? requiresVerification,
    String? verificationEmail,
    bool clearUser = false,
    bool clearError = false,
    bool clearSuccess = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      error: clearError ? null : (error ?? this.error),
      isLoading: isLoading ?? this.isLoading,
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
      requiresVerification: requiresVerification ?? this.requiresVerification,
      verificationEmail: verificationEmail ?? this.verificationEmail,
    );
  }
}

class AuthSessionNotifier extends Notifier<AuthState> {
  late final AuthRepository _repo;
  late final TokenStorage _tokenStorage;

  @override
  AuthState build() {
    _repo = ref.watch(authRepositoryProvider);
    _tokenStorage = ref.watch(tokenStorageProvider);
    _tryRestoreSession();
    return const AuthState();
  }

  static const _cachedUserKey = 'dayla_cached_user';

  Future<void> _cacheUser(UserModel user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cachedUserKey, jsonEncode(user.toJson()));
    } catch (_) {
      // Cache is an optimization; never let it break auth.
    }
  }

  Future<UserModel?> _readCachedUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cachedUserKey);
      if (raw == null) return null;
      return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  AuthState _signedInState(UserModel user) => AuthState(
        status: user.onboardingCompleted
            ? AuthStatus.authenticated
            : AuthStatus.onboarding,
        user: user,
      );

  Future<void> _clearSession() async {
    await _tokenStorage.delete();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_cachedUserKey);
    } catch (_) {}
    ref.read(authTokenProvider.notifier).state = null;
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Restore the session on app launch.
  ///
  /// Rules (the old version violated all three):
  ///  1. A stored token + cached profile signs the user in IMMEDIATELY —
  ///     no network round-trip gates the dashboard.
  ///  2. The server check retries through backend cold starts, and a
  ///     network/indeterminate failure NEVER deletes the token — only an
  ///     explicit server rejection (expired/revoked) logs the user out.
  ///  3. On a successful check the token is rotated via /auth/refresh, so
  ///     active users never hit the JWT expiry cliff (rolling sessions).
  Future<void> _tryRestoreSession() async {
    final token = await _tokenStorage.read();
    if (token == null || token.isEmpty) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }
    ref.read(authTokenProvider.notifier).state = token;

    // Optimistic restore from the cached profile (works offline).
    final cached = await _readCachedUser();
    if (cached != null) {
      state = _signedInState(cached);
    }

    // Validate with the server — retry through cold starts (Render can
    // take 30-60s to wake, longer than one request timeout).
    var response = await _repo.checkAuth();
    for (var attempt = 1;
        !response.success && response.networkError && attempt <= 2;
        attempt++) {
      await Future.delayed(Duration(seconds: 5 * attempt));
      response = await _repo.checkAuth();
    }

    if (response.success && response.data?.user != null) {
      final user = response.data!.user!;
      await _cacheUser(user);
      state = _signedInState(user);
      // Rolling session: swap in a fresh token while this one is valid.
      final fresh = await _repo.refreshToken();
      if (fresh != null) {
        await _tokenStorage.write(fresh);
        ref.read(authTokenProvider.notifier).state = fresh;
      }
    } else if (!response.networkError) {
      // The server SAW the token and rejected it — the only real logout.
      await _clearSession();
    } else if (cached == null) {
      // Unreachable server and nothing cached to render: show login but
      // KEEP the token — the next launch tries again.
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
    // Unreachable server + cached profile: stay signed in on cache.
  }

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      clearSuccess: true,
      requiresVerification: false,
    );
    final response = await _repo.login(email: email, password: password);
    if (response.success && response.data?.token != null) {
      final token = response.data!.token!;
      await _tokenStorage.write(token);
      ref.read(authTokenProvider.notifier).state = token;
      final user = response.data!.user!;
      await _cacheUser(user);
      state = _signedInState(user);
    } else {
      state = state.copyWith(
        isLoading: false,
        error: response.message ?? 'Login failed',
        requiresVerification: response.requiresVerification,
        verificationEmail: response.data?.email ?? email,
      );
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      clearSuccess: true,
      requiresVerification: false,
    );
    final response =
        await _repo.register(name: name, email: email, password: password);
    if (response.success) {
      if (response.requiresVerification) {
        state = state.copyWith(
          isLoading: false,
          successMessage: response.message,
          requiresVerification: true,
          verificationEmail: response.data?.email ?? email,
        );
      } else if (response.data?.token != null) {
        final token = response.data!.token!;
        await _tokenStorage.write(token);
        ref.read(authTokenProvider.notifier).state = token;
        final user = response.data!.user!;
        await _cacheUser(user);
        state = _signedInState(user);
      }
    } else {
      state = state.copyWith(
        isLoading: false,
        error: response.message ?? 'Registration failed',
      );
    }
  }

  Future<void> resendVerification(String email) async {
    state = state.copyWith(isLoading: true, clearError: true, clearSuccess: true);
    final response = await _repo.resendVerification(email);
    state = state.copyWith(
      isLoading: false,
      successMessage:
          response.success ? 'Verification email sent!' : null,
      error: response.success ? null : response.message,
    );
  }

  Future<void> completeOnboarding() async {
    await _repo.completeOnboarding();
    final updated = state.user?.copyWith(onboardingCompleted: true);
    if (updated != null) await _cacheUser(updated);
    state = state.copyWith(
      status: AuthStatus.authenticated,
      user: updated,
    );
  }

  /// Onboarding completion and email verification are monotonic — once
  /// true they only reset by an intentional server-side change, never by a
  /// partial payload that happened to omit the flags. Without this guard a
  /// single incomplete /me response got cached and resurrected the
  /// onboarding flow (and "confirm your email" prompts) on the next launch.
  UserModel _mergeMonotonicFlags(UserModel incoming) {
    final current = state.user;
    if (current == null) return incoming;
    return incoming.copyWith(
      onboardingCompleted:
          incoming.onboardingCompleted || current.onboardingCompleted,
      emailVerified: incoming.emailVerified || current.emailVerified,
    );
  }

  Future<void> updateUser(UserModel user) async {
    final merged = _mergeMonotonicFlags(user);
    await _cacheUser(merged);
    state = state.copyWith(user: merged);
  }

  Future<void> refreshUser() async {
    final response = await _repo.getMe();
    if (response.success && response.data?.user != null) {
      final merged = _mergeMonotonicFlags(response.data!.user!);
      await _cacheUser(merged);
      state = state.copyWith(user: merged);
    }
  }

  Future<void> logout() async {
    // Unregister this device's push token while the JWT is still valid.
    await ref.read(pushServiceProvider).unregister();
    await RevenueCatBilling.logOut();
    await _repo.logout();
    await _clearSession();
  }

  void clearMessages() {
    state = state.copyWith(clearError: true, clearSuccess: true);
  }
}

final authSessionProvider =
    NotifierProvider<AuthSessionNotifier, AuthState>(AuthSessionNotifier.new);
