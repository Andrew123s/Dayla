import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/billing/data/datasources/billing_remote_datasource.dart';
import 'package:dayla_flutter/features/billing/data/models/billing_models.dart';
import 'package:dayla_flutter/features/billing/data/repositories/billing_repository.dart';

final billingRemoteDatasourceProvider =
    Provider<BillingRemoteDatasource>((ref) {
  return BillingRemoteDatasource(ref.watch(dioProvider));
});

final billingRepositoryProvider = Provider<BillingRepository>((ref) {
  return BillingRepository(ref.watch(billingRemoteDatasourceProvider));
});

final planCatalogueProvider = FutureProvider<PlanCatalogue?>((ref) {
  return ref.watch(billingRepositoryProvider).getPlans();
});

/// The viewer's entitlements. Server always re-checks — this is UX gating.
final subscriptionProvider =
    AsyncNotifierProvider<SubscriptionNotifier, SubscriptionAccess>(
        SubscriptionNotifier.new);

class SubscriptionNotifier extends AsyncNotifier<SubscriptionAccess> {
  @override
  Future<SubscriptionAccess> build() {
    return ref.watch(billingRepositoryProvider).getSubscription();
  }

  Future<void> refresh() async {
    final result =
        await ref.read(billingRepositoryProvider).getSubscription();
    state = AsyncValue.data(result);
  }
}

/// Synchronous convenience for UI gating (defaults to free while loading).
final subscriptionAccessProvider = Provider<SubscriptionAccess>((ref) {
  return ref.watch(subscriptionProvider).valueOrNull ??
      SubscriptionAccess.free;
});

final isProProvider = Provider<bool>((ref) {
  return ref.watch(subscriptionAccessProvider).isPro;
});
