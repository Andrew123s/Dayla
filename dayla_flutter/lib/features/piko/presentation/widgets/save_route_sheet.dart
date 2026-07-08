import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/repositories/piko_repository.dart';

/// Final step of every creation flow (draw / record / GPX): name the route,
/// pick difficulty, then POST it — new routes enter moderation as pending.
class SaveRouteSheet extends ConsumerStatefulWidget {
  const SaveRouteSheet({
    super.key,
    required this.coordinates,
    required this.distanceKm,
    required this.elevationGainM,
    required this.durationMins,
  });

  /// `[lng, lat, ele?]` positions.
  final List<List<double>> coordinates;
  final double distanceKm;
  final double elevationGainM;
  final double durationMins;

  /// Returns true when the route was created.
  static Future<bool?> show(
    BuildContext context, {
    required List<List<double>> coordinates,
    required double distanceKm,
    required double elevationGainM,
    required double durationMins,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SaveRouteSheet(
        coordinates: coordinates,
        distanceKm: distanceKm,
        elevationGainM: elevationGainM,
        durationMins: durationMins,
      ),
    );
  }

  @override
  ConsumerState<SaveRouteSheet> createState() => _SaveRouteSheetState();
}

class _SaveRouteSheetState extends ConsumerState<SaveRouteSheet> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  String _difficulty = 'moderate';
  bool _saving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Give your route a name')),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      await ref.read(pikoRepositoryProvider).createRoute({
        'title': title,
        'description': _descriptionController.text.trim(),
        'location': _locationController.text.trim().isEmpty
            ? 'Your route'
            : _locationController.text.trim(),
        'difficulty': _difficulty,
        'distanceKm': widget.distanceKm,
        'elevationGainM': widget.elevationGainM,
        'estimatedDurationMins': widget.durationMins,
        'geometry': {
          'type': 'LineString',
          'coordinates': widget.coordinates,
        },
      });
      ref.read(pikoRoutesProvider.notifier).refresh();
      if (mounted) Navigator.of(context).pop(true);
    } on PikoActionException catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
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
          Text(
            'Save your trail',
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            '${widget.distanceKm.toStringAsFixed(1)} km · '
            '${widget.elevationGainM.round()} m up · '
            '~${widget.durationMins.round()} min',
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Route name',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _locationController,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(
              labelText: 'Location (e.g. "Dolomites · Italy")',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            maxLines: 3,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Description (optional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'easy', label: Text('Easy')),
              ButtonSegment(value: 'moderate', label: Text('Moderate')),
              ButtonSegment(value: 'hard', label: Text('Hard')),
            ],
            selected: {_difficulty},
            onSelectionChanged: (s) =>
                setState(() => _difficulty = s.first),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _saving ? null : _save,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              minimumSize: const Size.fromHeight(48),
            ),
            child: _saving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Submit for review'),
          ),
          const SizedBox(height: 8),
          Text(
            'New trails are reviewed before they appear publicly. '
            'You can see yours right away.',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }
}
