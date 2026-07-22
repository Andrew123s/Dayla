/// Cross-account isolation regression: after a logout/login boundary the
/// user-scoped providers must REFETCH for the new account, never serve the
/// previous user's cached data. Proven here on the representative
/// tripsProvider (the reset invalidates the whole registered set the same
/// way).
library;

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/core/session/session_reset.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/datasources/dashboard_remote_datasource.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';
import 'package:dayla_flutter/features/dashboard/data/repositories/dashboard_repository.dart';

/// Returns different trips on each fetch, standing in for two accounts.
class _SwitchingRepo extends DashboardRepository {
  _SwitchingRepo() : super(DashboardRemoteDatasource(Dio()));
  int calls = 0;
  @override
  Future<List<TripModel>> getTrips() async {
    calls++;
    return [
      TripModel(id: 'id$calls', name: calls == 1 ? 'Alice trip' : 'Bob trip'),
    ];
  }
}

// Lets the test invoke the production reset with a real Ref.
final _resetInvoker = Provider((ref) => () => resetUserScopedProviders(ref));

void main() {
  test('reset forces user-scoped providers to refetch (no cross-account cache)',
      () async {
    final repo = _SwitchingRepo();
    final container = ProviderContainer(
      overrides: [dashboardRepositoryProvider.overrideWithValue(repo)],
    );
    addTearDown(container.dispose);

    // "Alice" session.
    final first = await container.read(tripsProvider.future);
    expect(first.single.name, 'Alice trip');
    // Re-reading WITHOUT a reset serves the same cache — this is exactly the
    // surface that leaked across accounts before the fix.
    expect((await container.read(tripsProvider.future)).single.name,
        'Alice trip');
    expect(repo.calls, 1);

    // Logout → login boundary.
    container.read(_resetInvoker)();

    // "Bob" session — provider was invalidated, so it refetches his data.
    final second = await container.read(tripsProvider.future);
    expect(second.single.name, 'Bob trip',
        reason: 'after reset the provider must refetch, not serve the '
            'previous account cache');
    expect(repo.calls, 2);
  });
}
