import 'package:dio/dio.dart';
import 'package:dayla_flutter/features/climatiq/data/datasources/climatiq_remote_datasource.dart';
import 'package:dayla_flutter/features/climatiq/data/models/climatiq_model.dart';

class ClimatiqRepository {
  ClimatiqRepository(this._remote);

  final ClimatiqRemoteDatasource _remote;

  Future<bool> validateConnection() async {
    try {
      final json = await _remote.validateConnection();
      return json['success'] == true && json['connected'] == true;
    } on DioException {
      return false;
    }
  }

  Future<EmissionResult?> calculateTransport(TransportInput input) async {
    try {
      final json = await _remote.calculateTransport({
        'mode': input.mode,
        'distance': input.distance,
        'passengers': input.passengers,
        if (input.fuelType != null) 'fuel_type': input.fuelType,
        if (input.cabinClass != null) 'cabin_class': input.cabinClass,
      });
      final data = json['data'];
      if (data != null) {
        return EmissionResult.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<EmissionResult?> calculateAccommodation(
      AccommodationInput input) async {
    try {
      final json = await _remote.calculateAccommodation({
        'type': input.type,
        'nights': input.nights,
        'country': input.country,
        if (input.starRating != null) 'star_rating': input.starRating,
      });
      final data = json['data'];
      if (data != null) {
        return EmissionResult.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<EmissionResult?> calculateFood(FoodInput input) async {
    try {
      final json = await _remote.calculateFood({
        'meal_type': input.mealType,
        'country_code': input.countryCode,
        'number_of_meals': input.numberOfMeals,
      });
      final data = json['data'];
      if (data != null) {
        return EmissionResult.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<TripEmissionResult?> calculateTrip({
    List<Map<String, dynamic>> transport = const [],
    List<Map<String, dynamic>> accommodation = const [],
    List<Map<String, dynamic>> activities = const [],
    List<Map<String, dynamic>> food = const [],
  }) async {
    try {
      final json = await _remote.calculateTrip({
        'transport': transport,
        'accommodation': accommodation,
        'activities': activities,
        'food': food,
      });
      final data = json['data'];
      if (data != null) {
        return TripEmissionResult.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<TripEmissionResult?> calculateRealtime({
    required String destination,
    required int duration,
    String? transportMode,
    String? accommodationType,
  }) async {
    try {
      final json = await _remote.calculateRealtime({
        'destination': destination,
        'duration': duration,
        if (transportMode != null) 'transport_mode': transportMode,
        if (accommodationType != null)
          'accommodation_type': accommodationType,
      });
      final data = json['data'];
      if (data != null) {
        return TripEmissionResult.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }
}
