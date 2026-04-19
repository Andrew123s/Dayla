// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'trip_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TripModel {
  String get id;
  String get name;
  String get description;
  TripOwner? get owner;
  List<TripCollaborator> get collaborators;
  TripDestination? get destination;
  TripDates? get dates;
  TripBudget? get budget;
  String get status;
  List<String> get tags;
  String? get category;
  double get ecoScore;
  String? get coverImage;
  String? get notes;
  bool get isPublic;
  String? get createdAt;
  String? get updatedAt;

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripModelCopyWith<TripModel> get copyWith =>
      _$TripModelCopyWithImpl<TripModel>(this as TripModel, _$identity);

  /// Serializes this TripModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.owner, owner) || other.owner == owner) &&
            const DeepCollectionEquality()
                .equals(other.collaborators, collaborators) &&
            (identical(other.destination, destination) ||
                other.destination == destination) &&
            (identical(other.dates, dates) || other.dates == dates) &&
            (identical(other.budget, budget) || other.budget == budget) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(other.tags, tags) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.ecoScore, ecoScore) ||
                other.ecoScore == ecoScore) &&
            (identical(other.coverImage, coverImage) ||
                other.coverImage == coverImage) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.isPublic, isPublic) ||
                other.isPublic == isPublic) &&
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
      name,
      description,
      owner,
      const DeepCollectionEquality().hash(collaborators),
      destination,
      dates,
      budget,
      status,
      const DeepCollectionEquality().hash(tags),
      category,
      ecoScore,
      coverImage,
      notes,
      isPublic,
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'TripModel(id: $id, name: $name, description: $description, owner: $owner, collaborators: $collaborators, destination: $destination, dates: $dates, budget: $budget, status: $status, tags: $tags, category: $category, ecoScore: $ecoScore, coverImage: $coverImage, notes: $notes, isPublic: $isPublic, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class $TripModelCopyWith<$Res> {
  factory $TripModelCopyWith(TripModel value, $Res Function(TripModel) _then) =
      _$TripModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String description,
      TripOwner? owner,
      List<TripCollaborator> collaborators,
      TripDestination? destination,
      TripDates? dates,
      TripBudget? budget,
      String status,
      List<String> tags,
      String? category,
      double ecoScore,
      String? coverImage,
      String? notes,
      bool isPublic,
      String? createdAt,
      String? updatedAt});

  $TripOwnerCopyWith<$Res>? get owner;
  $TripDestinationCopyWith<$Res>? get destination;
  $TripDatesCopyWith<$Res>? get dates;
  $TripBudgetCopyWith<$Res>? get budget;
}

/// @nodoc
class _$TripModelCopyWithImpl<$Res> implements $TripModelCopyWith<$Res> {
  _$TripModelCopyWithImpl(this._self, this._then);

  final TripModel _self;
  final $Res Function(TripModel) _then;

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? owner = freezed,
    Object? collaborators = null,
    Object? destination = freezed,
    Object? dates = freezed,
    Object? budget = freezed,
    Object? status = null,
    Object? tags = null,
    Object? category = freezed,
    Object? ecoScore = null,
    Object? coverImage = freezed,
    Object? notes = freezed,
    Object? isPublic = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
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
      description: null == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      owner: freezed == owner
          ? _self.owner
          : owner // ignore: cast_nullable_to_non_nullable
              as TripOwner?,
      collaborators: null == collaborators
          ? _self.collaborators
          : collaborators // ignore: cast_nullable_to_non_nullable
              as List<TripCollaborator>,
      destination: freezed == destination
          ? _self.destination
          : destination // ignore: cast_nullable_to_non_nullable
              as TripDestination?,
      dates: freezed == dates
          ? _self.dates
          : dates // ignore: cast_nullable_to_non_nullable
              as TripDates?,
      budget: freezed == budget
          ? _self.budget
          : budget // ignore: cast_nullable_to_non_nullable
              as TripBudget?,
      status: null == status
          ? _self.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      tags: null == tags
          ? _self.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      category: freezed == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String?,
      ecoScore: null == ecoScore
          ? _self.ecoScore
          : ecoScore // ignore: cast_nullable_to_non_nullable
              as double,
      coverImage: freezed == coverImage
          ? _self.coverImage
          : coverImage // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _self.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      isPublic: null == isPublic
          ? _self.isPublic
          : isPublic // ignore: cast_nullable_to_non_nullable
              as bool,
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

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripOwnerCopyWith<$Res>? get owner {
    if (_self.owner == null) {
      return null;
    }

    return $TripOwnerCopyWith<$Res>(_self.owner!, (value) {
      return _then(_self.copyWith(owner: value));
    });
  }

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripDestinationCopyWith<$Res>? get destination {
    if (_self.destination == null) {
      return null;
    }

    return $TripDestinationCopyWith<$Res>(_self.destination!, (value) {
      return _then(_self.copyWith(destination: value));
    });
  }

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripDatesCopyWith<$Res>? get dates {
    if (_self.dates == null) {
      return null;
    }

    return $TripDatesCopyWith<$Res>(_self.dates!, (value) {
      return _then(_self.copyWith(dates: value));
    });
  }

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripBudgetCopyWith<$Res>? get budget {
    if (_self.budget == null) {
      return null;
    }

    return $TripBudgetCopyWith<$Res>(_self.budget!, (value) {
      return _then(_self.copyWith(budget: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _TripModel implements TripModel {
  const _TripModel(
      {required this.id,
      required this.name,
      this.description = '',
      this.owner,
      final List<TripCollaborator> collaborators = const [],
      this.destination,
      this.dates,
      this.budget,
      this.status = 'planning',
      final List<String> tags = const [],
      this.category,
      this.ecoScore = 0,
      this.coverImage,
      this.notes,
      this.isPublic = false,
      this.createdAt,
      this.updatedAt})
      : _collaborators = collaborators,
        _tags = tags;
  factory _TripModel.fromJson(Map<String, dynamic> json) =>
      _$TripModelFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey()
  final String description;
  @override
  final TripOwner? owner;
  final List<TripCollaborator> _collaborators;
  @override
  @JsonKey()
  List<TripCollaborator> get collaborators {
    if (_collaborators is EqualUnmodifiableListView) return _collaborators;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_collaborators);
  }

  @override
  final TripDestination? destination;
  @override
  final TripDates? dates;
  @override
  final TripBudget? budget;
  @override
  @JsonKey()
  final String status;
  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  @override
  final String? category;
  @override
  @JsonKey()
  final double ecoScore;
  @override
  final String? coverImage;
  @override
  final String? notes;
  @override
  @JsonKey()
  final bool isPublic;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripModelCopyWith<_TripModel> get copyWith =>
      __$TripModelCopyWithImpl<_TripModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.owner, owner) || other.owner == owner) &&
            const DeepCollectionEquality()
                .equals(other._collaborators, _collaborators) &&
            (identical(other.destination, destination) ||
                other.destination == destination) &&
            (identical(other.dates, dates) || other.dates == dates) &&
            (identical(other.budget, budget) || other.budget == budget) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.ecoScore, ecoScore) ||
                other.ecoScore == ecoScore) &&
            (identical(other.coverImage, coverImage) ||
                other.coverImage == coverImage) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.isPublic, isPublic) ||
                other.isPublic == isPublic) &&
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
      name,
      description,
      owner,
      const DeepCollectionEquality().hash(_collaborators),
      destination,
      dates,
      budget,
      status,
      const DeepCollectionEquality().hash(_tags),
      category,
      ecoScore,
      coverImage,
      notes,
      isPublic,
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'TripModel(id: $id, name: $name, description: $description, owner: $owner, collaborators: $collaborators, destination: $destination, dates: $dates, budget: $budget, status: $status, tags: $tags, category: $category, ecoScore: $ecoScore, coverImage: $coverImage, notes: $notes, isPublic: $isPublic, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class _$TripModelCopyWith<$Res>
    implements $TripModelCopyWith<$Res> {
  factory _$TripModelCopyWith(
          _TripModel value, $Res Function(_TripModel) _then) =
      __$TripModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String description,
      TripOwner? owner,
      List<TripCollaborator> collaborators,
      TripDestination? destination,
      TripDates? dates,
      TripBudget? budget,
      String status,
      List<String> tags,
      String? category,
      double ecoScore,
      String? coverImage,
      String? notes,
      bool isPublic,
      String? createdAt,
      String? updatedAt});

  @override
  $TripOwnerCopyWith<$Res>? get owner;
  @override
  $TripDestinationCopyWith<$Res>? get destination;
  @override
  $TripDatesCopyWith<$Res>? get dates;
  @override
  $TripBudgetCopyWith<$Res>? get budget;
}

/// @nodoc
class __$TripModelCopyWithImpl<$Res> implements _$TripModelCopyWith<$Res> {
  __$TripModelCopyWithImpl(this._self, this._then);

  final _TripModel _self;
  final $Res Function(_TripModel) _then;

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? owner = freezed,
    Object? collaborators = null,
    Object? destination = freezed,
    Object? dates = freezed,
    Object? budget = freezed,
    Object? status = null,
    Object? tags = null,
    Object? category = freezed,
    Object? ecoScore = null,
    Object? coverImage = freezed,
    Object? notes = freezed,
    Object? isPublic = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_TripModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      owner: freezed == owner
          ? _self.owner
          : owner // ignore: cast_nullable_to_non_nullable
              as TripOwner?,
      collaborators: null == collaborators
          ? _self._collaborators
          : collaborators // ignore: cast_nullable_to_non_nullable
              as List<TripCollaborator>,
      destination: freezed == destination
          ? _self.destination
          : destination // ignore: cast_nullable_to_non_nullable
              as TripDestination?,
      dates: freezed == dates
          ? _self.dates
          : dates // ignore: cast_nullable_to_non_nullable
              as TripDates?,
      budget: freezed == budget
          ? _self.budget
          : budget // ignore: cast_nullable_to_non_nullable
              as TripBudget?,
      status: null == status
          ? _self.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      tags: null == tags
          ? _self._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>,
      category: freezed == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String?,
      ecoScore: null == ecoScore
          ? _self.ecoScore
          : ecoScore // ignore: cast_nullable_to_non_nullable
              as double,
      coverImage: freezed == coverImage
          ? _self.coverImage
          : coverImage // ignore: cast_nullable_to_non_nullable
              as String?,
      notes: freezed == notes
          ? _self.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String?,
      isPublic: null == isPublic
          ? _self.isPublic
          : isPublic // ignore: cast_nullable_to_non_nullable
              as bool,
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

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripOwnerCopyWith<$Res>? get owner {
    if (_self.owner == null) {
      return null;
    }

    return $TripOwnerCopyWith<$Res>(_self.owner!, (value) {
      return _then(_self.copyWith(owner: value));
    });
  }

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripDestinationCopyWith<$Res>? get destination {
    if (_self.destination == null) {
      return null;
    }

    return $TripDestinationCopyWith<$Res>(_self.destination!, (value) {
      return _then(_self.copyWith(destination: value));
    });
  }

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripDatesCopyWith<$Res>? get dates {
    if (_self.dates == null) {
      return null;
    }

    return $TripDatesCopyWith<$Res>(_self.dates!, (value) {
      return _then(_self.copyWith(dates: value));
    });
  }

  /// Create a copy of TripModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripBudgetCopyWith<$Res>? get budget {
    if (_self.budget == null) {
      return null;
    }

    return $TripBudgetCopyWith<$Res>(_self.budget!, (value) {
      return _then(_self.copyWith(budget: value));
    });
  }
}

/// @nodoc
mixin _$TripOwner {
  String get id;
  String get name;
  String? get avatar;

  /// Create a copy of TripOwner
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripOwnerCopyWith<TripOwner> get copyWith =>
      _$TripOwnerCopyWithImpl<TripOwner>(this as TripOwner, _$identity);

  /// Serializes this TripOwner to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripOwner &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'TripOwner(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class $TripOwnerCopyWith<$Res> {
  factory $TripOwnerCopyWith(TripOwner value, $Res Function(TripOwner) _then) =
      _$TripOwnerCopyWithImpl;
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class _$TripOwnerCopyWithImpl<$Res> implements $TripOwnerCopyWith<$Res> {
  _$TripOwnerCopyWithImpl(this._self, this._then);

  final TripOwner _self;
  final $Res Function(TripOwner) _then;

  /// Create a copy of TripOwner
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
class _TripOwner implements TripOwner {
  const _TripOwner({required this.id, required this.name, this.avatar});
  factory _TripOwner.fromJson(Map<String, dynamic> json) =>
      _$TripOwnerFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? avatar;

  /// Create a copy of TripOwner
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripOwnerCopyWith<_TripOwner> get copyWith =>
      __$TripOwnerCopyWithImpl<_TripOwner>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripOwnerToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripOwner &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'TripOwner(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class _$TripOwnerCopyWith<$Res>
    implements $TripOwnerCopyWith<$Res> {
  factory _$TripOwnerCopyWith(
          _TripOwner value, $Res Function(_TripOwner) _then) =
      __$TripOwnerCopyWithImpl;
  @override
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class __$TripOwnerCopyWithImpl<$Res> implements _$TripOwnerCopyWith<$Res> {
  __$TripOwnerCopyWithImpl(this._self, this._then);

  final _TripOwner _self;
  final $Res Function(_TripOwner) _then;

  /// Create a copy of TripOwner
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
  }) {
    return _then(_TripOwner(
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
mixin _$TripCollaborator {
  String get id;
  String get name;
  String? get avatar;

  /// Create a copy of TripCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripCollaboratorCopyWith<TripCollaborator> get copyWith =>
      _$TripCollaboratorCopyWithImpl<TripCollaborator>(
          this as TripCollaborator, _$identity);

  /// Serializes this TripCollaborator to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripCollaborator &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'TripCollaborator(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class $TripCollaboratorCopyWith<$Res> {
  factory $TripCollaboratorCopyWith(
          TripCollaborator value, $Res Function(TripCollaborator) _then) =
      _$TripCollaboratorCopyWithImpl;
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class _$TripCollaboratorCopyWithImpl<$Res>
    implements $TripCollaboratorCopyWith<$Res> {
  _$TripCollaboratorCopyWithImpl(this._self, this._then);

  final TripCollaborator _self;
  final $Res Function(TripCollaborator) _then;

  /// Create a copy of TripCollaborator
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
class _TripCollaborator implements TripCollaborator {
  const _TripCollaborator({required this.id, required this.name, this.avatar});
  factory _TripCollaborator.fromJson(Map<String, dynamic> json) =>
      _$TripCollaboratorFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? avatar;

  /// Create a copy of TripCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripCollaboratorCopyWith<_TripCollaborator> get copyWith =>
      __$TripCollaboratorCopyWithImpl<_TripCollaborator>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripCollaboratorToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripCollaborator &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, avatar);

  @override
  String toString() {
    return 'TripCollaborator(id: $id, name: $name, avatar: $avatar)';
  }
}

/// @nodoc
abstract mixin class _$TripCollaboratorCopyWith<$Res>
    implements $TripCollaboratorCopyWith<$Res> {
  factory _$TripCollaboratorCopyWith(
          _TripCollaborator value, $Res Function(_TripCollaborator) _then) =
      __$TripCollaboratorCopyWithImpl;
  @override
  @useResult
  $Res call({String id, String name, String? avatar});
}

/// @nodoc
class __$TripCollaboratorCopyWithImpl<$Res>
    implements _$TripCollaboratorCopyWith<$Res> {
  __$TripCollaboratorCopyWithImpl(this._self, this._then);

  final _TripCollaborator _self;
  final $Res Function(_TripCollaborator) _then;

  /// Create a copy of TripCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? avatar = freezed,
  }) {
    return _then(_TripCollaborator(
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
mixin _$TripDestination {
  String? get name;
  TripCoordinates? get coordinates;
  String? get country;
  String? get region;

  /// Create a copy of TripDestination
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripDestinationCopyWith<TripDestination> get copyWith =>
      _$TripDestinationCopyWithImpl<TripDestination>(
          this as TripDestination, _$identity);

  /// Serializes this TripDestination to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripDestination &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.coordinates, coordinates) ||
                other.coordinates == coordinates) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.region, region) || other.region == region));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, name, coordinates, country, region);

  @override
  String toString() {
    return 'TripDestination(name: $name, coordinates: $coordinates, country: $country, region: $region)';
  }
}

/// @nodoc
abstract mixin class $TripDestinationCopyWith<$Res> {
  factory $TripDestinationCopyWith(
          TripDestination value, $Res Function(TripDestination) _then) =
      _$TripDestinationCopyWithImpl;
  @useResult
  $Res call(
      {String? name,
      TripCoordinates? coordinates,
      String? country,
      String? region});

  $TripCoordinatesCopyWith<$Res>? get coordinates;
}

/// @nodoc
class _$TripDestinationCopyWithImpl<$Res>
    implements $TripDestinationCopyWith<$Res> {
  _$TripDestinationCopyWithImpl(this._self, this._then);

  final TripDestination _self;
  final $Res Function(TripDestination) _then;

  /// Create a copy of TripDestination
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = freezed,
    Object? coordinates = freezed,
    Object? country = freezed,
    Object? region = freezed,
  }) {
    return _then(_self.copyWith(
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      coordinates: freezed == coordinates
          ? _self.coordinates
          : coordinates // ignore: cast_nullable_to_non_nullable
              as TripCoordinates?,
      country: freezed == country
          ? _self.country
          : country // ignore: cast_nullable_to_non_nullable
              as String?,
      region: freezed == region
          ? _self.region
          : region // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of TripDestination
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripCoordinatesCopyWith<$Res>? get coordinates {
    if (_self.coordinates == null) {
      return null;
    }

    return $TripCoordinatesCopyWith<$Res>(_self.coordinates!, (value) {
      return _then(_self.copyWith(coordinates: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _TripDestination implements TripDestination {
  const _TripDestination(
      {this.name, this.coordinates, this.country, this.region});
  factory _TripDestination.fromJson(Map<String, dynamic> json) =>
      _$TripDestinationFromJson(json);

  @override
  final String? name;
  @override
  final TripCoordinates? coordinates;
  @override
  final String? country;
  @override
  final String? region;

  /// Create a copy of TripDestination
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripDestinationCopyWith<_TripDestination> get copyWith =>
      __$TripDestinationCopyWithImpl<_TripDestination>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripDestinationToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripDestination &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.coordinates, coordinates) ||
                other.coordinates == coordinates) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.region, region) || other.region == region));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, name, coordinates, country, region);

  @override
  String toString() {
    return 'TripDestination(name: $name, coordinates: $coordinates, country: $country, region: $region)';
  }
}

/// @nodoc
abstract mixin class _$TripDestinationCopyWith<$Res>
    implements $TripDestinationCopyWith<$Res> {
  factory _$TripDestinationCopyWith(
          _TripDestination value, $Res Function(_TripDestination) _then) =
      __$TripDestinationCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String? name,
      TripCoordinates? coordinates,
      String? country,
      String? region});

  @override
  $TripCoordinatesCopyWith<$Res>? get coordinates;
}

/// @nodoc
class __$TripDestinationCopyWithImpl<$Res>
    implements _$TripDestinationCopyWith<$Res> {
  __$TripDestinationCopyWithImpl(this._self, this._then);

  final _TripDestination _self;
  final $Res Function(_TripDestination) _then;

  /// Create a copy of TripDestination
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? name = freezed,
    Object? coordinates = freezed,
    Object? country = freezed,
    Object? region = freezed,
  }) {
    return _then(_TripDestination(
      name: freezed == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      coordinates: freezed == coordinates
          ? _self.coordinates
          : coordinates // ignore: cast_nullable_to_non_nullable
              as TripCoordinates?,
      country: freezed == country
          ? _self.country
          : country // ignore: cast_nullable_to_non_nullable
              as String?,
      region: freezed == region
          ? _self.region
          : region // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of TripDestination
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripCoordinatesCopyWith<$Res>? get coordinates {
    if (_self.coordinates == null) {
      return null;
    }

    return $TripCoordinatesCopyWith<$Res>(_self.coordinates!, (value) {
      return _then(_self.copyWith(coordinates: value));
    });
  }
}

/// @nodoc
mixin _$TripCoordinates {
  double? get lat;
  double? get lng;

  /// Create a copy of TripCoordinates
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripCoordinatesCopyWith<TripCoordinates> get copyWith =>
      _$TripCoordinatesCopyWithImpl<TripCoordinates>(
          this as TripCoordinates, _$identity);

  /// Serializes this TripCoordinates to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripCoordinates &&
            (identical(other.lat, lat) || other.lat == lat) &&
            (identical(other.lng, lng) || other.lng == lng));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, lat, lng);

  @override
  String toString() {
    return 'TripCoordinates(lat: $lat, lng: $lng)';
  }
}

/// @nodoc
abstract mixin class $TripCoordinatesCopyWith<$Res> {
  factory $TripCoordinatesCopyWith(
          TripCoordinates value, $Res Function(TripCoordinates) _then) =
      _$TripCoordinatesCopyWithImpl;
  @useResult
  $Res call({double? lat, double? lng});
}

/// @nodoc
class _$TripCoordinatesCopyWithImpl<$Res>
    implements $TripCoordinatesCopyWith<$Res> {
  _$TripCoordinatesCopyWithImpl(this._self, this._then);

  final TripCoordinates _self;
  final $Res Function(TripCoordinates) _then;

  /// Create a copy of TripCoordinates
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lat = freezed,
    Object? lng = freezed,
  }) {
    return _then(_self.copyWith(
      lat: freezed == lat
          ? _self.lat
          : lat // ignore: cast_nullable_to_non_nullable
              as double?,
      lng: freezed == lng
          ? _self.lng
          : lng // ignore: cast_nullable_to_non_nullable
              as double?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _TripCoordinates implements TripCoordinates {
  const _TripCoordinates({this.lat, this.lng});
  factory _TripCoordinates.fromJson(Map<String, dynamic> json) =>
      _$TripCoordinatesFromJson(json);

  @override
  final double? lat;
  @override
  final double? lng;

  /// Create a copy of TripCoordinates
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripCoordinatesCopyWith<_TripCoordinates> get copyWith =>
      __$TripCoordinatesCopyWithImpl<_TripCoordinates>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripCoordinatesToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripCoordinates &&
            (identical(other.lat, lat) || other.lat == lat) &&
            (identical(other.lng, lng) || other.lng == lng));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, lat, lng);

  @override
  String toString() {
    return 'TripCoordinates(lat: $lat, lng: $lng)';
  }
}

/// @nodoc
abstract mixin class _$TripCoordinatesCopyWith<$Res>
    implements $TripCoordinatesCopyWith<$Res> {
  factory _$TripCoordinatesCopyWith(
          _TripCoordinates value, $Res Function(_TripCoordinates) _then) =
      __$TripCoordinatesCopyWithImpl;
  @override
  @useResult
  $Res call({double? lat, double? lng});
}

/// @nodoc
class __$TripCoordinatesCopyWithImpl<$Res>
    implements _$TripCoordinatesCopyWith<$Res> {
  __$TripCoordinatesCopyWithImpl(this._self, this._then);

  final _TripCoordinates _self;
  final $Res Function(_TripCoordinates) _then;

  /// Create a copy of TripCoordinates
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? lat = freezed,
    Object? lng = freezed,
  }) {
    return _then(_TripCoordinates(
      lat: freezed == lat
          ? _self.lat
          : lat // ignore: cast_nullable_to_non_nullable
              as double?,
      lng: freezed == lng
          ? _self.lng
          : lng // ignore: cast_nullable_to_non_nullable
              as double?,
    ));
  }
}

/// @nodoc
mixin _$TripDates {
  String? get startDate;
  String? get endDate;

  /// Create a copy of TripDates
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripDatesCopyWith<TripDates> get copyWith =>
      _$TripDatesCopyWithImpl<TripDates>(this as TripDates, _$identity);

  /// Serializes this TripDates to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripDates &&
            (identical(other.startDate, startDate) ||
                other.startDate == startDate) &&
            (identical(other.endDate, endDate) || other.endDate == endDate));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, startDate, endDate);

  @override
  String toString() {
    return 'TripDates(startDate: $startDate, endDate: $endDate)';
  }
}

/// @nodoc
abstract mixin class $TripDatesCopyWith<$Res> {
  factory $TripDatesCopyWith(TripDates value, $Res Function(TripDates) _then) =
      _$TripDatesCopyWithImpl;
  @useResult
  $Res call({String? startDate, String? endDate});
}

/// @nodoc
class _$TripDatesCopyWithImpl<$Res> implements $TripDatesCopyWith<$Res> {
  _$TripDatesCopyWithImpl(this._self, this._then);

  final TripDates _self;
  final $Res Function(TripDates) _then;

  /// Create a copy of TripDates
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? startDate = freezed,
    Object? endDate = freezed,
  }) {
    return _then(_self.copyWith(
      startDate: freezed == startDate
          ? _self.startDate
          : startDate // ignore: cast_nullable_to_non_nullable
              as String?,
      endDate: freezed == endDate
          ? _self.endDate
          : endDate // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _TripDates implements TripDates {
  const _TripDates({this.startDate, this.endDate});
  factory _TripDates.fromJson(Map<String, dynamic> json) =>
      _$TripDatesFromJson(json);

  @override
  final String? startDate;
  @override
  final String? endDate;

  /// Create a copy of TripDates
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripDatesCopyWith<_TripDates> get copyWith =>
      __$TripDatesCopyWithImpl<_TripDates>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripDatesToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripDates &&
            (identical(other.startDate, startDate) ||
                other.startDate == startDate) &&
            (identical(other.endDate, endDate) || other.endDate == endDate));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, startDate, endDate);

  @override
  String toString() {
    return 'TripDates(startDate: $startDate, endDate: $endDate)';
  }
}

/// @nodoc
abstract mixin class _$TripDatesCopyWith<$Res>
    implements $TripDatesCopyWith<$Res> {
  factory _$TripDatesCopyWith(
          _TripDates value, $Res Function(_TripDates) _then) =
      __$TripDatesCopyWithImpl;
  @override
  @useResult
  $Res call({String? startDate, String? endDate});
}

/// @nodoc
class __$TripDatesCopyWithImpl<$Res> implements _$TripDatesCopyWith<$Res> {
  __$TripDatesCopyWithImpl(this._self, this._then);

  final _TripDates _self;
  final $Res Function(_TripDates) _then;

  /// Create a copy of TripDates
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? startDate = freezed,
    Object? endDate = freezed,
  }) {
    return _then(_TripDates(
      startDate: freezed == startDate
          ? _self.startDate
          : startDate // ignore: cast_nullable_to_non_nullable
              as String?,
      endDate: freezed == endDate
          ? _self.endDate
          : endDate // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$TripBudget {
  double get total;
  String get currency;
  BudgetCategories? get categories;

  /// Create a copy of TripBudget
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripBudgetCopyWith<TripBudget> get copyWith =>
      _$TripBudgetCopyWithImpl<TripBudget>(this as TripBudget, _$identity);

  /// Serializes this TripBudget to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripBudget &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.currency, currency) ||
                other.currency == currency) &&
            (identical(other.categories, categories) ||
                other.categories == categories));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, total, currency, categories);

  @override
  String toString() {
    return 'TripBudget(total: $total, currency: $currency, categories: $categories)';
  }
}

/// @nodoc
abstract mixin class $TripBudgetCopyWith<$Res> {
  factory $TripBudgetCopyWith(
          TripBudget value, $Res Function(TripBudget) _then) =
      _$TripBudgetCopyWithImpl;
  @useResult
  $Res call({double total, String currency, BudgetCategories? categories});

  $BudgetCategoriesCopyWith<$Res>? get categories;
}

/// @nodoc
class _$TripBudgetCopyWithImpl<$Res> implements $TripBudgetCopyWith<$Res> {
  _$TripBudgetCopyWithImpl(this._self, this._then);

  final TripBudget _self;
  final $Res Function(TripBudget) _then;

  /// Create a copy of TripBudget
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? currency = null,
    Object? categories = freezed,
  }) {
    return _then(_self.copyWith(
      total: null == total
          ? _self.total
          : total // ignore: cast_nullable_to_non_nullable
              as double,
      currency: null == currency
          ? _self.currency
          : currency // ignore: cast_nullable_to_non_nullable
              as String,
      categories: freezed == categories
          ? _self.categories
          : categories // ignore: cast_nullable_to_non_nullable
              as BudgetCategories?,
    ));
  }

  /// Create a copy of TripBudget
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $BudgetCategoriesCopyWith<$Res>? get categories {
    if (_self.categories == null) {
      return null;
    }

    return $BudgetCategoriesCopyWith<$Res>(_self.categories!, (value) {
      return _then(_self.copyWith(categories: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _TripBudget implements TripBudget {
  const _TripBudget({this.total = 0, this.currency = 'USD', this.categories});
  factory _TripBudget.fromJson(Map<String, dynamic> json) =>
      _$TripBudgetFromJson(json);

  @override
  @JsonKey()
  final double total;
  @override
  @JsonKey()
  final String currency;
  @override
  final BudgetCategories? categories;

  /// Create a copy of TripBudget
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripBudgetCopyWith<_TripBudget> get copyWith =>
      __$TripBudgetCopyWithImpl<_TripBudget>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripBudgetToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripBudget &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.currency, currency) ||
                other.currency == currency) &&
            (identical(other.categories, categories) ||
                other.categories == categories));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, total, currency, categories);

  @override
  String toString() {
    return 'TripBudget(total: $total, currency: $currency, categories: $categories)';
  }
}

/// @nodoc
abstract mixin class _$TripBudgetCopyWith<$Res>
    implements $TripBudgetCopyWith<$Res> {
  factory _$TripBudgetCopyWith(
          _TripBudget value, $Res Function(_TripBudget) _then) =
      __$TripBudgetCopyWithImpl;
  @override
  @useResult
  $Res call({double total, String currency, BudgetCategories? categories});

  @override
  $BudgetCategoriesCopyWith<$Res>? get categories;
}

/// @nodoc
class __$TripBudgetCopyWithImpl<$Res> implements _$TripBudgetCopyWith<$Res> {
  __$TripBudgetCopyWithImpl(this._self, this._then);

  final _TripBudget _self;
  final $Res Function(_TripBudget) _then;

  /// Create a copy of TripBudget
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? total = null,
    Object? currency = null,
    Object? categories = freezed,
  }) {
    return _then(_TripBudget(
      total: null == total
          ? _self.total
          : total // ignore: cast_nullable_to_non_nullable
              as double,
      currency: null == currency
          ? _self.currency
          : currency // ignore: cast_nullable_to_non_nullable
              as String,
      categories: freezed == categories
          ? _self.categories
          : categories // ignore: cast_nullable_to_non_nullable
              as BudgetCategories?,
    ));
  }

  /// Create a copy of TripBudget
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $BudgetCategoriesCopyWith<$Res>? get categories {
    if (_self.categories == null) {
      return null;
    }

    return $BudgetCategoriesCopyWith<$Res>(_self.categories!, (value) {
      return _then(_self.copyWith(categories: value));
    });
  }
}

/// @nodoc
mixin _$BudgetCategories {
  double get accommodation;
  double get transportation;
  double get food;
  double get activities;
  double get other;

  /// Create a copy of BudgetCategories
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BudgetCategoriesCopyWith<BudgetCategories> get copyWith =>
      _$BudgetCategoriesCopyWithImpl<BudgetCategories>(
          this as BudgetCategories, _$identity);

  /// Serializes this BudgetCategories to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BudgetCategories &&
            (identical(other.accommodation, accommodation) ||
                other.accommodation == accommodation) &&
            (identical(other.transportation, transportation) ||
                other.transportation == transportation) &&
            (identical(other.food, food) || other.food == food) &&
            (identical(other.activities, activities) ||
                other.activities == activities) &&
            (identical(other.other, this.other) || other.other == this.other));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, accommodation, transportation, food, activities, other);

  @override
  String toString() {
    return 'BudgetCategories(accommodation: $accommodation, transportation: $transportation, food: $food, activities: $activities, other: $other)';
  }
}

/// @nodoc
abstract mixin class $BudgetCategoriesCopyWith<$Res> {
  factory $BudgetCategoriesCopyWith(
          BudgetCategories value, $Res Function(BudgetCategories) _then) =
      _$BudgetCategoriesCopyWithImpl;
  @useResult
  $Res call(
      {double accommodation,
      double transportation,
      double food,
      double activities,
      double other});
}

/// @nodoc
class _$BudgetCategoriesCopyWithImpl<$Res>
    implements $BudgetCategoriesCopyWith<$Res> {
  _$BudgetCategoriesCopyWithImpl(this._self, this._then);

  final BudgetCategories _self;
  final $Res Function(BudgetCategories) _then;

  /// Create a copy of BudgetCategories
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accommodation = null,
    Object? transportation = null,
    Object? food = null,
    Object? activities = null,
    Object? other = null,
  }) {
    return _then(_self.copyWith(
      accommodation: null == accommodation
          ? _self.accommodation
          : accommodation // ignore: cast_nullable_to_non_nullable
              as double,
      transportation: null == transportation
          ? _self.transportation
          : transportation // ignore: cast_nullable_to_non_nullable
              as double,
      food: null == food
          ? _self.food
          : food // ignore: cast_nullable_to_non_nullable
              as double,
      activities: null == activities
          ? _self.activities
          : activities // ignore: cast_nullable_to_non_nullable
              as double,
      other: null == other
          ? _self.other
          : other // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _BudgetCategories implements BudgetCategories {
  const _BudgetCategories(
      {this.accommodation = 0,
      this.transportation = 0,
      this.food = 0,
      this.activities = 0,
      this.other = 0});
  factory _BudgetCategories.fromJson(Map<String, dynamic> json) =>
      _$BudgetCategoriesFromJson(json);

  @override
  @JsonKey()
  final double accommodation;
  @override
  @JsonKey()
  final double transportation;
  @override
  @JsonKey()
  final double food;
  @override
  @JsonKey()
  final double activities;
  @override
  @JsonKey()
  final double other;

  /// Create a copy of BudgetCategories
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$BudgetCategoriesCopyWith<_BudgetCategories> get copyWith =>
      __$BudgetCategoriesCopyWithImpl<_BudgetCategories>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BudgetCategoriesToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _BudgetCategories &&
            (identical(other.accommodation, accommodation) ||
                other.accommodation == accommodation) &&
            (identical(other.transportation, transportation) ||
                other.transportation == transportation) &&
            (identical(other.food, food) || other.food == food) &&
            (identical(other.activities, activities) ||
                other.activities == activities) &&
            (identical(other.other, this.other) || other.other == this.other));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, accommodation, transportation, food, activities, other);

  @override
  String toString() {
    return 'BudgetCategories(accommodation: $accommodation, transportation: $transportation, food: $food, activities: $activities, other: $other)';
  }
}

/// @nodoc
abstract mixin class _$BudgetCategoriesCopyWith<$Res>
    implements $BudgetCategoriesCopyWith<$Res> {
  factory _$BudgetCategoriesCopyWith(
          _BudgetCategories value, $Res Function(_BudgetCategories) _then) =
      __$BudgetCategoriesCopyWithImpl;
  @override
  @useResult
  $Res call(
      {double accommodation,
      double transportation,
      double food,
      double activities,
      double other});
}

/// @nodoc
class __$BudgetCategoriesCopyWithImpl<$Res>
    implements _$BudgetCategoriesCopyWith<$Res> {
  __$BudgetCategoriesCopyWithImpl(this._self, this._then);

  final _BudgetCategories _self;
  final $Res Function(_BudgetCategories) _then;

  /// Create a copy of BudgetCategories
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? accommodation = null,
    Object? transportation = null,
    Object? food = null,
    Object? activities = null,
    Object? other = null,
  }) {
    return _then(_BudgetCategories(
      accommodation: null == accommodation
          ? _self.accommodation
          : accommodation // ignore: cast_nullable_to_non_nullable
              as double,
      transportation: null == transportation
          ? _self.transportation
          : transportation // ignore: cast_nullable_to_non_nullable
              as double,
      food: null == food
          ? _self.food
          : food // ignore: cast_nullable_to_non_nullable
              as double,
      activities: null == activities
          ? _self.activities
          : activities // ignore: cast_nullable_to_non_nullable
              as double,
      other: null == other
          ? _self.other
          : other // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
mixin _$BoardModel {
  String get id;
  String get tripId;
  String get name;
  String? get description;
  TripOwner? get owner;
  List<BoardCollaborator> get collaborators;
  List<StickyNoteModel> get notes;
  String? get createdAt;
  String? get updatedAt;

  /// Create a copy of BoardModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BoardModelCopyWith<BoardModel> get copyWith =>
      _$BoardModelCopyWithImpl<BoardModel>(this as BoardModel, _$identity);

  /// Serializes this BoardModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BoardModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.owner, owner) || other.owner == owner) &&
            const DeepCollectionEquality()
                .equals(other.collaborators, collaborators) &&
            const DeepCollectionEquality().equals(other.notes, notes) &&
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
      tripId,
      name,
      description,
      owner,
      const DeepCollectionEquality().hash(collaborators),
      const DeepCollectionEquality().hash(notes),
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'BoardModel(id: $id, tripId: $tripId, name: $name, description: $description, owner: $owner, collaborators: $collaborators, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class $BoardModelCopyWith<$Res> {
  factory $BoardModelCopyWith(
          BoardModel value, $Res Function(BoardModel) _then) =
      _$BoardModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String tripId,
      String name,
      String? description,
      TripOwner? owner,
      List<BoardCollaborator> collaborators,
      List<StickyNoteModel> notes,
      String? createdAt,
      String? updatedAt});

  $TripOwnerCopyWith<$Res>? get owner;
}

/// @nodoc
class _$BoardModelCopyWithImpl<$Res> implements $BoardModelCopyWith<$Res> {
  _$BoardModelCopyWithImpl(this._self, this._then);

  final BoardModel _self;
  final $Res Function(BoardModel) _then;

  /// Create a copy of BoardModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tripId = null,
    Object? name = null,
    Object? description = freezed,
    Object? owner = freezed,
    Object? collaborators = null,
    Object? notes = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      tripId: null == tripId
          ? _self.tripId
          : tripId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      owner: freezed == owner
          ? _self.owner
          : owner // ignore: cast_nullable_to_non_nullable
              as TripOwner?,
      collaborators: null == collaborators
          ? _self.collaborators
          : collaborators // ignore: cast_nullable_to_non_nullable
              as List<BoardCollaborator>,
      notes: null == notes
          ? _self.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as List<StickyNoteModel>,
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

  /// Create a copy of BoardModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripOwnerCopyWith<$Res>? get owner {
    if (_self.owner == null) {
      return null;
    }

    return $TripOwnerCopyWith<$Res>(_self.owner!, (value) {
      return _then(_self.copyWith(owner: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _BoardModel implements BoardModel {
  const _BoardModel(
      {required this.id,
      required this.tripId,
      required this.name,
      this.description,
      this.owner,
      final List<BoardCollaborator> collaborators = const [],
      final List<StickyNoteModel> notes = const [],
      this.createdAt,
      this.updatedAt})
      : _collaborators = collaborators,
        _notes = notes;
  factory _BoardModel.fromJson(Map<String, dynamic> json) =>
      _$BoardModelFromJson(json);

  @override
  final String id;
  @override
  final String tripId;
  @override
  final String name;
  @override
  final String? description;
  @override
  final TripOwner? owner;
  final List<BoardCollaborator> _collaborators;
  @override
  @JsonKey()
  List<BoardCollaborator> get collaborators {
    if (_collaborators is EqualUnmodifiableListView) return _collaborators;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_collaborators);
  }

  final List<StickyNoteModel> _notes;
  @override
  @JsonKey()
  List<StickyNoteModel> get notes {
    if (_notes is EqualUnmodifiableListView) return _notes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_notes);
  }

  @override
  final String? createdAt;
  @override
  final String? updatedAt;

  /// Create a copy of BoardModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$BoardModelCopyWith<_BoardModel> get copyWith =>
      __$BoardModelCopyWithImpl<_BoardModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BoardModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _BoardModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.owner, owner) || other.owner == owner) &&
            const DeepCollectionEquality()
                .equals(other._collaborators, _collaborators) &&
            const DeepCollectionEquality().equals(other._notes, _notes) &&
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
      tripId,
      name,
      description,
      owner,
      const DeepCollectionEquality().hash(_collaborators),
      const DeepCollectionEquality().hash(_notes),
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'BoardModel(id: $id, tripId: $tripId, name: $name, description: $description, owner: $owner, collaborators: $collaborators, notes: $notes, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class _$BoardModelCopyWith<$Res>
    implements $BoardModelCopyWith<$Res> {
  factory _$BoardModelCopyWith(
          _BoardModel value, $Res Function(_BoardModel) _then) =
      __$BoardModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String tripId,
      String name,
      String? description,
      TripOwner? owner,
      List<BoardCollaborator> collaborators,
      List<StickyNoteModel> notes,
      String? createdAt,
      String? updatedAt});

  @override
  $TripOwnerCopyWith<$Res>? get owner;
}

/// @nodoc
class __$BoardModelCopyWithImpl<$Res> implements _$BoardModelCopyWith<$Res> {
  __$BoardModelCopyWithImpl(this._self, this._then);

  final _BoardModel _self;
  final $Res Function(_BoardModel) _then;

  /// Create a copy of BoardModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? tripId = null,
    Object? name = null,
    Object? description = freezed,
    Object? owner = freezed,
    Object? collaborators = null,
    Object? notes = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_BoardModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      tripId: null == tripId
          ? _self.tripId
          : tripId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      owner: freezed == owner
          ? _self.owner
          : owner // ignore: cast_nullable_to_non_nullable
              as TripOwner?,
      collaborators: null == collaborators
          ? _self._collaborators
          : collaborators // ignore: cast_nullable_to_non_nullable
              as List<BoardCollaborator>,
      notes: null == notes
          ? _self._notes
          : notes // ignore: cast_nullable_to_non_nullable
              as List<StickyNoteModel>,
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

  /// Create a copy of BoardModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripOwnerCopyWith<$Res>? get owner {
    if (_self.owner == null) {
      return null;
    }

    return $TripOwnerCopyWith<$Res>(_self.owner!, (value) {
      return _then(_self.copyWith(owner: value));
    });
  }
}

/// @nodoc
mixin _$BoardCollaborator {
  TripCollaborator? get user;
  String get role;
  String? get joinedAt;

  /// Create a copy of BoardCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $BoardCollaboratorCopyWith<BoardCollaborator> get copyWith =>
      _$BoardCollaboratorCopyWithImpl<BoardCollaborator>(
          this as BoardCollaborator, _$identity);

  /// Serializes this BoardCollaborator to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is BoardCollaborator &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.joinedAt, joinedAt) ||
                other.joinedAt == joinedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, user, role, joinedAt);

  @override
  String toString() {
    return 'BoardCollaborator(user: $user, role: $role, joinedAt: $joinedAt)';
  }
}

/// @nodoc
abstract mixin class $BoardCollaboratorCopyWith<$Res> {
  factory $BoardCollaboratorCopyWith(
          BoardCollaborator value, $Res Function(BoardCollaborator) _then) =
      _$BoardCollaboratorCopyWithImpl;
  @useResult
  $Res call({TripCollaborator? user, String role, String? joinedAt});

  $TripCollaboratorCopyWith<$Res>? get user;
}

/// @nodoc
class _$BoardCollaboratorCopyWithImpl<$Res>
    implements $BoardCollaboratorCopyWith<$Res> {
  _$BoardCollaboratorCopyWithImpl(this._self, this._then);

  final BoardCollaborator _self;
  final $Res Function(BoardCollaborator) _then;

  /// Create a copy of BoardCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? user = freezed,
    Object? role = null,
    Object? joinedAt = freezed,
  }) {
    return _then(_self.copyWith(
      user: freezed == user
          ? _self.user
          : user // ignore: cast_nullable_to_non_nullable
              as TripCollaborator?,
      role: null == role
          ? _self.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      joinedAt: freezed == joinedAt
          ? _self.joinedAt
          : joinedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of BoardCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripCollaboratorCopyWith<$Res>? get user {
    if (_self.user == null) {
      return null;
    }

    return $TripCollaboratorCopyWith<$Res>(_self.user!, (value) {
      return _then(_self.copyWith(user: value));
    });
  }
}

/// @nodoc
@JsonSerializable()
class _BoardCollaborator implements BoardCollaborator {
  const _BoardCollaborator({this.user, this.role = 'editor', this.joinedAt});
  factory _BoardCollaborator.fromJson(Map<String, dynamic> json) =>
      _$BoardCollaboratorFromJson(json);

  @override
  final TripCollaborator? user;
  @override
  @JsonKey()
  final String role;
  @override
  final String? joinedAt;

  /// Create a copy of BoardCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$BoardCollaboratorCopyWith<_BoardCollaborator> get copyWith =>
      __$BoardCollaboratorCopyWithImpl<_BoardCollaborator>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$BoardCollaboratorToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _BoardCollaborator &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.joinedAt, joinedAt) ||
                other.joinedAt == joinedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, user, role, joinedAt);

  @override
  String toString() {
    return 'BoardCollaborator(user: $user, role: $role, joinedAt: $joinedAt)';
  }
}

/// @nodoc
abstract mixin class _$BoardCollaboratorCopyWith<$Res>
    implements $BoardCollaboratorCopyWith<$Res> {
  factory _$BoardCollaboratorCopyWith(
          _BoardCollaborator value, $Res Function(_BoardCollaborator) _then) =
      __$BoardCollaboratorCopyWithImpl;
  @override
  @useResult
  $Res call({TripCollaborator? user, String role, String? joinedAt});

  @override
  $TripCollaboratorCopyWith<$Res>? get user;
}

/// @nodoc
class __$BoardCollaboratorCopyWithImpl<$Res>
    implements _$BoardCollaboratorCopyWith<$Res> {
  __$BoardCollaboratorCopyWithImpl(this._self, this._then);

  final _BoardCollaborator _self;
  final $Res Function(_BoardCollaborator) _then;

  /// Create a copy of BoardCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? user = freezed,
    Object? role = null,
    Object? joinedAt = freezed,
  }) {
    return _then(_BoardCollaborator(
      user: freezed == user
          ? _self.user
          : user // ignore: cast_nullable_to_non_nullable
              as TripCollaborator?,
      role: null == role
          ? _self.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      joinedAt: freezed == joinedAt
          ? _self.joinedAt
          : joinedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }

  /// Create a copy of BoardCollaborator
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TripCollaboratorCopyWith<$Res>? get user {
    if (_self.user == null) {
      return null;
    }

    return $TripCollaboratorCopyWith<$Res>(_self.user!, (value) {
      return _then(_self.copyWith(user: value));
    });
  }
}

/// @nodoc
mixin _$StickyNoteModel {
  String get id;
  String get type;
  double get x;
  double get y;
  double get width;
  double get height;
  String get content;
  String get color;
  String? get emoji;
  String? get linkTo;
  String? get audioUrl;
  Map<String, dynamic>? get metadata;
  String? get scheduledDate;
  double get scale;

  /// Create a copy of StickyNoteModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $StickyNoteModelCopyWith<StickyNoteModel> get copyWith =>
      _$StickyNoteModelCopyWithImpl<StickyNoteModel>(
          this as StickyNoteModel, _$identity);

  /// Serializes this StickyNoteModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is StickyNoteModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.x, x) || other.x == x) &&
            (identical(other.y, y) || other.y == y) &&
            (identical(other.width, width) || other.width == width) &&
            (identical(other.height, height) || other.height == height) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.color, color) || other.color == color) &&
            (identical(other.emoji, emoji) || other.emoji == emoji) &&
            (identical(other.linkTo, linkTo) || other.linkTo == linkTo) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl) &&
            const DeepCollectionEquality().equals(other.metadata, metadata) &&
            (identical(other.scheduledDate, scheduledDate) ||
                other.scheduledDate == scheduledDate) &&
            (identical(other.scale, scale) || other.scale == scale));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      x,
      y,
      width,
      height,
      content,
      color,
      emoji,
      linkTo,
      audioUrl,
      const DeepCollectionEquality().hash(metadata),
      scheduledDate,
      scale);

  @override
  String toString() {
    return 'StickyNoteModel(id: $id, type: $type, x: $x, y: $y, width: $width, height: $height, content: $content, color: $color, emoji: $emoji, linkTo: $linkTo, audioUrl: $audioUrl, metadata: $metadata, scheduledDate: $scheduledDate, scale: $scale)';
  }
}

/// @nodoc
abstract mixin class $StickyNoteModelCopyWith<$Res> {
  factory $StickyNoteModelCopyWith(
          StickyNoteModel value, $Res Function(StickyNoteModel) _then) =
      _$StickyNoteModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String type,
      double x,
      double y,
      double width,
      double height,
      String content,
      String color,
      String? emoji,
      String? linkTo,
      String? audioUrl,
      Map<String, dynamic>? metadata,
      String? scheduledDate,
      double scale});
}

/// @nodoc
class _$StickyNoteModelCopyWithImpl<$Res>
    implements $StickyNoteModelCopyWith<$Res> {
  _$StickyNoteModelCopyWithImpl(this._self, this._then);

  final StickyNoteModel _self;
  final $Res Function(StickyNoteModel) _then;

  /// Create a copy of StickyNoteModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? x = null,
    Object? y = null,
    Object? width = null,
    Object? height = null,
    Object? content = null,
    Object? color = null,
    Object? emoji = freezed,
    Object? linkTo = freezed,
    Object? audioUrl = freezed,
    Object? metadata = freezed,
    Object? scheduledDate = freezed,
    Object? scale = null,
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
      x: null == x
          ? _self.x
          : x // ignore: cast_nullable_to_non_nullable
              as double,
      y: null == y
          ? _self.y
          : y // ignore: cast_nullable_to_non_nullable
              as double,
      width: null == width
          ? _self.width
          : width // ignore: cast_nullable_to_non_nullable
              as double,
      height: null == height
          ? _self.height
          : height // ignore: cast_nullable_to_non_nullable
              as double,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      color: null == color
          ? _self.color
          : color // ignore: cast_nullable_to_non_nullable
              as String,
      emoji: freezed == emoji
          ? _self.emoji
          : emoji // ignore: cast_nullable_to_non_nullable
              as String?,
      linkTo: freezed == linkTo
          ? _self.linkTo
          : linkTo // ignore: cast_nullable_to_non_nullable
              as String?,
      audioUrl: freezed == audioUrl
          ? _self.audioUrl
          : audioUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      metadata: freezed == metadata
          ? _self.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      scheduledDate: freezed == scheduledDate
          ? _self.scheduledDate
          : scheduledDate // ignore: cast_nullable_to_non_nullable
              as String?,
      scale: null == scale
          ? _self.scale
          : scale // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _StickyNoteModel implements StickyNoteModel {
  const _StickyNoteModel(
      {required this.id,
      required this.type,
      required this.x,
      required this.y,
      required this.width,
      required this.height,
      this.content = '',
      this.color = '#faedcd',
      this.emoji,
      this.linkTo,
      this.audioUrl,
      final Map<String, dynamic>? metadata,
      this.scheduledDate,
      this.scale = 1.0})
      : _metadata = metadata;
  factory _StickyNoteModel.fromJson(Map<String, dynamic> json) =>
      _$StickyNoteModelFromJson(json);

  @override
  final String id;
  @override
  final String type;
  @override
  final double x;
  @override
  final double y;
  @override
  final double width;
  @override
  final double height;
  @override
  @JsonKey()
  final String content;
  @override
  @JsonKey()
  final String color;
  @override
  final String? emoji;
  @override
  final String? linkTo;
  @override
  final String? audioUrl;
  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final String? scheduledDate;
  @override
  @JsonKey()
  final double scale;

  /// Create a copy of StickyNoteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$StickyNoteModelCopyWith<_StickyNoteModel> get copyWith =>
      __$StickyNoteModelCopyWithImpl<_StickyNoteModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$StickyNoteModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _StickyNoteModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.x, x) || other.x == x) &&
            (identical(other.y, y) || other.y == y) &&
            (identical(other.width, width) || other.width == width) &&
            (identical(other.height, height) || other.height == height) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.color, color) || other.color == color) &&
            (identical(other.emoji, emoji) || other.emoji == emoji) &&
            (identical(other.linkTo, linkTo) || other.linkTo == linkTo) &&
            (identical(other.audioUrl, audioUrl) ||
                other.audioUrl == audioUrl) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata) &&
            (identical(other.scheduledDate, scheduledDate) ||
                other.scheduledDate == scheduledDate) &&
            (identical(other.scale, scale) || other.scale == scale));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      type,
      x,
      y,
      width,
      height,
      content,
      color,
      emoji,
      linkTo,
      audioUrl,
      const DeepCollectionEquality().hash(_metadata),
      scheduledDate,
      scale);

  @override
  String toString() {
    return 'StickyNoteModel(id: $id, type: $type, x: $x, y: $y, width: $width, height: $height, content: $content, color: $color, emoji: $emoji, linkTo: $linkTo, audioUrl: $audioUrl, metadata: $metadata, scheduledDate: $scheduledDate, scale: $scale)';
  }
}

/// @nodoc
abstract mixin class _$StickyNoteModelCopyWith<$Res>
    implements $StickyNoteModelCopyWith<$Res> {
  factory _$StickyNoteModelCopyWith(
          _StickyNoteModel value, $Res Function(_StickyNoteModel) _then) =
      __$StickyNoteModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String type,
      double x,
      double y,
      double width,
      double height,
      String content,
      String color,
      String? emoji,
      String? linkTo,
      String? audioUrl,
      Map<String, dynamic>? metadata,
      String? scheduledDate,
      double scale});
}

/// @nodoc
class __$StickyNoteModelCopyWithImpl<$Res>
    implements _$StickyNoteModelCopyWith<$Res> {
  __$StickyNoteModelCopyWithImpl(this._self, this._then);

  final _StickyNoteModel _self;
  final $Res Function(_StickyNoteModel) _then;

  /// Create a copy of StickyNoteModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? x = null,
    Object? y = null,
    Object? width = null,
    Object? height = null,
    Object? content = null,
    Object? color = null,
    Object? emoji = freezed,
    Object? linkTo = freezed,
    Object? audioUrl = freezed,
    Object? metadata = freezed,
    Object? scheduledDate = freezed,
    Object? scale = null,
  }) {
    return _then(_StickyNoteModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      x: null == x
          ? _self.x
          : x // ignore: cast_nullable_to_non_nullable
              as double,
      y: null == y
          ? _self.y
          : y // ignore: cast_nullable_to_non_nullable
              as double,
      width: null == width
          ? _self.width
          : width // ignore: cast_nullable_to_non_nullable
              as double,
      height: null == height
          ? _self.height
          : height // ignore: cast_nullable_to_non_nullable
              as double,
      content: null == content
          ? _self.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      color: null == color
          ? _self.color
          : color // ignore: cast_nullable_to_non_nullable
              as String,
      emoji: freezed == emoji
          ? _self.emoji
          : emoji // ignore: cast_nullable_to_non_nullable
              as String?,
      linkTo: freezed == linkTo
          ? _self.linkTo
          : linkTo // ignore: cast_nullable_to_non_nullable
              as String?,
      audioUrl: freezed == audioUrl
          ? _self.audioUrl
          : audioUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      metadata: freezed == metadata
          ? _self._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      scheduledDate: freezed == scheduledDate
          ? _self.scheduledDate
          : scheduledDate // ignore: cast_nullable_to_non_nullable
              as String?,
      scale: null == scale
          ? _self.scale
          : scale // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

// dart format on
