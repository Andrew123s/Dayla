// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'route_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RouteModel {
  String get id;
  String get type;
  String get title;
  String get country;
  String get location;
  String get description;
  String get difficulty;
  double get distanceKm;
  double get elevationGainM;
  double get estimatedDurationMins;
  List<String> get photos;
  List<String> get tags;
  double get ecoScore;
  double get weatherScore;
  double get accessibilityScore;
  RouteEcoImpact? get ecoImpact;
  RouteGeometry? get geometry;
  List<double>? get startPoint;
  String get creatorName;
  String get moderationStatus;
  bool get isMine;
  bool get isSaved;
  int get saveCount;
  int get voteScore;
  int get userVote;
  int get commentCount;

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $RouteModelCopyWith<RouteModel> get copyWith =>
      _$RouteModelCopyWithImpl<RouteModel>(this as RouteModel, _$identity);

  /// Serializes this RouteModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is RouteModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.difficulty, difficulty) ||
                other.difficulty == difficulty) &&
            (identical(other.distanceKm, distanceKm) ||
                other.distanceKm == distanceKm) &&
            (identical(other.elevationGainM, elevationGainM) ||
                other.elevationGainM == elevationGainM) &&
            (identical(other.estimatedDurationMins, estimatedDurationMins) ||
                other.estimatedDurationMins == estimatedDurationMins) &&
            const DeepCollectionEquality().equals(other.photos, photos) &&
            const DeepCollectionEquality().equals(other.tags, tags) &&
            (identical(other.ecoScore, ecoScore) ||
                other.ecoScore == ecoScore) &&
            (identical(other.weatherScore, weatherScore) ||
                other.weatherScore == weatherScore) &&
            (identical(other.accessibilityScore, accessibilityScore) ||
                other.accessibilityScore == accessibilityScore) &&
            (identical(other.ecoImpact, ecoImpact) ||
                other.ecoImpact == ecoImpact) &&
            (identical(other.geometry, geometry) ||
                other.geometry == geometry) &&
            const DeepCollectionEquality()
                .equals(other.startPoint, startPoint) &&
            (identical(other.creatorName, creatorName) ||
                other.creatorName == creatorName) &&
            (identical(other.moderationStatus, moderationStatus) ||
                other.moderationStatus == moderationStatus) &&
            (identical(other.isMine, isMine) || other.isMine == isMine) &&
            (identical(other.isSaved, isSaved) || other.isSaved == isSaved) &&
            (identical(other.saveCount, saveCount) ||
                other.saveCount == saveCount) &&
            (identical(other.voteScore, voteScore) ||
                other.voteScore == voteScore) &&
            (identical(other.userVote, userVote) ||
                other.userVote == userVote) &&
            (identical(other.commentCount, commentCount) ||
                other.commentCount == commentCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        type,
        title,
        country,
        location,
        description,
        difficulty,
        distanceKm,
        elevationGainM,
        estimatedDurationMins,
        const DeepCollectionEquality().hash(photos),
        const DeepCollectionEquality().hash(tags),
        ecoScore,
        weatherScore,
        accessibilityScore,
        ecoImpact,
        geometry,
        const DeepCollectionEquality().hash(startPoint),
        creatorName,
        moderationStatus,
        isMine,
        isSaved,
        saveCount,
        voteScore,
        userVote,
        commentCount
      ]);

  @override
  String toString() {
    return 'RouteModel(id: $id, type: $type, title: $title, country: $country, location: $location, description: $description, difficulty: $difficulty, distanceKm: $distanceKm, elevationGainM: $elevationGainM, estimatedDurationMins: $estimatedDurationMins, photos: $photos, tags: $tags, ecoScore: $ecoScore, weatherScore: $weatherScore, accessibilityScore: $accessibilityScore, ecoImpact: $ecoImpact, geometry: $geometry, startPoint: $startPoint, creatorName: $creatorName, moderationStatus: $moderationStatus, isMine: $isMine, isSaved: $isSaved, saveCount: $saveCount, voteScore: $voteScore, userVote: $userVote, commentCount: $commentCount)';
  }
}

/// @nodoc
abstract mixin class $RouteModelCopyWith<$Res> {
  factory $RouteModelCopyWith(
          RouteModel value, $Res Function(RouteModel) _then) =
      _$RouteModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String type,
      String title,
      String country,
      String location,
      String description,
      String difficulty,
      double distanceKm,
      double elevationGainM,
      double estimatedDurationMins,
      List<String> photos,
      List<String> tags,
      double ecoScore,
      double weatherScore,
      double accessibilityScore,
      RouteEcoImpact? ecoImpact,
      RouteGeometry? geometry,
      List<double>? startPoint,
      String creatorName,
      String moderationStatus,
      bool isMine,
      bool isSaved,
      int saveCount,
      int voteScore,
      int userVote,
      int commentCount});

  $RouteEcoImpactCopyWith<$Res>? get ecoImpact;
  $RouteGeometryCopyWith<$Res>? get geometry;
}

/// @nodoc
class _$RouteModelCopyWithImpl<$Res> implements $RouteModelCopyWith<$Res> {
  _$RouteModelCopyWithImpl(this._self, this._then);

  final RouteModel _self;
  final $Res Function(RouteModel) _then;

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? title = null,
    Object? country = null,
    Object? location = null,
    Object? description = null,
    Object? difficulty = null,
    Object? distanceKm = null,
    Object? elevationGainM = null,
    Object? estimatedDurationMins = null,
    Object? photos = null,
    Object? tags = null,
    Object? ecoScore = null,
    Object? weatherScore = null,
    Object? accessibilityScore = null,
    Object? ecoImpact = freezed,
    Object? geometry = freezed,
    Object? startPoint = freezed,
    Object? creatorName = null,
    Object? moderationStatus = null,
    Object? isMine = null,
    Object? isSaved = null,
    Object? saveCount = null,
    Object? voteScore = null,
    Object? userVote = null,
    Object? commentCount = null,
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
      title: null == title
          ? _self.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      country: null == country
          ? _self.country
          : country // ignore: cast_nullable_to_non_nullable
              as String,
      location: null == location
          ? _self.location
          : location // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      difficulty: null == difficulty
          ? _self.difficulty
          : difficulty // ignore: cast_nullable_to_non_nullable
              as String,
      distanceKm: null == distanceKm
          ? _self.distanceKm
          : distanceKm // ignore: cast_nullable_to_non_nullable
              as double,
      elevationGainM: null == elevationGainM
          ? _self.elevationGainM
          : elevationGainM // ignore: cast_nullable_to_non_nullable
              as double,
      estimatedDurationMins: null == estimatedDurationMins
          ? _self.estimatedDurationMins
          : estimatedDurationMins // ignore: cast_nullable_to_non_nullable
              as double,
      photos: null == photos
          ? _self.photos
          : photos // ignore: cast_nullable_to_non_nullable
              as List<String>,
      tags: null == tags
          ? _self.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      ecoScore: null == ecoScore
          ? _self.ecoScore
          : ecoScore // ignore: cast_nullable_to_non_nullable
              as double,
      weatherScore: null == weatherScore
          ? _self.weatherScore
          : weatherScore // ignore: cast_nullable_to_non_nullable
              as double,
      accessibilityScore: null == accessibilityScore
          ? _self.accessibilityScore
          : accessibilityScore // ignore: cast_nullable_to_non_nullable
              as double,
      ecoImpact: freezed == ecoImpact
          ? _self.ecoImpact
          : ecoImpact // ignore: cast_nullable_to_non_nullable
              as RouteEcoImpact?,
      geometry: freezed == geometry
          ? _self.geometry
          : geometry // ignore: cast_nullable_to_non_nullable
              as RouteGeometry?,
      startPoint: freezed == startPoint
          ? _self.startPoint
          : startPoint // ignore: cast_nullable_to_non_nullable
              as List<double>?,
      creatorName: null == creatorName
          ? _self.creatorName
          : creatorName // ignore: cast_nullable_to_non_nullable
              as String,
      moderationStatus: null == moderationStatus
          ? _self.moderationStatus
          : moderationStatus // ignore: cast_nullable_to_non_nullable
              as String,
      isMine: null == isMine
          ? _self.isMine
          : isMine // ignore: cast_nullable_to_non_nullable
              as bool,
      isSaved: null == isSaved
          ? _self.isSaved
          : isSaved // ignore: cast_nullable_to_non_nullable
              as bool,
      saveCount: null == saveCount
          ? _self.saveCount
          : saveCount // ignore: cast_nullable_to_non_nullable
              as int,
      voteScore: null == voteScore
          ? _self.voteScore
          : voteScore // ignore: cast_nullable_to_non_nullable
              as int,
      userVote: null == userVote
          ? _self.userVote
          : userVote // ignore: cast_nullable_to_non_nullable
              as int,
      commentCount: null == commentCount
          ? _self.commentCount
          : commentCount // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RouteEcoImpactCopyWith<$Res>? get ecoImpact {
    if (_self.ecoImpact == null) {
      return null;
    }

    return $RouteEcoImpactCopyWith<$Res>(_self.ecoImpact!, (value) {
      return _then(_self.copyWith(ecoImpact: value));
    });
  }

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RouteGeometryCopyWith<$Res>? get geometry {
    if (_self.geometry == null) {
      return null;
    }

    return $RouteGeometryCopyWith<$Res>(_self.geometry!, (value) {
      return _then(_self.copyWith(geometry: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _RouteModel implements RouteModel {
  const _RouteModel(
      {required this.id,
      this.type = 'curated',
      this.title = '',
      this.country = '',
      this.location = '',
      this.description = '',
      this.difficulty = 'moderate',
      this.distanceKm = 0,
      this.elevationGainM = 0,
      this.estimatedDurationMins = 0,
      final List<String> photos = const [],
      final List<String> tags = const [],
      this.ecoScore = 75,
      this.weatherScore = 70,
      this.accessibilityScore = 50,
      this.ecoImpact,
      this.geometry,
      final List<double>? startPoint,
      this.creatorName = 'Dayla',
      this.moderationStatus = 'approved',
      this.isMine = false,
      this.isSaved = false,
      this.saveCount = 0,
      this.voteScore = 0,
      this.userVote = 0,
      this.commentCount = 0})
      : _photos = photos,
        _tags = tags,
        _startPoint = startPoint;
  factory _RouteModel.fromJson(Map<String, dynamic> json) =>
      _$RouteModelFromJson(json);

  @override
  final String id;
  @override
  @JsonKey()
  final String type;
  @override
  @JsonKey()
  final String title;
  @override
  @JsonKey()
  final String country;
  @override
  @JsonKey()
  final String location;
  @override
  @JsonKey()
  final String description;
  @override
  @JsonKey()
  final String difficulty;
  @override
  @JsonKey()
  final double distanceKm;
  @override
  @JsonKey()
  final double elevationGainM;
  @override
  @JsonKey()
  final double estimatedDurationMins;
  final List<String> _photos;
  @override
  @JsonKey()
  List<String> get photos {
    if (_photos is EqualUnmodifiableListView) return _photos;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_photos);
  }

  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  @override
  @JsonKey()
  final double ecoScore;
  @override
  @JsonKey()
  final double weatherScore;
  @override
  @JsonKey()
  final double accessibilityScore;
  @override
  final RouteEcoImpact? ecoImpact;
  @override
  final RouteGeometry? geometry;
  final List<double>? _startPoint;
  @override
  List<double>? get startPoint {
    final value = _startPoint;
    if (value == null) return null;
    if (_startPoint is EqualUnmodifiableListView) return _startPoint;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  @JsonKey()
  final String creatorName;
  @override
  @JsonKey()
  final String moderationStatus;
  @override
  @JsonKey()
  final bool isMine;
  @override
  @JsonKey()
  final bool isSaved;
  @override
  @JsonKey()
  final int saveCount;
  @override
  @JsonKey()
  final int voteScore;
  @override
  @JsonKey()
  final int userVote;
  @override
  @JsonKey()
  final int commentCount;

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$RouteModelCopyWith<_RouteModel> get copyWith =>
      __$RouteModelCopyWithImpl<_RouteModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$RouteModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _RouteModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.difficulty, difficulty) ||
                other.difficulty == difficulty) &&
            (identical(other.distanceKm, distanceKm) ||
                other.distanceKm == distanceKm) &&
            (identical(other.elevationGainM, elevationGainM) ||
                other.elevationGainM == elevationGainM) &&
            (identical(other.estimatedDurationMins, estimatedDurationMins) ||
                other.estimatedDurationMins == estimatedDurationMins) &&
            const DeepCollectionEquality().equals(other._photos, _photos) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.ecoScore, ecoScore) ||
                other.ecoScore == ecoScore) &&
            (identical(other.weatherScore, weatherScore) ||
                other.weatherScore == weatherScore) &&
            (identical(other.accessibilityScore, accessibilityScore) ||
                other.accessibilityScore == accessibilityScore) &&
            (identical(other.ecoImpact, ecoImpact) ||
                other.ecoImpact == ecoImpact) &&
            (identical(other.geometry, geometry) ||
                other.geometry == geometry) &&
            const DeepCollectionEquality()
                .equals(other._startPoint, _startPoint) &&
            (identical(other.creatorName, creatorName) ||
                other.creatorName == creatorName) &&
            (identical(other.moderationStatus, moderationStatus) ||
                other.moderationStatus == moderationStatus) &&
            (identical(other.isMine, isMine) || other.isMine == isMine) &&
            (identical(other.isSaved, isSaved) || other.isSaved == isSaved) &&
            (identical(other.saveCount, saveCount) ||
                other.saveCount == saveCount) &&
            (identical(other.voteScore, voteScore) ||
                other.voteScore == voteScore) &&
            (identical(other.userVote, userVote) ||
                other.userVote == userVote) &&
            (identical(other.commentCount, commentCount) ||
                other.commentCount == commentCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        type,
        title,
        country,
        location,
        description,
        difficulty,
        distanceKm,
        elevationGainM,
        estimatedDurationMins,
        const DeepCollectionEquality().hash(_photos),
        const DeepCollectionEquality().hash(_tags),
        ecoScore,
        weatherScore,
        accessibilityScore,
        ecoImpact,
        geometry,
        const DeepCollectionEquality().hash(_startPoint),
        creatorName,
        moderationStatus,
        isMine,
        isSaved,
        saveCount,
        voteScore,
        userVote,
        commentCount
      ]);

  @override
  String toString() {
    return 'RouteModel(id: $id, type: $type, title: $title, country: $country, location: $location, description: $description, difficulty: $difficulty, distanceKm: $distanceKm, elevationGainM: $elevationGainM, estimatedDurationMins: $estimatedDurationMins, photos: $photos, tags: $tags, ecoScore: $ecoScore, weatherScore: $weatherScore, accessibilityScore: $accessibilityScore, ecoImpact: $ecoImpact, geometry: $geometry, startPoint: $startPoint, creatorName: $creatorName, moderationStatus: $moderationStatus, isMine: $isMine, isSaved: $isSaved, saveCount: $saveCount, voteScore: $voteScore, userVote: $userVote, commentCount: $commentCount)';
  }
}

/// @nodoc
abstract mixin class _$RouteModelCopyWith<$Res>
    implements $RouteModelCopyWith<$Res> {
  factory _$RouteModelCopyWith(
          _RouteModel value, $Res Function(_RouteModel) _then) =
      __$RouteModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String type,
      String title,
      String country,
      String location,
      String description,
      String difficulty,
      double distanceKm,
      double elevationGainM,
      double estimatedDurationMins,
      List<String> photos,
      List<String> tags,
      double ecoScore,
      double weatherScore,
      double accessibilityScore,
      RouteEcoImpact? ecoImpact,
      RouteGeometry? geometry,
      List<double>? startPoint,
      String creatorName,
      String moderationStatus,
      bool isMine,
      bool isSaved,
      int saveCount,
      int voteScore,
      int userVote,
      int commentCount});

  @override
  $RouteEcoImpactCopyWith<$Res>? get ecoImpact;
  @override
  $RouteGeometryCopyWith<$Res>? get geometry;
}

/// @nodoc
class __$RouteModelCopyWithImpl<$Res> implements _$RouteModelCopyWith<$Res> {
  __$RouteModelCopyWithImpl(this._self, this._then);

  final _RouteModel _self;
  final $Res Function(_RouteModel) _then;

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? title = null,
    Object? country = null,
    Object? location = null,
    Object? description = null,
    Object? difficulty = null,
    Object? distanceKm = null,
    Object? elevationGainM = null,
    Object? estimatedDurationMins = null,
    Object? photos = null,
    Object? tags = null,
    Object? ecoScore = null,
    Object? weatherScore = null,
    Object? accessibilityScore = null,
    Object? ecoImpact = freezed,
    Object? geometry = freezed,
    Object? startPoint = freezed,
    Object? creatorName = null,
    Object? moderationStatus = null,
    Object? isMine = null,
    Object? isSaved = null,
    Object? saveCount = null,
    Object? voteScore = null,
    Object? userVote = null,
    Object? commentCount = null,
  }) {
    return _then(_RouteModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _self.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      country: null == country
          ? _self.country
          : country // ignore: cast_nullable_to_non_nullable
              as String,
      location: null == location
          ? _self.location
          : location // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      difficulty: null == difficulty
          ? _self.difficulty
          : difficulty // ignore: cast_nullable_to_non_nullable
              as String,
      distanceKm: null == distanceKm
          ? _self.distanceKm
          : distanceKm // ignore: cast_nullable_to_non_nullable
              as double,
      elevationGainM: null == elevationGainM
          ? _self.elevationGainM
          : elevationGainM // ignore: cast_nullable_to_non_nullable
              as double,
      estimatedDurationMins: null == estimatedDurationMins
          ? _self.estimatedDurationMins
          : estimatedDurationMins // ignore: cast_nullable_to_non_nullable
              as double,
      photos: null == photos
          ? _self._photos
          : photos // ignore: cast_nullable_to_non_nullable
              as List<String>,
      tags: null == tags
          ? _self._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      ecoScore: null == ecoScore
          ? _self.ecoScore
          : ecoScore // ignore: cast_nullable_to_non_nullable
              as double,
      weatherScore: null == weatherScore
          ? _self.weatherScore
          : weatherScore // ignore: cast_nullable_to_non_nullable
              as double,
      accessibilityScore: null == accessibilityScore
          ? _self.accessibilityScore
          : accessibilityScore // ignore: cast_nullable_to_non_nullable
              as double,
      ecoImpact: freezed == ecoImpact
          ? _self.ecoImpact
          : ecoImpact // ignore: cast_nullable_to_non_nullable
              as RouteEcoImpact?,
      geometry: freezed == geometry
          ? _self.geometry
          : geometry // ignore: cast_nullable_to_non_nullable
              as RouteGeometry?,
      startPoint: freezed == startPoint
          ? _self._startPoint
          : startPoint // ignore: cast_nullable_to_non_nullable
              as List<double>?,
      creatorName: null == creatorName
          ? _self.creatorName
          : creatorName // ignore: cast_nullable_to_non_nullable
              as String,
      moderationStatus: null == moderationStatus
          ? _self.moderationStatus
          : moderationStatus // ignore: cast_nullable_to_non_nullable
              as String,
      isMine: null == isMine
          ? _self.isMine
          : isMine // ignore: cast_nullable_to_non_nullable
              as bool,
      isSaved: null == isSaved
          ? _self.isSaved
          : isSaved // ignore: cast_nullable_to_non_nullable
              as bool,
      saveCount: null == saveCount
          ? _self.saveCount
          : saveCount // ignore: cast_nullable_to_non_nullable
              as int,
      voteScore: null == voteScore
          ? _self.voteScore
          : voteScore // ignore: cast_nullable_to_non_nullable
              as int,
      userVote: null == userVote
          ? _self.userVote
          : userVote // ignore: cast_nullable_to_non_nullable
              as int,
      commentCount: null == commentCount
          ? _self.commentCount
          : commentCount // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RouteEcoImpactCopyWith<$Res>? get ecoImpact {
    if (_self.ecoImpact == null) {
      return null;
    }

    return $RouteEcoImpactCopyWith<$Res>(_self.ecoImpact!, (value) {
      return _then(_self.copyWith(ecoImpact: value));
    });
  }

  /// Create a copy of RouteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RouteGeometryCopyWith<$Res>? get geometry {
    if (_self.geometry == null) {
      return null;
    }

    return $RouteGeometryCopyWith<$Res>(_self.geometry!, (value) {
      return _then(_self.copyWith(geometry: value));
    });
  }
}

/// @nodoc
mixin _$RouteEcoImpact {
  String get transportMode;
  double get co2EstimateKg;
  List<String> get greenerAlternatives;

  /// Create a copy of RouteEcoImpact
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $RouteEcoImpactCopyWith<RouteEcoImpact> get copyWith =>
      _$RouteEcoImpactCopyWithImpl<RouteEcoImpact>(
          this as RouteEcoImpact, _$identity);

  /// Serializes this RouteEcoImpact to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is RouteEcoImpact &&
            (identical(other.transportMode, transportMode) ||
                other.transportMode == transportMode) &&
            (identical(other.co2EstimateKg, co2EstimateKg) ||
                other.co2EstimateKg == co2EstimateKg) &&
            const DeepCollectionEquality()
                .equals(other.greenerAlternatives, greenerAlternatives));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, transportMode, co2EstimateKg,
      const DeepCollectionEquality().hash(greenerAlternatives));

  @override
  String toString() {
    return 'RouteEcoImpact(transportMode: $transportMode, co2EstimateKg: $co2EstimateKg, greenerAlternatives: $greenerAlternatives)';
  }
}

/// @nodoc
abstract mixin class $RouteEcoImpactCopyWith<$Res> {
  factory $RouteEcoImpactCopyWith(
          RouteEcoImpact value, $Res Function(RouteEcoImpact) _then) =
      _$RouteEcoImpactCopyWithImpl;
  @useResult
  $Res call(
      {String transportMode,
      double co2EstimateKg,
      List<String> greenerAlternatives});
}

/// @nodoc
class _$RouteEcoImpactCopyWithImpl<$Res>
    implements $RouteEcoImpactCopyWith<$Res> {
  _$RouteEcoImpactCopyWithImpl(this._self, this._then);

  final RouteEcoImpact _self;
  final $Res Function(RouteEcoImpact) _then;

  /// Create a copy of RouteEcoImpact
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? transportMode = null,
    Object? co2EstimateKg = null,
    Object? greenerAlternatives = null,
  }) {
    return _then(_self.copyWith(
      transportMode: null == transportMode
          ? _self.transportMode
          : transportMode // ignore: cast_nullable_to_non_nullable
              as String,
      co2EstimateKg: null == co2EstimateKg
          ? _self.co2EstimateKg
          : co2EstimateKg // ignore: cast_nullable_to_non_nullable
              as double,
      greenerAlternatives: null == greenerAlternatives
          ? _self.greenerAlternatives
          : greenerAlternatives // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _RouteEcoImpact implements RouteEcoImpact {
  const _RouteEcoImpact(
      {this.transportMode = '',
      this.co2EstimateKg = 0,
      final List<String> greenerAlternatives = const []})
      : _greenerAlternatives = greenerAlternatives;
  factory _RouteEcoImpact.fromJson(Map<String, dynamic> json) =>
      _$RouteEcoImpactFromJson(json);

  @override
  @JsonKey()
  final String transportMode;
  @override
  @JsonKey()
  final double co2EstimateKg;
  final List<String> _greenerAlternatives;
  @override
  @JsonKey()
  List<String> get greenerAlternatives {
    if (_greenerAlternatives is EqualUnmodifiableListView)
      return _greenerAlternatives;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_greenerAlternatives);
  }

  /// Create a copy of RouteEcoImpact
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$RouteEcoImpactCopyWith<_RouteEcoImpact> get copyWith =>
      __$RouteEcoImpactCopyWithImpl<_RouteEcoImpact>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$RouteEcoImpactToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _RouteEcoImpact &&
            (identical(other.transportMode, transportMode) ||
                other.transportMode == transportMode) &&
            (identical(other.co2EstimateKg, co2EstimateKg) ||
                other.co2EstimateKg == co2EstimateKg) &&
            const DeepCollectionEquality()
                .equals(other._greenerAlternatives, _greenerAlternatives));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, transportMode, co2EstimateKg,
      const DeepCollectionEquality().hash(_greenerAlternatives));

  @override
  String toString() {
    return 'RouteEcoImpact(transportMode: $transportMode, co2EstimateKg: $co2EstimateKg, greenerAlternatives: $greenerAlternatives)';
  }
}

/// @nodoc
abstract mixin class _$RouteEcoImpactCopyWith<$Res>
    implements $RouteEcoImpactCopyWith<$Res> {
  factory _$RouteEcoImpactCopyWith(
          _RouteEcoImpact value, $Res Function(_RouteEcoImpact) _then) =
      __$RouteEcoImpactCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String transportMode,
      double co2EstimateKg,
      List<String> greenerAlternatives});
}

/// @nodoc
class __$RouteEcoImpactCopyWithImpl<$Res>
    implements _$RouteEcoImpactCopyWith<$Res> {
  __$RouteEcoImpactCopyWithImpl(this._self, this._then);

  final _RouteEcoImpact _self;
  final $Res Function(_RouteEcoImpact) _then;

  /// Create a copy of RouteEcoImpact
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? transportMode = null,
    Object? co2EstimateKg = null,
    Object? greenerAlternatives = null,
  }) {
    return _then(_RouteEcoImpact(
      transportMode: null == transportMode
          ? _self.transportMode
          : transportMode // ignore: cast_nullable_to_non_nullable
              as String,
      co2EstimateKg: null == co2EstimateKg
          ? _self.co2EstimateKg
          : co2EstimateKg // ignore: cast_nullable_to_non_nullable
              as double,
      greenerAlternatives: null == greenerAlternatives
          ? _self._greenerAlternatives
          : greenerAlternatives // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc
mixin _$RouteGeometry {
  String get type;
  List<List<double>> get coordinates;

  /// Create a copy of RouteGeometry
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $RouteGeometryCopyWith<RouteGeometry> get copyWith =>
      _$RouteGeometryCopyWithImpl<RouteGeometry>(
          this as RouteGeometry, _$identity);

  /// Serializes this RouteGeometry to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is RouteGeometry &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality()
                .equals(other.coordinates, coordinates));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, type, const DeepCollectionEquality().hash(coordinates));

  @override
  String toString() {
    return 'RouteGeometry(type: $type, coordinates: $coordinates)';
  }
}

/// @nodoc
abstract mixin class $RouteGeometryCopyWith<$Res> {
  factory $RouteGeometryCopyWith(
          RouteGeometry value, $Res Function(RouteGeometry) _then) =
      _$RouteGeometryCopyWithImpl;
  @useResult
  $Res call({String type, List<List<double>> coordinates});
}

/// @nodoc
class _$RouteGeometryCopyWithImpl<$Res>
    implements $RouteGeometryCopyWith<$Res> {
  _$RouteGeometryCopyWithImpl(this._self, this._then);

  final RouteGeometry _self;
  final $Res Function(RouteGeometry) _then;

  /// Create a copy of RouteGeometry
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? coordinates = null,
  }) {
    return _then(_self.copyWith(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      coordinates: null == coordinates
          ? _self.coordinates
          : coordinates // ignore: cast_nullable_to_non_nullable
              as List<List<double>>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _RouteGeometry implements RouteGeometry {
  const _RouteGeometry(
      {this.type = 'LineString',
      final List<List<double>> coordinates = const []})
      : _coordinates = coordinates;
  factory _RouteGeometry.fromJson(Map<String, dynamic> json) =>
      _$RouteGeometryFromJson(json);

  @override
  @JsonKey()
  final String type;
  final List<List<double>> _coordinates;
  @override
  @JsonKey()
  List<List<double>> get coordinates {
    if (_coordinates is EqualUnmodifiableListView) return _coordinates;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_coordinates);
  }

  /// Create a copy of RouteGeometry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$RouteGeometryCopyWith<_RouteGeometry> get copyWith =>
      __$RouteGeometryCopyWithImpl<_RouteGeometry>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$RouteGeometryToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _RouteGeometry &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality()
                .equals(other._coordinates, _coordinates));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, type, const DeepCollectionEquality().hash(_coordinates));

  @override
  String toString() {
    return 'RouteGeometry(type: $type, coordinates: $coordinates)';
  }
}

/// @nodoc
abstract mixin class _$RouteGeometryCopyWith<$Res>
    implements $RouteGeometryCopyWith<$Res> {
  factory _$RouteGeometryCopyWith(
          _RouteGeometry value, $Res Function(_RouteGeometry) _then) =
      __$RouteGeometryCopyWithImpl;
  @override
  @useResult
  $Res call({String type, List<List<double>> coordinates});
}

/// @nodoc
class __$RouteGeometryCopyWithImpl<$Res>
    implements _$RouteGeometryCopyWith<$Res> {
  __$RouteGeometryCopyWithImpl(this._self, this._then);

  final _RouteGeometry _self;
  final $Res Function(_RouteGeometry) _then;

  /// Create a copy of RouteGeometry
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? type = null,
    Object? coordinates = null,
  }) {
    return _then(_RouteGeometry(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      coordinates: null == coordinates
          ? _self._coordinates
          : coordinates // ignore: cast_nullable_to_non_nullable
              as List<List<double>>,
    ));
  }
}

/// @nodoc
mixin _$RouteCommentModel {
  String get id;
  String get author;
  String get content;
  String? get createdAt;

  /// Create a copy of RouteCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $RouteCommentModelCopyWith<RouteCommentModel> get copyWith =>
      _$RouteCommentModelCopyWithImpl<RouteCommentModel>(
          this as RouteCommentModel, _$identity);

  /// Serializes this RouteCommentModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is RouteCommentModel &&
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
    return 'RouteCommentModel(id: $id, author: $author, content: $content, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class $RouteCommentModelCopyWith<$Res> {
  factory $RouteCommentModelCopyWith(
          RouteCommentModel value, $Res Function(RouteCommentModel) _then) =
      _$RouteCommentModelCopyWithImpl;
  @useResult
  $Res call({String id, String author, String content, String? createdAt});
}

/// @nodoc
class _$RouteCommentModelCopyWithImpl<$Res>
    implements $RouteCommentModelCopyWith<$Res> {
  _$RouteCommentModelCopyWithImpl(this._self, this._then);

  final RouteCommentModel _self;
  final $Res Function(RouteCommentModel) _then;

  /// Create a copy of RouteCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? author = null,
    Object? content = null,
    Object? createdAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      author: null == author
          ? _self.author
          : author // ignore: cast_nullable_to_non_nullable
              as String,
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
}

/// @nodoc
@JsonSerializable()
class _RouteCommentModel implements RouteCommentModel {
  const _RouteCommentModel(
      {required this.id,
      this.author = 'Anonymous',
      this.content = '',
      this.createdAt});
  factory _RouteCommentModel.fromJson(Map<String, dynamic> json) =>
      _$RouteCommentModelFromJson(json);

  @override
  final String id;
  @override
  @JsonKey()
  final String author;
  @override
  @JsonKey()
  final String content;
  @override
  final String? createdAt;

  /// Create a copy of RouteCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$RouteCommentModelCopyWith<_RouteCommentModel> get copyWith =>
      __$RouteCommentModelCopyWithImpl<_RouteCommentModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$RouteCommentModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _RouteCommentModel &&
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
    return 'RouteCommentModel(id: $id, author: $author, content: $content, createdAt: $createdAt)';
  }
}

/// @nodoc
abstract mixin class _$RouteCommentModelCopyWith<$Res>
    implements $RouteCommentModelCopyWith<$Res> {
  factory _$RouteCommentModelCopyWith(
          _RouteCommentModel value, $Res Function(_RouteCommentModel) _then) =
      __$RouteCommentModelCopyWithImpl;
  @override
  @useResult
  $Res call({String id, String author, String content, String? createdAt});
}

/// @nodoc
class __$RouteCommentModelCopyWithImpl<$Res>
    implements _$RouteCommentModelCopyWith<$Res> {
  __$RouteCommentModelCopyWithImpl(this._self, this._then);

  final _RouteCommentModel _self;
  final $Res Function(_RouteCommentModel) _then;

  /// Create a copy of RouteCommentModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? author = null,
    Object? content = null,
    Object? createdAt = freezed,
  }) {
    return _then(_RouteCommentModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      author: null == author
          ? _self.author
          : author // ignore: cast_nullable_to_non_nullable
              as String,
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
}

// dart format on
