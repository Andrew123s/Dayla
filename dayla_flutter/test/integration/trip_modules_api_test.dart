@Tags(['integration'])
library;

/// End-to-end proof of the trip modules against PRODUCTION with the
/// Play-review account: planning board loads for a fresh trip, budget can be
/// set and read back, expenses persist, and the first packing item can be
/// added without any prior packing-list fetch (the auto-create fix).
///
/// Run: flutter test test/integration --tags integration
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/features/dashboard/data/datasources/dashboard_remote_datasource.dart';
import 'package:dayla_flutter/features/dashboard/data/repositories/dashboard_repository.dart';
import 'package:dayla_flutter/features/packing/data/datasources/packing_remote_datasource.dart';
import 'package:dayla_flutter/features/packing/data/repositories/packing_repository.dart';

const _base = 'https://dayla.onrender.com';
const _email = 'playreview@daylapp.com';
const _password = 'DaylaReview2026!';

void main() {
  late DashboardRepository dashboards;
  late PackingRepository packing;
  String? tripId;

  setUpAll(() async {
    final login = await Dio(BaseOptions(
      baseUrl: _base,
      connectTimeout: const Duration(seconds: 90),
      receiveTimeout: const Duration(seconds: 90),
    )).post('/api/auth/login',
        data: {'email': _email, 'password': _password});
    final token = login.data['data']['token'] as String;

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
    dashboards = DashboardRepository(DashboardRemoteDatasource(dio));
    packing = PackingRepository(PackingRemoteDatasource(dio));

    final trip = await dashboards.createTrip(
      name: 'Modules test ${DateTime.now().millisecondsSinceEpoch}',
      category: 'exploring',
    );
    expect(trip, isNotNull, reason: 'test trip must be created');
    tripId = trip!.id;
  });

  tearDownAll(() async {
    if (tripId != null) {
      await dashboards.deleteTrip(tripId!);
    }
  });

  test('planning board loads and parses for the trip', () async {
    final board = await dashboards.getBoardByTrip(tripId!);
    expect(board, isNotNull,
        reason: 'by-trip must return (or self-heal) a dashboard');
    expect(board!.tripId, tripId);
  });

  test('budget can be set and read back', () async {
    final ok = await dashboards.updateTrip(tripId!, {
      'budget': {'total': 750, 'currency': 'USD'},
    });
    expect(ok, isTrue, reason: 'budget update must be accepted');

    final trip = await dashboards.getTrip(tripId!);
    expect(trip?.budget?.total, 750,
        reason: 'the validator used to strip the budget key silently');
  });

  test('expenses persist: create, list, delete', () async {
    final created = await dashboards.createExpense(tripId!, {
      'title': 'Test dinner',
      'amount': 42.5,
      'currency': 'USD',
      'category': 'Food & Dining',
      'date': DateTime.now().toIso8601String().substring(0, 10),
      'paidBy': '6a50ec0233092c929530d5b0',
      'splitMethod': 'equal',
      'splits': [
        {'user': '6a50ec0233092c929530d5b0', 'amount': 42.5},
      ],
    });
    expect(created, isTrue);

    final budget = await dashboards.getBudget(tripId!);
    expect(budget.expenses.any((e) => e.title == 'Test dinner'), isTrue,
        reason: 'the expense must persist server-side');
    final expense =
        budget.expenses.firstWhere((e) => e.title == 'Test dinner');
    expect(expense.amountUSD, greaterThan(0));

    final deleted = await dashboards.deleteExpense(tripId!, expense.id);
    expect(deleted, isTrue);
    final after = await dashboards.getBudget(tripId!);
    expect(after.expenses.any((e) => e.id == expense.id), isFalse);
  });

  test('first packing item works without any prior list fetch', () async {
    // Deliberately NO getPackingList first — the old backend 404ed here
    // because only the GET auto-created the list ("+ button does nothing").
    final ok = await packing.addItem(tripId!, {
      'name': 'Head lamp',
      'category': 'gear',
      'quantity': 1,
    });
    expect(ok, isTrue,
        reason: 'addItem must auto-create the packing list when missing');

    final list = await packing.getPackingList(tripId!);
    expect(list?.items.any((i) => i.name == 'Head lamp'), isTrue);
  });
}
