// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'post_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PostModel {
  String get id;
  PostAuthor? get author;
  String get content;
  List<PostImage> get images;
  PostLocation? get location;
  List<PostTag> get tags;
  int get likeCount;
  bool get liked;
  bool get saved;
  List<PostComment> get comments;
  int get views;
  String get visibility;
  String? get createdAt;
  String? get updatedAt;

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PostModelCopyWith<PostModel> get copyWith =>
      _$PostModelCopyWithImpl<PostModel>(this as PostModel, _$identity);

  /// Serializes this PostModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PostModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.content, content) || other.content == content) &&
            const DeepCollectionEquality().equals(other.images, images) &&
            (identical(other.location, location) ||
                other.location == location) &&
            const DeepCollectionEquality().equals(other.tags, tags) &&
            (identical(other.likeCount, likeCount) ||
                other.likeCount == likeCount) &&
            (identical(other.liked, liked) || other.liked == liked) &&
            (identical(other.saved, saved) || other.saved == saved) &&
            const DeepCollectionEquality().equals(other.comments, comments) &&
            (identical(other.views, views) || other.views == views) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      author,
      content,
      const DeepCollectionEquality().hash(images),
      location,
      const DeepCollectionEquality().hash(tags),
      likeCount,
      liked,
      saved,
      const DeepCollectionEquality().hash(comments),
      views,
      visibility,
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'PostModel(id: $id, author: $author, content: $content, images: $images, location: $location, tags: $tags, likeCount: $likeCount, liked: $liked, saved: $saved, comments: $comments, views: $views, visibility: $visibility, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class $PostModelCopyWith<$Res> {
  factory $PostModelCopyWith(PostModel value, $Res Function(PostModel) _then) =
      _$PostModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      PostAuthor? author,
      String content,
      List<PostImage> images,
      PostLocation? location,
      List<PostTag> tags,
      int likeCount,
      bool liked,
      bool saved,
      List<PostComment> comments,
      int views,
      String visibility,
      String? createdAt,
      String? updatedAt});

  $PostAuthorCopyWith<$Res>? get author;
  $PostLocationCopyWith<$Res>? get location;
}

/// @nodoc
class _$PostModelCopyWithImpl<$Res> implements $PostModelCopyWith<$Res> {
  _$PostModelCopyWithImpl(this._self, this._then);

  final PostModel _self;
  final $Res Function(PostModel) _then;

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? author = freezed,
    Object? content = null,
    Object? images = null,
    Object? location = freezed,
    Object? tags = null,
    Object? likeCount = null,
    Object? liked = null,
    Object? saved = null,
    Object? comments = null,
    Object? views = null,
    Object? visibility = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      author: freezed == author
          ? _self.author
          : author // ignore: cast_nullable_to_non_nullable
              as PostAuthor?,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      images: null == images
          ? _self.images
          : images // ignore: cast_nullable_to_non_nullable
              as List<PostImage>,
      location: freezed == location
          ? _self.location
          : location // ignore: cast_nullable_to_non_nullable
              as PostLocation?,
      tags: null == tags
          ? _self.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<PostTag>,
      likeCount: null == likeCount
          ? _self.likeCount
          : likeCount // ignore: cast_nullable_to_non_nullable
              as int,
      liked: null == liked
          ? _self.liked
          : liked // ignore: cast_nullable_to_non_nullable
              as bool,
      saved: null == saved
          ? _self.saved
          : saved // ignore: cast_nullable_to_non_nullable
              as bool,
      comments: null == comments
          ? _self.comments
          : comments // ignore: cast_nullable_to_non_nullable
              as List<PostComment>,
      views: null == views
          ? _self.views
          : views // ignore: cast_nullable_to_non_nullable
              as int,
      visibility: null == visibility
          ? _self.visibility
          : visibility // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      updatedAt: freezed == updatedAt
          ? _self.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PostAuthorCopyWith<$Res>? get author {
    if (_self.author == null) {
      return null;
    }

    return $PostAuthorCopyWith<$Res>(_self.author!, (value) {
      return _then(_self.copyWith(author: value));
    });
  }

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PostLocationCopyWith<$Res>? get location {
    if (_self.location == null) {
      return null;
    }

    return $PostLocationCopyWith<$Res>(_self.location!, (value) {
      return _then(_self.copyWith(location: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _PostModel implements PostModel {
  const _PostModel(
      {required this.id,
      this.author,
      this.content = '',
      final List<PostImage> images = const [],
      this.location,
      final List<PostTag> tags = const [],
      this.likeCount = 0,
      this.liked = false,
      this.saved = false,
      final List<PostComment> comments = const [],
      this.views = 0,
      this.visibility = 'public',
      this.createdAt,
      this.updatedAt})
      : _images = images,
        _tags = tags,
        _comments = comments;
  factory _PostModel.fromJson(Map<String, dynamic> json) =>
      _$PostModelFromJson(json);

  @override
  final String id;
  @override
  final PostAuthor? author;
  @override
  @JsonKey()
  final String content;
  final List<PostImage> _images;
  @override
  @JsonKey()
  List<PostImage> get images {
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_images);
  }

  @override
  final PostLocation? location;
  final List<PostTag> _tags;
  @override
  @JsonKey()
  List<PostTag> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  @override
  @JsonKey()
  final int likeCount;
  @override
  @JsonKey()
  final bool liked;
  @override
  @JsonKey()
  final bool saved;
  final List<PostComment> _comments;
  @override
  @JsonKey()
  List<PostComment> get comments {
    if (_comments is EqualUnmodifiableListView) return _comments;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_comments);
  }

  @override
  @JsonKey()
  final int views;
  @override
  @JsonKey()
  final String visibility;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PostModelCopyWith<_PostModel> get copyWith =>
      __$PostModelCopyWithImpl<_PostModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PostModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PostModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.content, content) || other.content == content) &&
            const DeepCollectionEquality().equals(other._images, _images) &&
            (identical(other.location, location) ||
                other.location == location) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.likeCount, likeCount) ||
                other.likeCount == likeCount) &&
            (identical(other.liked, liked) || other.liked == liked) &&
            (identical(other.saved, saved) || other.saved == saved) &&
            const DeepCollectionEquality().equals(other._comments, _comments) &&
            (identical(other.views, views) || other.views == views) &&
            (identical(other.visibility, visibility) ||
                other.visibility == visibility) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      author,
      content,
      const DeepCollectionEquality().hash(_images),
      location,
      const DeepCollectionEquality().hash(_tags),
      likeCount,
      liked,
      saved,
      const DeepCollectionEquality().hash(_comments),
      views,
      visibility,
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'PostModel(id: $id, author: $author, content: $content, images: $images, location: $location, tags: $tags, likeCount: $likeCount, liked: $liked, saved: $saved, comments: $comments, views: $views, visibility: $visibility, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class _$PostModelCopyWith<$Res>
    implements $PostModelCopyWith<$Res> {
  factory _$PostModelCopyWith(
          _PostModel value, $Res Function(_PostModel) _then) =
      __$PostModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      PostAuthor? author,
      String content,
      List<PostImage> images,
      PostLocation? location,
      List<PostTag> tags,
      int likeCount,
      bool liked,
      bool saved,
      List<PostComment> comments,
      int views,
      String visibility,
      String? createdAt,
      String? updatedAt});

  @override
  $PostAuthorCopyWith<$Res>? get author;
  @override
  $PostLocationCopyWith<$Res>? get location;
}

/// @nodoc
class __$PostModelCopyWithImpl<$Res> implements _$PostModelCopyWith<$Res> {
  __$PostModelCopyWithImpl(this._self, this._then);

  final _PostModel _self;
  final $Res Function(_PostModel) _then;

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? author = freezed,
    Object? content = null,
    Object? images = null,
    Object? location = freezed,
    Object? tags = null,
    Object? likeCount = null,
    Object? liked = null,
    Object? saved = null,
    Object? comments = null,
    Object? views = null,
    Object? visibility = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_PostModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      author: freezed == author
          ? _self.author
          : author // ignore: cast_nullable_to_non_nullable
              as PostAuthor?,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      images: null == images
          ? _self._images
          : images // ignore: cast_nullable_to_non_nullable
              as List<PostImage>,
      location: freezed == location
          ? _self.location
          : location // ignore: cast_nullable_to_non_nullable
              as PostLocation?,
      tags: null == tags
          ? _self._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<PostTag>,
      likeCount: null == likeCount
          ? _self.likeCount
          : likeCount // ignore: cast_nullable_to_non_nullable
              as int,
      liked: null == liked
          ? _self.liked
          : liked // ignore: cast_nullable_to_non_nullable
              as bool,
      saved: null == saved
          ? _self.saved
          : saved // ignore: cast_nullable_to_non_nullable
              as bool,
      comments: null == comments
          ? _self._comments
          : comments // ignore: cast_nullable_to_non_nullable
              as List<PostComment>,
      views: null == views
          ? _self.views
          : views // ignore: cast_nullable_to_non_nullable
              as int,
      visibility: null == visibility
          ? _self.visibility
          : visibility // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      updatedAt: freezed == updatedAt
          ? _self.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PostAuthorCopyWith<$Res>? get author {
    if (_self.author == null) {
      return null;
    }

    return $PostAuthorCopyWith<$Res>(_self.author!, (value) {
      return _then(_self.copyWith(author: value));
    });
  }

  /// Create a copy of PostModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PostLocationCopyWith<$Res>? get location {
    if (_self.location == null) {
      return null;
    }

    return $PostLocationCopyWith<$Res>(_self.location!, (value) {
      return _then(_self.copyWith(location: value));
    });
  }
}

/// @nodoc
mixin _$PostAuthor {
  String get id;
  String get name;
  String? get avatar;
  String? get bio;

  /// Create a copy of PostAuthor
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PostAuthorCopyWith<PostAuthor> get copyWith =>
      _$PostAuthorCopyWithImpl<PostAuthor>(this as PostAuthor, _$identity);

  /// Serializes this PostAuthor to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PostAuthor &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar, bio);

  @override
  String toString() {
    return 'PostAuthor(id: $id, name: $name, avatar: $avatar, bio: $bio)';
  }
}

/// @nodoc
abstract mixin class $PostAuthorCopyWith<$Res> {
  factory $PostAuthorCopyWith(
          PostAuthor value, $Res Function(PostAuthor) _then) =
      _$PostAuthorCopyWithImpl;
  @useResult
  $Res call({String id, String name, String? avatar, String? bio});
}

/// @nodoc
class _$PostAuthorCopyWithImpl<$Res> implements $PostAuthorCopyWith<$Res> {
  _$PostAuthorCopyWithImpl(this._self, this._then);

  final PostAuthor _self;
  final $Res Function(PostAuthor) _then;

  /// Create a copy of PostAuthor
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
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
class _PostAuthor implements PostAuthor {
  const _PostAuthor(
      {required this.id, required this.name, this.avatar, this.bio});
  factory _PostAuthor.fromJson(Map<String, dynamic> json) =>
      _$PostAuthorFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? avatar;
  @override
  final String? bio;

  /// Create a copy of PostAuthor
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PostAuthorCopyWith<_PostAuthor> get copyWith =>
      __$PostAuthorCopyWithImpl<_PostAuthor>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PostAuthorToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PostAuthor &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar, bio);

  @override
  String toString() {
    return 'PostAuthor(id: $id, name: $name, avatar: $avatar, bio: $bio)';
  }
}

/// @nodoc
abstract mixin class _$PostAuthorCopyWith<$Res>
    implements $PostAuthorCopyWith<$Res> {
  factory _$PostAuthorCopyWith(
          _PostAuthor value, $Res Function(_PostAuthor) _then) =
      __$PostAuthorCopyWithImpl;
  @override
  @useResult
  $Res call({String id, String name, String? avatar, String? bio});
}

/// @nodoc
class __$PostAuthorCopyWithImpl<$Res> implements _$PostAuthorCopyWith<$Res> {
  __$PostAuthorCopyWithImpl(this._self, this._then);

  final _PostAuthor _self;
  final $Res Function(_PostAuthor) _then;

  /// Create a copy of PostAuthor
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
    Object? bio = freezed,
  }) {
    return _then(_PostAuthor(
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
      bio: freezed == bio
          ? _self.bio
          : bio // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$PostImage {
  String get url;
  String? get caption;

  /// Create a copy of PostImage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PostImageCopyWith<PostImage> get copyWith =>
      _$PostImageCopyWithImpl<PostImage>(this as PostImage, _$identity);

  /// Serializes this PostImage to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PostImage &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.caption, caption) || other.caption == caption));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, url, caption);

  @override
  String toString() {
    return 'PostImage(url: $url, caption: $caption)';
  }
}

/// @nodoc
abstract mixin class $PostImageCopyWith<$Res> {
  factory $PostImageCopyWith(PostImage value, $Res Function(PostImage) _then) =
      _$PostImageCopyWithImpl;
  @useResult
  $Res call({String url, String? caption});
}

/// @nodoc
class _$PostImageCopyWithImpl<$Res> implements $PostImageCopyWith<$Res> {
  _$PostImageCopyWithImpl(this._self, this._then);

  final PostImage _self;
  final $Res Function(PostImage) _then;

  /// Create a copy of PostImage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? url = null,
    Object? caption = freezed,
  }) {
    return _then(_self.copyWith(
      url: null == url
          ? _self.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      caption: freezed == caption
          ? _self.caption
          : caption // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PostImage implements PostImage {
  const _PostImage({required this.url, this.caption});
  factory _PostImage.fromJson(Map<String, dynamic> json) =>
      _$PostImageFromJson(json);

  @override
  final String url;
  @override
  final String? caption;

  /// Create a copy of PostImage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PostImageCopyWith<_PostImage> get copyWith =>
      __$PostImageCopyWithImpl<_PostImage>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PostImageToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PostImage &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.caption, caption) || other.caption == caption));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, url, caption);

  @override
  String toString() {
    return 'PostImage(url: $url, caption: $caption)';
  }
}

/// @nodoc
abstract mixin class _$PostImageCopyWith<$Res>
    implements $PostImageCopyWith<$Res> {
  factory _$PostImageCopyWith(
          _PostImage value, $Res Function(_PostImage) _then) =
      __$PostImageCopyWithImpl;
  @override
  @useResult
  $Res call({String url, String? caption});
}

/// @nodoc
class __$PostImageCopyWithImpl<$Res> implements _$PostImageCopyWith<$Res> {
  __$PostImageCopyWithImpl(this._self, this._then);

  final _PostImage _self;
  final $Res Function(_PostImage) _then;

  /// Create a copy of PostImage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? url = null,
    Object? caption = freezed,
  }) {
    return _then(_PostImage(
      url: null == url
          ? _self.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
      caption: freezed == caption
          ? _self.caption
          : caption // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$PostLocation {
  String? get name;

  /// Create a copy of PostLocation
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PostLocationCopyWith<PostLocation> get copyWith =>
      _$PostLocationCopyWithImpl<PostLocation>(
          this as PostLocation, _$identity);

  /// Serializes this PostLocation to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PostLocation &&
            (identical(other.name, name) || other.name == name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name);

  @override
  String toString() {
    return 'PostLocation(name: $name)';
  }
}

/// @nodoc
abstract mixin class $PostLocationCopyWith<$Res> {
  factory $PostLocationCopyWith(
          PostLocation value, $Res Function(PostLocation) _then) =
      _$PostLocationCopyWithImpl;
  @useResult
  $Res call({String? name});
}

/// @nodoc
class _$PostLocationCopyWithImpl<$Res> implements $PostLocationCopyWith<$Res> {
  _$PostLocationCopyWithImpl(this._self, this._then);

  final PostLocation _self;
  final $Res Function(PostLocation) _then;

  /// Create a copy of PostLocation
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
  }) {
    return _then(_self.copyWith(
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PostLocation implements PostLocation {
  const _PostLocation({this.name});
  factory _PostLocation.fromJson(Map<String, dynamic> json) =>
      _$PostLocationFromJson(json);

  @override
  final String? name;

  /// Create a copy of PostLocation
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PostLocationCopyWith<_PostLocation> get copyWith =>
      __$PostLocationCopyWithImpl<_PostLocation>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PostLocationToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PostLocation &&
            (identical(other.name, name) || other.name == name));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name);

  @override
  String toString() {
    return 'PostLocation(name: $name)';
  }
}

/// @nodoc
abstract mixin class _$PostLocationCopyWith<$Res>
    implements $PostLocationCopyWith<$Res> {
  factory _$PostLocationCopyWith(
          _PostLocation value, $Res Function(_PostLocation) _then) =
      __$PostLocationCopyWithImpl;
  @override
  @useResult
  $Res call({String? name});
}

/// @nodoc
class __$PostLocationCopyWithImpl<$Res>
    implements _$PostLocationCopyWith<$Res> {
  __$PostLocationCopyWithImpl(this._self, this._then);

  final _PostLocation _self;
  final $Res Function(_PostLocation) _then;

  /// Create a copy of PostLocation
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? name = freezed,
  }) {
    return _then(_PostLocation(
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$PostTag {
  String get name;
  String get category;

  /// Create a copy of PostTag
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PostTagCopyWith<PostTag> get copyWith =>
      _$PostTagCopyWithImpl<PostTag>(this as PostTag, _$identity);

  /// Serializes this PostTag to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PostTag &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, category);

  @override
  String toString() {
    return 'PostTag(name: $name, category: $category)';
  }
}

/// @nodoc
abstract mixin class $PostTagCopyWith<$Res> {
  factory $PostTagCopyWith(PostTag value, $Res Function(PostTag) _then) =
      _$PostTagCopyWithImpl;
  @useResult
  $Res call({String name, String category});
}

/// @nodoc
class _$PostTagCopyWithImpl<$Res> implements $PostTagCopyWith<$Res> {
  _$PostTagCopyWithImpl(this._self, this._then);

  final PostTag _self;
  final $Res Function(PostTag) _then;

  /// Create a copy of PostTag
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? category = null,
  }) {
    return _then(_self.copyWith(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PostTag implements PostTag {
  const _PostTag({required this.name, this.category = ''});
  factory _PostTag.fromJson(Map<String, dynamic> json) =>
      _$PostTagFromJson(json);

  @override
  final String name;
  @override
  @JsonKey()
  final String category;

  /// Create a copy of PostTag
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PostTagCopyWith<_PostTag> get copyWith =>
      __$PostTagCopyWithImpl<_PostTag>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PostTagToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PostTag &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, name, category);

  @override
  String toString() {
    return 'PostTag(name: $name, category: $category)';
  }
}

/// @nodoc
abstract mixin class _$PostTagCopyWith<$Res> implements $PostTagCopyWith<$Res> {
  factory _$PostTagCopyWith(_PostTag value, $Res Function(_PostTag) _then) =
      __$PostTagCopyWithImpl;
  @override
  @useResult
  $Res call({String name, String category});
}

/// @nodoc
class __$PostTagCopyWithImpl<$Res> implements _$PostTagCopyWith<$Res> {
  __$PostTagCopyWithImpl(this._self, this._then);

  final _PostTag _self;
  final $Res Function(_PostTag) _then;

  /// Create a copy of PostTag
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? name = null,
    Object? category = null,
  }) {
    return _then(_PostTag(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
mixin _$PostComment {
  String get id;
  PostAuthor? get author;
  String get content;
  String? get createdAt;

  /// Create a copy of PostComment
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PostCommentCopyWith<PostComment> get copyWith =>
      _$PostCommentCopyWithImpl<PostComment>(this as PostComment, _$identity);

  /// Serializes this PostComment to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PostComment &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, author, content, createdAt);

  @override
  String toString() {
    return 'PostComment(id: $id, author: $author, content: $content, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $PostCommentCopyWith<$Res> {
  factory $PostCommentCopyWith(
          PostComment value, $Res Function(PostComment) _then) =
      _$PostCommentCopyWithImpl;
  @useResult
  $Res call({String id, PostAuthor? author, String content, String? createdAt});

  $PostAuthorCopyWith<$Res>? get author;
}

/// @nodoc
class _$PostCommentCopyWithImpl<$Res> implements $PostCommentCopyWith<$Res> {
  _$PostCommentCopyWithImpl(this._self, this._then);

  final PostComment _self;
  final $Res Function(PostComment) _then;

  /// Create a copy of PostComment
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? author = freezed,
    Object? content = null,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      author: freezed == author
          ? _self.author
          : author // ignore: cast_nullable_to_non_nullable
              as PostAuthor?,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of PostComment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PostAuthorCopyWith<$Res>? get author {
    if (_self.author == null) {
      return null;
    }

    return $PostAuthorCopyWith<$Res>(_self.author!, (value) {
      return _then(_self.copyWith(author: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _PostComment implements PostComment {
  const _PostComment(
      {required this.id, this.author, this.content = '', this.createdAt});
  factory _PostComment.fromJson(Map<String, dynamic> json) =>
      _$PostCommentFromJson(json);

  @override
  final String id;
  @override
  final PostAuthor? author;
  @override
  @JsonKey()
  final String content;
  @override
  final String? createdAt;

  /// Create a copy of PostComment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PostCommentCopyWith<_PostComment> get copyWith =>
      __$PostCommentCopyWithImpl<_PostComment>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PostCommentToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PostComment &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.author, author) || other.author == author) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, author, content, createdAt);

  @override
  String toString() {
    return 'PostComment(id: $id, author: $author, content: $content, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$PostCommentCopyWith<$Res>
    implements $PostCommentCopyWith<$Res> {
  factory _$PostCommentCopyWith(
          _PostComment value, $Res Function(_PostComment) _then) =
      __$PostCommentCopyWithImpl;
  @override
  @useResult
  $Res call({String id, PostAuthor? author, String content, String? createdAt});

  @override
  $PostAuthorCopyWith<$Res>? get author;
}

/// @nodoc
class __$PostCommentCopyWithImpl<$Res> implements _$PostCommentCopyWith<$Res> {
  __$PostCommentCopyWithImpl(this._self, this._then);

  final _PostComment _self;
  final $Res Function(_PostComment) _then;

  /// Create a copy of PostComment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? author = freezed,
    Object? content = null,
    Object? createdAt = freezed,
  }) {
    return _then(_PostComment(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      author: freezed == author
          ? _self.author
          : author // ignore: cast_nullable_to_non_nullable
              as PostAuthor?,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _self.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of PostComment
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PostAuthorCopyWith<$Res>? get author {
    if (_self.author == null) {
      return null;
    }

    return $PostAuthorCopyWith<$Res>(_self.author!, (value) {
      return _then(_self.copyWith(author: value));
    });
  }
}

// dart format on
