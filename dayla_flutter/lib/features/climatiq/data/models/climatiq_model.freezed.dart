// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'climatiq_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$EmissionResult {
  double get emissions;
  String get unit;
  String? get mode;
  double? get distance;
  String? get type;
  int? get nights;
  String? get mealType;
  int? get numberOfMeals;

  /// Create a copy of EmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $EmissionResultCopyWith<EmissionResult> get copyWith =>
      _$EmissionResultCopyWithImpl<EmissionResult>(
          this as EmissionResult, _$identity);

  /// Serializes this EmissionResult to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is EmissionResult &&
            (identical(other.emissions, emissions) ||
                other.emissions == emissions) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.mode, mode) || other.mode == mode) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.nights, nights) || other.nights == nights) &&
            (identical(other.mealType, mealType) ||
                other.mealType == mealType) &&
            (identical(other.numberOfMeals, numberOfMeals) ||
                other.numberOfMeals == numberOfMeals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, emissions, unit, mode, distance,
      type, nights, mealType, numberOfMeals);

  @override
  String toString() {
    return 'EmissionResult(emissions: $emissions, unit: $unit, mode: $mode, distance: $distance, type: $type, nights: $nights, mealType: $mealType, numberOfMeals: $numberOfMeals)';
  }
}

/// @nodoc
abstract mixin class $EmissionResultCopyWith<$Res> {
  factory $EmissionResultCopyWith(
          EmissionResult value, $Res Function(EmissionResult) _then) =
      _$EmissionResultCopyWithImpl;
  @useResult
  $Res call(
      {double emissions,
      String unit,
      String? mode,
      double? distance,
      String? type,
      int? nights,
      String? mealType,
      int? numberOfMeals});
}

/// @nodoc
class _$EmissionResultCopyWithImpl<$Res>
    implements $EmissionResultCopyWith<$Res> {
  _$EmissionResultCopyWithImpl(this._self, this._then);

  final EmissionResult _self;
  final $Res Function(EmissionResult) _then;

  /// Create a copy of EmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? emissions = null,
    Object? unit = null,
    Object? mode = freezed,
    Object? distance = freezed,
    Object? type = freezed,
    Object? nights = freezed,
    Object? mealType = freezed,
    Object? numberOfMeals = freezed,
  }) {
    return _then(_self.copyWith(
      emissions: null == emissions
          ? _self.emissions
          : emissions // ignore: cast_nullable_to_non_nullable
              as double,
      unit: null == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String,
      mode: freezed == mode
          ? _self.mode
          : mode // ignore: cast_nullable_to_non_nullable
              as String?,
      distance: freezed == distance
          ? _self.distance
          : distance // ignore: cast_nullable_to_non_nullable
              as double?,
      type: freezed == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String?,
      nights: freezed == nights
          ? _self.nights
          : nights // ignore: cast_nullable_to_non_nullable
              as int?,
      mealType: freezed == mealType
          ? _self.mealType
          : mealType // ignore: cast_nullable_to_non_nullable
              as String?,
      numberOfMeals: freezed == numberOfMeals
          ? _self.numberOfMeals
          : numberOfMeals // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _EmissionResult implements EmissionResult {
  const _EmissionResult(
      {this.emissions = 0,
      this.unit = 'kg CO2e',
      this.mode,
      this.distance,
      this.type,
      this.nights,
      this.mealType,
      this.numberOfMeals});
  factory _EmissionResult.fromJson(Map<String, dynamic> json) =>
      _$EmissionResultFromJson(json);

  @override
  @JsonKey()
  final double emissions;
  @override
  @JsonKey()
  final String unit;
  @override
  final String? mode;
  @override
  final double? distance;
  @override
  final String? type;
  @override
  final int? nights;
  @override
  final String? mealType;
  @override
  final int? numberOfMeals;

  /// Create a copy of EmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$EmissionResultCopyWith<_EmissionResult> get copyWith =>
      __$EmissionResultCopyWithImpl<_EmissionResult>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$EmissionResultToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _EmissionResult &&
            (identical(other.emissions, emissions) ||
                other.emissions == emissions) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.mode, mode) || other.mode == mode) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.nights, nights) || other.nights == nights) &&
            (identical(other.mealType, mealType) ||
                other.mealType == mealType) &&
            (identical(other.numberOfMeals, numberOfMeals) ||
                other.numberOfMeals == numberOfMeals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, emissions, unit, mode, distance,
      type, nights, mealType, numberOfMeals);

  @override
  String toString() {
    return 'EmissionResult(emissions: $emissions, unit: $unit, mode: $mode, distance: $distance, type: $type, nights: $nights, mealType: $mealType, numberOfMeals: $numberOfMeals)';
  }
}

/// @nodoc
abstract mixin class _$EmissionResultCopyWith<$Res>
    implements $EmissionResultCopyWith<$Res> {
  factory _$EmissionResultCopyWith(
          _EmissionResult value, $Res Function(_EmissionResult) _then) =
      __$EmissionResultCopyWithImpl;
  @override
  @useResult
  $Res call(
      {double emissions,
      String unit,
      String? mode,
      double? distance,
      String? type,
      int? nights,
      String? mealType,
      int? numberOfMeals});
}

/// @nodoc
class __$EmissionResultCopyWithImpl<$Res>
    implements _$EmissionResultCopyWith<$Res> {
  __$EmissionResultCopyWithImpl(this._self, this._then);

  final _EmissionResult _self;
  final $Res Function(_EmissionResult) _then;

  /// Create a copy of EmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? emissions = null,
    Object? unit = null,
    Object? mode = freezed,
    Object? distance = freezed,
    Object? type = freezed,
    Object? nights = freezed,
    Object? mealType = freezed,
    Object? numberOfMeals = freezed,
  }) {
    return _then(_EmissionResult(
      emissions: null == emissions
          ? _self.emissions
          : emissions // ignore: cast_nullable_to_non_nullable
              as double,
      unit: null == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String,
      mode: freezed == mode
          ? _self.mode
          : mode // ignore: cast_nullable_to_non_nullable
              as String?,
      distance: freezed == distance
          ? _self.distance
          : distance // ignore: cast_nullable_to_non_nullable
              as double?,
      type: freezed == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String?,
      nights: freezed == nights
          ? _self.nights
          : nights // ignore: cast_nullable_to_non_nullable
              as int?,
      mealType: freezed == mealType
          ? _self.mealType
          : mealType // ignore: cast_nullable_to_non_nullable
              as String?,
      numberOfMeals: freezed == numberOfMeals
          ? _self.numberOfMeals
          : numberOfMeals // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
mixin _$TripEmissionResult {
  double get totalEmissions;
  String get unit;
  double get transportEmissions;
  double get accommodationEmissions;
  double get foodEmissions;
  double get activityEmissions;
  List<EmissionBreakdown> get breakdown;
  String get ecoRating;
  List<String> get recommendations;

  /// Create a copy of TripEmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TripEmissionResultCopyWith<TripEmissionResult> get copyWith =>
      _$TripEmissionResultCopyWithImpl<TripEmissionResult>(
          this as TripEmissionResult, _$identity);

  /// Serializes this TripEmissionResult to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TripEmissionResult &&
            (identical(other.totalEmissions, totalEmissions) ||
                other.totalEmissions == totalEmissions) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.transportEmissions, transportEmissions) ||
                other.transportEmissions == transportEmissions) &&
            (identical(other.accommodationEmissions, accommodationEmissions) ||
                other.accommodationEmissions == accommodationEmissions) &&
            (identical(other.foodEmissions, foodEmissions) ||
                other.foodEmissions == foodEmissions) &&
            (identical(other.activityEmissions, activityEmissions) ||
                other.activityEmissions == activityEmissions) &&
            const DeepCollectionEquality().equals(other.breakdown, breakdown) &&
            (identical(other.ecoRating, ecoRating) ||
                other.ecoRating == ecoRating) &&
            const DeepCollectionEquality()
                .equals(other.recommendations, recommendations));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      totalEmissions,
      unit,
      transportEmissions,
      accommodationEmissions,
      foodEmissions,
      activityEmissions,
      const DeepCollectionEquality().hash(breakdown),
      ecoRating,
      const DeepCollectionEquality().hash(recommendations));

  @override
  String toString() {
    return 'TripEmissionResult(totalEmissions: $totalEmissions, unit: $unit, transportEmissions: $transportEmissions, accommodationEmissions: $accommodationEmissions, foodEmissions: $foodEmissions, activityEmissions: $activityEmissions, breakdown: $breakdown, ecoRating: $ecoRating, recommendations: $recommendations)';
  }
}

/// @nodoc
abstract mixin class $TripEmissionResultCopyWith<$Res> {
  factory $TripEmissionResultCopyWith(
          TripEmissionResult value, $Res Function(TripEmissionResult) _then) =
      _$TripEmissionResultCopyWithImpl;
  @useResult
  $Res call(
      {double totalEmissions,
      String unit,
      double transportEmissions,
      double accommodationEmissions,
      double foodEmissions,
      double activityEmissions,
      List<EmissionBreakdown> breakdown,
      String ecoRating,
      List<String> recommendations});
}

/// @nodoc
class _$TripEmissionResultCopyWithImpl<$Res>
    implements $TripEmissionResultCopyWith<$Res> {
  _$TripEmissionResultCopyWithImpl(this._self, this._then);

  final TripEmissionResult _self;
  final $Res Function(TripEmissionResult) _then;

  /// Create a copy of TripEmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalEmissions = null,
    Object? unit = null,
    Object? transportEmissions = null,
    Object? accommodationEmissions = null,
    Object? foodEmissions = null,
    Object? activityEmissions = null,
    Object? breakdown = null,
    Object? ecoRating = null,
    Object? recommendations = null,
  }) {
    return _then(_self.copyWith(
      totalEmissions: null == totalEmissions
          ? _self.totalEmissions
          : totalEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      unit: null == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String,
      transportEmissions: null == transportEmissions
          ? _self.transportEmissions
          : transportEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      accommodationEmissions: null == accommodationEmissions
          ? _self.accommodationEmissions
          : accommodationEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      foodEmissions: null == foodEmissions
          ? _self.foodEmissions
          : foodEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      activityEmissions: null == activityEmissions
          ? _self.activityEmissions
          : activityEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      breakdown: null == breakdown
          ? _self.breakdown
          : breakdown // ignore: cast_nullable_to_non_nullable
              as List<EmissionBreakdown>,
      ecoRating: null == ecoRating
          ? _self.ecoRating
          : ecoRating // ignore: cast_nullable_to_non_nullable
              as String,
      recommendations: null == recommendations
          ? _self.recommendations
          : recommendations // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _TripEmissionResult implements TripEmissionResult {
  const _TripEmissionResult(
      {this.totalEmissions = 0,
      this.unit = 'kg CO2e',
      this.transportEmissions = 0,
      this.accommodationEmissions = 0,
      this.foodEmissions = 0,
      this.activityEmissions = 0,
      final List<EmissionBreakdown> breakdown = const [],
      this.ecoRating = '',
      final List<String> recommendations = const []})
      : _breakdown = breakdown,
        _recommendations = recommendations;
  factory _TripEmissionResult.fromJson(Map<String, dynamic> json) =>
      _$TripEmissionResultFromJson(json);

  @override
  @JsonKey()
  final double totalEmissions;
  @override
  @JsonKey()
  final String unit;
  @override
  @JsonKey()
  final double transportEmissions;
  @override
  @JsonKey()
  final double accommodationEmissions;
  @override
  @JsonKey()
  final double foodEmissions;
  @override
  @JsonKey()
  final double activityEmissions;
  final List<EmissionBreakdown> _breakdown;
  @override
  @JsonKey()
  List<EmissionBreakdown> get breakdown {
    if (_breakdown is EqualUnmodifiableListView) return _breakdown;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_breakdown);
  }

  @override
  @JsonKey()
  final String ecoRating;
  final List<String> _recommendations;
  @override
  @JsonKey()
  List<String> get recommendations {
    if (_recommendations is EqualUnmodifiableListView) return _recommendations;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_recommendations);
  }

  /// Create a copy of TripEmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TripEmissionResultCopyWith<_TripEmissionResult> get copyWith =>
      __$TripEmissionResultCopyWithImpl<_TripEmissionResult>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TripEmissionResultToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TripEmissionResult &&
            (identical(other.totalEmissions, totalEmissions) ||
                other.totalEmissions == totalEmissions) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.transportEmissions, transportEmissions) ||
                other.transportEmissions == transportEmissions) &&
            (identical(other.accommodationEmissions, accommodationEmissions) ||
                other.accommodationEmissions == accommodationEmissions) &&
            (identical(other.foodEmissions, foodEmissions) ||
                other.foodEmissions == foodEmissions) &&
            (identical(other.activityEmissions, activityEmissions) ||
                other.activityEmissions == activityEmissions) &&
            const DeepCollectionEquality()
                .equals(other._breakdown, _breakdown) &&
            (identical(other.ecoRating, ecoRating) ||
                other.ecoRating == ecoRating) &&
            const DeepCollectionEquality()
                .equals(other._recommendations, _recommendations));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      totalEmissions,
      unit,
      transportEmissions,
      accommodationEmissions,
      foodEmissions,
      activityEmissions,
      const DeepCollectionEquality().hash(_breakdown),
      ecoRating,
      const DeepCollectionEquality().hash(_recommendations));

  @override
  String toString() {
    return 'TripEmissionResult(totalEmissions: $totalEmissions, unit: $unit, transportEmissions: $transportEmissions, accommodationEmissions: $accommodationEmissions, foodEmissions: $foodEmissions, activityEmissions: $activityEmissions, breakdown: $breakdown, ecoRating: $ecoRating, recommendations: $recommendations)';
  }
}

/// @nodoc
abstract mixin class _$TripEmissionResultCopyWith<$Res>
    implements $TripEmissionResultCopyWith<$Res> {
  factory _$TripEmissionResultCopyWith(
          _TripEmissionResult value, $Res Function(_TripEmissionResult) _then) =
      __$TripEmissionResultCopyWithImpl;
  @override
  @useResult
  $Res call(
      {double totalEmissions,
      String unit,
      double transportEmissions,
      double accommodationEmissions,
      double foodEmissions,
      double activityEmissions,
      List<EmissionBreakdown> breakdown,
      String ecoRating,
      List<String> recommendations});
}

/// @nodoc
class __$TripEmissionResultCopyWithImpl<$Res>
    implements _$TripEmissionResultCopyWith<$Res> {
  __$TripEmissionResultCopyWithImpl(this._self, this._then);

  final _TripEmissionResult _self;
  final $Res Function(_TripEmissionResult) _then;

  /// Create a copy of TripEmissionResult
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? totalEmissions = null,
    Object? unit = null,
    Object? transportEmissions = null,
    Object? accommodationEmissions = null,
    Object? foodEmissions = null,
    Object? activityEmissions = null,
    Object? breakdown = null,
    Object? ecoRating = null,
    Object? recommendations = null,
  }) {
    return _then(_TripEmissionResult(
      totalEmissions: null == totalEmissions
          ? _self.totalEmissions
          : totalEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      unit: null == unit
          ? _self.unit
          : unit // ignore: cast_nullable_to_non_nullable
              as String,
      transportEmissions: null == transportEmissions
          ? _self.transportEmissions
          : transportEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      accommodationEmissions: null == accommodationEmissions
          ? _self.accommodationEmissions
          : accommodationEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      foodEmissions: null == foodEmissions
          ? _self.foodEmissions
          : foodEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      activityEmissions: null == activityEmissions
          ? _self.activityEmissions
          : activityEmissions // ignore: cast_nullable_to_non_nullable
              as double,
      breakdown: null == breakdown
          ? _self._breakdown
          : breakdown // ignore: cast_nullable_to_non_nullable
              as List<EmissionBreakdown>,
      ecoRating: null == ecoRating
          ? _self.ecoRating
          : ecoRating // ignore: cast_nullable_to_non_nullable
              as String,
      recommendations: null == recommendations
          ? _self._recommendations
          : recommendations // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc
mixin _$EmissionBreakdown {
  String get category;
  double get emissions;
  double get percentage;

  /// Create a copy of EmissionBreakdown
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $EmissionBreakdownCopyWith<EmissionBreakdown> get copyWith =>
      _$EmissionBreakdownCopyWithImpl<EmissionBreakdown>(
          this as EmissionBreakdown, _$identity);

  /// Serializes this EmissionBreakdown to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is EmissionBreakdown &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.emissions, emissions) ||
                other.emissions == emissions) &&
            (identical(other.percentage, percentage) ||
                other.percentage == percentage));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, category, emissions, percentage);

  @override
  String toString() {
    return 'EmissionBreakdown(category: $category, emissions: $emissions, percentage: $percentage)';
  }
}

/// @nodoc
abstract mixin class $EmissionBreakdownCopyWith<$Res> {
  factory $EmissionBreakdownCopyWith(
          EmissionBreakdown value, $Res Function(EmissionBreakdown) _then) =
      _$EmissionBreakdownCopyWithImpl;
  @useResult
  $Res call({String category, double emissions, double percentage});
}

/// @nodoc
class _$EmissionBreakdownCopyWithImpl<$Res>
    implements $EmissionBreakdownCopyWith<$Res> {
  _$EmissionBreakdownCopyWithImpl(this._self, this._then);

  final EmissionBreakdown _self;
  final $Res Function(EmissionBreakdown) _then;

  /// Create a copy of EmissionBreakdown
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? category = null,
    Object? emissions = null,
    Object? percentage = null,
  }) {
    return _then(_self.copyWith(
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      emissions: null == emissions
          ? _self.emissions
          : emissions // ignore: cast_nullable_to_non_nullable
              as double,
      percentage: null == percentage
          ? _self.percentage
          : percentage // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _EmissionBreakdown implements EmissionBreakdown {
  const _EmissionBreakdown(
      {this.category = '', this.emissions = 0, this.percentage = 0});
  factory _EmissionBreakdown.fromJson(Map<String, dynamic> json) =>
      _$EmissionBreakdownFromJson(json);

  @override
  @JsonKey()
  final String category;
  @override
  @JsonKey()
  final double emissions;
  @override
  @JsonKey()
  final double percentage;

  /// Create a copy of EmissionBreakdown
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$EmissionBreakdownCopyWith<_EmissionBreakdown> get copyWith =>
      __$EmissionBreakdownCopyWithImpl<_EmissionBreakdown>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$EmissionBreakdownToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _EmissionBreakdown &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.emissions, emissions) ||
                other.emissions == emissions) &&
            (identical(other.percentage, percentage) ||
                other.percentage == percentage));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, category, emissions, percentage);

  @override
  String toString() {
    return 'EmissionBreakdown(category: $category, emissions: $emissions, percentage: $percentage)';
  }
}

/// @nodoc
abstract mixin class _$EmissionBreakdownCopyWith<$Res>
    implements $EmissionBreakdownCopyWith<$Res> {
  factory _$EmissionBreakdownCopyWith(
          _EmissionBreakdown value, $Res Function(_EmissionBreakdown) _then) =
      __$EmissionBreakdownCopyWithImpl;
  @override
  @useResult
  $Res call({String category, double emissions, double percentage});
}

/// @nodoc
class __$EmissionBreakdownCopyWithImpl<$Res>
    implements _$EmissionBreakdownCopyWith<$Res> {
  __$EmissionBreakdownCopyWithImpl(this._self, this._then);

  final _EmissionBreakdown _self;
  final $Res Function(_EmissionBreakdown) _then;

  /// Create a copy of EmissionBreakdown
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? category = null,
    Object? emissions = null,
    Object? percentage = null,
  }) {
    return _then(_EmissionBreakdown(
      category: null == category
          ? _self.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      emissions: null == emissions
          ? _self.emissions
          : emissions // ignore: cast_nullable_to_non_nullable
              as double,
      percentage: null == percentage
          ? _self.percentage
          : percentage // ignore: cast_nullable_to_non_nullable
              as double,
    ));
  }
}

/// @nodoc
mixin _$TransportInput {
  String get mode;
  double get distance;
  int get passengers;
  String? get fuelType;
  String? get cabinClass;

  /// Create a copy of TransportInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $TransportInputCopyWith<TransportInput> get copyWith =>
      _$TransportInputCopyWithImpl<TransportInput>(
          this as TransportInput, _$identity);

  /// Serializes this TransportInput to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is TransportInput &&
            (identical(other.mode, mode) || other.mode == mode) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            (identical(other.passengers, passengers) ||
                other.passengers == passengers) &&
            (identical(other.fuelType, fuelType) ||
                other.fuelType == fuelType) &&
            (identical(other.cabinClass, cabinClass) ||
                other.cabinClass == cabinClass));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, mode, distance, passengers, fuelType, cabinClass);

  @override
  String toString() {
    return 'TransportInput(mode: $mode, distance: $distance, passengers: $passengers, fuelType: $fuelType, cabinClass: $cabinClass)';
  }
}

/// @nodoc
abstract mixin class $TransportInputCopyWith<$Res> {
  factory $TransportInputCopyWith(
          TransportInput value, $Res Function(TransportInput) _then) =
      _$TransportInputCopyWithImpl;
  @useResult
  $Res call(
      {String mode,
      double distance,
      int passengers,
      String? fuelType,
      String? cabinClass});
}

/// @nodoc
class _$TransportInputCopyWithImpl<$Res>
    implements $TransportInputCopyWith<$Res> {
  _$TransportInputCopyWithImpl(this._self, this._then);

  final TransportInput _self;
  final $Res Function(TransportInput) _then;

  /// Create a copy of TransportInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? mode = null,
    Object? distance = null,
    Object? passengers = null,
    Object? fuelType = freezed,
    Object? cabinClass = freezed,
  }) {
    return _then(_self.copyWith(
      mode: null == mode
          ? _self.mode
          : mode // ignore: cast_nullable_to_non_nullable
              as String,
      distance: null == distance
          ? _self.distance
          : distance // ignore: cast_nullable_to_non_nullable
              as double,
      passengers: null == passengers
          ? _self.passengers
          : passengers // ignore: cast_nullable_to_non_nullable
              as int,
      fuelType: freezed == fuelType
          ? _self.fuelType
          : fuelType // ignore: cast_nullable_to_non_nullable
              as String?,
      cabinClass: freezed == cabinClass
          ? _self.cabinClass
          : cabinClass // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _TransportInput implements TransportInput {
  const _TransportInput(
      {required this.mode,
      required this.distance,
      this.passengers = 1,
      this.fuelType,
      this.cabinClass});
  factory _TransportInput.fromJson(Map<String, dynamic> json) =>
      _$TransportInputFromJson(json);

  @override
  final String mode;
  @override
  final double distance;
  @override
  @JsonKey()
  final int passengers;
  @override
  final String? fuelType;
  @override
  final String? cabinClass;

  /// Create a copy of TransportInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$TransportInputCopyWith<_TransportInput> get copyWith =>
      __$TransportInputCopyWithImpl<_TransportInput>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$TransportInputToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _TransportInput &&
            (identical(other.mode, mode) || other.mode == mode) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            (identical(other.passengers, passengers) ||
                other.passengers == passengers) &&
            (identical(other.fuelType, fuelType) ||
                other.fuelType == fuelType) &&
            (identical(other.cabinClass, cabinClass) ||
                other.cabinClass == cabinClass));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, mode, distance, passengers, fuelType, cabinClass);

  @override
  String toString() {
    return 'TransportInput(mode: $mode, distance: $distance, passengers: $passengers, fuelType: $fuelType, cabinClass: $cabinClass)';
  }
}

/// @nodoc
abstract mixin class _$TransportInputCopyWith<$Res>
    implements $TransportInputCopyWith<$Res> {
  factory _$TransportInputCopyWith(
          _TransportInput value, $Res Function(_TransportInput) _then) =
      __$TransportInputCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String mode,
      double distance,
      int passengers,
      String? fuelType,
      String? cabinClass});
}

/// @nodoc
class __$TransportInputCopyWithImpl<$Res>
    implements _$TransportInputCopyWith<$Res> {
  __$TransportInputCopyWithImpl(this._self, this._then);

  final _TransportInput _self;
  final $Res Function(_TransportInput) _then;

  /// Create a copy of TransportInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? mode = null,
    Object? distance = null,
    Object? passengers = null,
    Object? fuelType = freezed,
    Object? cabinClass = freezed,
  }) {
    return _then(_TransportInput(
      mode: null == mode
          ? _self.mode
          : mode // ignore: cast_nullable_to_non_nullable
              as String,
      distance: null == distance
          ? _self.distance
          : distance // ignore: cast_nullable_to_non_nullable
              as double,
      passengers: null == passengers
          ? _self.passengers
          : passengers // ignore: cast_nullable_to_non_nullable
              as int,
      fuelType: freezed == fuelType
          ? _self.fuelType
          : fuelType // ignore: cast_nullable_to_non_nullable
              as String?,
      cabinClass: freezed == cabinClass
          ? _self.cabinClass
          : cabinClass // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
mixin _$AccommodationInput {
  String get type;
  int get nights;
  String get country;
  int? get starRating;

  /// Create a copy of AccommodationInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $AccommodationInputCopyWith<AccommodationInput> get copyWith =>
      _$AccommodationInputCopyWithImpl<AccommodationInput>(
          this as AccommodationInput, _$identity);

  /// Serializes this AccommodationInput to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is AccommodationInput &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.nights, nights) || other.nights == nights) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.starRating, starRating) ||
                other.starRating == starRating));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, type, nights, country, starRating);

  @override
  String toString() {
    return 'AccommodationInput(type: $type, nights: $nights, country: $country, starRating: $starRating)';
  }
}

/// @nodoc
abstract mixin class $AccommodationInputCopyWith<$Res> {
  factory $AccommodationInputCopyWith(
          AccommodationInput value, $Res Function(AccommodationInput) _then) =
      _$AccommodationInputCopyWithImpl;
  @useResult
  $Res call({String type, int nights, String country, int? starRating});
}

/// @nodoc
class _$AccommodationInputCopyWithImpl<$Res>
    implements $AccommodationInputCopyWith<$Res> {
  _$AccommodationInputCopyWithImpl(this._self, this._then);

  final AccommodationInput _self;
  final $Res Function(AccommodationInput) _then;

  /// Create a copy of AccommodationInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? nights = null,
    Object? country = null,
    Object? starRating = freezed,
  }) {
    return _then(_self.copyWith(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      nights: null == nights
          ? _self.nights
          : nights // ignore: cast_nullable_to_non_nullable
              as int,
      country: null == country
          ? _self.country
          : country // ignore: cast_nullable_to_non_nullable
              as String,
      starRating: freezed == starRating
          ? _self.starRating
          : starRating // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _AccommodationInput implements AccommodationInput {
  const _AccommodationInput(
      {required this.type,
      required this.nights,
      required this.country,
      this.starRating});
  factory _AccommodationInput.fromJson(Map<String, dynamic> json) =>
      _$AccommodationInputFromJson(json);

  @override
  final String type;
  @override
  final int nights;
  @override
  final String country;
  @override
  final int? starRating;

  /// Create a copy of AccommodationInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$AccommodationInputCopyWith<_AccommodationInput> get copyWith =>
      __$AccommodationInputCopyWithImpl<_AccommodationInput>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$AccommodationInputToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _AccommodationInput &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.nights, nights) || other.nights == nights) &&
            (identical(other.country, country) || other.country == country) &&
            (identical(other.starRating, starRating) ||
                other.starRating == starRating));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, type, nights, country, starRating);

  @override
  String toString() {
    return 'AccommodationInput(type: $type, nights: $nights, country: $country, starRating: $starRating)';
  }
}

/// @nodoc
abstract mixin class _$AccommodationInputCopyWith<$Res>
    implements $AccommodationInputCopyWith<$Res> {
  factory _$AccommodationInputCopyWith(
          _AccommodationInput value, $Res Function(_AccommodationInput) _then) =
      __$AccommodationInputCopyWithImpl;
  @override
  @useResult
  $Res call({String type, int nights, String country, int? starRating});
}

/// @nodoc
class __$AccommodationInputCopyWithImpl<$Res>
    implements _$AccommodationInputCopyWith<$Res> {
  __$AccommodationInputCopyWithImpl(this._self, this._then);

  final _AccommodationInput _self;
  final $Res Function(_AccommodationInput) _then;

  /// Create a copy of AccommodationInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? type = null,
    Object? nights = null,
    Object? country = null,
    Object? starRating = freezed,
  }) {
    return _then(_AccommodationInput(
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      nights: null == nights
          ? _self.nights
          : nights // ignore: cast_nullable_to_non_nullable
              as int,
      country: null == country
          ? _self.country
          : country // ignore: cast_nullable_to_non_nullable
              as String,
      starRating: freezed == starRating
          ? _self.starRating
          : starRating // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
mixin _$FoodInput {
  String get mealType;
  String get countryCode;
  int get numberOfMeals;

  /// Create a copy of FoodInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $FoodInputCopyWith<FoodInput> get copyWith =>
      _$FoodInputCopyWithImpl<FoodInput>(this as FoodInput, _$identity);

  /// Serializes this FoodInput to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is FoodInput &&
            (identical(other.mealType, mealType) ||
                other.mealType == mealType) &&
            (identical(other.countryCode, countryCode) ||
                other.countryCode == countryCode) &&
            (identical(other.numberOfMeals, numberOfMeals) ||
                other.numberOfMeals == numberOfMeals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, mealType, countryCode, numberOfMeals);

  @override
  String toString() {
    return 'FoodInput(mealType: $mealType, countryCode: $countryCode, numberOfMeals: $numberOfMeals)';
  }
}

/// @nodoc
abstract mixin class $FoodInputCopyWith<$Res> {
  factory $FoodInputCopyWith(FoodInput value, $Res Function(FoodInput) _then) =
      _$FoodInputCopyWithImpl;
  @useResult
  $Res call({String mealType, String countryCode, int numberOfMeals});
}

/// @nodoc
class _$FoodInputCopyWithImpl<$Res> implements $FoodInputCopyWith<$Res> {
  _$FoodInputCopyWithImpl(this._self, this._then);

  final FoodInput _self;
  final $Res Function(FoodInput) _then;

  /// Create a copy of FoodInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? mealType = null,
    Object? countryCode = null,
    Object? numberOfMeals = null,
  }) {
    return _then(_self.copyWith(
      mealType: null == mealType
          ? _self.mealType
          : mealType // ignore: cast_nullable_to_non_nullable
              as String,
      countryCode: null == countryCode
          ? _self.countryCode
          : countryCode // ignore: cast_nullable_to_non_nullable
              as String,
      numberOfMeals: null == numberOfMeals
          ? _self.numberOfMeals
          : numberOfMeals // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _FoodInput implements FoodInput {
  const _FoodInput(
      {required this.mealType,
      required this.countryCode,
      required this.numberOfMeals});
  factory _FoodInput.fromJson(Map<String, dynamic> json) =>
      _$FoodInputFromJson(json);

  @override
  final String mealType;
  @override
  final String countryCode;
  @override
  final int numberOfMeals;

  /// Create a copy of FoodInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$FoodInputCopyWith<_FoodInput> get copyWith =>
      __$FoodInputCopyWithImpl<_FoodInput>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$FoodInputToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _FoodInput &&
            (identical(other.mealType, mealType) ||
                other.mealType == mealType) &&
            (identical(other.countryCode, countryCode) ||
                other.countryCode == countryCode) &&
            (identical(other.numberOfMeals, numberOfMeals) ||
                other.numberOfMeals == numberOfMeals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, mealType, countryCode, numberOfMeals);

  @override
  String toString() {
    return 'FoodInput(mealType: $mealType, countryCode: $countryCode, numberOfMeals: $numberOfMeals)';
  }
}

/// @nodoc
abstract mixin class _$FoodInputCopyWith<$Res>
    implements $FoodInputCopyWith<$Res> {
  factory _$FoodInputCopyWith(
          _FoodInput value, $Res Function(_FoodInput) _then) =
      __$FoodInputCopyWithImpl;
  @override
  @useResult
  $Res call({String mealType, String countryCode, int numberOfMeals});
}

/// @nodoc
class __$FoodInputCopyWithImpl<$Res> implements _$FoodInputCopyWith<$Res> {
  __$FoodInputCopyWithImpl(this._self, this._then);

  final _FoodInput _self;
  final $Res Function(_FoodInput) _then;

  /// Create a copy of FoodInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? mealType = null,
    Object? countryCode = null,
    Object? numberOfMeals = null,
  }) {
    return _then(_FoodInput(
      mealType: null == mealType
          ? _self.mealType
          : mealType // ignore: cast_nullable_to_non_nullable
              as String,
      countryCode: null == countryCode
          ? _self.countryCode
          : countryCode // ignore: cast_nullable_to_non_nullable
              as String,
      numberOfMeals: null == numberOfMeals
          ? _self.numberOfMeals
          : numberOfMeals // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

// dart format on
