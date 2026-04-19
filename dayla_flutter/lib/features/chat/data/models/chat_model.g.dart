// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ConversationModel _$ConversationModelFromJson(Map<String, dynamic> json) =>
    _ConversationModel(
      id: json['id'] as String,
      participants: (json['participants'] as List<dynamic>?)
              ?.map((e) =>
                  ConversationParticipant.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      isGroup: json['isGroup'] as bool? ?? false,
      name: json['name'] as String?,
      avatar: json['avatar'] as String?,
      lastMessage: json['lastMessage'] == null
          ? null
          : LastMessage.fromJson(json['lastMessage'] as Map<String, dynamic>),
      messageCount: (json['messageCount'] as num?)?.toInt() ?? 0,
      inviteCode: json['inviteCode'] as String?,
      createdBy: json['createdBy'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$ConversationModelToJson(_ConversationModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'participants': instance.participants,
      'isGroup': instance.isGroup,
      'name': instance.name,
      'avatar': instance.avatar,
      'lastMessage': instance.lastMessage,
      'messageCount': instance.messageCount,
      'inviteCode': instance.inviteCode,
      'createdBy': instance.createdBy,
      'updatedAt': instance.updatedAt,
    };

_ConversationParticipant _$ConversationParticipantFromJson(
        Map<String, dynamic> json) =>
    _ConversationParticipant(
      user: ParticipantUser.fromJson(json['user'] as Map<String, dynamic>),
      role: json['role'] as String? ?? 'member',
      joinedAt: json['joinedAt'] as String?,
      lastReadAt: json['lastReadAt'] as String?,
    );

Map<String, dynamic> _$ConversationParticipantToJson(
        _ConversationParticipant instance) =>
    <String, dynamic>{
      'user': instance.user,
      'role': instance.role,
      'joinedAt': instance.joinedAt,
      'lastReadAt': instance.lastReadAt,
    };

_ParticipantUser _$ParticipantUserFromJson(Map<String, dynamic> json) =>
    _ParticipantUser(
      id: json['id'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$ParticipantUserToJson(_ParticipantUser instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'avatar': instance.avatar,
    };

_LastMessage _$LastMessageFromJson(Map<String, dynamic> json) => _LastMessage(
      content: json['content'] as String?,
      sender: json['sender'] == null
          ? null
          : MessageSender.fromJson(json['sender'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$LastMessageToJson(_LastMessage instance) =>
    <String, dynamic>{
      'content': instance.content,
      'sender': instance.sender,
      'createdAt': instance.createdAt,
    };

_MessageSender _$MessageSenderFromJson(Map<String, dynamic> json) =>
    _MessageSender(
      id: json['id'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$MessageSenderToJson(_MessageSender instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'avatar': instance.avatar,
    };

_MessageModel _$MessageModelFromJson(Map<String, dynamic> json) =>
    _MessageModel(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      sender: json['sender'] == null
          ? null
          : MessageSender.fromJson(json['sender'] as Map<String, dynamic>),
      content: json['content'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
      audioUrl: json['audioUrl'] as String?,
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((e) => MessageReaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$MessageModelToJson(_MessageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'senderId': instance.senderId,
      'sender': instance.sender,
      'content': instance.content,
      'imageUrl': instance.imageUrl,
      'audioUrl': instance.audioUrl,
      'reactions': instance.reactions,
      'createdAt': instance.createdAt,
    };

_MessageReaction _$MessageReactionFromJson(Map<String, dynamic> json) =>
    _MessageReaction(
      emoji: json['emoji'] as String,
      users:
          (json['users'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
    );

Map<String, dynamic> _$MessageReactionToJson(_MessageReaction instance) =>
    <String, dynamic>{
      'emoji': instance.emoji,
      'users': instance.users,
    };
