// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$UserModel {
  String get id;
  String get name;
  String get email;
  String? get avatar;
  String get bio;
  List<String> get interests;
  String? get location;
  double get ecoScore;
  List<Badge> get badges;
  bool get emailVerified;
  bool get onboardingCompleted;
  bool get notificationsEnabled;
  int get friendCount;
  int get tripCount;
  int get postCount;
  String? get createdAt;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $UserModelCopyWith<UserModel> get copyWith =>
      _$UserModelCopyWithImpl<UserModel>(this as UserModel, _$identity);

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is UserModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            const DeepCollectionEquality().equals(other.interests, interests) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.ecoScore, ecoScore) ||
                other.ecoScore == ecoScore) &&
            const DeepCollectionEquality().equals(other.badges, badges) &&
            (identical(other.emailVerified, emailVerified) ||
                other.emailVerified == emailVerified) &&
            (identical(other.onboardingCompleted, onboardingCompleted) ||
                other.onboardingCompleted == onboardingCompleted) &&
            (identical(other.notificationsEnabled, notificationsEnabled) ||
                other.notificationsEnabled == notificationsEnabled) &&
            (identical(other.friendCount, friendCount) ||
                other.friendCount == friendCount) &&
            (identical(other.tripCount, tripCount) ||
                other.tripCount == tripCount) &&
            (identical(other.postCount, postCount) ||
                other.postCount == postCount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      email,
      avatar,
      bio,
      const DeepCollectionEquality().hash(interests),
      location,
      ecoScore,
      const DeepCollectionEquality().hash(badges),
      emailVerified,
      onboardingCompleted,
      notificationsEnabled,
      friendCount,
      tripCount,
      postCount,
      createdAt);

  @override
  String toString() {
    return 'UserModel(id: $id, name: $name, email: $email, avatar: $avatar, bio: $bio, interests: $interests, location: $location, ecoScore: $ecoScore, badges: $badges, emailVerified: $emailVerified, onboardingCompleted: $onboardingCompleted, notificationsEnabled: $notificationsEnabled, friendCount: $friendCount, tripCount: $tripCount, postCount: $postCount, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $UserModelCopyWith<$Res> {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) _then) =
      _$UserModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String email,
      String? avatar,
      String bio,
      List<String> interests,
      String? location,
      double ecoScore,
      List<Badge> badges,
      bool emailVerified,
      bool onboardingCompleted,
      bool notificationsEnabled,
      int friendCount,
      int tripCount,
      int postCount,
      String? createdAt});
}

/// @nodoc
class _$UserModelCopyWithImpl<$Res> implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._self, this._then);

  final UserModel _self;
  final $Res Function(UserModel) _then;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = null,
    Object? avatar = freezed,
    Object? bio = null,
    Object? interests = null,
    Object? location = freezed,
    Object? ecoScore = null,
    Object? badges = null,
    Object? emailVerified = null,
    Object? onboardingCompleted = null,
    Object? notificationsEnabled = null,
    Object? friendCount = null,
    Object? tripCount = null,
    Object? postCount = null,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      bio: null == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String,
      interests: null == interests
          ? _self.interests
          : interests // ignore: cast_nullable_to_non_nullable
              as List<String>,
      location: freezed == location
          ? _self.location
          : location // ignore: cast_nullable_to_non_nullable
              as String?,
      ecoScore: null == ecoScore
          ? _self.ecoScore
          : ecoScore // ignore: cast_nullable_to_non_nullable
              as double,
      badges: null == badges
          ? _self.badges
          : badges // ignore: cast_nullable_to_non_nullable
              as List<Badge>,
      emailVerified: null == emailVerified
          ? _self.emailVerified
          : emailVerified // ignore: cast_nullable_to_non_nullable
              as bool,
      onboardingCompleted: null == onboardingCompleted
          ? _self.onboardingCompleted
          : onboardingCompleted // ignore: cast_nullable_to_non_nullable
              as bool,
      notificationsEnabled: null == notificationsEnabled
          ? _self.notificationsEnabled
          : notificationsEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      friendCount: null == friendCount
          ? _self.friendCount
          : friendCount // ignore: cast_nullable_to_non_nullable
              as int,
      tripCount: null == tripCount
          ? _self.tripCount
          : tripCount // ignore: cast_nullable_to_non_nullable
              as int,
      postCount: null == postCount
          ? _self.postCount
          : postCount // ignore: cast_nullable_to_non_nullable
              as int,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _UserModel implements UserModel {
  const _UserModel(
      {required this.id,
      required this.name,
      required this.email,
      this.avatar,
      this.bio = '',
      final List<String> interests = const [],
      this.location,
      this.ecoScore = 0,
      final List<Badge> badges = const [],
      this.emailVerified = true,
      this.onboardingCompleted = false,
      this.notificationsEnabled = true,
      this.friendCount = 0,
      this.tripCount = 0,
      this.postCount = 0,
      this.createdAt})
      : _interests = interests,
        _badges = badges;
  factory _UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String email;
  @override
  final String? avatar;
  @override
  @JsonKey()
  final String bio;
  final List<String> _interests;
  @override
  @JsonKey()
  List<String> get interests {
    if (_interests is EqualUnmodifiableListView) return _interests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_interests);
  }

  @override
  final String? location;
  @override
  @JsonKey()
  final double ecoScore;
  final List<Badge> _badges;
  @override
  @JsonKey()
  List<Badge> get badges {
    if (_badges is EqualUnmodifiableListView) return _badges;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_badges);
  }

  @override
  @JsonKey()
  final bool emailVerified;
  @override
  @JsonKey()
  final bool onboardingCompleted;
  @override
  @JsonKey()
  final bool notificationsEnabled;
  @override
  @JsonKey()
  final int friendCount;
  @override
  @JsonKey()
  final int tripCount;
  @override
  @JsonKey()
  final int postCount;
  @override
  final String? createdAt;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$UserModelCopyWith<_UserModel> get copyWith =>
      __$UserModelCopyWithImpl<_UserModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$UserModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _UserModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            const DeepCollectionEquality()
                .equals(other._interests, _interests) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.ecoScore, ecoScore) ||
                other.ecoScore == ecoScore) &&
            const DeepCollectionEquality().equals(other._badges, _badges) &&
            (identical(other.emailVerified, emailVerified) ||
                other.emailVerified == emailVerified) &&
            (identical(other.onboardingCompleted, onboardingCompleted) ||
                other.onboardingCompleted == onboardingCompleted) &&
            (identical(other.notificationsEnabled, notificationsEnabled) ||
                other.notificationsEnabled == notificationsEnabled) &&
            (identical(other.friendCount, friendCount) ||
                other.friendCount == friendCount) &&
            (identical(other.tripCount, tripCount) ||
                other.tripCount == tripCount) &&
            (identical(other.postCount, postCount) ||
                other.postCount == postCount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      email,
      avatar,
      bio,
      const DeepCollectionEquality().hash(_interests),
      location,
      ecoScore,
      const DeepCollectionEquality().hash(_badges),
      emailVerified,
      onboardingCompleted,
      notificationsEnabled,
      friendCount,
      tripCount,
      postCount,
      createdAt);

  @override
  String toString() {
    return 'UserModel(id: $id, name: $name, email: $email, avatar: $avatar, bio: $bio, interests: $interests, location: $location, ecoScore: $ecoScore, badges: $badges, emailVerified: $emailVerified, onboardingCompleted: $onboardingCompleted, notificationsEnabled: $notificationsEnabled, friendCount: $friendCount, tripCount: $tripCount, postCount: $postCount, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$UserModelCopyWith<$Res>
    implements $UserModelCopyWith<$Res> {
  factory _$UserModelCopyWith(
          _UserModel value, $Res Function(_UserModel) _then) =
      __$UserModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String email,
      String? avatar,
      String bio,
      List<String> interests,
      String? location,
      double ecoScore,
      List<Badge> badges,
      bool emailVerified,
      bool onboardingCompleted,
      bool notificationsEnabled,
      int friendCount,
      int tripCount,
      int postCount,
      String? createdAt});
}

/// @nodoc
class __$UserModelCopyWithImpl<$Res> implements _$UserModelCopyWith<$Res> {
  __$UserModelCopyWithImpl(this._self, this._then);

  final _UserModel _self;
  final $Res Function(_UserModel) _then;

  /// Create a copy of UserModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = null,
    Object? avatar = freezed,
    Object? bio = null,
    Object? interests = null,
    Object? location = freezed,
    Object? ecoScore = null,
    Object? badges = null,
    Object? emailVerified = null,
    Object? onboardingCompleted = null,
    Object? notificationsEnabled = null,
    Object? friendCount = null,
    Object? tripCount = null,
    Object? postCount = null,
    Object? createdAt = freezed,
  }) {
    return _then(_UserModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      bio: null == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String,
      interests: null == interests
          ? _self._interests
          : interests // ignore: cast_nullable_to_non_nullable
              as List<String>,
      location: freezed == location
          ? _self.location
          : location // ignore: cast_nullable_to_non_nullable
              as String?,
      ecoScore: null == ecoScore
          ? _self.ecoScore
          : ecoScore // ignore: cast_nullable_to_non_nullable
              as double,
      badges: null == badges
          ? _self._badges
          : badges // ignore: cast_nullable_to_non_nullable
              as List<Badge>,
      emailVerified: null == emailVerified
          ? _self.emailVerified
          : emailVerified // ignore: cast_nullable_to_non_nullable
              as bool,
      onboardingCompleted: null == onboardingCompleted
          ? _self.onboardingCompleted
          : onboardingCompleted // ignore: cast_nullable_to_non_nullable
              as bool,
      notificationsEnabled: null == notificationsEnabled
          ? _self.notificationsEnabled
          : notificationsEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      friendCount: null == friendCount
          ? _self.friendCount
          : friendCount // ignore: cast_nullable_to_non_nullable
              as int,
      tripCount: null == tripCount
          ? _self.tripCount
          : tripCount // ignore: cast_nullable_to_non_nullable
              as int,
      postCount: null == postCount
          ? _self.postCount
          : postCount // ignore: cast_nullable_to_non_nullable
              as int,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$Badge {
  String get name;
  String get description;
  String? get earnedAt;

  /// Create a copy of Badge
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BadgeCopyWith<Badge> get copyWith =>
      _$BadgeCopyWithImpl<Badge>(this as Badge, _$identity);

  /// Serializes this Badge to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is Badge &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.earnedAt, earnedAt) ||
                other.earnedAt == earnedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, description, earnedAt);

  @override
  String toString() {
    return 'Badge(name: $name, description: $description, earnedAt: $earnedAt)';
  }
}

/// @nodoc
abstract mixin class $BadgeCopyWith<$Res> {
  factory $BadgeCopyWith(Badge value, $Res Function(Badge) _then) =
      _$BadgeCopyWithImpl;
  @useResult
  $Res call({String name, String description, String? earnedAt});
}

/// @nodoc
class _$BadgeCopyWithImpl<$Res> implements $BadgeCopyWith<$Res> {
  _$BadgeCopyWithImpl(this._self, this._then);

  final Badge _self;
  final $Res Function(Badge) _then;

  /// Create a copy of Badge
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? description = null,
    Object? earnedAt = freezed,
  }) {
    return _then(_self.copyWith(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      earnedAt: freezed == earnedAt
          ? _self.earnedAt
          : earnedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _Badge implements Badge {
  const _Badge({required this.name, this.description = '', this.earnedAt});
  factory _Badge.fromJson(Map<String, dynamic> json) => _$BadgeFromJson(json);

  @override
  final String name;
  @override
  @JsonKey()
  final String description;
  @override
  final String? earnedAt;

  /// Create a copy of Badge
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$BadgeCopyWith<_Badge> get copyWith =>
      __$BadgeCopyWithImpl<_Badge>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BadgeToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _Badge &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.earnedAt, earnedAt) ||
                other.earnedAt == earnedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, description, earnedAt);

  @override
  String toString() {
    return 'Badge(name: $name, description: $description, earnedAt: $earnedAt)';
  }
}

/// @nodoc
abstract mixin class _$BadgeCopyWith<$Res> implements $BadgeCopyWith<$Res> {
  factory _$BadgeCopyWith(_Badge value, $Res Function(_Badge) _then) =
      __$BadgeCopyWithImpl;
  @override
  @useResult
  $Res call({String name, String description, String? earnedAt});
}

/// @nodoc
class __$BadgeCopyWithImpl<$Res> implements _$BadgeCopyWith<$Res> {
  __$BadgeCopyWithImpl(this._self, this._then);

  final _Badge _self;
  final $Res Function(_Badge) _then;

  /// Create a copy of Badge
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? name = null,
    Object? description = null,
    Object? earnedAt = freezed,
  }) {
    return _then(_Badge(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      earnedAt: freezed == earnedAt
          ? _self.earnedAt
          : earnedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$AuthResponse {
  bool get success;
  String? get message;
  bool get requiresVerification;
  AuthData? get data;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $AuthResponseCopyWith<AuthResponse> get copyWith =>
      _$AuthResponseCopyWithImpl<AuthResponse>(
          this as AuthResponse, _$identity);

  /// Serializes this AuthResponse to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is AuthResponse &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.requiresVerification, requiresVerification) ||
                other.requiresVerification == requiresVerification) &&
            (identical(other.data, data) || other.data == data));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, success, message, requiresVerification, data);

  @override
  String toString() {
    return 'AuthResponse(success: $success, message: $message, requiresVerification: $requiresVerification, data: $data)';
  }
}

/// @nodoc
abstract mixin class $AuthResponseCopyWith<$Res> {
  factory $AuthResponseCopyWith(
          AuthResponse value, $Res Function(AuthResponse) _then) =
      _$AuthResponseCopyWithImpl;
  @useResult
  $Res call(
      {bool success,
      String? message,
      bool requiresVerification,
      AuthData? data});

  $AuthDataCopyWith<$Res>? get data;
}

/// @nodoc
class _$AuthResponseCopyWithImpl<$Res> implements $AuthResponseCopyWith<$Res> {
  _$AuthResponseCopyWithImpl(this._self, this._then);

  final AuthResponse _self;
  final $Res Function(AuthResponse) _then;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = freezed,
    Object? requiresVerification = null,
    Object? data = freezed,
  }) {
    return _then(_self.copyWith(
      success: null == success
          ? _self.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: freezed == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String?,
      requiresVerification: null == requiresVerification
          ? _self.requiresVerification
          : requiresVerification // ignore: cast_nullable_to_non_nullable
              as bool,
      data: freezed == data
          ? _self.data
          : data // ignore: cast_nullable_to_non_nullable
              as AuthData?,
    ));
  }

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $AuthDataCopyWith<$Res>? get data {
    if (_self.data == null) {
      return null;
    }

    return $AuthDataCopyWith<$Res>(_self.data!, (value) {
      return _then(_self.copyWith(data: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _AuthResponse implements AuthResponse {
  const _AuthResponse(
      {required this.success,
      this.message,
      this.requiresVerification = false,
      this.data});
  factory _AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);

  @override
  final bool success;
  @override
  final String? message;
  @override
  @JsonKey()
  final bool requiresVerification;
  @override
  final AuthData? data;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$AuthResponseCopyWith<_AuthResponse> get copyWith =>
      __$AuthResponseCopyWithImpl<_AuthResponse>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$AuthResponseToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _AuthResponse &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.requiresVerification, requiresVerification) ||
                other.requiresVerification == requiresVerification) &&
            (identical(other.data, data) || other.data == data));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, success, message, requiresVerification, data);

  @override
  String toString() {
    return 'AuthResponse(success: $success, message: $message, requiresVerification: $requiresVerification, data: $data)';
  }
}

/// @nodoc
abstract mixin class _$AuthResponseCopyWith<$Res>
    implements $AuthResponseCopyWith<$Res> {
  factory _$AuthResponseCopyWith(
          _AuthResponse value, $Res Function(_AuthResponse) _then) =
      __$AuthResponseCopyWithImpl;
  @override
  @useResult
  $Res call(
      {bool success,
      String? message,
      bool requiresVerification,
      AuthData? data});

  @override
  $AuthDataCopyWith<$Res>? get data;
}

/// @nodoc
class __$AuthResponseCopyWithImpl<$Res>
    implements _$AuthResponseCopyWith<$Res> {
  __$AuthResponseCopyWithImpl(this._self, this._then);

  final _AuthResponse _self;
  final $Res Function(_AuthResponse) _then;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? success = null,
    Object? message = freezed,
    Object? requiresVerification = null,
    Object? data = freezed,
  }) {
    return _then(_AuthResponse(
      success: null == success
          ? _self.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: freezed == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String?,
      requiresVerification: null == requiresVerification
          ? _self.requiresVerification
          : requiresVerification // ignore: cast_nullable_to_non_nullable
              as bool,
      data: freezed == data
          ? _self.data
          : data // ignore: cast_nullable_to_non_nullable
              as AuthData?,
    ));
  }

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $AuthDataCopyWith<$Res>? get data {
    if (_self.data == null) {
      return null;
    }

    return $AuthDataCopyWith<$Res>(_self.data!, (value) {
      return _then(_self.copyWith(data: value));
    });
  }
}

/// @nodoc
mixin _$AuthData {
  UserModel? get user;
  String? get token;
  String? get email;

  /// Create a copy of AuthData
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $AuthDataCopyWith<AuthData> get copyWith =>
      _$AuthDataCopyWithImpl<AuthData>(this as AuthData, _$identity);

  /// Serializes this AuthData to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is AuthData &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.token, token) || other.token == token) &&
            (identical(other.email, email) || other.email == email));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, user, token, email);

  @override
  String toString() {
    return 'AuthData(user: $user, token: $token, email: $email)';
  }
}

/// @nodoc
abstract mixin class $AuthDataCopyWith<$Res> {
  factory $AuthDataCopyWith(AuthData value, $Res Function(AuthData) _then) =
      _$AuthDataCopyWithImpl;
  @useResult
  $Res call({UserModel? user, String? token, String? email});

  $UserModelCopyWith<$Res>? get user;
}

/// @nodoc
class _$AuthDataCopyWithImpl<$Res> implements $AuthDataCopyWith<$Res> {
  _$AuthDataCopyWithImpl(this._self, this._then);

  final AuthData _self;
  final $Res Function(AuthData) _then;

  /// Create a copy of AuthData
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user = freezed,
    Object? token = freezed,
    Object? email = freezed,
  }) {
    return _then(_self.copyWith(
      user: freezed == user
          ? _self.user
          : user // ignore: cast_nullable_to_non_nullable
              as UserModel?,
      token: freezed == token
          ? _self.token
          : token // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of AuthData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserModelCopyWith<$Res>? get user {
    if (_self.user == null) {
      return null;
    }

    return $UserModelCopyWith<$Res>(_self.user!, (value) {
      return _then(_self.copyWith(user: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _AuthData implements AuthData {
  const _AuthData({this.user, this.token, this.email});
  factory _AuthData.fromJson(Map<String, dynamic> json) =>
      _$AuthDataFromJson(json);

  @override
  final UserModel? user;
  @override
  final String? token;
  @override
  final String? email;

  /// Create a copy of AuthData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$AuthDataCopyWith<_AuthData> get copyWith =>
      __$AuthDataCopyWithImpl<_AuthData>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$AuthDataToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _AuthData &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.token, token) || other.token == token) &&
            (identical(other.email, email) || other.email == email));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, user, token, email);

  @override
  String toString() {
    return 'AuthData(user: $user, token: $token, email: $email)';
  }
}

/// @nodoc
abstract mixin class _$AuthDataCopyWith<$Res>
    implements $AuthDataCopyWith<$Res> {
  factory _$AuthDataCopyWith(_AuthData value, $Res Function(_AuthData) _then) =
      __$AuthDataCopyWithImpl;
  @override
  @useResult
  $Res call({UserModel? user, String? token, String? email});

  @override
  $UserModelCopyWith<$Res>? get user;
}

/// @nodoc
class __$AuthDataCopyWithImpl<$Res> implements _$AuthDataCopyWith<$Res> {
  __$AuthDataCopyWithImpl(this._self, this._then);

  final _AuthData _self;
  final $Res Function(_AuthData) _then;

  /// Create a copy of AuthData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? user = freezed,
    Object? token = freezed,
    Object? email = freezed,
  }) {
    return _then(_AuthData(
      user: freezed == user
          ? _self.user
          : user // ignore: cast_nullable_to_non_nullable
              as UserModel?,
      token: freezed == token
          ? _self.token
          : token // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of AuthData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UserModelCopyWith<$Res>? get user {
    if (_self.user == null) {
      return null;
    }

    return $UserModelCopyWith<$Res>(_self.user!, (value) {
      return _then(_self.copyWith(user: value));
    });
  }
}

/// @nodoc
mixin _$FriendRequest {
  String get id;
  FriendRequestUser get from;
  String get status;
  String? get createdAt;

  /// Create a copy of FriendRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $FriendRequestCopyWith<FriendRequest> get copyWith =>
      _$FriendRequestCopyWithImpl<FriendRequest>(
          this as FriendRequest, _$identity);

  /// Serializes this FriendRequest to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is FriendRequest &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.from, from) || other.from == from) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, from, status, createdAt);

  @override
  String toString() {
    return 'FriendRequest(id: $id, from: $from, status: $status, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $FriendRequestCopyWith<$Res> {
  factory $FriendRequestCopyWith(
          FriendRequest value, $Res Function(FriendRequest) _then) =
      _$FriendRequestCopyWithImpl;
  @useResult
  $Res call(
      {String id, FriendRequestUser from, String status, String? createdAt});

  $FriendRequestUserCopyWith<$Res> get from;
}

/// @nodoc
class _$FriendRequestCopyWithImpl<$Res>
    implements $FriendRequestCopyWith<$Res> {
  _$FriendRequestCopyWithImpl(this._self, this._then);

  final FriendRequest _self;
  final $Res Function(FriendRequest) _then;

  /// Create a copy of FriendRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? from = null,
    Object? status = null,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      from: null == from
          ? _self.from
          : from // ignore: cast_nullable_to_non_nullable
              as FriendRequestUser,
      status: null == status
          ? _self.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of FriendRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $FriendRequestUserCopyWith<$Res> get from {
    return $FriendRequestUserCopyWith<$Res>(_self.from, (value) {
      return _then(_self.copyWith(from: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _FriendRequest implements FriendRequest {
  const _FriendRequest(
      {required this.id,
      required this.from,
      this.status = 'pending',
      this.createdAt});
  factory _FriendRequest.fromJson(Map<String, dynamic> json) =>
      _$FriendRequestFromJson(json);

  @override
  final String id;
  @override
  final FriendRequestUser from;
  @override
  @JsonKey()
  final String status;
  @override
  final String? createdAt;

  /// Create a copy of FriendRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$FriendRequestCopyWith<_FriendRequest> get copyWith =>
      __$FriendRequestCopyWithImpl<_FriendRequest>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$FriendRequestToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _FriendRequest &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.from, from) || other.from == from) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, from, status, createdAt);

  @override
  String toString() {
    return 'FriendRequest(id: $id, from: $from, status: $status, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$FriendRequestCopyWith<$Res>
    implements $FriendRequestCopyWith<$Res> {
  factory _$FriendRequestCopyWith(
          _FriendRequest value, $Res Function(_FriendRequest) _then) =
      __$FriendRequestCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id, FriendRequestUser from, String status, String? createdAt});

  @override
  $FriendRequestUserCopyWith<$Res> get from;
}

/// @nodoc
class __$FriendRequestCopyWithImpl<$Res>
    implements _$FriendRequestCopyWith<$Res> {
  __$FriendRequestCopyWithImpl(this._self, this._then);

  final _FriendRequest _self;
  final $Res Function(_FriendRequest) _then;

  /// Create a copy of FriendRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? from = null,
    Object? status = null,
    Object? createdAt = freezed,
  }) {
    return _then(_FriendRequest(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      from: null == from
          ? _self.from
          : from // ignore: cast_nullable_to_non_nullable
              as FriendRequestUser,
      status: null == status
          ? _self.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of FriendRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $FriendRequestUserCopyWith<$Res> get from {
    return $FriendRequestUserCopyWith<$Res>(_self.from, (value) {
      return _then(_self.copyWith(from: value));
    });
  }
}

/// @nodoc
mixin _$FriendRequestUser {
  String get id;
  String get name;
  String? get email;
  String? get avatar;
  String? get bio;

  /// Create a copy of FriendRequestUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $FriendRequestUserCopyWith<FriendRequestUser> get copyWith =>
      _$FriendRequestUserCopyWithImpl<FriendRequestUser>(
          this as FriendRequestUser, _$identity);

  /// Serializes this FriendRequestUser to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is FriendRequestUser &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, email, avatar, bio);

  @override
  String toString() {
    return 'FriendRequestUser(id: $id, name: $name, email: $email, avatar: $avatar, bio: $bio)';
  }
}

/// @nodoc
abstract mixin class $FriendRequestUserCopyWith<$Res> {
  factory $FriendRequestUserCopyWith(
          FriendRequestUser value, $Res Function(FriendRequestUser) _then) =
      _$FriendRequestUserCopyWithImpl;
  @useResult
  $Res call(
      {String id, String name, String? email, String? avatar, String? bio});
}

/// @nodoc
class _$FriendRequestUserCopyWithImpl<$Res>
    implements $FriendRequestUserCopyWith<$Res> {
  _$FriendRequestUserCopyWithImpl(this._self, this._then);

  final FriendRequestUser _self;
  final $Res Function(FriendRequestUser) _then;

  /// Create a copy of FriendRequestUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = freezed,
    Object? avatar = freezed,
    Object? bio = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: freezed == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      bio: freezed == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _FriendRequestUser implements FriendRequestUser {
  const _FriendRequestUser(
      {required this.id,
      required this.name,
      this.email,
      this.avatar,
      this.bio});
  factory _FriendRequestUser.fromJson(Map<String, dynamic> json) =>
      _$FriendRequestUserFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? email;
  @override
  final String? avatar;
  @override
  final String? bio;

  /// Create a copy of FriendRequestUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$FriendRequestUserCopyWith<_FriendRequestUser> get copyWith =>
      __$FriendRequestUserCopyWithImpl<_FriendRequestUser>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$FriendRequestUserToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _FriendRequestUser &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, email, avatar, bio);

  @override
  String toString() {
    return 'FriendRequestUser(id: $id, name: $name, email: $email, avatar: $avatar, bio: $bio)';
  }
}

/// @nodoc
abstract mixin class _$FriendRequestUserCopyWith<$Res>
    implements $FriendRequestUserCopyWith<$Res> {
  factory _$FriendRequestUserCopyWith(
          _FriendRequestUser value, $Res Function(_FriendRequestUser) _then) =
      __$FriendRequestUserCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id, String name, String? email, String? avatar, String? bio});
}

/// @nodoc
class __$FriendRequestUserCopyWithImpl<$Res>
    implements _$FriendRequestUserCopyWith<$Res> {
  __$FriendRequestUserCopyWithImpl(this._self, this._then);

  final _FriendRequestUser _self;
  final $Res Function(_FriendRequestUser) _then;

  /// Create a copy of FriendRequestUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = freezed,
    Object? avatar = freezed,
    Object? bio = freezed,
  }) {
    return _then(_FriendRequestUser(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: freezed == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      bio: freezed == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$SearchedUser {
  String get id;
  String get name;
  String? get email;
  String? get avatar;
  String? get bio;
  String get friendStatus;

  /// Create a copy of SearchedUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $SearchedUserCopyWith<SearchedUser> get copyWith =>
      _$SearchedUserCopyWithImpl<SearchedUser>(
          this as SearchedUser, _$identity);

  /// Serializes this SearchedUser to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is SearchedUser &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            (identical(other.friendStatus, friendStatus) ||
                other.friendStatus == friendStatus));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, name, email, avatar, bio, friendStatus);

  @override
  String toString() {
    return 'SearchedUser(id: $id, name: $name, email: $email, avatar: $avatar, bio: $bio, friendStatus: $friendStatus)';
  }
}

/// @nodoc
abstract mixin class $SearchedUserCopyWith<$Res> {
  factory $SearchedUserCopyWith(
          SearchedUser value, $Res Function(SearchedUser) _then) =
      _$SearchedUserCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String? email,
      String? avatar,
      String? bio,
      String friendStatus});
}

/// @nodoc
class _$SearchedUserCopyWithImpl<$Res> implements $SearchedUserCopyWith<$Res> {
  _$SearchedUserCopyWithImpl(this._self, this._then);

  final SearchedUser _self;
  final $Res Function(SearchedUser) _then;

  /// Create a copy of SearchedUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = freezed,
    Object? avatar = freezed,
    Object? bio = freezed,
    Object? friendStatus = null,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: freezed == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      bio: freezed == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String?,
      friendStatus: null == friendStatus
          ? _self.friendStatus
          : friendStatus // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _SearchedUser implements SearchedUser {
  const _SearchedUser(
      {required this.id,
      required this.name,
      this.email,
      this.avatar,
      this.bio,
      this.friendStatus = 'none'});
  factory _SearchedUser.fromJson(Map<String, dynamic> json) =>
      _$SearchedUserFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? email;
  @override
  final String? avatar;
  @override
  final String? bio;
  @override
  @JsonKey()
  final String friendStatus;

  /// Create a copy of SearchedUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$SearchedUserCopyWith<_SearchedUser> get copyWith =>
      __$SearchedUserCopyWithImpl<_SearchedUser>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$SearchedUserToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _SearchedUser &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            (identical(other.friendStatus, friendStatus) ||
                other.friendStatus == friendStatus));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, name, email, avatar, bio, friendStatus);

  @override
  String toString() {
    return 'SearchedUser(id: $id, name: $name, email: $email, avatar: $avatar, bio: $bio, friendStatus: $friendStatus)';
  }
}

/// @nodoc
abstract mixin class _$SearchedUserCopyWith<$Res>
    implements $SearchedUserCopyWith<$Res> {
  factory _$SearchedUserCopyWith(
          _SearchedUser value, $Res Function(_SearchedUser) _then) =
      __$SearchedUserCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String? email,
      String? avatar,
      String? bio,
      String friendStatus});
}

/// @nodoc
class __$SearchedUserCopyWithImpl<$Res>
    implements _$SearchedUserCopyWith<$Res> {
  __$SearchedUserCopyWithImpl(this._self, this._then);

  final _SearchedUser _self;
  final $Res Function(_SearchedUser) _then;

  /// Create a copy of SearchedUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = freezed,
    Object? avatar = freezed,
    Object? bio = freezed,
    Object? friendStatus = null,
  }) {
    return _then(_SearchedUser(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: freezed == email
          ? _self.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      bio: freezed == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String?,
      friendStatus: null == friendStatus
          ? _self.friendStatus
          : friendStatus // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
mixin _$NotificationModel {
  String get id;
  String get type;
  String get message;
  bool get read;
  NotificationSender? get sender;
  String? get createdAt;

  /// Create a copy of NotificationModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $NotificationModelCopyWith<NotificationModel> get copyWith =>
      _$NotificationModelCopyWithImpl<NotificationModel>(
          this as NotificationModel, _$identity);

  /// Serializes this NotificationModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is NotificationModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.read, read) || other.read == read) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, message, read, sender, createdAt);

  @override
  String toString() {
    return 'NotificationModel(id: $id, type: $type, message: $message, read: $read, sender: $sender, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $NotificationModelCopyWith<$Res> {
  factory $NotificationModelCopyWith(
          NotificationModel value, $Res Function(NotificationModel) _then) =
      _$NotificationModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String type,
      String message,
      bool read,
      NotificationSender? sender,
      String? createdAt});

  $NotificationSenderCopyWith<$Res>? get sender;
}

/// @nodoc
class _$NotificationModelCopyWithImpl<$Res>
    implements $NotificationModelCopyWith<$Res> {
  _$NotificationModelCopyWithImpl(this._self, this._then);

  final NotificationModel _self;
  final $Res Function(NotificationModel) _then;

  /// Create a copy of NotificationModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? message = null,
    Object? read = null,
    Object? sender = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      read: null == read
          ? _self.read
          : read // ignore: cast_nullable_to_non_nullable
              as bool,
      sender: freezed == sender
          ? _self.sender
          : sender // ignore: cast_nullable_to_non_nullable
              as NotificationSender?,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of NotificationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $NotificationSenderCopyWith<$Res>? get sender {
    if (_self.sender == null) {
      return null;
    }

    return $NotificationSenderCopyWith<$Res>(_self.sender!, (value) {
      return _then(_self.copyWith(sender: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _NotificationModel implements NotificationModel {
  const _NotificationModel(
      {required this.id,
      required this.type,
      this.message = '',
      this.read = false,
      this.sender,
      this.createdAt});
  factory _NotificationModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationModelFromJson(json);

  @override
  final String id;
  @override
  final String type;
  @override
  @JsonKey()
  final String message;
  @override
  @JsonKey()
  final bool read;
  @override
  final NotificationSender? sender;
  @override
  final String? createdAt;

  /// Create a copy of NotificationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$NotificationModelCopyWith<_NotificationModel> get copyWith =>
      __$NotificationModelCopyWithImpl<_NotificationModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$NotificationModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _NotificationModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.read, read) || other.read == read) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, type, message, read, sender, createdAt);

  @override
  String toString() {
    return 'NotificationModel(id: $id, type: $type, message: $message, read: $read, sender: $sender, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$NotificationModelCopyWith<$Res>
    implements $NotificationModelCopyWith<$Res> {
  factory _$NotificationModelCopyWith(
          _NotificationModel value, $Res Function(_NotificationModel) _then) =
      __$NotificationModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String type,
      String message,
      bool read,
      NotificationSender? sender,
      String? createdAt});

  @override
  $NotificationSenderCopyWith<$Res>? get sender;
}

/// @nodoc
class __$NotificationModelCopyWithImpl<$Res>
    implements _$NotificationModelCopyWith<$Res> {
  __$NotificationModelCopyWithImpl(this._self, this._then);

  final _NotificationModel _self;
  final $Res Function(_NotificationModel) _then;

  /// Create a copy of NotificationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? message = null,
    Object? read = null,
    Object? sender = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_NotificationModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      read: null == read
          ? _self.read
          : read // ignore: cast_nullable_to_non_nullable
              as bool,
      sender: freezed == sender
          ? _self.sender
          : sender // ignore: cast_nullable_to_non_nullable
              as NotificationSender?,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of NotificationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $NotificationSenderCopyWith<$Res>? get sender {
    if (_self.sender == null) {
      return null;
    }

    return $NotificationSenderCopyWith<$Res>(_self.sender!, (value) {
      return _then(_self.copyWith(sender: value));
    });
  }
}

/// @nodoc
mixin _$NotificationSender {
  String get name;
  String? get avatar;

  /// Create a copy of NotificationSender
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $NotificationSenderCopyWith<NotificationSender> get copyWith =>
      _$NotificationSenderCopyWithImpl<NotificationSender>(
          this as NotificationSender, _$identity);

  /// Serializes this NotificationSender to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is NotificationSender &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, avatar);

  @override
  String toString() {
    return 'NotificationSender(name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class $NotificationSenderCopyWith<$Res> {
  factory $NotificationSenderCopyWith(
          NotificationSender value, $Res Function(NotificationSender) _then) =
      _$NotificationSenderCopyWithImpl;
  @useResult
  $Res call({String name, String? avatar});
}

/// @nodoc
class _$NotificationSenderCopyWithImpl<$Res>
    implements $NotificationSenderCopyWith<$Res> {
  _$NotificationSenderCopyWithImpl(this._self, this._then);

  final NotificationSender _self;
  final $Res Function(NotificationSender) _then;

  /// Create a copy of NotificationSender
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? avatar = freezed,
  }) {
    return _then(_self.copyWith(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _NotificationSender implements NotificationSender {
  const _NotificationSender({required this.name, this.avatar});
  factory _NotificationSender.fromJson(Map<String, dynamic> json) =>
      _$NotificationSenderFromJson(json);

  @override
  final String name;
  @override
  final String? avatar;

  /// Create a copy of NotificationSender
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$NotificationSenderCopyWith<_NotificationSender> get copyWith =>
      __$NotificationSenderCopyWithImpl<_NotificationSender>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$NotificationSenderToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _NotificationSender &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, avatar);

  @override
  String toString() {
    return 'NotificationSender(name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class _$NotificationSenderCopyWith<$Res>
    implements $NotificationSenderCopyWith<$Res> {
  factory _$NotificationSenderCopyWith(
          _NotificationSender value, $Res Function(_NotificationSender) _then) =
      __$NotificationSenderCopyWithImpl;
  @override
  @useResult
  $Res call({String name, String? avatar});
}

/// @nodoc
class __$NotificationSenderCopyWithImpl<$Res>
    implements _$NotificationSenderCopyWith<$Res> {
  __$NotificationSenderCopyWithImpl(this._self, this._then);

  final _NotificationSender _self;
  final $Res Function(_NotificationSender) _then;

  /// Create a copy of NotificationSender
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? name = null,
    Object? avatar = freezed,
  }) {
    return _then(_NotificationSender(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

// dart format on
