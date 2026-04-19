// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chat_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ConversationModel {
  String get id;
  List<ConversationParticipant> get participants;
  bool get isGroup;
  String? get name;
  String? get avatar;
  LastMessage? get lastMessage;
  int get messageCount;
  String? get inviteCode;
  String? get createdBy;
  String? get updatedAt;

  /// Create a copy of ConversationModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ConversationModelCopyWith<ConversationModel> get copyWith =>
      _$ConversationModelCopyWithImpl<ConversationModel>(
          this as ConversationModel, _$identity);

  /// Serializes this ConversationModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ConversationModel &&
            (identical(other.id, id) || other.id == id) &&
            const DeepCollectionEquality()
                .equals(other.participants, participants) &&
            (identical(other.isGroup, isGroup) || other.isGroup == isGroup) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.lastMessage, lastMessage) ||
                other.lastMessage == lastMessage) &&
            (identical(other.messageCount, messageCount) ||
                other.messageCount == messageCount) &&
            (identical(other.inviteCode, inviteCode) ||
                other.inviteCode == inviteCode) &&
            (identical(other.createdBy, createdBy) ||
                other.createdBy == createdBy) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      const DeepCollectionEquality().hash(participants),
      isGroup,
      name,
      avatar,
      lastMessage,
      messageCount,
      inviteCode,
      createdBy,
      updatedAt);

  @override
  String toString() {
    return 'ConversationModel(id: $id, participants: $participants, isGroup: $isGroup, name: $name, avatar: $avatar, lastMessage: $lastMessage, messageCount: $messageCount, inviteCode: $inviteCode, createdBy: $createdBy, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class $ConversationModelCopyWith<$Res> {
  factory $ConversationModelCopyWith(
          ConversationModel value, $Res Function(ConversationModel) _then) =
      _$ConversationModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      List<ConversationParticipant> participants,
      bool isGroup,
      String? name,
      String? avatar,
      LastMessage? lastMessage,
      int messageCount,
      String? inviteCode,
      String? createdBy,
      String? updatedAt});

  $LastMessageCopyWith<$Res>? get lastMessage;
}

/// @nodoc
class _$ConversationModelCopyWithImpl<$Res>
    implements $ConversationModelCopyWith<$Res> {
  _$ConversationModelCopyWithImpl(this._self, this._then);

  final ConversationModel _self;
  final $Res Function(ConversationModel) _then;

  /// Create a copy of ConversationModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? participants = null,
    Object? isGroup = null,
    Object? name = freezed,
    Object? avatar = freezed,
    Object? lastMessage = freezed,
    Object? messageCount = null,
    Object? inviteCode = freezed,
    Object? createdBy = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      participants: null == participants
          ? _self.participants
          : participants // ignore: cast_nullable_to_non_nullable
              as List<ConversationParticipant>,
      isGroup: null == isGroup
          ? _self.isGroup
          : isGroup // ignore: cast_nullable_to_non_nullable
              as bool,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessage: freezed == lastMessage
          ? _self.lastMessage
          : lastMessage // ignore: cast_nullable_to_non_nullable
              as LastMessage?,
      messageCount: null == messageCount
          ? _self.messageCount
          : messageCount // ignore: cast_nullable_to_non_nullable
              as int,
      inviteCode: freezed == inviteCode
          ? _self.inviteCode
          : inviteCode // ignore: cast_nullable_to_non_nullable
              as String?,
      createdBy: freezed == createdBy
          ? _self.createdBy
          : createdBy // ignore: cast_nullable_to_non_nullable
              as String?,
      updatedAt: freezed == updatedAt
          ? _self.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of ConversationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LastMessageCopyWith<$Res>? get lastMessage {
    if (_self.lastMessage == null) {
      return null;
    }

    return $LastMessageCopyWith<$Res>(_self.lastMessage!, (value) {
      return _then(_self.copyWith(lastMessage: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _ConversationModel implements ConversationModel {
  const _ConversationModel(
      {required this.id,
      final List<ConversationParticipant> participants = const [],
      this.isGroup = false,
      this.name,
      this.avatar,
      this.lastMessage,
      this.messageCount = 0,
      this.inviteCode,
      this.createdBy,
      this.updatedAt})
      : _participants = participants;
  factory _ConversationModel.fromJson(Map<String, dynamic> json) =>
      _$ConversationModelFromJson(json);

  @override
  final String id;
  final List<ConversationParticipant> _participants;
  @override
  @JsonKey()
  List<ConversationParticipant> get participants {
    if (_participants is EqualUnmodifiableListView) return _participants;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_participants);
  }

  @override
  @JsonKey()
  final bool isGroup;
  @override
  final String? name;
  @override
  final String? avatar;
  @override
  final LastMessage? lastMessage;
  @override
  @JsonKey()
  final int messageCount;
  @override
  final String? inviteCode;
  @override
  final String? createdBy;
  @override
  final String? updatedAt;

  /// Create a copy of ConversationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$ConversationModelCopyWith<_ConversationModel> get copyWith =>
      __$ConversationModelCopyWithImpl<_ConversationModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ConversationModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _ConversationModel &&
            (identical(other.id, id) || other.id == id) &&
            const DeepCollectionEquality()
                .equals(other._participants, _participants) &&
            (identical(other.isGroup, isGroup) || other.isGroup == isGroup) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.lastMessage, lastMessage) ||
                other.lastMessage == lastMessage) &&
            (identical(other.messageCount, messageCount) ||
                other.messageCount == messageCount) &&
            (identical(other.inviteCode, inviteCode) ||
                other.inviteCode == inviteCode) &&
            (identical(other.createdBy, createdBy) ||
                other.createdBy == createdBy) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      const DeepCollectionEquality().hash(_participants),
      isGroup,
      name,
      avatar,
      lastMessage,
      messageCount,
      inviteCode,
      createdBy,
      updatedAt);

  @override
  String toString() {
    return 'ConversationModel(id: $id, participants: $participants, isGroup: $isGroup, name: $name, avatar: $avatar, lastMessage: $lastMessage, messageCount: $messageCount, inviteCode: $inviteCode, createdBy: $createdBy, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class _$ConversationModelCopyWith<$Res>
    implements $ConversationModelCopyWith<$Res> {
  factory _$ConversationModelCopyWith(
          _ConversationModel value, $Res Function(_ConversationModel) _then) =
      __$ConversationModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      List<ConversationParticipant> participants,
      bool isGroup,
      String? name,
      String? avatar,
      LastMessage? lastMessage,
      int messageCount,
      String? inviteCode,
      String? createdBy,
      String? updatedAt});

  @override
  $LastMessageCopyWith<$Res>? get lastMessage;
}

/// @nodoc
class __$ConversationModelCopyWithImpl<$Res>
    implements _$ConversationModelCopyWith<$Res> {
  __$ConversationModelCopyWithImpl(this._self, this._then);

  final _ConversationModel _self;
  final $Res Function(_ConversationModel) _then;

  /// Create a copy of ConversationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? participants = null,
    Object? isGroup = null,
    Object? name = freezed,
    Object? avatar = freezed,
    Object? lastMessage = freezed,
    Object? messageCount = null,
    Object? inviteCode = freezed,
    Object? createdBy = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_ConversationModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      participants: null == participants
          ? _self._participants
          : participants // ignore: cast_nullable_to_non_nullable
              as List<ConversationParticipant>,
      isGroup: null == isGroup
          ? _self.isGroup
          : isGroup // ignore: cast_nullable_to_non_nullable
              as bool,
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessage: freezed == lastMessage
          ? _self.lastMessage
          : lastMessage // ignore: cast_nullable_to_non_nullable
              as LastMessage?,
      messageCount: null == messageCount
          ? _self.messageCount
          : messageCount // ignore: cast_nullable_to_non_nullable
              as int,
      inviteCode: freezed == inviteCode
          ? _self.inviteCode
          : inviteCode // ignore: cast_nullable_to_non_nullable
              as String?,
      createdBy: freezed == createdBy
          ? _self.createdBy
          : createdBy // ignore: cast_nullable_to_non_nullable
              as String?,
      updatedAt: freezed == updatedAt
          ? _self.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of ConversationModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $LastMessageCopyWith<$Res>? get lastMessage {
    if (_self.lastMessage == null) {
      return null;
    }

    return $LastMessageCopyWith<$Res>(_self.lastMessage!, (value) {
      return _then(_self.copyWith(lastMessage: value));
    });
  }
}

/// @nodoc
mixin _$ConversationParticipant {
  ParticipantUser get user;
  String get role;
  String? get joinedAt;
  String? get lastReadAt;

  /// Create a copy of ConversationParticipant
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ConversationParticipantCopyWith<ConversationParticipant> get copyWith =>
      _$ConversationParticipantCopyWithImpl<ConversationParticipant>(
          this as ConversationParticipant, _$identity);

  /// Serializes this ConversationParticipant to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ConversationParticipant &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.joinedAt, joinedAt) ||
                other.joinedAt == joinedAt) &&
            (identical(other.lastReadAt, lastReadAt) ||
                other.lastReadAt == lastReadAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, user, role, joinedAt, lastReadAt);

  @override
  String toString() {
    return 'ConversationParticipant(user: $user, role: $role, joinedAt: $joinedAt, lastReadAt: $lastReadAt)';
  }
}

/// @nodoc
abstract mixin class $ConversationParticipantCopyWith<$Res> {
  factory $ConversationParticipantCopyWith(ConversationParticipant value,
          $Res Function(ConversationParticipant) _then) =
      _$ConversationParticipantCopyWithImpl;
  @useResult
  $Res call(
      {ParticipantUser user,
      String role,
      String? joinedAt,
      String? lastReadAt});

  $ParticipantUserCopyWith<$Res> get user;
}

/// @nodoc
class _$ConversationParticipantCopyWithImpl<$Res>
    implements $ConversationParticipantCopyWith<$Res> {
  _$ConversationParticipantCopyWithImpl(this._self, this._then);

  final ConversationParticipant _self;
  final $Res Function(ConversationParticipant) _then;

  /// Create a copy of ConversationParticipant
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user = null,
    Object? role = null,
    Object? joinedAt = freezed,
    Object? lastReadAt = freezed,
  }) {
    return _then(_self.copyWith(
      user: null == user
          ? _self.user
          : user // ignore: cast_nullable_to_non_nullable
              as ParticipantUser,
      role: null == role
          ? _self.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      joinedAt: freezed == joinedAt
          ? _self.joinedAt
          : joinedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastReadAt: freezed == lastReadAt
          ? _self.lastReadAt
          : lastReadAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of ConversationParticipant
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ParticipantUserCopyWith<$Res> get user {
    return $ParticipantUserCopyWith<$Res>(_self.user, (value) {
      return _then(_self.copyWith(user: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _ConversationParticipant implements ConversationParticipant {
  const _ConversationParticipant(
      {required this.user,
      this.role = 'member',
      this.joinedAt,
      this.lastReadAt});
  factory _ConversationParticipant.fromJson(Map<String, dynamic> json) =>
      _$ConversationParticipantFromJson(json);

  @override
  final ParticipantUser user;
  @override
  @JsonKey()
  final String role;
  @override
  final String? joinedAt;
  @override
  final String? lastReadAt;

  /// Create a copy of ConversationParticipant
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$ConversationParticipantCopyWith<_ConversationParticipant> get copyWith =>
      __$ConversationParticipantCopyWithImpl<_ConversationParticipant>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ConversationParticipantToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _ConversationParticipant &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.joinedAt, joinedAt) ||
                other.joinedAt == joinedAt) &&
            (identical(other.lastReadAt, lastReadAt) ||
                other.lastReadAt == lastReadAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, user, role, joinedAt, lastReadAt);

  @override
  String toString() {
    return 'ConversationParticipant(user: $user, role: $role, joinedAt: $joinedAt, lastReadAt: $lastReadAt)';
  }
}

/// @nodoc
abstract mixin class _$ConversationParticipantCopyWith<$Res>
    implements $ConversationParticipantCopyWith<$Res> {
  factory _$ConversationParticipantCopyWith(_ConversationParticipant value,
          $Res Function(_ConversationParticipant) _then) =
      __$ConversationParticipantCopyWithImpl;
  @override
  @useResult
  $Res call(
      {ParticipantUser user,
      String role,
      String? joinedAt,
      String? lastReadAt});

  @override
  $ParticipantUserCopyWith<$Res> get user;
}

/// @nodoc
class __$ConversationParticipantCopyWithImpl<$Res>
    implements _$ConversationParticipantCopyWith<$Res> {
  __$ConversationParticipantCopyWithImpl(this._self, this._then);

  final _ConversationParticipant _self;
  final $Res Function(_ConversationParticipant) _then;

  /// Create a copy of ConversationParticipant
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? user = null,
    Object? role = null,
    Object? joinedAt = freezed,
    Object? lastReadAt = freezed,
  }) {
    return _then(_ConversationParticipant(
      user: null == user
          ? _self.user
          : user // ignore: cast_nullable_to_non_nullable
              as ParticipantUser,
      role: null == role
          ? _self.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      joinedAt: freezed == joinedAt
          ? _self.joinedAt
          : joinedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastReadAt: freezed == lastReadAt
          ? _self.lastReadAt
          : lastReadAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of ConversationParticipant
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ParticipantUserCopyWith<$Res> get user {
    return $ParticipantUserCopyWith<$Res>(_self.user, (value) {
      return _then(_self.copyWith(user: value));
    });
  }
}

/// @nodoc
mixin _$ParticipantUser {
  String get id;
  String get name;
  String? get avatar;

  /// Create a copy of ParticipantUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ParticipantUserCopyWith<ParticipantUser> get copyWith =>
      _$ParticipantUserCopyWithImpl<ParticipantUser>(
          this as ParticipantUser, _$identity);

  /// Serializes this ParticipantUser to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ParticipantUser &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'ParticipantUser(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class $ParticipantUserCopyWith<$Res> {
  factory $ParticipantUserCopyWith(
          ParticipantUser value, $Res Function(ParticipantUser) _then) =
      _$ParticipantUserCopyWithImpl;
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class _$ParticipantUserCopyWithImpl<$Res>
    implements $ParticipantUserCopyWith<$Res> {
  _$ParticipantUserCopyWithImpl(this._self, this._then);

  final ParticipantUser _self;
  final $Res Function(ParticipantUser) _then;

  /// Create a copy of ParticipantUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
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
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _ParticipantUser implements ParticipantUser {
  const _ParticipantUser({required this.id, required this.name, this.avatar});
  factory _ParticipantUser.fromJson(Map<String, dynamic> json) =>
      _$ParticipantUserFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? avatar;

  /// Create a copy of ParticipantUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$ParticipantUserCopyWith<_ParticipantUser> get copyWith =>
      __$ParticipantUserCopyWithImpl<_ParticipantUser>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ParticipantUserToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _ParticipantUser &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'ParticipantUser(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class _$ParticipantUserCopyWith<$Res>
    implements $ParticipantUserCopyWith<$Res> {
  factory _$ParticipantUserCopyWith(
          _ParticipantUser value, $Res Function(_ParticipantUser) _then) =
      __$ParticipantUserCopyWithImpl;
  @override
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class __$ParticipantUserCopyWithImpl<$Res>
    implements _$ParticipantUserCopyWith<$Res> {
  __$ParticipantUserCopyWithImpl(this._self, this._then);

  final _ParticipantUser _self;
  final $Res Function(_ParticipantUser) _then;

  /// Create a copy of ParticipantUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
  }) {
    return _then(_ParticipantUser(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
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
mixin _$LastMessage {
  String? get content;
  MessageSender? get sender;
  String? get createdAt;

  /// Create a copy of LastMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $LastMessageCopyWith<LastMessage> get copyWith =>
      _$LastMessageCopyWithImpl<LastMessage>(this as LastMessage, _$identity);

  /// Serializes this LastMessage to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is LastMessage &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, content, sender, createdAt);

  @override
  String toString() {
    return 'LastMessage(content: $content, sender: $sender, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $LastMessageCopyWith<$Res> {
  factory $LastMessageCopyWith(
          LastMessage value, $Res Function(LastMessage) _then) =
      _$LastMessageCopyWithImpl;
  @useResult
  $Res call({String? content, MessageSender? sender, String? createdAt});

  $MessageSenderCopyWith<$Res>? get sender;
}

/// @nodoc
class _$LastMessageCopyWithImpl<$Res> implements $LastMessageCopyWith<$Res> {
  _$LastMessageCopyWithImpl(this._self, this._then);

  final LastMessage _self;
  final $Res Function(LastMessage) _then;

  /// Create a copy of LastMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? content = freezed,
    Object? sender = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      content: freezed == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String?,
      sender: freezed == sender
          ? _self.sender
          : sender // ignore: cast_nullable_to_non_nullable
              as MessageSender?,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of LastMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MessageSenderCopyWith<$Res>? get sender {
    if (_self.sender == null) {
      return null;
    }

    return $MessageSenderCopyWith<$Res>(_self.sender!, (value) {
      return _then(_self.copyWith(sender: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _LastMessage implements LastMessage {
  const _LastMessage({this.content, this.sender, this.createdAt});
  factory _LastMessage.fromJson(Map<String, dynamic> json) =>
      _$LastMessageFromJson(json);

  @override
  final String? content;
  @override
  final MessageSender? sender;
  @override
  final String? createdAt;

  /// Create a copy of LastMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$LastMessageCopyWith<_LastMessage> get copyWith =>
      __$LastMessageCopyWithImpl<_LastMessage>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$LastMessageToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _LastMessage &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, content, sender, createdAt);

  @override
  String toString() {
    return 'LastMessage(content: $content, sender: $sender, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$LastMessageCopyWith<$Res>
    implements $LastMessageCopyWith<$Res> {
  factory _$LastMessageCopyWith(
          _LastMessage value, $Res Function(_LastMessage) _then) =
      __$LastMessageCopyWithImpl;
  @override
  @useResult
  $Res call({String? content, MessageSender? sender, String? createdAt});

  @override
  $MessageSenderCopyWith<$Res>? get sender;
}

/// @nodoc
class __$LastMessageCopyWithImpl<$Res> implements _$LastMessageCopyWith<$Res> {
  __$LastMessageCopyWithImpl(this._self, this._then);

  final _LastMessage _self;
  final $Res Function(_LastMessage) _then;

  /// Create a copy of LastMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? content = freezed,
    Object? sender = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_LastMessage(
      content: freezed == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String?,
      sender: freezed == sender
          ? _self.sender
          : sender // ignore: cast_nullable_to_non_nullable
              as MessageSender?,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of LastMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MessageSenderCopyWith<$Res>? get sender {
    if (_self.sender == null) {
      return null;
    }

    return $MessageSenderCopyWith<$Res>(_self.sender!, (value) {
      return _then(_self.copyWith(sender: value));
    });
  }
}

/// @nodoc
mixin _$MessageSender {
  String get id;
  String get name;
  String? get avatar;

  /// Create a copy of MessageSender
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MessageSenderCopyWith<MessageSender> get copyWith =>
      _$MessageSenderCopyWithImpl<MessageSender>(
          this as MessageSender, _$identity);

  /// Serializes this MessageSender to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MessageSender &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'MessageSender(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class $MessageSenderCopyWith<$Res> {
  factory $MessageSenderCopyWith(
          MessageSender value, $Res Function(MessageSender) _then) =
      _$MessageSenderCopyWithImpl;
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class _$MessageSenderCopyWithImpl<$Res>
    implements $MessageSenderCopyWith<$Res> {
  _$MessageSenderCopyWithImpl(this._self, this._then);

  final MessageSender _self;
  final $Res Function(MessageSender) _then;

  /// Create a copy of MessageSender
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
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
      avatar: freezed == avatar
          ? _self.avatar
          : avatar // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _MessageSender implements MessageSender {
  const _MessageSender({required this.id, required this.name, this.avatar});
  factory _MessageSender.fromJson(Map<String, dynamic> json) =>
      _$MessageSenderFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? avatar;

  /// Create a copy of MessageSender
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$MessageSenderCopyWith<_MessageSender> get copyWith =>
      __$MessageSenderCopyWithImpl<_MessageSender>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MessageSenderToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _MessageSender &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'MessageSender(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class _$MessageSenderCopyWith<$Res>
    implements $MessageSenderCopyWith<$Res> {
  factory _$MessageSenderCopyWith(
          _MessageSender value, $Res Function(_MessageSender) _then) =
      __$MessageSenderCopyWithImpl;
  @override
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class __$MessageSenderCopyWithImpl<$Res>
    implements _$MessageSenderCopyWith<$Res> {
  __$MessageSenderCopyWithImpl(this._self, this._then);

  final _MessageSender _self;
  final $Res Function(_MessageSender) _then;

  /// Create a copy of MessageSender
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
  }) {
    return _then(_MessageSender(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
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
mixin _$MessageModel {
  String get id;
  String get senderId;
  MessageSender? get sender;
  String get content;
  String? get imageUrl;
  String? get audioUrl;
  List<MessageReaction> get reactions;
  String? get createdAt;

  /// Create a copy of MessageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MessageModelCopyWith<MessageModel> get copyWith =>
      _$MessageModelCopyWithImpl<MessageModel>(
          this as MessageModel, _$identity);

  /// Serializes this MessageModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MessageModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.senderId, senderId) ||
                other.senderId == senderId) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl) &&
            const DeepCollectionEquality().equals(other.reactions, reactions) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      senderId,
      sender,
      content,
      imageUrl,
      audioUrl,
      const DeepCollectionEquality().hash(reactions),
      createdAt);

  @override
  String toString() {
    return 'MessageModel(id: $id, senderId: $senderId, sender: $sender, content: $content, imageUrl: $imageUrl, audioUrl: $audioUrl, reactions: $reactions, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $MessageModelCopyWith<$Res> {
  factory $MessageModelCopyWith(
          MessageModel value, $Res Function(MessageModel) _then) =
      _$MessageModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String senderId,
      MessageSender? sender,
      String content,
      String? imageUrl,
      String? audioUrl,
      List<MessageReaction> reactions,
      String? createdAt});

  $MessageSenderCopyWith<$Res>? get sender;
}

/// @nodoc
class _$MessageModelCopyWithImpl<$Res> implements $MessageModelCopyWith<$Res> {
  _$MessageModelCopyWithImpl(this._self, this._then);

  final MessageModel _self;
  final $Res Function(MessageModel) _then;

  /// Create a copy of MessageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? senderId = null,
    Object? sender = freezed,
    Object? content = null,
    Object? imageUrl = freezed,
    Object? audioUrl = freezed,
    Object? reactions = null,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      senderId: null == senderId
          ? _self.senderId
          : senderId // ignore: cast_nullable_to_non_nullable
              as String,
      sender: freezed == sender
          ? _self.sender
          : sender // ignore: cast_nullable_to_non_nullable
              as MessageSender?,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: freezed == imageUrl
          ? _self.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      audioUrl: freezed == audioUrl
          ? _self.audioUrl
          : audioUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: null == reactions
          ? _self.reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as List<MessageReaction>,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of MessageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MessageSenderCopyWith<$Res>? get sender {
    if (_self.sender == null) {
      return null;
    }

    return $MessageSenderCopyWith<$Res>(_self.sender!, (value) {
      return _then(_self.copyWith(sender: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _MessageModel implements MessageModel {
  const _MessageModel(
      {required this.id,
      required this.senderId,
      this.sender,
      this.content = '',
      this.imageUrl,
      this.audioUrl,
      final List<MessageReaction> reactions = const [],
      this.createdAt})
      : _reactions = reactions;
  factory _MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(json);

  @override
  final String id;
  @override
  final String senderId;
  @override
  final MessageSender? sender;
  @override
  @JsonKey()
  final String content;
  @override
  final String? imageUrl;
  @override
  final String? audioUrl;
  final List<MessageReaction> _reactions;
  @override
  @JsonKey()
  List<MessageReaction> get reactions {
    if (_reactions is EqualUnmodifiableListView) return _reactions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_reactions);
  }

  @override
  final String? createdAt;

  /// Create a copy of MessageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$MessageModelCopyWith<_MessageModel> get copyWith =>
      __$MessageModelCopyWithImpl<_MessageModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MessageModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _MessageModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.senderId, senderId) ||
                other.senderId == senderId) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl) &&
            const DeepCollectionEquality()
                .equals(other._reactions, _reactions) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      senderId,
      sender,
      content,
      imageUrl,
      audioUrl,
      const DeepCollectionEquality().hash(_reactions),
      createdAt);

  @override
  String toString() {
    return 'MessageModel(id: $id, senderId: $senderId, sender: $sender, content: $content, imageUrl: $imageUrl, audioUrl: $audioUrl, reactions: $reactions, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$MessageModelCopyWith<$Res>
    implements $MessageModelCopyWith<$Res> {
  factory _$MessageModelCopyWith(
          _MessageModel value, $Res Function(_MessageModel) _then) =
      __$MessageModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String senderId,
      MessageSender? sender,
      String content,
      String? imageUrl,
      String? audioUrl,
      List<MessageReaction> reactions,
      String? createdAt});

  @override
  $MessageSenderCopyWith<$Res>? get sender;
}

/// @nodoc
class __$MessageModelCopyWithImpl<$Res>
    implements _$MessageModelCopyWith<$Res> {
  __$MessageModelCopyWithImpl(this._self, this._then);

  final _MessageModel _self;
  final $Res Function(_MessageModel) _then;

  /// Create a copy of MessageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? senderId = null,
    Object? sender = freezed,
    Object? content = null,
    Object? imageUrl = freezed,
    Object? audioUrl = freezed,
    Object? reactions = null,
    Object? createdAt = freezed,
  }) {
    return _then(_MessageModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      senderId: null == senderId
          ? _self.senderId
          : senderId // ignore: cast_nullable_to_non_nullable
              as String,
      sender: freezed == sender
          ? _self.sender
          : sender // ignore: cast_nullable_to_non_nullable
              as MessageSender?,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: freezed == imageUrl
          ? _self.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      audioUrl: freezed == audioUrl
          ? _self.audioUrl
          : audioUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: null == reactions
          ? _self._reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as List<MessageReaction>,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of MessageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MessageSenderCopyWith<$Res>? get sender {
    if (_self.sender == null) {
      return null;
    }

    return $MessageSenderCopyWith<$Res>(_self.sender!, (value) {
      return _then(_self.copyWith(sender: value));
    });
  }
}

/// @nodoc
mixin _$MessageReaction {
  String get emoji;
  List<String> get users;

  /// Create a copy of MessageReaction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $MessageReactionCopyWith<MessageReaction> get copyWith =>
      _$MessageReactionCopyWithImpl<MessageReaction>(
          this as MessageReaction, _$identity);

  /// Serializes this MessageReaction to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is MessageReaction &&
            (identical(other.emoji, emoji) || other.emoji == emoji) &&
            const DeepCollectionEquality().equals(other.users, users));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, emoji, const DeepCollectionEquality().hash(users));

  @override
  String toString() {
    return 'MessageReaction(emoji: $emoji, users: $users)';
  }
}

/// @nodoc
abstract mixin class $MessageReactionCopyWith<$Res> {
  factory $MessageReactionCopyWith(
          MessageReaction value, $Res Function(MessageReaction) _then) =
      _$MessageReactionCopyWithImpl;
  @useResult
  $Res call({String emoji, List<String> users});
}

/// @nodoc
class _$MessageReactionCopyWithImpl<$Res>
    implements $MessageReactionCopyWith<$Res> {
  _$MessageReactionCopyWithImpl(this._self, this._then);

  final MessageReaction _self;
  final $Res Function(MessageReaction) _then;

  /// Create a copy of MessageReaction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? emoji = null,
    Object? users = null,
  }) {
    return _then(_self.copyWith(
      emoji: null == emoji
          ? _self.emoji
          : emoji // ignore: cast_nullable_to_non_nullable
              as String,
      users: null == users
          ? _self.users
          : users // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _MessageReaction implements MessageReaction {
  const _MessageReaction(
      {required this.emoji, final List<String> users = const []})
      : _users = users;
  factory _MessageReaction.fromJson(Map<String, dynamic> json) =>
      _$MessageReactionFromJson(json);

  @override
  final String emoji;
  final List<String> _users;
  @override
  @JsonKey()
  List<String> get users {
    if (_users is EqualUnmodifiableListView) return _users;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_users);
  }

  /// Create a copy of MessageReaction
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$MessageReactionCopyWith<_MessageReaction> get copyWith =>
      __$MessageReactionCopyWithImpl<_MessageReaction>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$MessageReactionToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _MessageReaction &&
            (identical(other.emoji, emoji) || other.emoji == emoji) &&
            const DeepCollectionEquality().equals(other._users, _users));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, emoji, const DeepCollectionEquality().hash(_users));

  @override
  String toString() {
    return 'MessageReaction(emoji: $emoji, users: $users)';
  }
}

/// @nodoc
abstract mixin class _$MessageReactionCopyWith<$Res>
    implements $MessageReactionCopyWith<$Res> {
  factory _$MessageReactionCopyWith(
          _MessageReaction value, $Res Function(_MessageReaction) _then) =
      __$MessageReactionCopyWithImpl;
  @override
  @useResult
  $Res call({String emoji, List<String> users});
}

/// @nodoc
class __$MessageReactionCopyWithImpl<$Res>
    implements _$MessageReactionCopyWith<$Res> {
  __$MessageReactionCopyWithImpl(this._self, this._then);

  final _MessageReaction _self;
  final $Res Function(_MessageReaction) _then;

  /// Create a copy of MessageReaction
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? emoji = null,
    Object? users = null,
  }) {
    return _then(_MessageReaction(
      emoji: null == emoji
          ? _self.emoji
          : emoji // ignore: cast_nullable_to_non_nullable
              as String,
      users: null == users
          ? _self._users
          : users // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

// dart format on
