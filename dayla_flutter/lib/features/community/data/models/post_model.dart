import 'package:freezed_annotation/freezed_annotation.dart';

part 'post_model.freezed.dart';
part 'post_model.g.dart';

@freezed
abstract class PostModel with _$PostModel {
  const factory PostModel({
    required String id,
    PostAuthor? author,
    @Default('') String content,
    @Default([]) List<PostImage> images,
    PostLocation? location,
    @Default([]) List<PostTag> tags,
    @Default(0) int likeCount,
    @Default(false) bool liked,
    @Default(false) bool saved,
    @Default([]) List<PostComment> comments,
    @Default(0) int views,
    @Default('public') String visibility,
    String? createdAt,
    String? updatedAt,
  }) = _PostModel;

  factory PostModel.fromJson(Map<String, dynamic> json) =>
      _$PostModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    if (copy['likes'] is List) {
      copy['likeCount'] = (copy['likes'] as List).length;
    }
    return copy;
  }
}

@freezed
abstract class PostAuthor with _$PostAuthor {
  const factory PostAuthor({
    required String id,
    required String name,
    String? avatar,
    String? bio,
  }) = _PostAuthor;

  factory PostAuthor.fromJson(Map<String, dynamic> json) =>
      _$PostAuthorFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class PostImage with _$PostImage {
  const factory PostImage({
    required String url,
    String? caption,
  }) = _PostImage;

  factory PostImage.fromJson(Map<String, dynamic> json) =>
      _$PostImageFromJson(json);
}

@freezed
abstract class PostLocation with _$PostLocation {
  const factory PostLocation({
    String? name,
  }) = _PostLocation;

  factory PostLocation.fromJson(Map<String, dynamic> json) =>
      _$PostLocationFromJson(json);
}

@freezed
abstract class PostTag with _$PostTag {
  const factory PostTag({
    required String name,
    @Default('') String category,
  }) = _PostTag;

  factory PostTag.fromJson(Map<String, dynamic> json) =>
      _$PostTagFromJson(json);
}

@freezed
abstract class PostComment with _$PostComment {
  const factory PostComment({
    required String id,
    PostAuthor? author,
    @Default('') String content,
    String? createdAt,
  }) = _PostComment;

  factory PostComment.fromJson(Map<String, dynamic> json) =>
      _$PostCommentFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    copy['content'] ??= copy['text'] ?? '';
    return copy;
  }
}
