import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/billing/application/providers/billing_providers.dart';

/// Client-side Pro gating (UX only — the server always re-checks).
abstract final class ProGate {
  /// True when the viewer may use [featureKey]. Otherwise opens the pricing
  /// page noting [featureLabel] and returns false.
  static bool check(
    BuildContext context,
    WidgetRef ref, {
    required String featureKey,
    required String featureLabel,
  }) {
    final access = ref.read(subscriptionAccessProvider);
    if (access.canUse(featureKey)) return true;
    openPricing(context, featureLabel);
    return false;
  }

  static void openPricing(BuildContext context, [String? featureLabel]) {
    final query = featureLabel != null
        ? '?feature=${Uri.encodeComponent(featureLabel)}'
        : '';
    context.push('${RoutePaths.pricing}$query');
  }
}

/// Full-screen placeholder shown in place of a Pro feature's content.
class ProUpsell extends StatelessWidget {
  const ProUpsell({
    super.key,
    required this.featureLabel,
    required this.description,
    this.icon = Icons.lock_outline,
  });

  final String featureLabel;
  final String description;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.sage.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            Text(
              '$featureLabel is a Pro feature',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13.5),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: () => ProGate.openPricing(context, featureLabel),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
              ),
              icon: const Icon(Icons.workspace_premium_outlined, size: 18),
              label: const Text('See Dayla Pro'),
            ),
          ],
        ),
      ),
    );
  }
}
