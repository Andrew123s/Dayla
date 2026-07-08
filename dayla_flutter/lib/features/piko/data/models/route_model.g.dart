// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RouteModel _$RouteModelFromJson(Map<String, dynamic> json) => _RouteModel(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'curated',
      title: json['title'] as String? ?? '',
      country: json['country'] as String? ?? '',
      location: json['location'] as String? ?? '',
      description: json['description'] as String? ?? '',
      difficulty: json['difficulty'] as String? ?? 'moderate',
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 0,
      elevationGainM: (json['elevationGainM'] as num?)?.toDouble() ?? 0,
      estimatedDurationMins:
          (json['estimatedDurationMins'] as num?)?.toDouble() ?? 0,
      photos: (json['photos'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      ecoScore: (json['ecoScore'] as num?)?.toDouble() ?? 75,
      weatherScore: (json['weatherScore'] as num?)?.toDouble() ?? 70,
      accessibilityScore:
          (json['accessibilityScore'] as num?)?.toDouble() ?? 50,
      ecoImpact: json['ecoImpact'] == null
          ? null
          : RouteEcoImpact.fromJson(json['ecoImpact'] as Map<String, dynamic>),
      geometry: json['geometry'] == null
          ? null
          : RouteGeometry.fromJson(json['geometry'] as Map<String, dynamic>),
      startPoint: (json['startPoint'] as List<dynamic>?)
          ?.map((e) => (e as num).toDouble())
          .toList(),
      creatorName: json['creatorName'] as String? ?? 'Dayla',
      moderationStatus: json['moderationStatus'] as String? ?? 'approved',
      isMine: json['isMine'] as bool? ?? false,
      isSaved: json['isSaved'] as bool? ?? false,
      saveCount: (json['saveCount'] as num?)?.toInt() ?? 0,
      voteScore: (json['voteScore'] as num?)?.toInt() ?? 0,
      userVote: (json['userVote'] as num?)?.toInt() ?? 0,
      commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$RouteModelToJson(_RouteModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'title': instance.title,
      'country': instance.country,
      'location': instance.location,
      'description': instance.description,
      'difficulty': instance.difficulty,
      'distanceKm': instance.distanceKm,
      'elevationGainM': instance.elevationGainM,
      'estimatedDurationMins': instance.estimatedDurationMins,
      'photos': instance.photos,
      'tags': instance.tags,
      'ecoScore': instance.ecoScore,
      'weatherScore': instance.weatherScore,
      'accessibilityScore': instance.accessibilityScore,
      'ecoImpact': instance.ecoImpact,
      'geometry': instance.geometry,
      'startPoint': instance.startPoint,
      'creatorName': instance.creatorName,
      'moderationStatus': instance.moderationStatus,
      'isMine': instance.isMine,
      'isSaved': instance.isSaved,
      'saveCount': instance.saveCount,
      'voteScore': instance.voteScore,
      'userVote': instance.userVote,
      'commentCount': instance.commentCount,
    };

_RouteEcoImpact _$RouteEcoImpactFromJson(Map<String, dynamic> json) =>
    _RouteEcoImpact(
      transportMode: json['transportMode'] as String? ?? '',
      co2EstimateKg: (json['co2EstimateKg'] as num?)?.toDouble() ?? 0,
      greenerAlternatives: (json['greenerAlternatives'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$RouteEcoImpactToJson(_RouteEcoImpact instance) =>
    <String, dynamic>{
      'transportMode': instance.transportMode,
      'co2EstimateKg': instance.co2EstimateKg,
      'greenerAlternatives': instance.greenerAlternatives,
    };

_RouteGeometry _$RouteGeometryFromJson(Map<String, dynamic> json) =>
    _RouteGeometry(
      type: json['type'] as String? ?? 'LineString',
      coordinates: (json['coordinates'] as List<dynamic>?)
              ?.map((e) => (e as List<dynamic>)
                  .map((e) => (e as num).toDouble())
                  .toList())
              .toList() ??
          const [],
    );

Map<String, dynamic> _$RouteGeometryToJson(_RouteGeometry instance) =>
    <String, dynamic>{
      'type': instance.type,
      'coordinates': instance.coordinates,
    };

_RouteCommentModel _$RouteCommentModelFromJson(Map<String, dynamic> json) =>
    _RouteCommentModel(
      id: json['id'] as String,
      author: json['author'] as String? ?? 'Anonymous',
      content: json['content'] as String? ?? '',
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$RouteCommentModelToJson(_RouteCommentModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'author': instance.author,
      'content': instance.content,
      'createdAt': instance.createdAt,
    };
