// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String? ?? '',
      interests: (json['interests'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      location: json['location'] as String?,
      ecoScore: (json['ecoScore'] as num?)?.toDouble() ?? 0,
      badges: (json['badges'] as List<dynamic>?)
              ?.map((e) => Badge.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      emailVerified: json['emailVerified'] as bool? ?? true,
      onboardingCompleted: json['onboardingCompleted'] as bool? ?? false,
      notificationsEnabled: json['notificationsEnabled'] as bool? ?? true,
      friendCount: (json['friendCount'] as num?)?.toInt() ?? 0,
      tripCount: (json['tripCount'] as num?)?.toInt() ?? 0,
      postCount: (json['postCount'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'avatar': instance.avatar,
      'bio': instance.bio,
      'interests': instance.interests,
      'location': instance.location,
      'ecoScore': instance.ecoScore,
      'badges': instance.badges,
      'emailVerified': instance.emailVerified,
      'onboardingCompleted': instance.onboardingCompleted,
      'notificationsEnabled': instance.notificationsEnabled,
      'friendCount': instance.friendCount,
      'tripCount': instance.tripCount,
      'postCount': instance.postCount,
      'createdAt': instance.createdAt,
    };

_Badge _$BadgeFromJson(Map<String, dynamic> json) => _Badge(
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      earnedAt: json['earnedAt'] as String?,
    );

Map<String, dynamic> _$BadgeToJson(_Badge instance) => <String, dynamic>{
      'name': instance.name,
      'description': instance.description,
      'earnedAt': instance.earnedAt,
    };

_AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) =>
    _AuthResponse(
      success: json['success'] as bool,
      message: json['message'] as String?,
      requiresVerification: json['requiresVerification'] as bool? ?? false,
      data: json['data'] == null
          ? null
          : AuthData.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AuthResponseToJson(_AuthResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'requiresVerification': instance.requiresVerification,
      'data': instance.data,
    };

_AuthData _$AuthDataFromJson(Map<String, dynamic> json) => _AuthData(
      user: json['user'] == null
          ? null
          : UserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String?,
      email: json['email'] as String?,
    );

Map<String, dynamic> _$AuthDataToJson(_AuthData instance) => <String, dynamic>{
      'user': instance.user,
      'token': instance.token,
      'email': instance.email,
    };

_FriendRequest _$FriendRequestFromJson(Map<String, dynamic> json) =>
    _FriendRequest(
      id: json['id'] as String,
      from: FriendRequestUser.fromJson(json['from'] as Map<String, dynamic>),
      status: json['status'] as String? ?? 'pending',
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$FriendRequestToJson(_FriendRequest instance) =>
    <String, dynamic>{
      'id': instance.id,
      'from': instance.from,
      'status': instance.status,
      'createdAt': instance.createdAt,
    };

_FriendRequestUser _$FriendRequestUserFromJson(Map<String, dynamic> json) =>
    _FriendRequestUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
    );

Map<String, dynamic> _$FriendRequestUserToJson(_FriendRequestUser instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'avatar': instance.avatar,
      'bio': instance.bio,
    };

_SearchedUser _$SearchedUserFromJson(Map<String, dynamic> json) =>
    _SearchedUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
      friendStatus: json['friendStatus'] as String? ?? 'none',
    );

Map<String, dynamic> _$SearchedUserToJson(_SearchedUser instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'avatar': instance.avatar,
      'bio': instance.bio,
      'friendStatus': instance.friendStatus,
    };

_NotificationModel _$NotificationModelFromJson(Map<String, dynamic> json) =>
    _NotificationModel(
      id: json['id'] as String,
      type: json['type'] as String,
      message: json['message'] as String? ?? '',
      read: json['read'] as bool? ?? false,
      sender: json['sender'] == null
          ? null
          : NotificationSender.fromJson(json['sender'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$NotificationModelToJson(_NotificationModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'message': instance.message,
      'read': instance.read,
      'sender': instance.sender,
      'createdAt': instance.createdAt,
    };

_NotificationSender _$NotificationSenderFromJson(Map<String, dynamic> json) =>
    _NotificationSender(
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$NotificationSenderToJson(_NotificationSender instance) =>
    <String, dynamic>{
      'name': instance.name,
      'avatar': instance.avatar,
    };
