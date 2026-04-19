// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PostModel _$PostModelFromJson(Map<String, dynamic> json) => _PostModel(
      id: json['id'] as String,
      author: json['author'] == null
          ? null
          : PostAuthor.fromJson(json['author'] as Map<String, dynamic>),
      content: json['content'] as String? ?? '',
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => PostImage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      location: json['location'] == null
          ? null
          : PostLocation.fromJson(json['location'] as Map<String, dynamic>),
      tags: (json['tags'] as List<dynamic>?)
              ?.map((e) => PostTag.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
      liked: json['liked'] as bool? ?? false,
      saved: json['saved'] as bool? ?? false,
      comments: (json['comments'] as List<dynamic>?)
              ?.map((e) => PostComment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      views: (json['views'] as num?)?.toInt() ?? 0,
      visibility: json['visibility'] as String? ?? 'public',
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$PostModelToJson(_PostModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'author': instance.author,
      'content': instance.content,
      'images': instance.images,
      'location': instance.location,
      'tags': instance.tags,
      'likeCount': instance.likeCount,
      'liked': instance.liked,
      'saved': instance.saved,
      'comments': instance.comments,
      'views': instance.views,
      'visibility': instance.visibility,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

_PostAuthor _$PostAuthorFromJson(Map<String, dynamic> json) => _PostAuthor(
      id: json['id'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
    );

Map<String, dynamic> _$PostAuthorToJson(_PostAuthor instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'avatar': instance.avatar,
      'bio': instance.bio,
    };

_PostImage _$PostImageFromJson(Map<String, dynamic> json) => _PostImage(
      url: json['url'] as String,
      caption: json['caption'] as String?,
    );

Map<String, dynamic> _$PostImageToJson(_PostImage instance) =>
    <String, dynamic>{
      'url': instance.url,
      'caption': instance.caption,
    };

_PostLocation _$PostLocationFromJson(Map<String, dynamic> json) =>
    _PostLocation(
      name: json['name'] as String?,
    );

Map<String, dynamic> _$PostLocationToJson(_PostLocation instance) =>
    <String, dynamic>{
      'name': instance.name,
    };

_PostTag _$PostTagFromJson(Map<String, dynamic> json) => _PostTag(
      name: json['name'] as String,
      category: json['category'] as String? ?? '',
    );

Map<String, dynamic> _$PostTagToJson(_PostTag instance) => <String, dynamic>{
      'name': instance.name,
      'category': instance.category,
    };

_PostComment _$PostCommentFromJson(Map<String, dynamic> json) => _PostComment(
      id: json['id'] as String,
      author: json['author'] == null
          ? null
          : PostAuthor.fromJson(json['author'] as Map<String, dynamic>),
      content: json['content'] as String? ?? '',
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$PostCommentToJson(_PostComment instance) =>
    <String, dynamic>{
      'id': instance.id,
      'author': instance.author,
      'content': instance.content,
      'createdAt': instance.createdAt,
    };
