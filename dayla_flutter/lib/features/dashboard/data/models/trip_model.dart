import 'package:freezed_annotation/freezed_annotation.dart';

part 'trip_model.freezed.dart';
part 'trip_model.g.dart';

@freezed
abstract class TripModel with _$TripModel {
  const factory TripModel({
    required String id,
    required String name,
    @Default('') String description,
    TripOwner? owner,
    @Default([]) List<TripCollaborator> collaborators,
    TripDestination? destination,
    TripDates? dates,
    TripBudget? budget,
    @Default('planning') String status,
    @Default([]) List<String> tags,
    String? category,
    @Default(0) double ecoScore,
    String? coverImage,
    String? notes,
    @Default(false) bool isPublic,
    String? createdAt,
    String? updatedAt,
  }) = _TripModel;

  factory TripModel.fromJson(Map<String, dynamic> json) =>
      _$TripModelFromJson(_normalize(json));

  /// The API returns trips in two shapes: list/detail endpoints populate
  /// `owner`/`collaborators` into objects, while the create endpoint returns
  /// the raw document where `owner` is a plain id string and collaborators
  /// may be unpopulated subdocuments. Coerce both shapes so parsing never
  /// throws.
  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];

    if (copy['owner'] is! Map) copy.remove('owner');

    final collaborators = copy['collaborators'];
    if (collaborators is List) {
      copy['collaborators'] = collaborators
          .map((c) {
            if (c is! Map) return null;
            // Either the user object itself, or {user: {...}, role: ...}.
            final user = c['user'] is Map ? c['user'] as Map : c;
            if (user['name'] == null) return null;
            return Map<String, dynamic>.from(user);
          })
          .whereType<Map<String, dynamic>>()
          .toList();
    } else {
      copy.remove('collaborators');
    }
    return copy;
  }
}

@freezed
abstract class TripOwner with _$TripOwner {
  const factory TripOwner({
    required String id,
    required String name,
    String? avatar,
  }) = _TripOwner;

  factory TripOwner.fromJson(Map<String, dynamic> json) =>
      _$TripOwnerFromJson(_normalizeId(json));

  static Map<String, dynamic> _normalizeId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class TripCollaborator with _$TripCollaborator {
  const factory TripCollaborator({
    required String id,
    required String name,
    String? avatar,
  }) = _TripCollaborator;

  factory TripCollaborator.fromJson(Map<String, dynamic> json) =>
      _$TripCollaboratorFromJson(_normalizeId(json));

  static Map<String, dynamic> _normalizeId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class TripDestination with _$TripDestination {
  const factory TripDestination({
    String? name,
    TripCoordinates? coordinates,
    String? country,
    String? region,
  }) = _TripDestination;

  factory TripDestination.fromJson(Map<String, dynamic> json) =>
      _$TripDestinationFromJson(json);
}

@freezed
abstract class TripCoordinates with _$TripCoordinates {
  const factory TripCoordinates({
    double? lat,
    double? lng,
  }) = _TripCoordinates;

  factory TripCoordinates.fromJson(Map<String, dynamic> json) =>
      _$TripCoordinatesFromJson(json);
}

@freezed
abstract class TripDates with _$TripDates {
  const factory TripDates({
    String? startDate,
    String? endDate,
  }) = _TripDates;

  factory TripDates.fromJson(Map<String, dynamic> json) =>
      _$TripDatesFromJson(json);
}

@freezed
abstract class TripBudget with _$TripBudget {
  const factory TripBudget({
    @Default(0) double total,
    @Default('USD') String currency,
    BudgetCategories? categories,
  }) = _TripBudget;

  factory TripBudget.fromJson(Map<String, dynamic> json) =>
      _$TripBudgetFromJson(json);
}

@freezed
abstract class BudgetCategories with _$BudgetCategories {
  const factory BudgetCategories({
    @Default(0) double accommodation,
    @Default(0) double transportation,
    @Default(0) double food,
    @Default(0) double activities,
    @Default(0) double other,
  }) = _BudgetCategories;

  factory BudgetCategories.fromJson(Map<String, dynamic> json) =>
      _$BudgetCategoriesFromJson(json);
}

@freezed
abstract class BoardModel with _$BoardModel {
  const factory BoardModel({
    required String id,
    required String tripId,
    required String name,
    String? description,
    TripOwner? owner,
    @Default([]) List<BoardCollaborator> collaborators,
    @Default([]) List<StickyNoteModel> notes,
    String? createdAt,
    String? updatedAt,
  }) = _BoardModel;

  factory BoardModel.fromJson(Map<String, dynamic> json) =>
      _$BoardModelFromJson(_normalizeId(json));

  static Map<String, dynamic> _normalizeId(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    // Defensive: `name` may be absent on old boards; `tripId` may arrive
    // populated as an object.
    copy['name'] ??= 'Trip Board';
    final tripId = copy['tripId'];
    if (tripId is Map) {
      copy['tripId'] = (tripId['_id'] ?? tripId['id']).toString();
    } else {
      copy['tripId'] = tripId?.toString() ?? '';
    }
    return copy;
  }
}

@freezed
abstract class BoardCollaborator with _$BoardCollaborator {
  const factory BoardCollaborator({
    TripCollaborator? user,
    @Default('editor') String role,
    String? joinedAt,
  }) = _BoardCollaborator;

  factory BoardCollaborator.fromJson(Map<String, dynamic> json) =>
      _$BoardCollaboratorFromJson(json);
}

@freezed
abstract class StickyNoteModel with _$StickyNoteModel {
  const factory StickyNoteModel({
    required String id,
    required String type,
    required double x,
    required double y,
    required double width,
    required double height,
    @Default('') String content,
    @Default('#faedcd') String color,
    String? emoji,
    String? linkTo,
    String? audioUrl,
    Map<String, dynamic>? metadata,
    String? scheduledDate,
    @Default(1.0) double scale,
  }) = _StickyNoteModel;

  factory StickyNoteModel.fromJson(Map<String, dynamic> json) =>
      _$StickyNoteModelFromJson(json);
}
