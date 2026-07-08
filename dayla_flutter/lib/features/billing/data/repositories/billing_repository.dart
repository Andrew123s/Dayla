import 'package:dio/dio.dart';

import 'package:dayla_flutter/features/billing/data/datasources/billing_remote_datasource.dart';
import 'package:dayla_flutter/features/billing/data/models/billing_models.dart';

class BillingRepository {
  BillingRepository(this._remote);

  final BillingRemoteDatasource _remote;

  Future<PlanCatalogue?> getPlans() async {
    try {
      final json = await _remote.getPlans();
      final data = json['data'] as Map? ?? {};
      final plans = data['plans'] as Map? ?? {};
      return PlanCatalogue(
        free: BillingPlan.fromJson(
            Map<String, dynamic>.from(plans['free'] as Map? ?? {})),
        proMonthly: BillingPlan.fromJson(
            Map<String, dynamic>.from(plans['proMonthly'] as Map? ?? {})),
        proAnnual: BillingPlan.fromJson(
            Map<String, dynamic>.from(plans['proAnnual'] as Map? ?? {})),
        billingEnabled: data['billingEnabled'] == true,
      );
    } on DioException {
      return null;
    }
  }

  /// Falls back to free access when the endpoint is unreachable — the server
  /// always re-checks, so client gating is UX only.
  Future<SubscriptionAccess> getSubscription() async {
    try {
      final json = await _remote.getSubscription();
      final data = json['data'] as Map? ?? {};
      return SubscriptionAccess.fromJson(Map<String, dynamic>.from(data));
    } on DioException {
      return SubscriptionAccess.free;
    }
  }

  /// Returns the Stripe Checkout URL, or an error message via exception.
  Future<String> createCheckoutUrl(String cycle) async {
    try {
      final json = await _remote.createCheckoutSession(cycle);
      final url = json['data']?['url'];
      if (url is String && url.isNotEmpty) return url;
      throw BillingException(
          (json['message'] ?? 'Checkout unavailable').toString());
    } on DioException catch (e) {
      throw BillingException(_message(e, 'Checkout unavailable'));
    }
  }

  Future<String> createPortalUrl() async {
    try {
      final json = await _remote.createCustomerPortal();
      final url = json['data']?['url'];
      if (url is String && url.isNotEmpty) return url;
      throw BillingException(
          (json['message'] ?? 'Billing portal unavailable').toString());
    } on DioException catch (e) {
      throw BillingException(_message(e, 'Billing portal unavailable'));
    }
  }

  static String _message(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    return fallback;
  }
}

class BillingException implements Exception {
  const BillingException(this.message);

  final String message;

  @override
  String toString() => message;
}
