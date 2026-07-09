import 'dart:ui' as ui;

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

import 'package:dayla_flutter/features/memories/application/providers/memory_providers.dart';
import 'package:dayla_flutter/features/memories/data/models/memory_model.dart';

/// Mriz Route Replay — the trip retold as a slow, cinematic animation:
/// the route draws itself across a calm fitted map, photos surface at the
/// places (or moments) they were taken, an elevation ribbon fills beneath,
/// and the story closes on its milestones. Tap anywhere to pause/resume.
///
/// Without a recorded route it degrades gracefully into a slow crossfade
/// slideshow of the trip's photos with the same outro.
class MemoryReplayScreen extends ConsumerWidget {
  const MemoryReplayScreen({super.key, required this.memoryId});

  final String memoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memoryAsync = ref.watch(memoryDetailProvider(memoryId));

    return Scaffold(
      backgroundColor: Colors.black,
      body: memoryAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: Colors.white54)),
        error: (e, _) => const Center(
          child: Text('Could not load this memory',
              style: TextStyle(color: Colors.white70)),
        ),
        data: (memory) {
          if (memory == null) {
            return const Center(
              child: Text('Memory not found',
                  style: TextStyle(color: Colors.white70)),
            );
          }
          return _Replay(memory: memory);
        },
      ),
    );
  }
}

/// A photo scheduled to appear at [fraction] of the replay.
class _PhotoEvent {
  const _PhotoEvent({required this.fraction, required this.media, this.point});

  final double fraction;
  final MemoryMedia media;
  final LatLng? point;
}

class _Replay extends StatefulWidget {
  const _Replay({required this.memory});

  final MemoryModel memory;

  @override
  State<_Replay> createState() => _ReplayState();
}

class _ReplayState extends State<_Replay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<LatLng> _path;
  late final List<double> _elevations;
  late final List<_PhotoEvent> _events;

  // The route finishes drawing here; the rest is the milestone outro.
  static const _drawEnd = 0.84;

  @override
  void initState() {
    super.initState();
    final memory = widget.memory;
    _path = memory.routeCoordinates.length > 1
        ? memory.routeCoordinates
            .map((c) => LatLng(c[1], c[0]))
            .toList()
        : const [];
    _elevations = memory.routeCoordinates
        .where((c) => c.length > 2)
        .map((c) => c[2])
        .toList();
    _events = _scheduleEvents(memory);

    final seconds =
        (18 + memory.media.length * 2.5).clamp(20, 45).toDouble();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: (seconds * 1000).round()),
    )..forward();
    _controller.addListener(() => setState(() {}));
  }

  /// Photos with GPS pin to their closest point on the route; the rest are
  /// spread through the draw in capture-time order.
  List<_PhotoEvent> _scheduleEvents(MemoryModel memory) {
    final events = <_PhotoEvent>[];
    final unplaced = <MemoryMedia>[];

    for (final m in memory.media) {
      if (m.lat != null && m.lng != null && _path.isNotEmpty) {
        var best = 0;
        var bestDist = double.infinity;
        for (var i = 0; i < _path.length; i++) {
          final d = (_path[i].latitude - m.lat!) *
                  (_path[i].latitude - m.lat!) +
              (_path[i].longitude - m.lng!) * (_path[i].longitude - m.lng!);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        events.add(_PhotoEvent(
          fraction: (best / (_path.length - 1)) * _drawEnd,
          media: m,
          point: _path[best],
        ));
      } else {
        unplaced.add(m);
      }
    }

    unplaced.sort((a, b) {
      if (a.takenAt == null && b.takenAt == null) return 0;
      if (a.takenAt == null) return 1;
      if (b.takenAt == null) return -1;
      return a.takenAt!.compareTo(b.takenAt!);
    });
    for (var i = 0; i < unplaced.length; i++) {
      events.add(_PhotoEvent(
        fraction: ((i + 1) / (unplaced.length + 1)) * _drawEnd,
        media: unplaced[i],
      ));
    }

    events.sort((a, b) => a.fraction.compareTo(b.fraction));
    return events;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _togglePlay() {
    if (_controller.isAnimating) {
      _controller.stop();
    } else if (_controller.value >= 1) {
      _controller.forward(from: 0);
    } else {
      _controller.forward();
    }
    setState(() {});
  }

  double get _t =>
      Curves.easeInOutCubic.transform(_controller.value.clamp(0.0, 1.0));

  @override
  Widget build(BuildContext context) {
    final memory = widget.memory;
    final color = SeasonPalette.of(memory.season);

    return GestureDetector(
      onTap: _togglePlay,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (_path.isNotEmpty)
            _buildMap(color)
          else
            _buildSlideshow(memory),

          // Soft top scrim + header
          _scrim(top: true),
          Positioned(
            top: MediaQuery.paddingOf(context).top + 8,
            left: 12,
            right: 12,
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, color: Colors.white),
                ),
                Expanded(
                  child: AnimatedOpacity(
                    // Title breathes in over the first moments.
                    opacity: (_t * 4).clamp(0.0, 1.0),
                    duration: const Duration(milliseconds: 200),
                    child: Column(
                      children: [
                        Text(
                          memory.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (memory.weatherCondition != null)
                          Text(
                            '${memory.weatherCondition}'
                            '${memory.weatherTempC != null ? ' · ${memory.weatherTempC!.round()}°C' : ''}',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 11.5,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 48),
              ],
            ),
          ),

          // Photo moments
          for (final event in _events) _photoOverlay(event),

          // Elevation ribbon
          if (_elevations.length > 10)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: SizedBox(
                height: 90,
                child: CustomPaint(
                  painter: _ElevationPainter(
                    elevations: _elevations,
                    progress: (_t / _drawEnd).clamp(0.0, 1.0),
                    color: color,
                  ),
                ),
              ),
            ),

          // Milestone outro
          if (_t > _drawEnd) _outro(memory, color),

          // Pause hint
          if (!_controller.isAnimating && _controller.value < 1)
            const Center(
              child: Icon(Icons.play_arrow_rounded,
                  size: 72, color: Colors.white70),
            ),

          // Thin progress line
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: LinearProgressIndicator(
              value: _controller.value,
              minHeight: 2,
              backgroundColor: Colors.white.withValues(alpha: 0.15),
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMap(Color color) {
    final drawT = (_t / _drawEnd).clamp(0.0, 1.0);
    final count = (drawT * (_path.length - 1)).round() + 1;
    final visible = _path.sublist(0, count.clamp(2, _path.length));

    return FlutterMap(
      options: MapOptions(
        initialCameraFit: CameraFit.bounds(
          bounds: LatLngBounds.fromPoints(_path),
          padding: const EdgeInsets.fromLTRB(48, 120, 48, 130),
        ),
        interactionOptions:
            const InteractionOptions(flags: InteractiveFlag.none),
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.dayla.app',
        ),
        // Faint full route underneath, story line drawing over it.
        PolylineLayer(
          polylines: [
            Polyline(
              points: _path,
              strokeWidth: 3,
              color: color.withValues(alpha: 0.2),
            ),
            Polyline(
              points: visible,
              strokeWidth: 4.5,
              color: color,
            ),
          ],
        ),
        MarkerLayer(
          markers: [
            _dot(_path.first, color),
            if (drawT >= 1) _dot(_path.last, const Color(0xFF0F172A)),
            // The travelling head of the line.
            if (drawT < 1)
              Marker(
                point: visible.last,
                width: 18,
                height: 18,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: color, width: 4),
                  ),
                ),
              ),
            // Passed photo pins stay on the map.
            for (final event in _events)
              if (event.point != null && _t >= event.fraction)
                Marker(
                  point: event.point!,
                  width: 26,
                  height: 26,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: const [
                        BoxShadow(color: Colors.black26, blurRadius: 4),
                      ],
                    ),
                    child: Icon(Icons.photo_camera,
                        size: 14, color: color),
                  ),
                ),
          ],
        ),
      ],
    );
  }

  Widget _buildSlideshow(MemoryModel memory) {
    if (memory.media.isEmpty) {
      // Nothing visual — hold the cover (or season color) under the outro.
      return memory.coverPhoto != null
          ? CachedNetworkImage(
              imageUrl: memory.coverPhoto!, fit: BoxFit.cover)
          : Container(color: SeasonPalette.of(memory.season));
    }
    final drawT = (_t / _drawEnd).clamp(0.0, 0.999);
    final index = (drawT * memory.media.length).floor();
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 900),
      child: CachedNetworkImage(
        key: ValueKey(index),
        imageUrl: memory.media[index].url,
        fit: BoxFit.cover,
        errorWidget: (_, __, ___) =>
            Container(color: SeasonPalette.of(memory.season)),
      ),
    );
  }

  /// Each photo surfaces as a floating polaroid for a short window.
  Widget _photoOverlay(_PhotoEvent event) {
    const window = 0.09;
    final local = (_t - event.fraction) / window;
    if (local < 0 || local > 1 || _path.isEmpty) {
      return const SizedBox.shrink();
    }
    // Ease in, hold, ease out.
    final opacity = local < 0.25
        ? local / 0.25
        : local > 0.8
            ? (1 - local) / 0.2
            : 1.0;

    return Center(
      child: Opacity(
        opacity: opacity.clamp(0.0, 1.0),
        child: Transform.scale(
          scale: 0.92 + 0.08 * opacity,
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 22),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: event.media.url,
                width: 230,
                height: 230,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => const SizedBox(
                    width: 230, height: 230, child: Icon(Icons.photo)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _outro(MemoryModel memory, Color color) {
    final outroT = ((_t - _drawEnd) / (1 - _drawEnd)).clamp(0.0, 1.0);
    final s = memory.stats;
    final lines = [
      [
        if (s.distanceKm > 0) '${s.distanceKm.toStringAsFixed(1)} km',
        '${s.days} day${s.days == 1 ? '' : 's'}',
        if (s.companions > 0) '${s.companions + 1} of you',
      ].join(' · '),
      ...memory.milestones,
    ];

    return Container(
      color: Colors.black.withValues(alpha: 0.55 * outroT),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < lines.length; i++)
              AnimatedOpacity(
                opacity: (outroT * (lines.length + 1) - i).clamp(0.0, 1.0),
                duration: const Duration(milliseconds: 200),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 40, vertical: 8),
                  child: Text(
                    lines[i],
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: i == 0 ? Colors.white : color,
                      fontSize: i == 0 ? 15 : 18,
                      fontWeight: i == 0 ? FontWeight.w500 : FontWeight.w800,
                      height: 1.3,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _scrim({required bool top}) => Positioned(
        top: top ? 0 : null,
        bottom: top ? null : 0,
        left: 0,
        right: 0,
        height: 140,
        child: IgnorePointer(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: top ? Alignment.topCenter : Alignment.bottomCenter,
                end: top ? Alignment.bottomCenter : Alignment.topCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.55),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      );

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

/// Elevation ribbon: the profile fills left-to-right in sync with the draw.
class _ElevationPainter extends CustomPainter {
  _ElevationPainter({
    required this.elevations,
    required this.progress,
    required this.color,
  });

  final List<double> elevations;
  final double progress;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (elevations.length < 2) return;
    var minE = elevations.first, maxE = elevations.first;
    for (final e in elevations) {
      if (e < minE) minE = e;
      if (e > maxE) maxE = e;
    }
    final span = (maxE - minE).abs() < 1 ? 1.0 : maxE - minE;

    Offset pointAt(int i) => Offset(
          size.width * i / (elevations.length - 1),
          size.height -
              8 -
              ((elevations[i] - minE) / span) * (size.height - 24),
        );

    final visible = (progress * (elevations.length - 1)).round() + 1;

    final fill = ui.Path()..moveTo(0, size.height);
    for (var i = 0; i < visible; i++) {
      final p = pointAt(i);
      fill.lineTo(p.dx, p.dy);
    }
    fill.lineTo(pointAt(visible - 1).dx, size.height);
    fill.close();
    canvas.drawPath(
      fill,
      Paint()..color = color.withValues(alpha: 0.35),
    );

    final line = ui.Path()..moveTo(pointAt(0).dx, pointAt(0).dy);
    for (var i = 1; i < visible; i++) {
      final p = pointAt(i);
      line.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(
      line,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_ElevationPainter old) =>
      old.progress != progress || old.elevations != elevations;
}
