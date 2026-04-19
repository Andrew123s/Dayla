import 'package:dio/dio.dart';
import 'package:dayla_flutter/features/dashboard/data/datasources/dashboard_remote_datasource.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

class DashboardRepository {
  DashboardRepository(this._remote);

  final DashboardRemoteDatasource _remote;

  Future<List<TripModel>> getTrips() async {
    try {
      final json = await _remote.getTrips();
      final trips = (json['data']?['trips'] as List?) ?? [];
      return trips
          .map((t) => TripModel.fromJson(t as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<TripModel?> getTrip(String id) async {
    try {
      final json = await _remote.getTrip(id);
      final data = json['data'];
      if (data == null) return null;
      final tripJson = data is Map && data.containsKey('trip')
          ? data['trip']
          : data;
      return TripModel.fromJson(tripJson as Map<String, dynamic>);
    } on DioException {
      return null;
    }
  }

  Future<TripModel?> createTrip({
    required String name,
    String? description,
    String? category,
    String? destination,
    Map<String, String>? dates,
  }) async {
    try {
      final json = await _remote.createTrip(
        name: name,
        description: description,
        category: category,
        destination: destination,
        dates: dates,
      );
      if (json['success'] == true && json['data']?['trip'] != null) {
        return TripModel.fromJson(
            json['data']['trip'] as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<bool> updateTrip(String id, Map<String, dynamic> data) async {
    try {
      final json = await _remote.updateTrip(id, data);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> deleteTrip(String id) async {
    try {
      final json = await _remote.deleteTrip(id);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<BoardModel?> getBoardByTrip(String tripId) async {
    try {
      final json = await _remote.getBoardByTrip(tripId);
      if (json['success'] == true && json['data'] != null) {
        final boardJson = json['data'] is Map && json['data'].containsKey('dashboard')
            ? json['data']['dashboard']
            : json['data'];
        return BoardModel.fromJson(boardJson as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<bool> inviteToBoard(String boardId, String email) async {
    try {
      final json = await _remote.inviteToBoard(boardId, email);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<Map<String, dynamic>?> getWeather(
    String location, {
    int days = 5,
  }) async {
    try {
      final json = await _remote.getWeather(location, days: days);
      if (json['success'] == true) return json['data'] as Map<String, dynamic>?;
      return null;
    } on DioException {
      return null;
    }
  }
}
