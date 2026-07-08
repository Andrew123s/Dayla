import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

/// Reusable OpenStreetMap view for trails: draws an optional route polyline,
/// waypoint markers, and reports taps for the Draw flow.
class TrailMap extends StatelessWidget {
  const TrailMap({
    super.key,
    this.controller,
    this.routeCoordinates = const [],
    this.waypoints = const [],
    this.onTap,
    this.initialCenter,
    this.initialZoom = 13,
    this.interactive = true,
  });

  final MapController? controller;

  /// Route path as `[lng, lat, ele?]` positions (GeoJSON order).
  final List<List<double>> routeCoordinates;
  final List<LatLng> waypoints;
  final void Function(LatLng point)? onTap;
  final LatLng? initialCenter;
  final double initialZoom;
  final bool interactive;

  static LatLng fromLngLat(List<double> c) => LatLng(c[1], c[0]);

  @override
  Widget build(BuildContext context) {
    final path = routeCoordinates.length >= 2
        ? routeCoordinates.map(fromLngLat).toList()
        : <LatLng>[];

    final center = initialCenter ??
        (path.isNotEmpty
            ? path[path.length ~/ 2]
            : (waypoints.isNotEmpty
                ? waypoints.last
                : const LatLng(46.6, 9.0)));

    return FlutterMap(
      mapController: controller,
      options: MapOptions(
        initialCenter: center,
        initialZoom: initialZoom,
        onTap: onTap == null ? null : (_, point) => onTap!(point),
        interactionOptions: InteractionOptions(
          flags: interactive
              ? InteractiveFlag.all & ~InteractiveFlag.rotate
              : InteractiveFlag.none,
        ),
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.dayla.app',
        ),
        if (path.isNotEmpty)
          PolylineLayer(
            polylines: [
              Polyline(
                points: path,
                strokeWidth: 4,
                color: const Color(0xFF059669),
              ),
            ],
          ),
        if (path.isNotEmpty)
          MarkerLayer(
            markers: [
              _dot(path.first, const Color(0xFF10B981)),
              _dot(path.last, const Color(0xFF0F172A)),
            ],
          ),
        if (waypoints.isNotEmpty)
          MarkerLayer(
            markers: [
              for (final (i, w) in waypoints.indexed)
                Marker(
                  point: w,
                  width: 26,
                  height: 26,
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF3A5A40),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        '${i + 1}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        RichAttributionWidget(
          attributions: [
            TextSourceAttribution('OpenStreetMap contributors'),
          ],
        ),
      ],
    );
  }

  static Marker _dot(LatLng point, Color color) => Marker(
        point: point,
        width: 16,
        height: 16,
        child: Container(
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
          ),
        ),
      );
}
