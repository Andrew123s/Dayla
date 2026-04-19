// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TripModel _$TripModelFromJson(Map<String, dynamic> json) => _TripModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      owner: json['owner'] == null
          ? null
          : TripOwner.fromJson(json['owner'] as Map<String, dynamic>),
      collaborators: (json['collaborators'] as List<dynamic>?)
              ?.map((e) => TripCollaborator.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      destination: json['destination'] == null
          ? null
          : TripDestination.fromJson(
              json['destination'] as Map<String, dynamic>),
      dates: json['dates'] == null
          ? null
          : TripDates.fromJson(json['dates'] as Map<String, dynamic>),
      budget: json['budget'] == null
          ? null
          : TripBudget.fromJson(json['budget'] as Map<String, dynamic>),
      status: json['status'] as String? ?? 'planning',
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      category: json['category'] as String?,
      ecoScore: (json['ecoScore'] as num?)?.toDouble() ?? 0,
      coverImage: json['coverImage'] as String?,
      notes: json['notes'] as String?,
      isPublic: json['isPublic'] as bool? ?? false,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$TripModelToJson(_TripModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'owner': instance.owner,
      'collaborators': instance.collaborators,
      'destination': instance.destination,
      'dates': instance.dates,
      'budget': instance.budget,
      'status': instance.status,
      'tags': instance.tags,
      'category': instance.category,
      'ecoScore': instance.ecoScore,
      'coverImage': instance.coverImage,
      'notes': instance.notes,
      'isPublic': instance.isPublic,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

_TripOwner _$TripOwnerFromJson(Map<String, dynamic> json) => _TripOwner(
      id: json['id'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$TripOwnerToJson(_TripOwner instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'avatar': instance.avatar,
    };

_TripCollaborator _$TripCollaboratorFromJson(Map<String, dynamic> json) =>
    _TripCollaborator(
      id: json['id'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
    );

Map<String, dynamic> _$TripCollaboratorToJson(_TripCollaborator instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'avatar': instance.avatar,
    };

_TripDestination _$TripDestinationFromJson(Map<String, dynamic> json) =>
    _TripDestination(
      name: json['name'] as String?,
      coordinates: json['coordinates'] == null
          ? null
          : TripCoordinates.fromJson(
              json['coordinates'] as Map<String, dynamic>),
      country: json['country'] as String?,
      region: json['region'] as String?,
    );

Map<String, dynamic> _$TripDestinationToJson(_TripDestination instance) =>
    <String, dynamic>{
      'name': instance.name,
      'coordinates': instance.coordinates,
      'country': instance.country,
      'region': instance.region,
    };

_TripCoordinates _$TripCoordinatesFromJson(Map<String, dynamic> json) =>
    _TripCoordinates(
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$TripCoordinatesToJson(_TripCoordinates instance) =>
    <String, dynamic>{
      'lat': instance.lat,
      'lng': instance.lng,
    };

_TripDates _$TripDatesFromJson(Map<String, dynamic> json) => _TripDates(
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
    );

Map<String, dynamic> _$TripDatesToJson(_TripDates instance) =>
    <String, dynamic>{
      'startDate': instance.startDate,
      'endDate': instance.endDate,
    };

_TripBudget _$TripBudgetFromJson(Map<String, dynamic> json) => _TripBudget(
      total: (json['total'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'USD',
      categories: json['categories'] == null
          ? null
          : BudgetCategories.fromJson(
              json['categories'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TripBudgetToJson(_TripBudget instance) =>
    <String, dynamic>{
      'total': instance.total,
      'currency': instance.currency,
      'categories': instance.categories,
    };

_BudgetCategories _$BudgetCategoriesFromJson(Map<String, dynamic> json) =>
    _BudgetCategories(
      accommodation: (json['accommodation'] as num?)?.toDouble() ?? 0,
      transportation: (json['transportation'] as num?)?.toDouble() ?? 0,
      food: (json['food'] as num?)?.toDouble() ?? 0,
      activities: (json['activities'] as num?)?.toDouble() ?? 0,
      other: (json['other'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$BudgetCategoriesToJson(_BudgetCategories instance) =>
    <String, dynamic>{
      'accommodation': instance.accommodation,
      'transportation': instance.transportation,
      'food': instance.food,
      'activities': instance.activities,
      'other': instance.other,
    };

_BoardModel _$BoardModelFromJson(Map<String, dynamic> json) => _BoardModel(
      id: json['id'] as String,
      tripId: json['tripId'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      owner: json['owner'] == null
          ? null
          : TripOwner.fromJson(json['owner'] as Map<String, dynamic>),
      collaborators: (json['collaborators'] as List<dynamic>?)
              ?.map(
                  (e) => BoardCollaborator.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      notes: (json['notes'] as List<dynamic>?)
              ?.map((e) => StickyNoteModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$BoardModelToJson(_BoardModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tripId': instance.tripId,
      'name': instance.name,
      'description': instance.description,
      'owner': instance.owner,
      'collaborators': instance.collaborators,
      'notes': instance.notes,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

_BoardCollaborator _$BoardCollaboratorFromJson(Map<String, dynamic> json) =>
    _BoardCollaborator(
      user: json['user'] == null
          ? null
          : TripCollaborator.fromJson(json['user'] as Map<String, dynamic>),
      role: json['role'] as String? ?? 'editor',
      joinedAt: json['joinedAt'] as String?,
    );

Map<String, dynamic> _$BoardCollaboratorToJson(_BoardCollaborator instance) =>
    <String, dynamic>{
      'user': instance.user,
      'role': instance.role,
      'joinedAt': instance.joinedAt,
    };

_StickyNoteModel _$StickyNoteModelFromJson(Map<String, dynamic> json) =>
    _StickyNoteModel(
      id: json['id'] as String,
      type: json['type'] as String,
      x: (json['x'] as num).toDouble(),
      y: (json['y'] as num).toDouble(),
      width: (json['width'] as num).toDouble(),
      height: (json['height'] as num).toDouble(),
      content: json['content'] as String? ?? '',
      color: json['color'] as String? ?? '#faedcd',
      emoji: json['emoji'] as String?,
      linkTo: json['linkTo'] as String?,
      audioUrl: json['audioUrl'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      scheduledDate: json['scheduledDate'] as String?,
      scale: (json['scale'] as num?)?.toDouble() ?? 1.0,
    );

Map<String, dynamic> _$StickyNoteModelToJson(_StickyNoteModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'x': instance.x,
      'y': instance.y,
      'width': instance.width,
      'height': instance.height,
      'content': instance.content,
      'color': instance.color,
      'emoji': instance.emoji,
      'linkTo': instance.linkTo,
      'audioUrl': instance.audioUrl,
      'metadata': instance.metadata,
      'scheduledDate': instance.scheduledDate,
      'scale': instance.scale,
    };
