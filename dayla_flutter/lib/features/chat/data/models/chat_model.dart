import 'package:freezed_annotation/freezed_annotation.dart';

part 'chat_model.freezed.dart';
part 'chat_model.g.dart';

@freezed
abstract class ConversationModel with _$ConversationModel {
  const factory ConversationModel({
    required String id,
    @Default([]) List<ConversationParticipant> participants,
    @Default(false) bool isGroup,
    String? name,
    String? avatar,
    LastMessage? lastMessage,
    @Default(0) int messageCount,
    String? inviteCode,
    String? createdBy,
    String? updatedAt,
  }) = _ConversationModel;

  factory ConversationModel.fromJson(Map<String, dynamic> json) =>
      _$ConversationModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class ConversationParticipant with _$ConversationParticipant {
  const factory ConversationParticipant({
    required ParticipantUser user,
    @Default('member') String role,
    String? joinedAt,
    String? lastReadAt,
  }) = _ConversationParticipant;

  factory ConversationParticipant.fromJson(Map<String, dynamic> json) =>
      _$ConversationParticipantFromJson(json);
}

@freezed
abstract class ParticipantUser with _$ParticipantUser {
  const factory ParticipantUser({
    required String id,
    required String name,
    String? avatar,
  }) = _ParticipantUser;

  factory ParticipantUser.fromJson(Map<String, dynamic> json) =>
      _$ParticipantUserFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class LastMessage with _$LastMessage {
  const factory LastMessage({
    String? content,
    MessageSender? sender,
    String? createdAt,
  }) = _LastMessage;

  factory LastMessage.fromJson(Map<String, dynamic> json) =>
      _$LastMessageFromJson(json);
}

@freezed
abstract class MessageSender with _$MessageSender {
  const factory MessageSender({
    required String id,
    required String name,
    String? avatar,
  }) = _MessageSender;

  factory MessageSender.fromJson(Map<String, dynamic> json) =>
      _$MessageSenderFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class MessageModel with _$MessageModel {
  const factory MessageModel({
    required String id,
    required String senderId,
    MessageSender? sender,
    @Default('') String content,
    String? imageUrl,
    String? audioUrl,
    @Default([]) List<MessageReaction> reactions,
    String? createdAt,
  }) = _MessageModel;

  factory MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    copy['content'] ??= copy['text'] ?? '';
    return copy;
  }
}

@freezed
abstract class MessageReaction with _$MessageReaction {
  const factory MessageReaction({
    required String emoji,
    @Default([]) List<String> users,
  }) = _MessageReaction;

  factory MessageReaction.fromJson(Map<String, dynamic> json) =>
      _$MessageReactionFromJson(json);
}
