import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/dashboard/data/datasources/dashboard_remote_datasource.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';
import 'package:dayla_flutter/features/dashboard/data/repositories/dashboard_repository.dart';

final dashboardRemoteDatasourceProvider =
    Provider<DashboardRemoteDatasource>((ref) {
  return DashboardRemoteDatasource(ref.watch(dioProvider));
});

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(dashboardRemoteDatasourceProvider));
});

final tripsProvider =
    AsyncNotifierProvider<TripsNotifier, List<TripModel>>(TripsNotifier.new);

class TripsNotifier extends AsyncNotifier<List<TripModel>> {
  @override
  Future<List<TripModel>> build() async {
    final repo = ref.watch(dashboardRepositoryProvider);
    return repo.getTrips();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() {
      final repo = ref.read(dashboardRepositoryProvider);
      return repo.getTrips();
    });
  }

  Future<TripModel?> createTrip({
    required String name,
    String? description,
    String? category,
    String? destination,
    Map<String, String>? dates,
  }) async {
    final repo = ref.read(dashboardRepositoryProvider);
    final trip = await repo.createTrip(
      name: name,
      description: description,
      category: category,
      destination: destination,
      dates: dates,
    );
    if (trip != null) {
      await refresh();
    }
    return trip;
  }

  Future<bool> deleteTrip(String id) async {
    final repo = ref.read(dashboardRepositoryProvider);
    final success = await repo.deleteTrip(id);
    if (success) {
      await refresh();
    }
    return success;
  }
}

final selectedTripProvider = StateProvider<TripModel?>((ref) => null);
