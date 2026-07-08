import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/save_route_sheet.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/trail_map.dart';

/// Record a trail with GPS while hiking (mirrors the web RecordRoutePage).
/// Points are captured every ~10 m; elevation gain sums positive altitude
/// deltas. Saving reuses the shared SaveRouteSheet.
class RecordRouteScreen extends ConsumerStatefulWidget {
  const RecordRouteScreen({super.key});

  @override
  ConsumerState<RecordRouteScreen> createState() =>
      _RecordRouteScreenState();
}

class _RecordRouteScreenState extends ConsumerState<RecordRouteScreen> {
  final _mapController = MapController();
  StreamSubscription<Position>? _positionSub;
  final List<Position> _points = [];
  bool _recording = false;
  bool _permissionDenied = false;
  DateTime? _startedAt;
  Timer? _ticker;

  double get _distanceKm {
    var total = 0.0;
    for (var i = 1; i < _points.length; i++) {
      total += Geolocator.distanceBetween(
        _points[i - 1].latitude,
        _points[i - 1].longitude,
        _points[i].latitude,
        _points[i].longitude,
      );
    }
    return total / 1000;
  }

  double get _elevationGainM {
    var gain = 0.0;
    for (var i = 1; i < _points.length; i++) {
      final delta = _points[i].altitude - _points[i - 1].altitude;
      if (delta > 0) gain += delta;
    }
    return gain;
  }

  Duration get _elapsed => _startedAt == null
      ? Duration.zero
      : DateTime.now().difference(_startedAt!);

  @override
  void initState() {
    super.initState();
    _prepare();
  }

  Future<void> _prepare() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      if (mounted) setState(() => _permissionDenied = true);
      return;
    }
    try {
      final pos = await Geolocator.getCurrentPosition();
      if (mounted) {
        _mapController.move(LatLng(pos.latitude, pos.longitude), 15);
      }
    } catch (_) {/* keep default center */}
  }

  void _start() {
    setState(() {
      _recording = true;
      _startedAt ??= DateTime.now();
    });
    _ticker = Timer.periodic(
        const Duration(seconds: 1), (_) => setState(() {}));
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 10, // a point every ~10 m
      ),
    ).listen((pos) {
      if (!mounted) return;
      setState(() => _points.add(pos));
      _mapController.move(
          LatLng(pos.latitude, pos.longitude), _mapController.camera.zoom);
    });
  }

  void _pause() {
    _positionSub?.cancel();
    _positionSub = null;
    _ticker?.cancel();
    setState(() => _recording = false);
  }

  Future<void> _finish() async {
    _pause();
    if (_points.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Not enough GPS points yet — keep walking!')),
      );
      return;
    }
    final coordinates = _points
        .map((p) => [p.longitude, p.latitude, p.altitude])
        .toList();
    final created = await SaveRouteSheet.show(
      context,
      coordinates: coordinates,
      distanceKm: double.parse(_distanceKm.toStringAsFixed(1)),
      elevationGainM: _elevationGainM.roundToDouble(),
      durationMins: _elapsed.inMinutes.toDouble(),
    );
    if (created == true && mounted) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Trail submitted for review')),
      );
    }
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_permissionDenied) {
      return Scaffold(
        appBar: AppBar(title: const Text('Record a trail')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.location_off,
                    size: 48, color: Colors.grey.shade400),
                const SizedBox(height: 12),
                const Text(
                  'Location permission is needed to record your hike.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () => Geolocator.openAppSettings(),
                  child: const Text('Open settings'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final coords =
        _points.map((p) => [p.longitude, p.latitude]).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Record a trail')),
      body: Stack(
        children: [
          TrailMap(
            controller: _mapController,
            routeCoordinates: coords,
            initialZoom: 15,
          ),
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _stat('Distance',
                        '${_distanceKm.toStringAsFixed(2)} km'),
                    _stat('Elevation',
                        '${_elevationGainM.round()} m'),
                    _stat('Time', _formatElapsed(_elapsed)),
                    _stat('Points', '${_points.length}'),
                  ],
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
                child: _recording
                    ? OutlinedButton.icon(
                        onPressed: _pause,
                        icon: const Icon(Icons.pause, size: 18),
                        label: const Text('Pause'),
                      )
                    : FilledButton.icon(
                        onPressed: _start,
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                        ),
                        icon: const Icon(Icons.fiber_manual_record,
                            size: 18, color: Colors.red),
                        label: Text(
                            _points.isEmpty ? 'Start recording' : 'Resume'),
                      ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: _points.length >= 2 ? _finish : null,
                  icon: const Icon(Icons.flag, size: 18),
                  label: const Text('Finish & save'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String _formatElapsed(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes % 60;
    final s = d.inSeconds % 60;
    return h > 0 ? '${h}h ${m}m' : '${m}m ${s}s';
  }

  Widget _stat(String label, String value) => Column(
        children: [
          Text(value,
              style: const TextStyle(
                  fontWeight: FontWeight.w800, fontSize: 14)),
          Text(label,
              style:
                  TextStyle(fontSize: 11, color: Colors.grey.shade600)),
        ],
      );
}
