import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/repositories/piko_repository.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/save_route_sheet.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/trail_map.dart';

/// Draw a route: tap the map to drop waypoints, snap them to real trails via
/// the backend GraphHopper proxy, then save (mirrors the web DrawRoutePage).
class DrawRouteScreen extends ConsumerStatefulWidget {
  const DrawRouteScreen({super.key});

  @override
  ConsumerState<DrawRouteScreen> createState() => _DrawRouteScreenState();
}

class _DrawRouteScreenState extends ConsumerState<DrawRouteScreen> {
  final _mapController = MapController();
  final List<LatLng> _waypoints = [];
  SnappedRoute? _snapped;
  bool _snapping = false;

  @override
  void initState() {
    super.initState();
    _centerOnUser();
  }

  Future<void> _centerOnUser() async {
    try {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return;
      }
      final pos = await Geolocator.getCurrentPosition();
      if (mounted) {
        _mapController.move(LatLng(pos.latitude, pos.longitude), 14);
      }
    } catch (_) {
      // Keep the default center when location is unavailable.
    }
  }

  void _onTap(LatLng point) {
    setState(() {
      _waypoints.add(point);
      _snapped = null; // Editing invalidates the previous snap.
    });
  }

  Future<void> _snap() async {
    if (_waypoints.length < 2 || _snapping) return;
    setState(() => _snapping = true);
    try {
      final points =
          _waypoints.map((w) => [w.longitude, w.latitude]).toList();
      final result =
          await ref.read(pikoRepositoryProvider).snapRoute(points);
      if (mounted) setState(() => _snapped = result);
    } on PikoActionException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      if (mounted) setState(() => _snapping = false);
    }
  }

  Future<void> _save() async {
    final snapped = _snapped;
    if (snapped == null) return;
    final created = await SaveRouteSheet.show(
      context,
      coordinates: snapped.coordinates,
      distanceKm: snapped.distanceKm,
      elevationGainM: snapped.elevationGainM,
      durationMins: snapped.durationMins,
    );
    if (created == true && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Trail submitted for review')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final snapped = _snapped;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Draw a trail'),
        actions: [
          IconButton(
            tooltip: 'Undo last point',
            icon: const Icon(Icons.undo),
            onPressed: _waypoints.isEmpty
                ? null
                : () => setState(() {
                      _waypoints.removeLast();
                      _snapped = null;
                    }),
          ),
          IconButton(
            tooltip: 'Clear',
            icon: const Icon(Icons.delete_outline),
            onPressed: _waypoints.isEmpty
                ? null
                : () => setState(() {
                      _waypoints.clear();
                      _snapped = null;
                    }),
          ),
        ],
      ),
      body: Stack(
        children: [
          TrailMap(
            controller: _mapController,
            waypoints: _waypoints,
            routeCoordinates: snapped?.coordinates ?? const [],
            onTap: _onTap,
          ),
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Text(
                  snapped != null
                      ? '${snapped.distanceKm.toStringAsFixed(1)} km · '
                          '${snapped.elevationGainM.round()} m up · '
                          '~${snapped.durationMins.round()} min'
                      : _waypoints.isEmpty
                          ? 'Tap the map to drop your first waypoint'
                          : _waypoints.length == 1
                              ? 'Add at least one more waypoint'
                              : '${_waypoints.length} waypoints — snap to trails when ready',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed:
                      _waypoints.length >= 2 && !_snapping ? _snap : null,
                  icon: _snapping
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.route, size: 18),
                  label: const Text('Snap to trails'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: snapped != null ? _save : null,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Save'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
