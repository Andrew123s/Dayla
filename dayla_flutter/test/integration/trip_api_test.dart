@Tags(['integration'])
library;

/// End-to-end proof of the trip-creation pipeline: runs the app's REAL
/// datasource, repository and models against the PRODUCTION API with the
/// Play-review test account — the exact flow behind the Create Trip button.
///
/// Run: flutter test test/integration --tags integration
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/features/dashboard/data/datasources/dashboard_remote_datasource.dart';
import 'package:dayla_flutter/features/dashboard/data/repositories/dashboard_repository.dart';

const _base = 'https://dayla.onrender.com';
const _email = 'playreview@daylapp.com';
const _password = 'DaylaReview2026!';

void main() {
  late DashboardRepository repo;

  setUpAll(() async {
    final login = await Dio(BaseOptions(
      baseUrl: _base,
      connectTimeout: const Duration(seconds: 90),
      receiveTimeout: const Duration(seconds: 90),
    )).post('/api/auth/login',
        data: {'email': _email, 'password': _password});
    final token = login.data['data']['token'] as String;
    expect(token, isNotEmpty, reason: 'login must issue a JWT');

    // Same shape as core/network/dio_provider.dart.
    final dio = Dio(BaseOptions(
      baseUrl: _base,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    ));
    repo = DashboardRepository(DashboardRemoteDatasource(dio));
  });

  test('trips list loads and parses', () async {
    final trips = await repo.getTrips();
    expect(trips, isNotEmpty,
        reason: 'the reviewer account has at least one trip');
    expect(trips.first.id, isNotEmpty);
  });

  test('create trip returns a parsed trip, then delete cleans up', () async {
    final marker =
        'Integration trip ${DateTime.now().millisecondsSinceEpoch}';
    final trip = await repo.createTrip(
      name: marker,
      description: 'created by trip_api_test',
      category: 'exploring',
      destination: 'Test Valley',
      dates: {
        'startDate': DateTime.now()
            .add(const Duration(days: 30))
            .toIso8601String(),
        'endDate': DateTime.now()
            .add(const Duration(days: 33))
            .toIso8601String(),
      },
    );
    expect(trip, isNotNull,
        reason: 'the raw create payload (string owner) must parse — '
            'a null here is the "Create Trip spins forever" bug');
    expect(trip!.name, marker);
    expect(trip.id, isNotEmpty);

    final listed = await repo.getTrips();
    expect(listed.any((t) => t.id == trip.id), isTrue,
        reason: 'the new trip must appear in the list');

    final deleted = await repo.deleteTrip(trip.id);
    expect(deleted, isTrue, reason: 'cleanup must succeed');
  });
}
