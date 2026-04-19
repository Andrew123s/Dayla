// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'packing_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PackingListModel {
  String get id;
  String get tripId;
  List<PackingItemModel> get items;
  List<PackingLuggageModel> get luggage;
  bool get isComplete;
  int get totalItems;
  int get packedItems;
  double get progress;
  double get totalWeight;
  double get totalVolume;
  String? get createdAt;
  String? get updatedAt;

  /// Create a copy of PackingListModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PackingListModelCopyWith<PackingListModel> get copyWith =>
      _$PackingListModelCopyWithImpl<PackingListModel>(
          this as PackingListModel, _$identity);

  /// Serializes this PackingListModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PackingListModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            const DeepCollectionEquality().equals(other.items, items) &&
            const DeepCollectionEquality().equals(other.luggage, luggage) &&
            (identical(other.isComplete, isComplete) ||
                other.isComplete == isComplete) &&
            (identical(other.totalItems, totalItems) ||
                other.totalItems == totalItems) &&
            (identical(other.packedItems, packedItems) ||
                other.packedItems == packedItems) &&
            (identical(other.progress, progress) ||
                other.progress == progress) &&
            (identical(other.totalWeight, totalWeight) ||
                other.totalWeight == totalWeight) &&
            (identical(other.totalVolume, totalVolume) ||
                other.totalVolume == totalVolume) &&
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
      const DeepCollectionEquality().hash(items),
      const DeepCollectionEquality().hash(luggage),
      isComplete,
      totalItems,
      packedItems,
      progress,
      totalWeight,
      totalVolume,
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'PackingListModel(id: $id, tripId: $tripId, items: $items, luggage: $luggage, isComplete: $isComplete, totalItems: $totalItems, packedItems: $packedItems, progress: $progress, totalWeight: $totalWeight, totalVolume: $totalVolume, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class $PackingListModelCopyWith<$Res> {
  factory $PackingListModelCopyWith(
          PackingListModel value, $Res Function(PackingListModel) _then) =
      _$PackingListModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String tripId,
      List<PackingItemModel> items,
      List<PackingLuggageModel> luggage,
      bool isComplete,
      int totalItems,
      int packedItems,
      double progress,
      double totalWeight,
      double totalVolume,
      String? createdAt,
      String? updatedAt});
}

/// @nodoc
class _$PackingListModelCopyWithImpl<$Res>
    implements $PackingListModelCopyWith<$Res> {
  _$PackingListModelCopyWithImpl(this._self, this._then);

  final PackingListModel _self;
  final $Res Function(PackingListModel) _then;

  /// Create a copy of PackingListModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tripId = null,
    Object? items = null,
    Object? luggage = null,
    Object? isComplete = null,
    Object? totalItems = null,
    Object? packedItems = null,
    Object? progress = null,
    Object? totalWeight = null,
    Object? totalVolume = null,
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
      items: null == items
          ? _self.items
          : items // ignore: cast_nullable_to_non_nullable
              as List<PackingItemModel>,
      luggage: null == luggage
          ? _self.luggage
          : luggage // ignore: cast_nullable_to_non_nullable
              as List<PackingLuggageModel>,
      isComplete: null == isComplete
          ? _self.isComplete
          : isComplete // ignore: cast_nullable_to_non_nullable
              as bool,
      totalItems: null == totalItems
          ? _self.totalItems
          : totalItems // ignore: cast_nullable_to_non_nullable
              as int,
      packedItems: null == packedItems
          ? _self.packedItems
          : packedItems // ignore: cast_nullable_to_non_nullable
              as int,
      progress: null == progress
          ? _self.progress
          : progress // ignore: cast_nullable_to_non_nullable
              as double,
      totalWeight: null == totalWeight
          ? _self.totalWeight
          : totalWeight // ignore: cast_nullable_to_non_nullable
              as double,
      totalVolume: null == totalVolume
          ? _self.totalVolume
          : totalVolume // ignore: cast_nullable_to_non_nullable
              as double,
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
}

/// @nodoc
@JsonSerializable()
class _PackingListModel implements PackingListModel {
  const _PackingListModel(
      {required this.id,
      required this.tripId,
      final List<PackingItemModel> items = const [],
      final List<PackingLuggageModel> luggage = const [],
      this.isComplete = false,
      this.totalItems = 0,
      this.packedItems = 0,
      this.progress = 0,
      this.totalWeight = 0,
      this.totalVolume = 0,
      this.createdAt,
      this.updatedAt})
      : _items = items,
        _luggage = luggage;
  factory _PackingListModel.fromJson(Map<String, dynamic> json) =>
      _$PackingListModelFromJson(json);

  @override
  final String id;
  @override
  final String tripId;
  final List<PackingItemModel> _items;
  @override
  @JsonKey()
  List<PackingItemModel> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  final List<PackingLuggageModel> _luggage;
  @override
  @JsonKey()
  List<PackingLuggageModel> get luggage {
    if (_luggage is EqualUnmodifiableListView) return _luggage;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_luggage);
  }

  @override
  @JsonKey()
  final bool isComplete;
  @override
  @JsonKey()
  final int totalItems;
  @override
  @JsonKey()
  final int packedItems;
  @override
  @JsonKey()
  final double progress;
  @override
  @JsonKey()
  final double totalWeight;
  @override
  @JsonKey()
  final double totalVolume;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;

  /// Create a copy of PackingListModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PackingListModelCopyWith<_PackingListModel> get copyWith =>
      __$PackingListModelCopyWithImpl<_PackingListModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PackingListModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PackingListModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            const DeepCollectionEquality().equals(other._luggage, _luggage) &&
            (identical(other.isComplete, isComplete) ||
                other.isComplete == isComplete) &&
            (identical(other.totalItems, totalItems) ||
                other.totalItems == totalItems) &&
            (identical(other.packedItems, packedItems) ||
                other.packedItems == packedItems) &&
            (identical(other.progress, progress) ||
                other.progress == progress) &&
            (identical(other.totalWeight, totalWeight) ||
                other.totalWeight == totalWeight) &&
            (identical(other.totalVolume, totalVolume) ||
                other.totalVolume == totalVolume) &&
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
      const DeepCollectionEquality().hash(_items),
      const DeepCollectionEquality().hash(_luggage),
      isComplete,
      totalItems,
      packedItems,
      progress,
      totalWeight,
      totalVolume,
      createdAt,
      updatedAt);

  @override
  String toString() {
    return 'PackingListModel(id: $id, tripId: $tripId, items: $items, luggage: $luggage, isComplete: $isComplete, totalItems: $totalItems, packedItems: $packedItems, progress: $progress, totalWeight: $totalWeight, totalVolume: $totalVolume, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

/// @nodoc
abstract mixin class _$PackingListModelCopyWith<$Res>
    implements $PackingListModelCopyWith<$Res> {
  factory _$PackingListModelCopyWith(
          _PackingListModel value, $Res Function(_PackingListModel) _then) =
      __$PackingListModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String tripId,
      List<PackingItemModel> items,
      List<PackingLuggageModel> luggage,
      bool isComplete,
      int totalItems,
      int packedItems,
      double progress,
      double totalWeight,
      double totalVolume,
      String? createdAt,
      String? updatedAt});
}

/// @nodoc
class __$PackingListModelCopyWithImpl<$Res>
    implements _$PackingListModelCopyWith<$Res> {
  __$PackingListModelCopyWithImpl(this._self, this._then);

  final _PackingListModel _self;
  final $Res Function(_PackingListModel) _then;

  /// Create a copy of PackingListModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? tripId = null,
    Object? items = null,
    Object? luggage = null,
    Object? isComplete = null,
    Object? totalItems = null,
    Object? packedItems = null,
    Object? progress = null,
    Object? totalWeight = null,
    Object? totalVolume = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_PackingListModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      tripId: null == tripId
          ? _self.tripId
          : tripId // ignore: cast_nullable_to_non_nullable
              as String,
      items: null == items
          ? _self._items
          : items // ignore: cast_nullable_to_non_nullable
              as List<PackingItemModel>,
      luggage: null == luggage
          ? _self._luggage
          : luggage // ignore: cast_nullable_to_non_nullable
              as List<PackingLuggageModel>,
      isComplete: null == isComplete
          ? _self.isComplete
          : isComplete // ignore: cast_nullable_to_non_nullable
              as bool,
      totalItems: null == totalItems
          ? _self.totalItems
          : totalItems // ignore: cast_nullable_to_non_nullable
              as int,
      packedItems: null == packedItems
          ? _self.packedItems
          : packedItems // ignore: cast_nullable_to_non_nullable
              as int,
      progress: null == progress
          ? _self.progress
          : progress // ignore: cast_nullable_to_non_nullable
              as double,
      totalWeight: null == totalWeight
          ? _self.totalWeight
          : totalWeight // ignore: cast_nullable_to_non_nullable
              as double,
      totalVolume: null == totalVolume
          ? _self.totalVolume
          : totalVolume // ignore: cast_nullable_to_non_nullable
              as double,
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
}

/// @nodoc
mixin _$PackingItemModel {
  String get id;
  String get name;
  String get category;
  int get quantity;
  bool get packed;
  double get weight;
  bool get isEssential;
  bool get isShared;
  String get source;
  String get notes;
  String? get packedAt;

  /// Create a copy of PackingItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PackingItemModelCopyWith<PackingItemModel> get copyWith =>
      _$PackingItemModelCopyWithImpl<PackingItemModel>(
          this as PackingItemModel, _$identity);

  /// Serializes this PackingItemModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PackingItemModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.packed, packed) || other.packed == packed) &&
            (identical(other.weight, weight) || other.weight == weight) &&
            (identical(other.isEssential, isEssential) ||
                other.isEssential == isEssential) &&
            (identical(other.isShared, isShared) ||
                other.isShared == isShared) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.packedAt, packedAt) ||
                other.packedAt == packedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, category, quantity,
      packed, weight, isEssential, isShared, source, notes, packedAt);

  @override
  String toString() {
    return 'PackingItemModel(id: $id, name: $name, category: $category, quantity: $quantity, packed: $packed, weight: $weight, isEssential: $isEssential, isShared: $isShared, source: $source, notes: $notes, packedAt: $packedAt)';
  }
}

/// @nodoc
abstract mixin class $PackingItemModelCopyWith<$Res> {
  factory $PackingItemModelCopyWith(
          PackingItemModel value, $Res Function(PackingItemModel) _then) =
      _$PackingItemModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String category,
      int quantity,
      bool packed,
      double weight,
      bool isEssential,
      bool isShared,
      String source,
      String notes,
      String? packedAt});
}

/// @nodoc
class _$PackingItemModelCopyWithImpl<$Res>
    implements $PackingItemModelCopyWith<$Res> {
  _$PackingItemModelCopyWithImpl(this._self, this._then);

  final PackingItemModel _self;
  final $Res Function(PackingItemModel) _then;

  /// Create a copy of PackingItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? category = null,
    Object? quantity = null,
    Object? packed = null,
    Object? weight = null,
    Object? isEssential = null,
    Object? isShared = null,
    Object? source = null,
    Object? notes = null,
    Object? packedAt = freezed,
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
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _self.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      packed: null == packed
          ? _self.packed
          : packed // ignore: cast_nullable_to_non_nullable
              as bool,
      weight: null == weight
          ? _self.weight
          : weight // ignore: cast_nullable_to_non_nullable
              as double,
      isEssential: null == isEssential
          ? _self.isEssential
          : isEssential // ignore: cast_nullable_to_non_nullable
              as bool,
      isShared: null == isShared
          ? _self.isShared
          : isShared // ignore: cast_nullable_to_non_nullable
              as bool,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as String,
      notes: null == notes
          ? _self.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String,
      packedAt: freezed == packedAt
          ? _self.packedAt
          : packedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PackingItemModel implements PackingItemModel {
  const _PackingItemModel(
      {required this.id,
      required this.name,
      this.category = 'other',
      this.quantity = 1,
      this.packed = false,
      this.weight = 0,
      this.isEssential = false,
      this.isShared = false,
      this.source = 'manual',
      this.notes = '',
      this.packedAt});
  factory _PackingItemModel.fromJson(Map<String, dynamic> json) =>
      _$PackingItemModelFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey()
  final String category;
  @override
  @JsonKey()
  final int quantity;
  @override
  @JsonKey()
  final bool packed;
  @override
  @JsonKey()
  final double weight;
  @override
  @JsonKey()
  final bool isEssential;
  @override
  @JsonKey()
  final bool isShared;
  @override
  @JsonKey()
  final String source;
  @override
  @JsonKey()
  final String notes;
  @override
  final String? packedAt;

  /// Create a copy of PackingItemModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PackingItemModelCopyWith<_PackingItemModel> get copyWith =>
      __$PackingItemModelCopyWithImpl<_PackingItemModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PackingItemModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PackingItemModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.packed, packed) || other.packed == packed) &&
            (identical(other.weight, weight) || other.weight == weight) &&
            (identical(other.isEssential, isEssential) ||
                other.isEssential == isEssential) &&
            (identical(other.isShared, isShared) ||
                other.isShared == isShared) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.packedAt, packedAt) ||
                other.packedAt == packedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, category, quantity,
      packed, weight, isEssential, isShared, source, notes, packedAt);

  @override
  String toString() {
    return 'PackingItemModel(id: $id, name: $name, category: $category, quantity: $quantity, packed: $packed, weight: $weight, isEssential: $isEssential, isShared: $isShared, source: $source, notes: $notes, packedAt: $packedAt)';
  }
}

/// @nodoc
abstract mixin class _$PackingItemModelCopyWith<$Res>
    implements $PackingItemModelCopyWith<$Res> {
  factory _$PackingItemModelCopyWith(
          _PackingItemModel value, $Res Function(_PackingItemModel) _then) =
      __$PackingItemModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String category,
      int quantity,
      bool packed,
      double weight,
      bool isEssential,
      bool isShared,
      String source,
      String notes,
      String? packedAt});
}

/// @nodoc
class __$PackingItemModelCopyWithImpl<$Res>
    implements _$PackingItemModelCopyWith<$Res> {
  __$PackingItemModelCopyWithImpl(this._self, this._then);

  final _PackingItemModel _self;
  final $Res Function(_PackingItemModel) _then;

  /// Create a copy of PackingItemModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? category = null,
    Object? quantity = null,
    Object? packed = null,
    Object? weight = null,
    Object? isEssential = null,
    Object? isShared = null,
    Object? source = null,
    Object? notes = null,
    Object? packedAt = freezed,
  }) {
    return _then(_PackingItemModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _self.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      packed: null == packed
          ? _self.packed
          : packed // ignore: cast_nullable_to_non_nullable
              as bool,
      weight: null == weight
          ? _self.weight
          : weight // ignore: cast_nullable_to_non_nullable
              as double,
      isEssential: null == isEssential
          ? _self.isEssential
          : isEssential // ignore: cast_nullable_to_non_nullable
              as bool,
      isShared: null == isShared
          ? _self.isShared
          : isShared // ignore: cast_nullable_to_non_nullable
              as bool,
      source: null == source
          ? _self.source
          : source // ignore: cast_nullable_to_non_nullable
              as String,
      notes: null == notes
          ? _self.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String,
      packedAt: freezed == packedAt
          ? _self.packedAt
          : packedAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$PackingLuggageModel {
  String get id;
  String get name;
  String get type;
  double get maxWeight;
  double get currentWeight;
  String get airline;
  String get color;

  /// Create a copy of PackingLuggageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PackingLuggageModelCopyWith<PackingLuggageModel> get copyWith =>
      _$PackingLuggageModelCopyWithImpl<PackingLuggageModel>(
          this as PackingLuggageModel, _$identity);

  /// Serializes this PackingLuggageModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PackingLuggageModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.maxWeight, maxWeight) ||
                other.maxWeight == maxWeight) &&
            (identical(other.currentWeight, currentWeight) ||
                other.currentWeight == currentWeight) &&
            (identical(other.airline, airline) || other.airline == airline) &&
            (identical(other.color, color) || other.color == color));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, name, type, maxWeight, currentWeight, airline, color);

  @override
  String toString() {
    return 'PackingLuggageModel(id: $id, name: $name, type: $type, maxWeight: $maxWeight, currentWeight: $currentWeight, airline: $airline, color: $color)';
  }
}

/// @nodoc
abstract mixin class $PackingLuggageModelCopyWith<$Res> {
  factory $PackingLuggageModelCopyWith(
          PackingLuggageModel value, $Res Function(PackingLuggageModel) _then) =
      _$PackingLuggageModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String type,
      double maxWeight,
      double currentWeight,
      String airline,
      String color});
}

/// @nodoc
class _$PackingLuggageModelCopyWithImpl<$Res>
    implements $PackingLuggageModelCopyWith<$Res> {
  _$PackingLuggageModelCopyWithImpl(this._self, this._then);

  final PackingLuggageModel _self;
  final $Res Function(PackingLuggageModel) _then;

  /// Create a copy of PackingLuggageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? maxWeight = null,
    Object? currentWeight = null,
    Object? airline = null,
    Object? color = null,
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
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      maxWeight: null == maxWeight
          ? _self.maxWeight
          : maxWeight // ignore: cast_nullable_to_non_nullable
              as double,
      currentWeight: null == currentWeight
          ? _self.currentWeight
          : currentWeight // ignore: cast_nullable_to_non_nullable
              as double,
      airline: null == airline
          ? _self.airline
          : airline // ignore: cast_nullable_to_non_nullable
              as String,
      color: null == color
          ? _self.color
          : color // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PackingLuggageModel implements PackingLuggageModel {
  const _PackingLuggageModel(
      {required this.id,
      required this.name,
      this.type = 'backpack',
      this.maxWeight = 0,
      this.currentWeight = 0,
      this.airline = '',
      this.color = ''});
  factory _PackingLuggageModel.fromJson(Map<String, dynamic> json) =>
      _$PackingLuggageModelFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey()
  final String type;
  @override
  @JsonKey()
  final double maxWeight;
  @override
  @JsonKey()
  final double currentWeight;
  @override
  @JsonKey()
  final String airline;
  @override
  @JsonKey()
  final String color;

  /// Create a copy of PackingLuggageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PackingLuggageModelCopyWith<_PackingLuggageModel> get copyWith =>
      __$PackingLuggageModelCopyWithImpl<_PackingLuggageModel>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PackingLuggageModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PackingLuggageModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.maxWeight, maxWeight) ||
                other.maxWeight == maxWeight) &&
            (identical(other.currentWeight, currentWeight) ||
                other.currentWeight == currentWeight) &&
            (identical(other.airline, airline) || other.airline == airline) &&
            (identical(other.color, color) || other.color == color));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, name, type, maxWeight, currentWeight, airline, color);

  @override
  String toString() {
    return 'PackingLuggageModel(id: $id, name: $name, type: $type, maxWeight: $maxWeight, currentWeight: $currentWeight, airline: $airline, color: $color)';
  }
}

/// @nodoc
abstract mixin class _$PackingLuggageModelCopyWith<$Res>
    implements $PackingLuggageModelCopyWith<$Res> {
  factory _$PackingLuggageModelCopyWith(_PackingLuggageModel value,
          $Res Function(_PackingLuggageModel) _then) =
      __$PackingLuggageModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String type,
      double maxWeight,
      double currentWeight,
      String airline,
      String color});
}

/// @nodoc
class __$PackingLuggageModelCopyWithImpl<$Res>
    implements _$PackingLuggageModelCopyWith<$Res> {
  __$PackingLuggageModelCopyWithImpl(this._self, this._then);

  final _PackingLuggageModel _self;
  final $Res Function(_PackingLuggageModel) _then;

  /// Create a copy of PackingLuggageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? maxWeight = null,
    Object? currentWeight = null,
    Object? airline = null,
    Object? color = null,
  }) {
    return _then(_PackingLuggageModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      maxWeight: null == maxWeight
          ? _self.maxWeight
          : maxWeight // ignore: cast_nullable_to_non_nullable
              as double,
      currentWeight: null == currentWeight
          ? _self.currentWeight
          : currentWeight // ignore: cast_nullable_to_non_nullable
              as double,
      airline: null == airline
          ? _self.airline
          : airline // ignore: cast_nullable_to_non_nullable
              as String,
      color: null == color
          ? _self.color
          : color // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
mixin _$PackingSuggestion {
  String get type;
  String get message;

  /// Create a copy of PackingSuggestion
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PackingSuggestionCopyWith<PackingSuggestion> get copyWith =>
      _$PackingSuggestionCopyWithImpl<PackingSuggestion>(
          this as PackingSuggestion, _$identity);

  /// Serializes this PackingSuggestion to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PackingSuggestion &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, type, message);

  @override
  String toString() {
    return 'PackingSuggestion(type: $type, message: $message)';
  }
}

/// @nodoc
abstract mixin class $PackingSuggestionCopyWith<$Res> {
  factory $PackingSuggestionCopyWith(
          PackingSuggestion value, $Res Function(PackingSuggestion) _then) =
      _$PackingSuggestionCopyWithImpl;
  @useResult
  $Res call({String type, String message});
}

/// @nodoc
class _$PackingSuggestionCopyWithImpl<$Res>
    implements $PackingSuggestionCopyWith<$Res> {
  _$PackingSuggestionCopyWithImpl(this._self, this._then);

  final PackingSuggestion _self;
  final $Res Function(PackingSuggestion) _then;

  /// Create a copy of PackingSuggestion
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? message = null,
  }) {
    return _then(_self.copyWith(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PackingSuggestion implements PackingSuggestion {
  const _PackingSuggestion({this.type = 'tip', this.message = ''});
  factory _PackingSuggestion.fromJson(Map<String, dynamic> json) =>
      _$PackingSuggestionFromJson(json);

  @override
  @JsonKey()
  final String type;
  @override
  @JsonKey()
  final String message;

  /// Create a copy of PackingSuggestion
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PackingSuggestionCopyWith<_PackingSuggestion> get copyWith =>
      __$PackingSuggestionCopyWithImpl<_PackingSuggestion>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PackingSuggestionToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PackingSuggestion &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, type, message);

  @override
  String toString() {
    return 'PackingSuggestion(type: $type, message: $message)';
  }
}

/// @nodoc
abstract mixin class _$PackingSuggestionCopyWith<$Res>
    implements $PackingSuggestionCopyWith<$Res> {
  factory _$PackingSuggestionCopyWith(
          _PackingSuggestion value, $Res Function(_PackingSuggestion) _then) =
      __$PackingSuggestionCopyWithImpl;
  @override
  @useResult
  $Res call({String type, String message});
}

/// @nodoc
class __$PackingSuggestionCopyWithImpl<$Res>
    implements _$PackingSuggestionCopyWith<$Res> {
  __$PackingSuggestionCopyWithImpl(this._self, this._then);

  final _PackingSuggestion _self;
  final $Res Function(_PackingSuggestion) _then;

  /// Create a copy of PackingSuggestion
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? type = null,
    Object? message = null,
  }) {
    return _then(_PackingSuggestion(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _self.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
mixin _$PackingTemplate {
  String get id;
  String get name;
  String get description;
  String get type;
  String? get tripCategory;
  String? get season;
  List<TemplateItem> get items;
  int get usageCount;

  /// Create a copy of PackingTemplate
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $PackingTemplateCopyWith<PackingTemplate> get copyWith =>
      _$PackingTemplateCopyWithImpl<PackingTemplate>(
          this as PackingTemplate, _$identity);

  /// Serializes this PackingTemplate to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is PackingTemplate &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.tripCategory, tripCategory) ||
                other.tripCategory == tripCategory) &&
            (identical(other.season, season) || other.season == season) &&
            const DeepCollectionEquality().equals(other.items, items) &&
            (identical(other.usageCount, usageCount) ||
                other.usageCount == usageCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      type,
      tripCategory,
      season,
      const DeepCollectionEquality().hash(items),
      usageCount);

  @override
  String toString() {
    return 'PackingTemplate(id: $id, name: $name, description: $description, type: $type, tripCategory: $tripCategory, season: $season, items: $items, usageCount: $usageCount)';
  }
}

/// @nodoc
abstract mixin class $PackingTemplateCopyWith<$Res> {
  factory $PackingTemplateCopyWith(
          PackingTemplate value, $Res Function(PackingTemplate) _then) =
      _$PackingTemplateCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String description,
      String type,
      String? tripCategory,
      String? season,
      List<TemplateItem> items,
      int usageCount});
}

/// @nodoc
class _$PackingTemplateCopyWithImpl<$Res>
    implements $PackingTemplateCopyWith<$Res> {
  _$PackingTemplateCopyWithImpl(this._self, this._then);

  final PackingTemplate _self;
  final $Res Function(PackingTemplate) _then;

  /// Create a copy of PackingTemplate
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? type = null,
    Object? tripCategory = freezed,
    Object? season = freezed,
    Object? items = null,
    Object? usageCount = null,
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
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      tripCategory: freezed == tripCategory
          ? _self.tripCategory
          : tripCategory // ignore: cast_nullable_to_non_nullable
              as String?,
      season: freezed == season
          ? _self.season
          : season // ignore: cast_nullable_to_non_nullable
              as String?,
      items: null == items
          ? _self.items
          : items // ignore: cast_nullable_to_non_nullable
              as List<TemplateItem>,
      usageCount: null == usageCount
          ? _self.usageCount
          : usageCount // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _PackingTemplate implements PackingTemplate {
  const _PackingTemplate(
      {required this.id,
      required this.name,
      this.description = '',
      this.type = 'system',
      this.tripCategory,
      this.season,
      final List<TemplateItem> items = const [],
      this.usageCount = 0})
      : _items = items;
  factory _PackingTemplate.fromJson(Map<String, dynamic> json) =>
      _$PackingTemplateFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  @JsonKey()
  final String description;
  @override
  @JsonKey()
  final String type;
  @override
  final String? tripCategory;
  @override
  final String? season;
  final List<TemplateItem> _items;
  @override
  @JsonKey()
  List<TemplateItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  @override
  @JsonKey()
  final int usageCount;

  /// Create a copy of PackingTemplate
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$PackingTemplateCopyWith<_PackingTemplate> get copyWith =>
      __$PackingTemplateCopyWithImpl<_PackingTemplate>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$PackingTemplateToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _PackingTemplate &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.tripCategory, tripCategory) ||
                other.tripCategory == tripCategory) &&
            (identical(other.season, season) || other.season == season) &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            (identical(other.usageCount, usageCount) ||
                other.usageCount == usageCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      type,
      tripCategory,
      season,
      const DeepCollectionEquality().hash(_items),
      usageCount);

  @override
  String toString() {
    return 'PackingTemplate(id: $id, name: $name, description: $description, type: $type, tripCategory: $tripCategory, season: $season, items: $items, usageCount: $usageCount)';
  }
}

/// @nodoc
abstract mixin class _$PackingTemplateCopyWith<$Res>
    implements $PackingTemplateCopyWith<$Res> {
  factory _$PackingTemplateCopyWith(
          _PackingTemplate value, $Res Function(_PackingTemplate) _then) =
      __$PackingTemplateCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String description,
      String type,
      String? tripCategory,
      String? season,
      List<TemplateItem> items,
      int usageCount});
}

/// @nodoc
class __$PackingTemplateCopyWithImpl<$Res>
    implements _$PackingTemplateCopyWith<$Res> {
  __$PackingTemplateCopyWithImpl(this._self, this._then);

  final _PackingTemplate _self;
  final $Res Function(_PackingTemplate) _then;

  /// Create a copy of PackingTemplate
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? type = null,
    Object? tripCategory = freezed,
    Object? season = freezed,
    Object? items = null,
    Object? usageCount = null,
  }) {
    return _then(_PackingTemplate(
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
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      tripCategory: freezed == tripCategory
          ? _self.tripCategory
          : tripCategory // ignore: cast_nullable_to_non_nullable
              as String?,
      season: freezed == season
          ? _self.season
          : season // ignore: cast_nullable_to_non_nullable
              as String?,
      items: null == items
          ? _self._items
          : items // ignore: cast_nullable_to_non_nullable
              as List<TemplateItem>,
      usageCount: null == usageCount
          ? _self.usageCount
          : usageCount // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
mixin _$TemplateItem {
  String get name;
  String get category;
  int get quantity;
  bool get isEssential;

  /// Create a copy of TemplateItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TemplateItemCopyWith<TemplateItem> get copyWith =>
      _$TemplateItemCopyWithImpl<TemplateItem>(
          this as TemplateItem, _$identity);

  /// Serializes this TemplateItem to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TemplateItem &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.isEssential, isEssential) ||
                other.isEssential == isEssential));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, name, category, quantity, isEssential);

  @override
  String toString() {
    return 'TemplateItem(name: $name, category: $category, quantity: $quantity, isEssential: $isEssential)';
  }
}

/// @nodoc
abstract mixin class $TemplateItemCopyWith<$Res> {
  factory $TemplateItemCopyWith(
          TemplateItem value, $Res Function(TemplateItem) _then) =
      _$TemplateItemCopyWithImpl;
  @useResult
  $Res call({String name, String category, int quantity, bool isEssential});
}

/// @nodoc
class _$TemplateItemCopyWithImpl<$Res> implements $TemplateItemCopyWith<$Res> {
  _$TemplateItemCopyWithImpl(this._self, this._then);

  final TemplateItem _self;
  final $Res Function(TemplateItem) _then;

  /// Create a copy of TemplateItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? category = null,
    Object? quantity = null,
    Object? isEssential = null,
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
      quantity: null == quantity
          ? _self.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      isEssential: null == isEssential
          ? _self.isEssential
          : isEssential // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _TemplateItem implements TemplateItem {
  const _TemplateItem(
      {required this.name,
      this.category = 'other',
      this.quantity = 1,
      this.isEssential = false});
  factory _TemplateItem.fromJson(Map<String, dynamic> json) =>
      _$TemplateItemFromJson(json);

  @override
  final String name;
  @override
  @JsonKey()
  final String category;
  @override
  @JsonKey()
  final int quantity;
  @override
  @JsonKey()
  final bool isEssential;

  /// Create a copy of TemplateItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TemplateItemCopyWith<_TemplateItem> get copyWith =>
      __$TemplateItemCopyWithImpl<_TemplateItem>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TemplateItemToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TemplateItem &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.isEssential, isEssential) ||
                other.isEssential == isEssential));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, name, category, quantity, isEssential);

  @override
  String toString() {
    return 'TemplateItem(name: $name, category: $category, quantity: $quantity, isEssential: $isEssential)';
  }
}

/// @nodoc
abstract mixin class _$TemplateItemCopyWith<$Res>
    implements $TemplateItemCopyWith<$Res> {
  factory _$TemplateItemCopyWith(
          _TemplateItem value, $Res Function(_TemplateItem) _then) =
      __$TemplateItemCopyWithImpl;
  @override
  @useResult
  $Res call({String name, String category, int quantity, bool isEssential});
}

/// @nodoc
class __$TemplateItemCopyWithImpl<$Res>
    implements _$TemplateItemCopyWith<$Res> {
  __$TemplateItemCopyWithImpl(this._self, this._then);

  final _TemplateItem _self;
  final $Res Function(_TemplateItem) _then;

  /// Create a copy of TemplateItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? name = null,
    Object? category = null,
    Object? quantity = null,
    Object? isEssential = null,
  }) {
    return _then(_TemplateItem(
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      quantity: null == quantity
          ? _self.quantity
          : quantity // ignore: cast_nullable_to_non_nullable
              as int,
      isEssential: null == isEssential
          ? _self.isEssential
          : isEssential // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

// dart format on
