import 'dart:io';
import 'dart:math' as math;

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xml/xml.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/billing/data/models/billing_models.dart';
import 'package:dayla_flutter/features/billing/presentation/widgets/pro_gate.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/save_route_sheet.dart';

/// "Create a trail" entry sheet: Draw on map, Record with GPS, or Upload GPX.
/// All three are Pro features (trailsCreate); the gate opens Pricing when
/// unavailable.
class CreateTrailSheet extends ConsumerWidget {
  const CreateTrailSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const CreateTrailSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Create a trail',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            _option(
              context,
              icon: Icons.draw_outlined,
              title: 'Draw on the map',
              subtitle: 'Drop waypoints and snap them to real trails',
              onTap: () {
                Navigator.pop(context);
                if (ProGate.check(context, ref,
                    featureKey: ProFeatures.trailsCreate,
                    featureLabel: 'Trail creation')) {
                  context.push('/piko/create/draw');
                }
              },
            ),
            _option(
              context,
              icon: Icons.radio_button_checked,
              title: 'Record with GPS',
              subtitle: 'Track your hike live as you walk it',
              onTap: () {
                Navigator.pop(context);
                if (ProGate.check(context, ref,
                    featureKey: ProFeatures.trailsCreate,
                    featureLabel: 'Trail creation')) {
                  context.push('/piko/create/record');
                }
              },
            ),
            _option(
              context,
              icon: Icons.upload_file_outlined,
              title: 'Upload a GPX file',
              subtitle: 'Import a track from your watch or another app',
              onTap: () async {
                Navigator.pop(context);
                if (ProGate.check(context, ref,
                    featureKey: ProFeatures.trailsCreate,
                    featureLabel: 'Trail creation')) {
                  await importGpx(context);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _option(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        backgroundColor: AppColors.sage.withValues(alpha: 0.25),
        child: Icon(icon, color: AppColors.primary),
      ),
      title: Text(title,
          style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12.5)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}

/// Pick a .gpx file, parse its track points, and hand off to SaveRouteSheet.
Future<void> importGpx(BuildContext context) async {
  final messenger = ScaffoldMessenger.of(context);
  final result = await FilePicker.platform.pickFiles(
    type: FileType.any, // .gpx isn't a recognized extension filter everywhere
  );
  final path = result?.files.single.path;
  if (path == null) return;
  if (!path.toLowerCase().endsWith('.gpx')) {
    messenger.showSnackBar(
        const SnackBar(content: Text('Please choose a .gpx file')));
    return;
  }

  try {
    final content = await File(path).readAsString();
    final doc = XmlDocument.parse(content);
    // trkpt (tracks) preferred; fall back to rtept (routes).
    var pts = doc.findAllElements('trkpt').toList();
    if (pts.isEmpty) pts = doc.findAllElements('rtept').toList();
    if (pts.length < 2) {
      messenger.showSnackBar(const SnackBar(
          content: Text('No track points found in that file')));
      return;
    }

    final coordinates = <List<double>>[];
    for (final p in pts) {
      final lat = double.tryParse(p.getAttribute('lat') ?? '');
      final lon = double.tryParse(p.getAttribute('lon') ?? '');
      if (lat == null || lon == null) continue;
      final ele = double.tryParse(
          p.getElement('ele')?.innerText.trim() ?? '');
      coordinates.add([lon, lat, if (ele != null) ele]);
    }
    if (coordinates.length < 2) {
      messenger.showSnackBar(const SnackBar(
          content: Text('No valid coordinates in that file')));
      return;
    }

    var distanceM = 0.0;
    var gainM = 0.0;
    for (var i = 1; i < coordinates.length; i++) {
      distanceM += _haversineM(coordinates[i - 1], coordinates[i]);
      if (coordinates[i].length > 2 && coordinates[i - 1].length > 2) {
        final delta = coordinates[i][2] - coordinates[i - 1][2];
        if (delta > 0) gainM += delta;
      }
    }
    final distanceKm = distanceM / 1000;
    // Rough hiking estimate: 4 km/h + 10 min per 100 m of climb.
    final durationMins = (distanceKm / 4) * 60 + (gainM / 100) * 10;

    if (!context.mounted) return;
    await SaveRouteSheet.show(
      context,
      coordinates: coordinates,
      distanceKm: double.parse(distanceKm.toStringAsFixed(1)),
      elevationGainM: gainM.roundToDouble(),
      durationMins: durationMins.roundToDouble(),
    );
  } catch (_) {
    messenger.showSnackBar(
        const SnackBar(content: Text('Could not read that GPX file')));
  }
}

double _haversineM(List<double> a, List<double> b) {
  const r = 6371000.0;
  final dLat = _rad(b[1] - a[1]);
  final dLng = _rad(b[0] - a[0]);
  final h = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(_rad(a[1])) *
          math.cos(_rad(b[1])) *
          math.sin(dLng / 2) *
          math.sin(dLng / 2);
  return 2 * r * math.asin(math.min(1, math.sqrt(h)));
}

double _rad(double deg) => deg * math.pi / 180;
