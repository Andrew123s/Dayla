import 'package:dio/dio.dart';

class AuthRemoteDatasource {
  AuthRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/api/auth/login',
      data: {'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(
      '/api/auth/register',
      data: {'name': name, 'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> checkAuth() async {
    final response = await _dio.get('/api/auth/check');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMe() async {
    final response = await _dio.get('/api/auth/me');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? bio,
    List<String>? interests,
    String? location,
  }) async {
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (bio != null) data['bio'] = bio;
    if (interests != null) data['interests'] = interests;
    if (location != null) data['location'] = location;

    final response = await _dio.put('/api/auth/me', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await _dio.put(
      '/api/auth/change-password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyEmail(String token) async {
    final response = await _dio.post(
      '/api/auth/verify-email',
      data: {'token': token},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> resendVerification(String email) async {
    final response = await _dio.post(
      '/api/auth/resend-verification',
      data: {'email': email},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> completeOnboarding() async {
    final response = await _dio.post('/api/auth/complete-onboarding');
    return response.data as Map<String, dynamic>;
  }

  Future<void> logout() async {
    await _dio.post('/api/auth/logout');
  }

  Future<Map<String, dynamic>> deactivateAccount() async {
    final response = await _dio.delete('/api/auth/deactivate');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> uploadAvatar(
    List<int> bytes,
    String filename,
  ) async {
    final formData = FormData.fromMap({
      'avatar': MultipartFile.fromBytes(bytes, filename: filename),
    });
    final response = await _dio.post(
      '/api/auth/upload-avatar',
      data: formData,
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getFriends() async {
    final response = await _dio.get('/api/auth/friends');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendFriendRequest(String userId) async {
    final response = await _dio.post('/api/auth/friend-request/$userId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> acceptFriendRequest(String userId) async {
    final response =
        await _dio.post('/api/auth/friend-request/$userId/accept');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> declineFriendRequest(String userId) async {
    final response =
        await _dio.post('/api/auth/friend-request/$userId/decline');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPendingFriendRequests() async {
    final response = await _dio.get('/api/auth/friend-requests/pending');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> searchUsers(String query) async {
    final response =
        await _dio.get('/api/auth/search', queryParameters: {'q': query});
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getNotifications() async {
    final response = await _dio.get('/api/auth/notifications');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markNotificationsRead() async {
    final response = await _dio.post('/api/auth/notifications/read');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updatePreferences({
    required bool notificationsEnabled,
  }) async {
    final response = await _dio.patch(
      '/api/auth/preferences',
      data: {'notificationsEnabled': notificationsEnabled},
    );
    return response.data as Map<String, dynamic>;
  }
}
