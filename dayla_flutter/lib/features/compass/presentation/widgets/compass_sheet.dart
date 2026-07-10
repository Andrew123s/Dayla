import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/billing/presentation/widgets/pro_gate.dart';
import 'package:dayla_flutter/features/compass/data/repositories/compass_repository.dart';

/// Dayla Compass wizard: pick a pace and interests, Compass drafts the trip
/// onto the board. Resolves true when a draft landed (caller reloads).
class CompassSheet extends ConsumerStatefulWidget {
  const CompassSheet({super.key, required this.tripId});

  final String tripId;

  static Future<bool?> show(BuildContext context, {required String tripId}) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => CompassSheet(tripId: tripId),
    );
  }

  @override
  ConsumerState<CompassSheet> createState() => _CompassSheetState();
}

class _CompassSheetState extends ConsumerState<CompassSheet> {
  String _vibe = 'balanced';
  final Set<String> _interests = {'Hiking'};
  bool _drafting = false;

  static const _interestOptions = [
    'Hiking', 'Water', 'Wildlife', 'Culture', 'Food',
    'Photography', 'Camping', 'Cycling',
  ];

  Future<void> _draft() async {
    setState(() => _drafting = true);
    try {
      final result = await ref.read(compassRepositoryProvider).draft(
            tripId: widget.tripId,
            vibe: _vibe,
            interests: _interests.toList(),
          );
      if (!mounted) return;
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
          'Compass drafted ${result.notesAdded} notes'
          '${result.trailCandidates > 0 ? ' and ${result.trailCandidates} trail candidates' : ''}'
          ' — rearrange anything.',
        ),
      ));
    } on CompassException catch (e) {
      if (!mounted) return;
      setState(() => _drafting = false);
      if (e.upgradeRequired) {
        Navigator.of(context).pop(false);
        ProGate.openPricing(context, 'Dayla Compass');
      } else {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (_) {
      // Whatever happens, never leave the button stuck on "drafting".
      if (!mounted) return;
      setState(() => _drafting = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Compass could not draft this trip. Try again.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.explore, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Dayla Compass',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Compass drafts a starting point onto your board — a day plan, '
            'trail candidates to vote on, a budget sketch. You and your '
            'group take it from there.',
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
          const SizedBox(height: 18),

          Text('Pace',
              style: Theme.of(context)
                  .textTheme
                  .titleSmall
                  ?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'relaxed', label: Text('Relaxed')),
              ButtonSegment(value: 'balanced', label: Text('Balanced')),
              ButtonSegment(
                  value: 'adventurous', label: Text('Adventurous')),
            ],
            selected: {_vibe},
            onSelectionChanged: (s) => setState(() => _vibe = s.first),
          ),
          const SizedBox(height: 16),

          Text('Interests',
              style: Theme.of(context)
                  .textTheme
                  .titleSmall
                  ?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final interest in _interestOptions)
                FilterChip(
                  label: Text(interest),
                  selected: _interests.contains(interest),
                  onSelected: (selected) => setState(() {
                    if (selected) {
                      _interests.add(interest);
                    } else {
                      _interests.remove(interest);
                    }
                  }),
                  selectedColor: AppColors.primary.withValues(alpha: 0.15),
                  checkmarkColor: AppColors.primary,
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
          const SizedBox(height: 20),

          FilledButton.icon(
            onPressed: _drafting ? null : _draft,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              minimumSize: const Size.fromHeight(48),
            ),
            icon: _drafting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.auto_awesome, size: 18),
            label: Text(
                _drafting ? 'Compass is drafting…' : 'Draft my trip'),
          ),
          const SizedBox(height: 8),
          Text(
            'Your first draft is free — unlimited drafting comes with Pro. '
            'Everything Compass adds is ordinary sticky notes: move, edit '
            'or delete anything.',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }
}
