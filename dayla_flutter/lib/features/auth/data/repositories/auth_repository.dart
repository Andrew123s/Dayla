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
    }
  }

  Future<AuthResponse> checkAuth() async {
    try {
      final json = await _remote.checkAuth();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<AuthResponse> getMe() async {
    try {
      final json = await _remote.getMe();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
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
    }
  }

  Future<AuthResponse> verifyEmail(String token) async {
    try {
      final json = await _remote.verifyEmail(token);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<AuthResponse> resendVerification(String email) async {
    try {
      final json = await _remote.resendVerification(email);
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<AuthResponse> completeOnboarding() async {
    try {
      final json = await _remote.completeOnboarding();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _remote.logout();
    } on DioException {
      // Logout locally even if the server request fails
    }
  }

  Future<AuthResponse> deactivateAccount() async {
    try {
      final json = await _remote.deactivateAccount();
      return AuthResponse.fromJson(json);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  Future<String?> uploadAvatar(List<int> bytes, String filename) async {
    try {
      final json = await _remote.uploadAvatar(bytes, filename);
      if (json['success'] == true) {
        return (json['data'] as Map<String, dynamic>?)?['avatar'] as String?;
      }
      return null;
    } on DioException {
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
    } on DioException {
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
    } on DioException {
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
    } on DioException {
      return [];
    }
  }

  Future<bool> sendFriendRequest(String userId) async {
    try {
      final json = await _remote.sendFriendRequest(userId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> acceptFriendRequest(String userId) async {
    try {
      final json = await _remote.acceptFriendRequest(userId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> declineFriendRequest(String userId) async {
    try {
      final json = await _remote.declineFriendRequest(userId);
      return json['success'] == true;
    } on DioException {
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
    } on DioException {
      return (notifications: <NotificationModel>[], unreadCount: 0);
    }
  }

  Future<bool> markNotificationsRead() async {
    try {
      final json = await _remote.markNotificationsRead();
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> updatePreferences({required bool notificationsEnabled}) async {
    try {
      final json = await _remote.updatePreferences(
        notificationsEnabled: notificationsEnabled,
      );
      return json['success'] == true;
    } on DioException {
      return false;
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
    return AuthResponse(success: false, message: _fallbackMessage(e));
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
