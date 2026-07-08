/// Billing DTOs — plain classes (no codegen): read-only views over
/// GET /api/billing/plans and /api/billing/subscription.
library;

/// Feature keys mirroring backend `config/plans.js` FEATURES.
abstract final class ProFeatures {
  static const footprint = 'footprint';
  static const trailsCreate = 'trailsCreate';
  static const trailsBrowse = 'trailsBrowse';
  static const ntelipak = 'ntelipak';
  static const weather = 'weather';
  static const collaborators = 'collaborators';
  static const priority = 'priority';
}

class BillingPlan {
  const BillingPlan({
    required this.id,
    required this.name,
    required this.price,
    required this.currency,
    this.billingCycle,
    required this.collaboratorLimit,
    required this.features,
    required this.purchasable,
  });

  final String id;
  final String name;
  final num price;
  final String currency;
  final String? billingCycle;

  /// -1 = unlimited.
  final int collaboratorLimit;
  final Map<String, bool> features;
  final bool purchasable;

  factory BillingPlan.fromJson(Map<String, dynamic> json) {
    final limits = json['limits'] as Map? ?? {};
    final features = json['features'] as Map? ?? {};
    return BillingPlan(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      price: (json['price'] as num?) ?? 0,
      currency: (json['currency'] ?? 'eur').toString(),
      billingCycle: json['billingCycle'] as String?,
      collaboratorLimit: (limits['collaborators'] as num?)?.toInt() ?? 0,
      features: features.map((k, v) => MapEntry(k.toString(), v == true)),
      purchasable: json['purchasable'] == true,
    );
  }
}

class PlanCatalogue {
  const PlanCatalogue({
    required this.free,
    required this.proMonthly,
    required this.proAnnual,
    required this.billingEnabled,
  });

  final BillingPlan free;
  final BillingPlan proMonthly;
  final BillingPlan proAnnual;
  final bool billingEnabled;
}

/// The viewer's entitlements — `access` from GET /api/billing/subscription.
class SubscriptionAccess {
  const SubscriptionAccess({
    required this.isPro,
    required this.plan,
    required this.collaboratorLimit,
    required this.features,
    this.billingEnabled = false,
    this.currentPeriodEnd,
    this.cancelAtPeriodEnd = false,
  });

  final bool isPro;

  /// 'free' | 'pro'
  final String plan;
  final int collaboratorLimit;
  final Map<String, bool> features;
  final bool billingEnabled;
  final DateTime? currentPeriodEnd;
  final bool cancelAtPeriodEnd;

  bool canUse(String feature) => features[feature] == true;

  static const free = SubscriptionAccess(
    isPro: false,
    plan: 'free',
    collaboratorLimit: 2,
    features: {
      ProFeatures.footprint: false,
      ProFeatures.trailsCreate: false,
      ProFeatures.trailsBrowse: true,
      ProFeatures.ntelipak: true,
      ProFeatures.weather: true,
      ProFeatures.collaborators: true,
      ProFeatures.priority: false,
    },
  );

  factory SubscriptionAccess.fromJson(Map<String, dynamic> data) {
    final access = data['access'] as Map? ?? {};
    final billing = data['billing'] as Map?;
    final features = access['features'] as Map? ?? {};
    return SubscriptionAccess(
      isPro: access['isPro'] == true,
      plan: (access['plan'] ?? 'free').toString(),
      collaboratorLimit:
          (access['collaboratorLimit'] as num?)?.toInt() ?? 2,
      features: features.map((k, v) => MapEntry(k.toString(), v == true)),
      billingEnabled: data['billingEnabled'] == true,
      currentPeriodEnd: billing?['currentPeriodEnd'] != null
          ? DateTime.tryParse(billing!['currentPeriodEnd'].toString())
          : null,
      cancelAtPeriodEnd: billing?['cancelAtPeriodEnd'] == true,
    );
  }
}
