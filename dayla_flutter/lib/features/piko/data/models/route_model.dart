import 'package:freezed_annotation/freezed_annotation.dart';

part 'route_model.freezed.dart';
part 'route_model.g.dart';

/// A Piko trail route, matching the backend `route.model.js` `toClient` shape.
@freezed
abstract class RouteModel with _$RouteModel {
  const factory RouteModel({
    required String id,
    @Default('curated') String type,
    @Default('') String title,
    @Default('') String country,
    @Default('') String location,
    @Default('') String description,
    @Default('moderate') String difficulty,
    @Default(0) double distanceKm,
    @Default(0) double elevationGainM,
    @Default(0) double estimatedDurationMins,
    @Default([]) List<String> photos,
    @Default([]) List<String> tags,
    @Default(75) double ecoScore,
    @Default(70) double weatherScore,
    @Default(50) double accessibilityScore,
    RouteEcoImpact? ecoImpact,
    RouteGeometry? geometry,
    List<double>? startPoint,
    @Default('Dayla') String creatorName,
    @Default('approved') String moderationStatus,
    @Default(false) bool isMine,
    @Default(false) bool isSaved,
    @Default(0) int saveCount,
    @Default(0) int voteScore,
    @Default(0) int userVote,
    @Default(0) int commentCount,
  }) = _RouteModel;

  factory RouteModel.fromJson(Map<String, dynamic> json) =>
      _$RouteModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class RouteEcoImpact with _$RouteEcoImpact {
  const factory RouteEcoImpact({
    @Default('') String transportMode,
    @Default(0) double co2EstimateKg,
    @Default([]) List<String> greenerAlternatives,
  }) = _RouteEcoImpact;

  factory RouteEcoImpact.fromJson(Map<String, dynamic> json) =>
      _$RouteEcoImpactFromJson(json);
}

/// GeoJSON-style LineString. Coordinates are `[lng, lat]` with an optional
/// third elevation value.
@freezed
abstract class RouteGeometry with _$RouteGeometry {
  const factory RouteGeometry({
    @Default('LineString') String type,
    @Default([]) List<List<double>> coordinates,
  }) = _RouteGeometry;

  factory RouteGeometry.fromJson(Map<String, dynamic> json) =>
      _$RouteGeometryFromJson(json);
}

@freezed
abstract class RouteCommentModel with _$RouteCommentModel {
  const factory RouteCommentModel({
    required String id,
    @Default('Anonymous') String author,
    @Default('') String content,
    String? createdAt,
  }) = _RouteCommentModel;

  factory RouteCommentModel.fromJson(Map<String, dynamic> json) =>
      _$RouteCommentModelFromJson(json);
}

/// A group plan (Dayla trip + dashboard) a route can be added to.
/// Assembled client-side from `/api/trips` + `/api/board/by-trip`.
class PikoPlan {
  const PikoPlan({
    required this.tripId,
    required this.name,
    this.subtitle,
  });

  final String tripId;
  final String name;
  final String? subtitle;
}
