import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/auth_token_provider.dart';
import 'package:dayla_flutter/core/network/token_storage.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_providers.dart';
import 'package:dayla_flutter/features/auth/data/models/user_model.dart';
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

  Future<void> _tryRestoreSession() async {
    final token = await _tokenStorage.read();
    if (token == null || token.isEmpty) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }
    ref.read(authTokenProvider.notifier).state = token;
    final response = await _repo.checkAuth();
    if (response.success && response.data?.user != null) {
      final user = response.data!.user!;
      state = AuthState(
        status: user.onboardingCompleted
            ? AuthStatus.authenticated
            : AuthStatus.onboarding,
        user: user,
      );
    } else {
      await _tokenStorage.delete();
      ref.read(authTokenProvider.notifier).state = null;
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
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
      state = AuthState(
        status: user.onboardingCompleted
            ? AuthStatus.authenticated
            : AuthStatus.onboarding,
        user: user,
      );
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
        state = AuthState(
          status: user.onboardingCompleted
              ? AuthStatus.authenticated
              : AuthStatus.onboarding,
          user: user,
        );
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
    state = state.copyWith(
      status: AuthStatus.authenticated,
      user: state.user?.copyWith(onboardingCompleted: true),
    );
  }

  Future<void> updateUser(UserModel user) async {
    state = state.copyWith(user: user);
  }

  Future<void> refreshUser() async {
    final response = await _repo.getMe();
    if (response.success && response.data?.user != null) {
      state = state.copyWith(user: response.data!.user);
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    await _tokenStorage.delete();
    ref.read(authTokenProvider.notifier).state = null;
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void clearMessages() {
    state = state.copyWith(clearError: true, clearSuccess: true);
  }
}

final authSessionProvider =
    NotifierProvider<AuthSessionNotifier, AuthState>(AuthSessionNotifier.new);
