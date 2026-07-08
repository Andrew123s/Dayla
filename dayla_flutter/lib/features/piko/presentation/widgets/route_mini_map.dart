import 'dart:math' as math;

import 'package:flutter/material.dart';

import 'package:dayla_flutter/features/piko/data/models/route_model.dart';

/// A dependency-free schematic of the route's real geometry — projects the
/// [lng, lat] polyline into the canvas with start/end markers. Port of the
/// web app's `RouteMiniMap` SVG (shape preview, not a tiled basemap).
class RouteMiniMap extends StatelessWidget {
  const RouteMiniMap({super.key, required this.geometry, this.height = 170});

  final RouteGeometry? geometry;
  final double height;

  @override
  Widget build(BuildContext context) {
    final coords = geometry?.coordinates ?? [];
    if (coords.length < 2) return const SizedBox.shrink();

    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(painter: _RoutePainter(coords)),
            ),
            Positioned(
              top: 10,
              left: 12,
              child: _MapBadge(
                icon: Icons.place,
                label: 'Start',
                color: Colors.teal.shade700,
              ),
            ),
            Positioned(
              bottom: 10,
              right: 12,
              child: _MapBadge(
                icon: Icons.flag,
                label: 'Finish',
                color: Colors.blueGrey.shade800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MapBadge extends StatelessWidget {
  const _MapBadge({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _RoutePainter extends CustomPainter {
  _RoutePainter(this.coords);

  final List<List<double>> coords;

  @override
  void paint(Canvas canvas, Size size) {
    // Background gradient (emerald tint, like the web version).
    final bg = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFFECFDF5), Color(0xFFD1FAE5)],
      ).createShader(Offset.zero & size);
    canvas.drawRect(Offset.zero & size, bg);

    // Subtle contour grid.
    final grid = Paint()
      ..color = const Color(0xFF10B981).withValues(alpha: 0.08)
      ..strokeWidth = 1;
    for (var i = 1; i <= 5; i++) {
      final y = size.height / 5 * i;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }

    const pad = 22.0;
    double minLng = coords.first[0], maxLng = coords.first[0];
    double minLat = coords.first[1], maxLat = coords.first[1];
    for (final c in coords) {
      if (c[0] < minLng) minLng = c[0];
      if (c[0] > maxLng) maxLng = c[0];
      if (c[1] < minLat) minLat = c[1];
      if (c[1] > maxLat) maxLat = c[1];
    }
    final spanLng = (maxLng - minLng).abs() < 1e-9 ? 1e-4 : maxLng - minLng;
    final spanLat = (maxLat - minLat).abs() < 1e-9 ? 1e-4 : maxLat - minLat;
    // Preserve aspect ratio so the shape isn't distorted.
    final scale = math.min(
      (size.width - pad * 2) / spanLng,
      (size.height - pad * 2) / spanLat,
    );
    final offX = (size.width - spanLng * scale) / 2;
    final offY = (size.height - spanLat * scale) / 2;

    Offset project(List<double> c) => Offset(
          offX + (c[0] - minLng) * scale,
          // Flip Y so north is up.
          size.height - (offY + (c[1] - minLat) * scale),
        );

    final path = Path()..moveTo(project(coords.first).dx, project(coords.first).dy);
    for (final c in coords.skip(1)) {
      final p = project(c);
      path.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(
      path,
      Paint()
        ..color = const Color(0xFF059669)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.5
        ..strokeJoin = StrokeJoin.round
        ..strokeCap = StrokeCap.round,
    );

    void marker(Offset p, Color fill) {
      canvas.drawCircle(p, 6, Paint()..color = fill);
      canvas.drawCircle(
        p,
        6,
        Paint()
          ..color = Colors.white
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5,
      );
    }

    marker(project(coords.first), const Color(0xFF10B981));
    marker(project(coords.last), const Color(0xFF0F172A));
  }

  @override
  bool shouldRepaint(_RoutePainter oldDelegate) =>
      oldDelegate.coords != coords;
}
