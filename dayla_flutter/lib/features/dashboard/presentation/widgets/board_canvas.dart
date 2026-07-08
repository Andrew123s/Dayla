import 'package:audioplayers/audioplayers.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

/// The spatial sticky-note board: notes keep their web x/y positions, can be
/// dragged (position persists via [onMove]), tapped to edit and long-pressed
/// to delete. Pinch/pan the canvas with InteractiveViewer.
class BoardCanvas extends StatefulWidget {
  const BoardCanvas({
    super.key,
    required this.notes,
    required this.onMove,
    required this.onTap,
    required this.onDelete,
  });

  final List<StickyNoteModel> notes;
  final void Function(StickyNoteModel note, double x, double y) onMove;
  final void Function(StickyNoteModel note) onTap;
  final void Function(StickyNoteModel note) onDelete;

  @override
  State<BoardCanvas> createState() => _BoardCanvasState();
}

class _BoardCanvasState extends State<BoardCanvas> {
  // Local drag offsets so dragging is smooth without waiting for the server.
  final Map<String, Offset> _positions = {};

  Offset _positionOf(StickyNoteModel note) =>
      _positions[note.id] ?? Offset(note.x, note.y);

  Size get _canvasSize {
    var maxX = 900.0;
    var maxY = 1200.0;
    for (final note in widget.notes) {
      final p = _positionOf(note);
      if (p.dx + note.width + 120 > maxX) maxX = p.dx + note.width + 120;
      if (p.dy + note.height + 200 > maxY) maxY = p.dy + note.height + 200;
    }
    return Size(maxX, maxY);
  }

  @override
  Widget build(BuildContext context) {
    final size = _canvasSize;

    return InteractiveViewer(
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
              child: CustomPaint(painter: _GridPainter()),
            ),
            for (final note in widget.notes)
              Positioned(
                left: _positionOf(note).dx,
                top: _positionOf(note).dy,
                child: GestureDetector(
                  onTap: () => widget.onTap(note),
                  onLongPress: () => widget.onDelete(note),
                  onPanUpdate: (details) {
                    setState(() {
                      final p = _positionOf(note) + details.delta;
                      _positions[note.id] = Offset(
                        p.dx.clamp(0, size.width - note.width),
                        p.dy.clamp(0, size.height - note.height),
                      );
                    });
                  },
                  onPanEnd: (_) {
                    final p = _positionOf(note);
                    widget.onMove(note, p.dx, p.dy);
                  },
                  child: _NoteCard(note: note),
                ),
              ),
          ],
        ),
      ),
    );
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
  const _VoiceNotePlayer({required this.url});

  final String url;

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
            _playing ? 'Playing…' : 'Voice memo',
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
          child: _VoiceNotePlayer(url: url),
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
