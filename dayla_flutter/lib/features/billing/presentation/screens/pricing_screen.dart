import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/billing/application/providers/billing_providers.dart';
import 'package:dayla_flutter/features/billing/data/repositories/billing_repository.dart';
import 'package:dayla_flutter/features/billing/data/services/revenuecat_service.dart';

/// Free vs Pro pricing page (mirrors the web PricingView). Upgrading opens
/// Stripe Checkout in the browser; after paying, pull-to-refresh (or
/// reopening the app) picks up the new entitlements from the backend.
class PricingScreen extends ConsumerStatefulWidget {
  const PricingScreen({super.key, this.attemptedFeature});

  /// Human label of the feature that triggered the paywall, e.g. "Eco-Tracker".
  final String? attemptedFeature;

  @override
  ConsumerState<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends ConsumerState<PricingScreen> {
  String _cycle = 'monthly';
  bool _busy = false;

  static const _proPerks = [
    ('Eco-Tracker carbon footprint', Icons.eco),
    ('Create your own trails (draw, GPS, GPX)', Icons.route),
    ('Group trail planning & voting', Icons.how_to_vote),
    ('Unlimited collaborators', Icons.group_add),
    ('Priority support', Icons.support_agent),
  ];

  static const _freePerks = [
    ('Trip dashboards & planning', Icons.dashboard),
    ('Ntelipak smart packing', Icons.backpack),
    ('Weather insights', Icons.wb_sunny),
    ('Browse & save Piko trails', Icons.hiking),
    ('Up to 2 collaborators', Icons.group),
  ];

  Future<void> _upgrade() async {
    // Store builds (RevenueCat keys baked in) buy through Google Play /
    // App Store as required by store policy; otherwise fall back to the
    // web's Stripe checkout in the browser.
    if (RevenueCatBilling.isAvailable) {
      return _upgradeViaStore();
    }
    setState(() => _busy = true);
    try {
      final url = await ref
          .read(billingRepositoryProvider)
          .createCheckoutUrl(_cycle);
      final ok =
          await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      if (!ok) _show('Could not open the checkout page');
    } on BillingException catch (e) {
      _show(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _upgradeViaStore() async {
    setState(() => _busy = true);
    try {
      final active =
          await RevenueCatBilling.purchasePro(annual: _cycle == 'annual');
      if (active) {
        _show("You're Pro! It may take a moment to activate everywhere.");
        await ref.read(subscriptionProvider.notifier).refresh();
      }
      // false = user cancelled the store sheet; stay quiet.
    } on RevenueCatException catch (e) {
      _show(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _restorePurchases() async {
    setState(() => _busy = true);
    final restored = await RevenueCatBilling.restore();
    if (restored) {
      await ref.read(subscriptionProvider.notifier).refresh();
    }
    if (mounted) {
      setState(() => _busy = false);
      _show(restored
          ? 'Purchases restored — welcome back to Pro!'
          : 'No previous purchases found for this account.');
    }
  }

  Future<void> _managePlan() async {
    setState(() => _busy = true);
    try {
      final url =
          await ref.read(billingRepositoryProvider).createPortalUrl();
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } on BillingException catch (e) {
      _show(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _show(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final access = ref.watch(subscriptionAccessProvider);
    final catalogue = ref.watch(planCatalogueProvider).valueOrNull;
    final monthlyPrice = catalogue?.proMonthly.price ?? 15;
    final annualPrice = catalogue?.proAnnual.price ?? 180;

    return Scaffold(
      appBar: AppBar(title: const Text('Dayla Pro')),
      body: RefreshIndicator(
        onRefresh: () => ref.read(subscriptionProvider.notifier).refresh(),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          children: [
            if (widget.attemptedFeature != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.sand.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lock_outline,
                        size: 18, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${widget.attemptedFeature} is a Pro feature',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (access.isPro) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.verified, color: Color(0xFF059669)),
                        SizedBox(width: 8),
                        Text(
                          "You're on Dayla Pro",
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                            color: Color(0xFF065F46),
                          ),
                        ),
                      ],
                    ),
                    if (access.currentPeriodEnd != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        access.cancelAtPeriodEnd
                            ? 'Pro until ${_date(access.currentPeriodEnd!)} (cancels after)'
                            : 'Renews ${_date(access.currentPeriodEnd!)}',
                        style: TextStyle(
                            fontSize: 13, color: Colors.grey.shade700),
                      ),
                    ],
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _busy ? null : _managePlan,
                      icon: const Icon(Icons.settings_outlined, size: 18),
                      label: const Text('Manage subscription'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Cycle toggle
            if (!access.isPro) ...[
              Center(
                child: SegmentedButton<String>(
                  segments: [
                    ButtonSegment(
                      value: 'monthly',
                      label: Text('Monthly · €${monthlyPrice.toStringAsFixed(0)}'),
                    ),
                    ButtonSegment(
                      value: 'annual',
                      label: Text(
                          'Annual · €${annualPrice.toStringAsFixed(0)}'),
                    ),
                  ],
                  selected: {_cycle},
                  onSelectionChanged: (s) =>
                      setState(() => _cycle = s.first),
                ),
              ),
              if (_cycle == 'annual')
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Center(
                    child: Text(
                      'Two months free vs monthly',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.green.shade700,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 20),
            ],

            // Pro card
            _PlanCard(
              title: 'Pro',
              subtitle: _cycle == 'monthly'
                  ? '€${monthlyPrice.toStringAsFixed(0)} / month'
                  : '€${annualPrice.toStringAsFixed(0)} / year',
              highlight: true,
              perks: _proPerks,
              footer: access.isPro
                  ? null
                  : FilledButton(
                      onPressed: _busy ? null : _upgrade,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child: _busy
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Upgrade to Pro'),
                    ),
            ),
            const SizedBox(height: 16),

            // Free card
            _PlanCard(
              title: 'Free',
              subtitle: 'What you already have',
              highlight: false,
              perks: _freePerks,
              footer: null,
            ),
            const SizedBox(height: 16),
            if (RevenueCatBilling.isAvailable) ...[
              Center(
                child: TextButton(
                  onPressed: _busy ? null : _restorePurchases,
                  child: const Text('Restore purchases'),
                ),
              ),
              Text(
                'Subscriptions are billed through your app store and can be '
                'managed in your store account settings.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
            ] else
              Text(
                'Payments are processed securely by Stripe in your browser. '
                'After upgrading, pull to refresh this page to activate Pro.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
          ],
        ),
      ),
    );
  }

  static String _date(DateTime d) =>
      '${d.day}/${d.month}/${d.year}';
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.title,
    required this.subtitle,
    required this.highlight,
    required this.perks,
    required this.footer,
  });

  final String title;
  final String subtitle;
  final bool highlight;
  final List<(String, IconData)> perks;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: highlight
            ? AppColors.primary
            : AppColors.sage.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: highlight ? Colors.white : AppColors.primary,
                ),
              ),
              if (highlight) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.sand,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'RECOMMENDED',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 13,
              color: highlight
                  ? Colors.white.withValues(alpha: 0.85)
                  : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 14),
          for (final (label, icon) in perks)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(
                    icon,
                    size: 17,
                    color: highlight ? AppColors.sand : AppColors.sage,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 13.5,
                        color: highlight
                            ? Colors.white
                            : Colors.grey.shade800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          if (footer != null) ...[
            const SizedBox(height: 14),
            footer!,
          ],
        ],
      ),
    );
  }
}
