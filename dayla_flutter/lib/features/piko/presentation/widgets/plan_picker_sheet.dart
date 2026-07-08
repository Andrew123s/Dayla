import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';

/// Bottom sheet listing the user's plans (trips); picking one resolves with
/// the chosen [PikoPlan], or null when dismissed.
class PlanPickerSheet extends ConsumerWidget {
  const PlanPickerSheet({super.key});

  static Future<PikoPlan?> show(BuildContext context) {
    return showModalBottomSheet<PikoPlan>(
      context: context,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const PlanPickerSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plansAsync = ref.watch(pikoPlansProvider);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Add to plan',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(
              'Drop this trail onto a trip board as a route note.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Flexible(
              child: plansAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text('Failed to load plans',
                      style: TextStyle(color: Colors.grey.shade600)),
                ),
                data: (plans) {
                  if (plans.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Text(
                          'No trips yet — create one on the Dashboard first.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ),
                    );
                  }
                  return ListView.separated(
                    shrinkWrap: true,
                    itemCount: plans.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final plan = plans[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor:
                              AppColors.sage.withValues(alpha: 0.3),
                          child: const Icon(Icons.map_outlined,
                              color: AppColors.primary),
                        ),
                        title: Text(plan.name),
                        subtitle:
                            plan.subtitle != null ? Text(plan.subtitle!) : null,
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => Navigator.of(context).pop(plan),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
