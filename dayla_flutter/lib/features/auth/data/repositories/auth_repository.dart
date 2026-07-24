import 'package:dio/dio.dart';
import 'package:dayla_flutter/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:dayla_flutter/features/auth/data/models/user_model.dart';

class AuthRepository {
  AuthRepository(this._remote);

  final AuthRemoteDatasource _remote;

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final json = await _remote.login(email: email, password: password);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final json =
          await _remote.register(name: name, email: email, password: password);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> checkAuth() async {
    try {
      final json = await _remote.checkAuth();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> getMe() async {
    try {
      final json = await _remote.getMe();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> updateProfile({
    String? name,
    String? bio,
    List<String>? interests,
    String? location,
  }) async {
    try {
      final json = await _remote.updateProfile(
        name: name,
        bio: bio,
        interests: interests,
        location: location,
      );
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final json = await _remote.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> verifyEmail(String token) async {
    try {
      final json = await _remote.verifyEmail(token);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> resendVerification(String email) async {
    try {
      final json = await _remote.resendVerification(email);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> forgotPassword(String email) async {
    try {
      final json = await _remote.forgotPassword(email);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> resetPassword({
    required String token,
    required String password,
  }) async {
    try {
      final json = await _remote.resetPassword(token: token, password: password);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<AuthResponse> completeOnboarding() async {
    try {
      final json = await _remote.completeOnboarding();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<void> logout() async {
    try {
      await _remote.logout();
    } catch (_) {
      // Logout locally even if the server request fails
    }
  }

  Future<AuthResponse> deactivateAccount() async {
    try {
      final json = await _remote.deactivateAccount();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    } catch (_) {
      // Unexpected payload shape — fail soft, and mark it indeterminate so
      // session restore never treats a parse hiccup as a revoked session.
      return AuthResponse(
          success: false,
          message: 'Something went wrong. Please try again.',
          networkError: true);
    }
  }

  Future<String?> uploadAvatar(List<int> bytes, String filename) async {
    try {
      final json = await _remote.uploadAvatar(bytes, filename);
      if (json['success'] == true) {
        return (json['data'] as Map<String, dynamic>?)?['avatar'] as String?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<SearchedUser>> searchUsers(String query) async {
    try {
      final json = await _remote.searchUsers(query);
      final users = (json['data']?['users'] as List?) ?? [];
      return users
          .map((u) => SearchedUser.fromJson(u as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<List<FriendRequestUser>> getFriends() async {
    try {
      final json = await _remote.getFriends();
      final friends = (json['data']?['friends'] as List?) ?? [];
      return friends
          .map((f) => FriendRequestUser.fromJson(f as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<List<FriendRequest>> getPendingFriendRequests() async {
    try {
      final json = await _remote.getPendingFriendRequests();
      final requests = (json['data']?['requests'] as List?) ?? [];
      return requests
          .map((r) => FriendRequest.fromJson(r as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<bool> sendFriendRequest(String userId) async {
    try {
      final json = await _remote.sendFriendRequest(userId);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> acceptFriendRequest(String userId) async {
    try {
      final json = await _remote.acceptFriendRequest(userId);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> declineFriendRequest(String userId) async {
    try {
      final json = await _remote.declineFriendRequest(userId);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<({List<NotificationModel> notifications, int unreadCount})>
      getNotifications() async {
    try {
      final json = await _remote.getNotifications();
      final data = json['data'] as Map<String, dynamic>? ?? {};
      final notifs = (data['notifications'] as List?) ?? [];
      return (
        notifications: notifs
            .map((n) =>
                NotificationModel.fromJson(n as Map<String, dynamic>))
            .toList(),
        unreadCount: (data['unreadCount'] as int?) ?? 0,
      );
    } catch (_) {
      return (notifications: <NotificationModel>[], unreadCount: 0);
    }
  }

  Future<bool> markNotificationsRead() async {
    try {
      final json = await _remote.markNotificationsRead();
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updatePreferences({required bool notificationsEnabled}) async {
    try {
      final json = await _remote.updatePreferences(
        notificationsEnabled: notificationsEnabled,
      );
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Rolling session: exchange a still-valid token for a fresh one.
  /// Returns the new token, or null (never throws) — callers keep the old
  /// token when rotation fails.
  Future<String?> refreshToken() async {
    try {
      final json = await _remote.refreshSession();
      final token = json['data']?['token'];
      return token is String && token.isNotEmpty ? token : null;
    } catch (_) {
      return null;
    }
  }

  AuthResponse _handleDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      return AuthResponse(
        success: false,
        message: data['message'] as String? ?? _fallbackMessage(e),
        requiresVerification: data['requiresVerification'] == true,
        data: data['email'] != null
            ? AuthData(email: data['email'] as String?)
            : null,
      );
    }
    // No response body: timeouts, dead connections, cancelled requests —
    // the server never judged this session.
    return AuthResponse(
      success: false,
      message: _fallbackMessage(e),
      networkError: e.response == null,
    );
  }

  String _fallbackMessage(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timed out. Please try again.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Unable to connect to server. Check your network.';
    }
    if (e.response?.statusCode == 429) {
      return 'Too many requests. Please wait a moment.';
    }
    return 'Something went wrong. Please try again.';
  }
}
