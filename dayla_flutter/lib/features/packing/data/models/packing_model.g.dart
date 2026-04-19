// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'packing_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PackingListModel _$PackingListModelFromJson(Map<String, dynamic> json) =>
    _PackingListModel(
      id: json['id'] as String,
      tripId: json['tripId'] as String,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => PackingItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      luggage: (json['luggage'] as List<dynamic>?)
              ?.map((e) =>
                  PackingLuggageModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      isComplete: json['isComplete'] as bool? ?? false,
      totalItems: (json['totalItems'] as num?)?.toInt() ?? 0,
      packedItems: (json['packedItems'] as num?)?.toInt() ?? 0,
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      totalWeight: (json['totalWeight'] as num?)?.toDouble() ?? 0,
      totalVolume: (json['totalVolume'] as num?)?.toDouble() ?? 0,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$PackingListModelToJson(_PackingListModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tripId': instance.tripId,
      'items': instance.items,
      'luggage': instance.luggage,
      'isComplete': instance.isComplete,
      'totalItems': instance.totalItems,
      'packedItems': instance.packedItems,
      'progress': instance.progress,
      'totalWeight': instance.totalWeight,
      'totalVolume': instance.totalVolume,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

_PackingItemModel _$PackingItemModelFromJson(Map<String, dynamic> json) =>
    _PackingItemModel(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String? ?? 'other',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      packed: json['packed'] as bool? ?? false,
      weight: (json['weight'] as num?)?.toDouble() ?? 0,
      isEssential: json['isEssential'] as bool? ?? false,
      isShared: json['isShared'] as bool? ?? false,
      source: json['source'] as String? ?? 'manual',
      notes: json['notes'] as String? ?? '',
      packedAt: json['packedAt'] as String?,
    );

Map<String, dynamic> _$PackingItemModelToJson(_PackingItemModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'category': instance.category,
      'quantity': instance.quantity,
      'packed': instance.packed,
      'weight': instance.weight,
      'isEssential': instance.isEssential,
      'isShared': instance.isShared,
      'source': instance.source,
      'notes': instance.notes,
      'packedAt': instance.packedAt,
    };

_PackingLuggageModel _$PackingLuggageModelFromJson(Map<String, dynamic> json) =>
    _PackingLuggageModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String? ?? 'backpack',
      maxWeight: (json['maxWeight'] as num?)?.toDouble() ?? 0,
      currentWeight: (json['currentWeight'] as num?)?.toDouble() ?? 0,
      airline: json['airline'] as String? ?? '',
      color: json['color'] as String? ?? '',
    );

Map<String, dynamic> _$PackingLuggageModelToJson(
        _PackingLuggageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'type': instance.type,
      'maxWeight': instance.maxWeight,
      'currentWeight': instance.currentWeight,
      'airline': instance.airline,
      'color': instance.color,
    };

_PackingSuggestion _$PackingSuggestionFromJson(Map<String, dynamic> json) =>
    _PackingSuggestion(
      type: json['type'] as String? ?? 'tip',
      message: json['message'] as String? ?? '',
    );

Map<String, dynamic> _$PackingSuggestionToJson(_PackingSuggestion instance) =>
    <String, dynamic>{
      'type': instance.type,
      'message': instance.message,
    };

_PackingTemplate _$PackingTemplateFromJson(Map<String, dynamic> json) =>
    _PackingTemplate(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      type: json['type'] as String? ?? 'system',
      tripCategory: json['tripCategory'] as String?,
      season: json['season'] as String?,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => TemplateItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      usageCount: (json['usageCount'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$PackingTemplateToJson(_PackingTemplate instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'type': instance.type,
      'tripCategory': instance.tripCategory,
      'season': instance.season,
      'items': instance.items,
      'usageCount': instance.usageCount,
    };

_TemplateItem _$TemplateItemFromJson(Map<String, dynamic> json) =>
    _TemplateItem(
      name: json['name'] as String,
      category: json['category'] as String? ?? 'other',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      isEssential: json['isEssential'] as bool? ?? false,
    );

Map<String, dynamic> _$TemplateItemToJson(_TemplateItem instance) =>
    <String, dynamic>{
      'name': instance.name,
      'category': instance.category,
      'quantity': instance.quantity,
      'isEssential': instance.isEssential,
    };
