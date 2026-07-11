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
    // POST /conversations returns createdBy POPULATED as an object; the
    // list endpoint returns a bare id string. Coerce to the id either way
    // (an object here used to throw in fromJson and hang "Creating…").
    final createdBy = copy['createdBy'];
    if (createdBy is Map) {
      copy['createdBy'] = (createdBy['_id'] ?? createdBy['id'])?.toString();
    }
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
    // The API has no `senderId` field: REST returns `sender` as a populated
    // object; unpopulated documents carry a bare id string. Derive senderId
    // from whichever shape arrived (a missing senderId used to throw and
    // blank the whole chat).
    final sender = copy['sender'];
    if (sender is Map) {
      copy['senderId'] ??= (sender['_id'] ?? sender['id'])?.toString();
    } else if (sender is String) {
      copy['senderId'] ??= sender;
      copy.remove('sender');
    }
    copy['senderId'] ??= '';
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
