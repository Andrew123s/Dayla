import 'package:freezed_annotation/freezed_annotation.dart';

part 'packing_model.freezed.dart';
part 'packing_model.g.dart';

@freezed
abstract class PackingListModel with _$PackingListModel {
  const factory PackingListModel({
    required String id,
    required String tripId,
    @Default([]) List<PackingItemModel> items,
    @Default([]) List<PackingLuggageModel> luggage,
    @Default(false) bool isComplete,
    @Default(0) int totalItems,
    @Default(0) int packedItems,
    @Default(0) double progress,
    @Default(0) double totalWeight,
    @Default(0) double totalVolume,
    String? createdAt,
    String? updatedAt,
  }) = _PackingListModel;

  factory PackingListModel.fromJson(Map<String, dynamic> json) =>
      _$PackingListModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class PackingItemModel with _$PackingItemModel {
  const factory PackingItemModel({
    required String id,
    required String name,
    @Default('other') String category,
    @Default(1) int quantity,
    @Default(false) bool packed,
    @Default(0) double weight,
    @Default(false) bool isEssential,
    @Default(false) bool isShared,
    @Default('manual') String source,
    @Default('') String notes,
    String? packedAt,
  }) = _PackingItemModel;

  factory PackingItemModel.fromJson(Map<String, dynamic> json) =>
      _$PackingItemModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class PackingLuggageModel with _$PackingLuggageModel {
  const factory PackingLuggageModel({
    required String id,
    required String name,
    @Default('backpack') String type,
    @Default(0) double maxWeight,
    @Default(0) double currentWeight,
    @Default('') String airline,
    @Default('') String color,
  }) = _PackingLuggageModel;

  factory PackingLuggageModel.fromJson(Map<String, dynamic> json) =>
      _$PackingLuggageModelFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class PackingSuggestion with _$PackingSuggestion {
  const factory PackingSuggestion({
    @Default('tip') String type,
    @Default('') String message,
  }) = _PackingSuggestion;

  factory PackingSuggestion.fromJson(Map<String, dynamic> json) =>
      _$PackingSuggestionFromJson(json);
}

@freezed
abstract class PackingTemplate with _$PackingTemplate {
  const factory PackingTemplate({
    required String id,
    required String name,
    @Default('') String description,
    @Default('system') String type,
    String? tripCategory,
    String? season,
    @Default([]) List<TemplateItem> items,
    @Default(0) int usageCount,
  }) = _PackingTemplate;

  factory PackingTemplate.fromJson(Map<String, dynamic> json) =>
      _$PackingTemplateFromJson(_normalize(json));

  static Map<String, dynamic> _normalize(Map<String, dynamic> json) {
    final copy = Map<String, dynamic>.from(json);
    copy['id'] ??= copy['_id'];
    return copy;
  }
}

@freezed
abstract class TemplateItem with _$TemplateItem {
  const factory TemplateItem({
    required String name,
    @Default('other') String category,
    @Default(1) int quantity,
    @Default(false) bool isEssential,
  }) = _TemplateItem;

  factory TemplateItem.fromJson(Map<String, dynamic> json) =>
      _$TemplateItemFromJson(json);
}
