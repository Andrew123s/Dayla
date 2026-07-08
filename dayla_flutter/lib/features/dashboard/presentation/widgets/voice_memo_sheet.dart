import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:record/record.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';

/// Record a voice memo for the trip board. Resolves with the local file path
/// of the recording (AAC/m4a), or null when cancelled.
class VoiceMemoSheet extends StatefulWidget {
  const VoiceMemoSheet({super.key});

  static Future<String?> show(BuildContext context) {
    return showModalBottomSheet<String>(
      context: context,
      isDismissible: false,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const VoiceMemoSheet(),
    );
  }

  @override
  State<VoiceMemoSheet> createState() => _VoiceMemoSheetState();
}

class _VoiceMemoSheetState extends State<VoiceMemoSheet> {
  final _recorder = AudioRecorder();
  bool _recording = false;
  bool _permissionDenied = false;
  Duration _elapsed = Duration.zero;
  Timer? _ticker;
  String? _path;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    if (!await _recorder.hasPermission()) {
      if (mounted) setState(() => _permissionDenied = true);
      return;
    }
    final dir = Directory.systemTemp;
    final path =
        '${dir.path}${Platform.pathSeparator}dayla_memo_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc),
      path: path,
    );
    _path = path;
    setState(() => _recording = true);
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsed += const Duration(seconds: 1));
    });
  }

  Future<void> _finish() async {
    _ticker?.cancel();
    final path = await _recorder.stop();
    if (mounted) Navigator.of(context).pop(path ?? _path);
  }

  Future<void> _cancel() async {
    _ticker?.cancel();
    await _recorder.stop();
    if (_path != null) {
      try {
        await File(_path!).delete();
      } catch (_) {/* best effort */}
    }
    if (mounted) Navigator.of(context).pop(null);
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _recorder.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_permissionDenied) ...[
              Icon(Icons.mic_off, size: 40, color: Colors.grey.shade400),
              const SizedBox(height: 10),
              const Text('Microphone permission is needed for voice memos.'),
              const SizedBox(height: 14),
              TextButton(
                onPressed: () => Navigator.of(context).pop(null),
                child: const Text('Close'),
              ),
            ] else ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 400),
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: _recording
                          ? Colors.red
                          : Colors.grey.shade400,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _recording ? 'Recording…' : 'Starting…',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                _format(_elapsed),
                style: Theme.of(context)
                    .textTheme
                    .headlineMedium
                    ?.copyWith(
                      fontWeight: FontWeight.w800,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _cancel,
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _recording ? _finish : null,
                      style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary),
                      icon: const Icon(Icons.check, size: 18),
                      label: const Text('Use memo'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  static String _format(Duration d) {
    final m = d.inMinutes.toString().padLeft(2, '0');
    final s = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }
}
