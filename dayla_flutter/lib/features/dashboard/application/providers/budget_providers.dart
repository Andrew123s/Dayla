import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/expense_model.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

typedef BudgetState = ({TripModel? trip, List<ExpenseModel> expenses});

/// Provider-owned budget state for one trip (same pattern as the chat
/// thread's conversationMessagesProvider): the screen is a pure renderer,
/// and every mutation goes through the notifier followed by an
/// authoritative refetch.
final budgetProvider = AsyncNotifierProvider.autoDispose
    .family<BudgetNotifier, BudgetState, String>(BudgetNotifier.new);

class BudgetNotifier
    extends AutoDisposeFamilyAsyncNotifier<BudgetState, String> {
  @override
  Future<BudgetState> build(String arg) => _load();

  Future<BudgetState> _load() async {
    final repo = ref.read(dashboardRepositoryProvider);
    final results = await Future.wait([
      repo.getTrip(arg),
      repo.getBudget(arg),
    ]);
    final budget =
        results[1] as ({List<ExpenseModel> expenses, double budgetUSD});
    return (trip: results[0] as TripModel?, expenses: budget.expenses);
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(_load);
  }

  /// Budget totals are tracked in USD (matches the web's budgetUSD).
  Future<bool> setBudget(double total) async {
    final ok = await ref.read(dashboardRepositoryProvider).updateTrip(arg, {
      'budget': {'total': total, 'currency': 'USD'},
    });
    if (ok) await refresh();
    return ok;
  }

  Future<bool> createExpense(Map<String, dynamic> data) async {
    final ok =
        await ref.read(dashboardRepositoryProvider).createExpense(arg, data);
    if (ok) await refresh();
    return ok;
  }

  Future<bool> deleteExpense(String expenseId) async {
    final ok = await ref
        .read(dashboardRepositoryProvider)
        .deleteExpense(arg, expenseId);
    await refresh();
    return ok;
  }
}
