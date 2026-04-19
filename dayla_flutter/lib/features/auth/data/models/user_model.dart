import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
abstract class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
    String? avatar,
    @Default('') String bio,
    @Default([]) List<String> interests,
    String? location,
    @Default(0) double ecoScore,
    @Default([]) List<Badge> badges,
    @Default(true) bool emailVerified,
    @Default(false) bool onboardingCompleted,
    @Default(true) bool notificationsEnabled,
    @Default(0) int friendCount,
    @Default(0) int tripCount,
    @Default(0) int postCount,
    String? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(_normalizeId(json));

  static Map<String, dynamic> _normalizeId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class Badge with _$Badge {
  const factory Badge({
    required String name,
    @Default('') String description,
    String? earnedAt,
  }) = _Badge;

  factory Badge.fromJson(Map<String, dynamic> json) => _$BadgeFromJson(json);
}

@freezed
abstract class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required bool success,
    String? message,
    @Default(false) bool requiresVerification,
    AuthData? data,
  }) = _AuthResponse;

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
}

@freezed
abstract class AuthData with _$AuthData {
  const factory AuthData({
    UserModel? user,
    String? token,
    String? email,
  }) = _AuthData;

  factory AuthData.fromJson(Map<String, dynamic> json) =>
      _$AuthDataFromJson(json);
}

@freezed
abstract class FriendRequest with _$FriendRequest {
  const factory FriendRequest({
    required String id,
    required FriendRequestUser from,
    @Default('pending') String status,
    String? createdAt,
  }) = _FriendRequest;

  factory FriendRequest.fromJson(Map<String, dynamic> json) =>
      _$FriendRequestFromJson(_normalizeMongoId(json));

  static Map<String, dynamic> _normalizeMongoId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class FriendRequestUser with _$FriendRequestUser {
  const factory FriendRequestUser({
    required String id,
    required String name,
    String? email,
    String? avatar,
    String? bio,
  }) = _FriendRequestUser;

  factory FriendRequestUser.fromJson(Map<String, dynamic> json) =>
      _$FriendRequestUserFromJson(_normalizeMongoId(json));

  static Map<String, dynamic> _normalizeMongoId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class SearchedUser with _$SearchedUser {
  const factory SearchedUser({
    required String id,
    required String name,
    String? email,
    String? avatar,
    String? bio,
    @Default('none') String friendStatus,
  }) = _SearchedUser;

  factory SearchedUser.fromJson(Map<String, dynamic> json) =>
      _$SearchedUserFromJson(_normalizeMongoId(json));

  static Map<String, dynamic> _normalizeMongoId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class NotificationModel with _$NotificationModel {
  const factory NotificationModel({
    required String id,
    required String type,
    @Default('') String message,
    @Default(false) bool read,
    NotificationSender? sender,
    String? createdAt,
  }) = _NotificationModel;

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(_normalizeMongoId(json));

  static Map<String, dynamic> _normalizeMongoId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class NotificationSender with _$NotificationSender {
  const factory NotificationSender({
    required String name,
    String? avatar,
  }) = _NotificationSender;

  factory NotificationSender.fromJson(Map<String, dynamic> json) =>
      _$NotificationSenderFromJson(json);
}
