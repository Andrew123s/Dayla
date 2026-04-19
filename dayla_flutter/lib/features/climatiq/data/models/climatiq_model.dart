import 'package:freezed_annotation/freezed_annotation.dart';

part 'climatiq_model.freezed.dart';
part 'climatiq_model.g.dart';

@freezed
abstract class EmissionResult with _$EmissionResult {
  const factory EmissionResult({
    @Default(0) double emissions,
    @Default('kg CO2e') String unit,
    String? mode,
    double? distance,
    String? type,
    int? nights,
    String? mealType,
    int? numberOfMeals,
  }) = _EmissionResult;

  factory EmissionResult.fromJson(Map<String, dynamic> json) =>
      _$EmissionResultFromJson(json);
}

@freezed
abstract class TripEmissionResult with _$TripEmissionResult {
  const factory TripEmissionResult({
    @Default(0) double totalEmissions,
    @Default('kg CO2e') String unit,
    @Default(0) double transportEmissions,
    @Default(0) double accommodationEmissions,
    @Default(0) double foodEmissions,
    @Default(0) double activityEmissions,
    @Default([]) List<EmissionBreakdown> breakdown,
    @Default('') String ecoRating,
    @Default([]) List<String> recommendations,
  }) = _TripEmissionResult;

  factory TripEmissionResult.fromJson(Map<String, dynamic> json) =>
      _$TripEmissionResultFromJson(json);
}

@freezed
abstract class EmissionBreakdown with _$EmissionBreakdown {
  const factory EmissionBreakdown({
    @Default('') String category,
    @Default(0) double emissions,
    @Default(0) double percentage,
  }) = _EmissionBreakdown;

  factory EmissionBreakdown.fromJson(Map<String, dynamic> json) =>
      _$EmissionBreakdownFromJson(json);
}

@freezed
abstract class TransportInput with _$TransportInput {
  const factory TransportInput({
    required String mode,
    required double distance,
    @Default(1) int passengers,
    String? fuelType,
    String? cabinClass,
  }) = _TransportInput;

  factory TransportInput.fromJson(Map<String, dynamic> json) =>
      _$TransportInputFromJson(json);
}

@freezed
abstract class AccommodationInput with _$AccommodationInput {
  const factory AccommodationInput({
    required String type,
    required int nights,
    required String country,
    int? starRating,
  }) = _AccommodationInput;

  factory AccommodationInput.fromJson(Map<String, dynamic> json) =>
      _$AccommodationInputFromJson(json);
}

@freezed
abstract class FoodInput with _$FoodInput {
  const factory FoodInput({
    required String mealType,
    required String countryCode,
    required int numberOfMeals,
  }) = _FoodInput;

  factory FoodInput.fromJson(Map<String, dynamic> json) =>
      _$FoodInputFromJson(json);
}
