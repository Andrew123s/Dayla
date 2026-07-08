import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/piko/data/datasources/piko_remote_datasource.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';
import 'package:dayla_flutter/features/piko/data/repositories/piko_repository.dart';

final pikoRemoteDatasourceProvider = Provider<PikoRemoteDatasource>((ref) {
  return PikoRemoteDatasource(ref.watch(dioProvider));
});

final pikoRepositoryProvider = Provider<PikoRepository>((ref) {
  return PikoRepository(ref.watch(pikoRemoteDatasourceProvider));
});

/// Discover feed filters, mirroring the web app's chips + search.
class PikoFilters {
  const PikoFilters({
    this.chip = 'all',
    this.query = '',
    this.country = 'all',
  });

  /// One of: all | eco | group | easy | hard.
  final String chip;
  final String query;
  final String country;

  PikoFilters copyWith({String? chip, String? query, String? country}) {
    return PikoFilters(
      chip: chip ?? this.chip,
      query: query ?? this.query,
      country: country ?? this.country,
    );
  }
}

final pikoFiltersProvider =
    StateProvider<PikoFilters>((ref) => const PikoFilters());

final pikoRoutesProvider =
    AsyncNotifierProvider<PikoRoutesNotifier, List<RouteModel>>(
        PikoRoutesNotifier.new);

class PikoRoutesNotifier extends AsyncNotifier<List<RouteModel>> {
  @override
  Future<List<RouteModel>> build() async {
    final filters = ref.watch(pikoFiltersProvider);
    final repo = ref.watch(pikoRepositoryProvider);

    // The easy/hard chips map to the difficulty query param; eco/group use
    // the dedicated `filter` param (matches piko.controller.js).
    final isDifficultyChip = filters.chip == 'easy' || filters.chip == 'hard';
    return repo.getRoutes(
      country: filters.country,
      difficulty: isDifficultyChip ? filters.chip : null,
      filter: isDifficultyChip ? null : filters.chip,
      query: filters.query,
    );
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(build);
  }

  /// Toggle save on a route and update it in place.
  Future<void> toggleSave(String routeId) async {
    final result =
        await ref.read(pikoRepositoryProvider).toggleSave(routeId);
    if (result == null) return;
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncValue.data([
      for (final r in current)
        if (r.id == routeId)
          r.copyWith(isSaved: result.isSaved, saveCount: result.saveCount)
        else
          r,
    ]);
    ref.invalidate(pikoSavedRoutesProvider);
  }
}

final pikoSavedRoutesProvider =
    AsyncNotifierProvider<PikoSavedRoutesNotifier, List<RouteModel>>(
        PikoSavedRoutesNotifier.new);

class PikoSavedRoutesNotifier extends AsyncNotifier<List<RouteModel>> {
  @override
  Future<List<RouteModel>> build() async {
    return ref.watch(pikoRepositoryProvider).getSaved();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(build);
  }
}

final pikoRouteDetailProvider = AsyncNotifierProvider.family<
    PikoRouteDetailNotifier, RouteModel?, String>(PikoRouteDetailNotifier.new);

class PikoRouteDetailNotifier extends FamilyAsyncNotifier<RouteModel?, String> {
  @override
  Future<RouteModel?> build(String arg) async {
    return ref.watch(pikoRepositoryProvider).getRoute(arg);
  }

  Future<void> toggleSave() async {
    final route = state.valueOrNull;
    if (route == null) return;
    final result = await ref.read(pikoRepositoryProvider).toggleSave(arg);
    if (result == null) return;
    state = AsyncValue.data(
      route.copyWith(isSaved: result.isSaved, saveCount: result.saveCount),
    );
    ref.invalidate(pikoSavedRoutesProvider);
  }

  /// Throws [PikoActionException] when voting is unavailable (Pro gate).
  Future<void> vote(int value) async {
    final route = state.valueOrNull;
    if (route == null) return;
    final result = await ref.read(pikoRepositoryProvider).vote(arg, value);
    state = AsyncValue.data(
      route.copyWith(voteScore: result.voteScore, userVote: result.userVote),
    );
  }
}

final pikoCommentsProvider = AsyncNotifierProvider.family<
    PikoCommentsNotifier, List<RouteCommentModel>, String>(
        PikoCommentsNotifier.new);

class PikoCommentsNotifier
    extends FamilyAsyncNotifier<List<RouteCommentModel>, String> {
  @override
  Future<List<RouteCommentModel>> build(String arg) async {
    return ref.watch(pikoRepositoryProvider).getComments(arg);
  }

  Future<bool> addComment(String content) async {
    final comment =
        await ref.read(pikoRepositoryProvider).addComment(arg, content);
    if (comment == null) return false;
    state = AsyncValue.data([...state.valueOrNull ?? [], comment]);
    return true;
  }
}

/// Plans (trips) the viewer can add a route to.
final pikoPlansProvider = FutureProvider<List<PikoPlan>>((ref) {
  return ref.watch(pikoRepositoryProvider).getPlans();
});
