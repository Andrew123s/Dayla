import 'package:audioplayers/audioplayers.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

/// The spatial sticky-note board: notes keep their web x/y positions, can be
/// dragged (position persists via [onMove]), tapped to edit and long-pressed
/// for a menu (map to another note / remove link / delete). Notes linked via
/// `linkTo` are joined by dashed lines that follow them while dragging, same
/// as the web board. Pinch/pan the canvas with InteractiveViewer.
class BoardCanvas extends StatefulWidget {
  const BoardCanvas({
    super.key,
    required this.notes,
    required this.onMove,
    required this.onTap,
    required this.onDelete,
    required this.onLink,
  });

  final List<StickyNoteModel> notes;
  final void Function(StickyNoteModel note, double x, double y) onMove;
  final void Function(StickyNoteModel note) onTap;
  final void Function(StickyNoteModel note) onDelete;

  /// Persist a link change: [linkTo] is the target note's id, or null to
  /// remove the note's existing link.
  final void Function(StickyNoteModel note, String? linkTo) onLink;

  @override
  State<BoardCanvas> createState() => _BoardCanvasState();
}

class _BoardCanvasState extends State<BoardCanvas> {
  // Local drag offsets so dragging is smooth without waiting for the server.
  final Map<String, Offset> _positions = {};
  final _transform = TransformationController();
  double _zoom = 1.0;

  /// World-space padding rendered around the note area on every side, so
  /// notes can be dragged left of / above the origin too (the backend and
  /// web board both allow negative coordinates). Without it the canvas
  /// starts exactly at world (0,0) and everything beyond that edge is a
  /// dead zone notes can never enter.
  static const double _originPad = 1600;

  /// Mind-map linking mode: id of the note waiting for a target, or null.
  String? _linkingFromId;

  static const _linkColor = Color(0xFF588157);

  Offset _positionOf(StickyNoteModel note) =>
      _positions[note.id] ?? Offset(note.x, note.y);

  /// The size a note is actually rendered at (mirrors _NoteCard's clamps).
  Size _displaySizeOf(StickyNoteModel note) {
    final width = note.width.clamp(120.0, 360.0);
    if (note.type == 'voice') return Size(width, 70);
    return Size(width, note.height.clamp(90.0, 420.0));
  }

  /// Center-to-center segments (in shifted canvas coordinates) for every
  /// note with a resolvable linkTo. Dangling targets are skipped, matching
  /// the web renderer.
  List<(Offset, Offset)> _linkSegments() {
    final byId = {for (final n in widget.notes) n.id: n};
    final segments = <(Offset, Offset)>[];
    for (final note in widget.notes) {
      final target = note.linkTo == null ? null : byId[note.linkTo];
      if (target == null) continue;
      final a = _positionOf(note);
      final b = _positionOf(target);
      final sizeA = _displaySizeOf(note);
      final sizeB = _displaySizeOf(target);
      segments.add((
        Offset(a.dx + sizeA.width / 2 + _originPad,
            a.dy + sizeA.height / 2 + _originPad),
        Offset(b.dx + sizeB.width / 2 + _originPad,
            b.dy + sizeB.height / 2 + _originPad),
      ));
    }
    return segments;
  }

  void _handleNoteTap(StickyNoteModel note) {
    final fromId = _linkingFromId;
    if (fromId == null) {
      widget.onTap(note);
      return;
    }
    setState(() => _linkingFromId = null);
    if (note.id == fromId) return; // Tapped the source again — cancel.
    StickyNoteModel? source;
    for (final n in widget.notes) {
      if (n.id == fromId) {
        source = n;
        break;
      }
    }
    if (source == null) return;
    // Tapping the current target unlinks; anything else (re)links.
    widget.onLink(source, source.linkTo == note.id ? null : note.id);
  }

  void _showNoteMenu(StickyNoteModel note) {
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.account_tree_outlined,
                  color: _linkColor),
              title: const Text('Map to a note'),
              subtitle: const Text('Tap another note to draw a connection'),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _linkingFromId = note.id);
              },
            ),
            if (note.linkTo != null && note.linkTo!.isNotEmpty)
              ListTile(
                leading: const Icon(Icons.link_off),
                title: const Text('Remove link'),
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onLink(note, null);
                },
              ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('Delete',
                  style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(ctx);
                widget.onDelete(note);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    // Start with world (0,0) at the viewport's top-left, not the padding.
    _transform.value = Matrix4.identity()..translate(-_originPad, -_originPad);
    _transform.addListener(() {
      final scale = _transform.value.getMaxScaleOnAxis();
      if ((scale - _zoom).abs() > 0.01) {
        setState(() => _zoom = scale);
      }
    });
  }

  @override
  void dispose() {
    _transform.dispose();
    super.dispose();
  }

  void _setZoom(double scale) {
    final clamped = scale.clamp(0.35, 2.5);
    // Zoom around the current viewport center.
    final current = _transform.value.getMaxScaleOnAxis();
    final factor = clamped / current;
    final box = context.findRenderObject() as RenderBox?;
    final center = box == null
        ? Offset.zero
        : Offset(box.size.width / 2, box.size.height / 2);
    final m = _transform.value.clone()
      ..translate(center.dx, center.dy)
      ..scale(factor)
      ..translate(-center.dx, -center.dy);
    _transform.value = m;
  }

  void _resetView() {
    _transform.value = Matrix4.identity()
      ..translate(-_originPad, -_originPad);
  }

  /// Canvas size in shifted coordinates: [_originPad] of free space on the
  /// left/top, and the note extent plus breathing room on the right/bottom.
  Size get _canvasSize {
    var maxX = 900.0;
    var maxY = 1200.0;
    for (final note in widget.notes) {
      final p = _positionOf(note);
      if (p.dx + note.width + 120 > maxX) maxX = p.dx + note.width + 120;
      if (p.dy + note.height + 200 > maxY) maxY = p.dy + note.height + 200;
    }
    return Size(maxX + _originPad, maxY + _originPad);
  }

  @override
  Widget build(BuildContext context) {
    final size = _canvasSize;

    return Stack(
      children: [
        InteractiveViewer(
          transformationController: _transform,
          constrained: false,
          minScale: 0.35,
          maxScale: 2.5,
          boundaryMargin: const EdgeInsets.all(200),
          child: SizedBox(
            width: size.width,
            height: size.height,
            child: Stack(
              children: [
                Positioned.fill(
                  child: GestureDetector(
                    // Tapping empty canvas cancels linking mode.
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      if (_linkingFromId != null) {
                        setState(() => _linkingFromId = null);
                      }
                    },
                    child: CustomPaint(painter: _GridPainter()),
                  ),
                ),
                Positioned.fill(
                  child: IgnorePointer(
                    child: CustomPaint(
                      painter: _LinkPainter(segments: _linkSegments()),
                    ),
                  ),
                ),
                for (final note in widget.notes)
                  Positioned(
                    left: _positionOf(note).dx + _originPad,
                    top: _positionOf(note).dy + _originPad,
                    child: GestureDetector(
                      onTap: () => _handleNoteTap(note),
                      onLongPress: () => _showNoteMenu(note),
                      onPanUpdate: (details) {
                        setState(() {
                          // World coordinates; may go negative down to
                          // -_originPad, matching the padded canvas.
                          final p = _positionOf(note) + details.delta;
                          _positions[note.id] = Offset(
                            p.dx.clamp(
                                -_originPad, size.width - _originPad - note.width),
                            p.dy.clamp(
                                -_originPad,
                                size.height - _originPad - note.height),
                          );
                        });
                      },
                      onPanEnd: (_) {
                        final p = _positionOf(note);
                        widget.onMove(note, p.dx, p.dy);
                      },
                      child: Container(
                        decoration: _linkingFromId == note.id
                            ? BoxDecoration(
                                borderRadius: BorderRadius.circular(17),
                                border: Border.all(
                                    color: _linkColor, width: 3),
                              )
                            : null,
                        child: _NoteCard(note: note),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        // Linking-mode banner.
        if (_linkingFromId != null)
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Card(
              color: const Color(0xFF3A5A40),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 8, 6, 8),
                child: Row(
                  children: [
                    const Icon(Icons.account_tree_outlined,
                        color: Colors.white, size: 18),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'Tap another note to link it — tap its current '
                        'link to unlink',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                    TextButton(
                      onPressed: () =>
                          setState(() => _linkingFromId = null),
                      child: const Text('CANCEL',
                          style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        // Zoom controls (mirrors the web board's +/−/% panel).
        Positioned(
          right: 12,
          bottom: 100,
          child: Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(18),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.add, size: 20),
                    onPressed: () => _setZoom(_zoom * 1.25),
                  ),
                  Text(
                    '${(_zoom * 100).round()}%',
                    style: const TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.remove, size: 20),
                    onPressed: () => _setZoom(_zoom / 1.25),
                  ),
                  const Divider(height: 1, indent: 8, endIndent: 8),
                  IconButton(
                    visualDensity: VisualDensity.compact,
                    tooltip: 'Reset view',
                    icon: const Icon(Icons.crop_free, size: 18),
                    onPressed: _resetView,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Dashed lines between linked notes (web parity: #588157, dash 5/5).
class _LinkPainter extends CustomPainter {
  _LinkPainter({required this.segments});

  final List<(Offset, Offset)> segments;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF588157).withValues(alpha: 0.6)
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    for (final (a, b) in segments) {
      _dashedLine(canvas, a, b, paint);
    }
  }

  void _dashedLine(Canvas canvas, Offset a, Offset b, Paint paint) {
    const dash = 6.0;
    const gap = 5.0;
    final total = (b - a).distance;
    if (total <= 0) return;
    final dir = (b - a) / total;
    var d = 0.0;
    while (d < total) {
      final end = d + dash < total ? d + dash : total;
      canvas.drawLine(a + dir * d, a + dir * end, paint);
      d = end + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _LinkPainter oldDelegate) {
    if (oldDelegate.segments.length != segments.length) return true;
    for (var i = 0; i < segments.length; i++) {
      if (oldDelegate.segments[i] != segments[i]) return true;
    }
    return false;
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.sage.withValues(alpha: 0.25)
      ..strokeWidth = 1;
    const gap = 40.0;
    for (var x = 0.0; x < size.width; x += gap) {
      for (var y = 0.0; y < size.height; y += gap) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_GridPainter oldDelegate) => false;
}

/// Inline voice memo player for the canvas: tap to play/stop.
class _VoiceNotePlayer extends StatefulWidget {
  const _VoiceNotePlayer({required this.url, required this.label});

  final String url;

  /// Recorder's first name (falls back to "Voice memo").
  final String label;

  @override
  State<_VoiceNotePlayer> createState() => _VoiceNotePlayerState();
}

class _VoiceNotePlayerState extends State<_VoiceNotePlayer> {
  final _player = AudioPlayer();
  bool _playing = false;

  @override
  void initState() {
    super.initState();
    _player.onPlayerComplete.listen((_) {
      if (mounted) setState(() => _playing = false);
    });
  }

  Future<void> _toggle() async {
    if (!widget.url.startsWith('http')) return;
    if (_playing) {
      await _player.stop();
      if (mounted) setState(() => _playing = false);
    } else {
      await _player.play(UrlSource(widget.url));
      if (mounted) setState(() => _playing = true);
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: _toggle,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            _playing ? Icons.stop_circle : Icons.play_circle_fill,
            color: AppColors.primary,
            size: 30,
          ),
          const SizedBox(width: 8),
          Text(
            _playing ? 'Playing…' : widget.label,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }
}

class _NoteCard extends StatelessWidget {
  const _NoteCard({required this.note});

  final StickyNoteModel note;

  static Color _parse(String hex) {
    try {
      var h = hex.replaceFirst('#', '');
      if (h.length == 6) h = 'FF$h';
      return Color(int.parse(h, radix: 16));
    } catch (_) {
      return const Color(0xFFFAEDCD);
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = note.width.clamp(120.0, 360.0);
    final height = note.height.clamp(90.0, 420.0);

    switch (note.type) {
      case 'image':
        return _frame(
          width: width,
          height: height,
          color: Colors.white,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: note.content.startsWith('http')
                ? CachedNetworkImage(
                    imageUrl: note.content,
                    fit: BoxFit.cover,
                    width: width,
                    height: height,
                    errorWidget: (_, __, ___) => const Center(
                        child: Icon(Icons.broken_image_outlined)),
                  )
                : const Center(child: Icon(Icons.image_outlined)),
          ),
        );

      case 'voice':
        final url = note.audioUrl ?? note.content;
        return _frame(
          width: width,
          height: 70,
          color: Colors.white,
          child: _VoiceNotePlayer(
            url: url,
            // "Andrew" instead of the generic "Voice memo".
            label: note.creatorFirstName ?? 'Voice memo',
          ),
        );

      case 'route':
        final m = note.metadata ?? {};
        return _frame(
          width: width,
          height: height,
          color: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (m['thumbnail'] is String)
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(12)),
                  child: CachedNetworkImage(
                    imageUrl: m['thumbnail'] as String,
                    height: 56,
                    width: width,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '🥾 TRAIL',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF059669),
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      (m['title'] ?? note.content).toString(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                    if (m['distanceKm'] != null)
                      Text(
                        '${m['distanceKm']} km · ${m['difficulty'] ?? ''}',
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey.shade600),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );

      default: // text, schedule, budget, sustainability, weather
        return _frame(
          width: width,
          height: height,
          color: _parse(note.color),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${note.emoji ?? ''} ${note.type.toUpperCase()}'.trim(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: Colors.black.withValues(alpha: 0.45),
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Expanded(
                  child: Text(
                    note.content,
                    overflow: TextOverflow.fade,
                    style: const TextStyle(fontSize: 13, height: 1.3),
                  ),
                ),
              ],
            ),
          ),
        );
    }
  }

  Widget _frame({
    required double width,
    required double height,
    required Color color,
    required Widget child,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 8,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: child,
    );
  }
}
