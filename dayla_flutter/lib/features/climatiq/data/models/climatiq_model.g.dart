// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'climatiq_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_EmissionResult _$EmissionResultFromJson(Map<String, dynamic> json) =>
    _EmissionResult(
      emissions: (json['emissions'] as num?)?.toDouble() ?? 0,
      unit: json['unit'] as String? ?? 'kg CO2e',
      mode: json['mode'] as String?,
      distance: (json['distance'] as num?)?.toDouble(),
      type: json['type'] as String?,
      nights: (json['nights'] as num?)?.toInt(),
      mealType: json['mealType'] as String?,
      numberOfMeals: (json['numberOfMeals'] as num?)?.toInt(),
    );

Map<String, dynamic> _$EmissionResultToJson(_EmissionResult instance) =>
    <String, dynamic>{
      'emissions': instance.emissions,
      'unit': instance.unit,
      'mode': instance.mode,
      'distance': instance.distance,
      'type': instance.type,
      'nights': instance.nights,
      'mealType': instance.mealType,
      'numberOfMeals': instance.numberOfMeals,
    };

_TripEmissionResult _$TripEmissionResultFromJson(Map<String, dynamic> json) =>
    _TripEmissionResult(
      totalEmissions: (json['totalEmissions'] as num?)?.toDouble() ?? 0,
      unit: json['unit'] as String? ?? 'kg CO2e',
      transportEmissions: (json['transportEmissions'] as num?)?.toDouble() ?? 0,
      accommodationEmissions:
          (json['accommodationEmissions'] as num?)?.toDouble() ?? 0,
      foodEmissions: (json['foodEmissions'] as num?)?.toDouble() ?? 0,
      activityEmissions: (json['activityEmissions'] as num?)?.toDouble() ?? 0,
      breakdown: (json['breakdown'] as List<dynamic>?)
              ?.map(
                  (e) => EmissionBreakdown.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      ecoRating: json['ecoRating'] as String? ?? '',
      recommendations: (json['recommendations'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$TripEmissionResultToJson(_TripEmissionResult instance) =>
    <String, dynamic>{
      'totalEmissions': instance.totalEmissions,
      'unit': instance.unit,
      'transportEmissions': instance.transportEmissions,
      'accommodationEmissions': instance.accommodationEmissions,
      'foodEmissions': instance.foodEmissions,
      'activityEmissions': instance.activityEmissions,
      'breakdown': instance.breakdown,
      'ecoRating': instance.ecoRating,
      'recommendations': instance.recommendations,
    };

_EmissionBreakdown _$EmissionBreakdownFromJson(Map<String, dynamic> json) =>
    _EmissionBreakdown(
      category: json['category'] as String? ?? '',
      emissions: (json['emissions'] as num?)?.toDouble() ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$EmissionBreakdownToJson(_EmissionBreakdown instance) =>
    <String, dynamic>{
      'category': instance.category,
      'emissions': instance.emissions,
      'percentage': instance.percentage,
    };

_TransportInput _$TransportInputFromJson(Map<String, dynamic> json) =>
    _TransportInput(
      mode: json['mode'] as String,
      distance: (json['distance'] as num).toDouble(),
      passengers: (json['passengers'] as num?)?.toInt() ?? 1,
      fuelType: json['fuelType'] as String?,
      cabinClass: json['cabinClass'] as String?,
    );

Map<String, dynamic> _$TransportInputToJson(_TransportInput instance) =>
    <String, dynamic>{
      'mode': instance.mode,
      'distance': instance.distance,
      'passengers': instance.passengers,
      'fuelType': instance.fuelType,
      'cabinClass': instance.cabinClass,
    };

_AccommodationInput _$AccommodationInputFromJson(Map<String, dynamic> json) =>
    _AccommodationInput(
      type: json['type'] as String,
      nights: (json['nights'] as num).toInt(),
      country: json['country'] as String,
      starRating: (json['starRating'] as num?)?.toInt(),
    );

Map<String, dynamic> _$AccommodationInputToJson(_AccommodationInput instance) =>
    <String, dynamic>{
      'type': instance.type,
      'nights': instance.nights,
      'country': instance.country,
      'starRating': instance.starRating,
    };

_FoodInput _$FoodInputFromJson(Map<String, dynamic> json) => _FoodInput(
      mealType: json['mealType'] as String,
      countryCode: json['countryCode'] as String,
      numberOfMeals: (json['numberOfMeals'] as num).toInt(),
    );

Map<String, dynamic> _$FoodInputToJson(_FoodInput instance) =>
    <String, dynamic>{
      'mealType': instance.mealType,
      'countryCode': instance.countryCode,
      'numberOfMeals': instance.numberOfMeals,
    };
