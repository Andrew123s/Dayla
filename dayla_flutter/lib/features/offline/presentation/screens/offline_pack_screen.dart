import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/offline/data/offline_pack_service.dart';

/// The Offline Adventure Pack viewer — works with ZERO connectivity.
/// Everything renders from the on-device pack: the trail on offline map
/// tiles, the board's notes (read-only), and the packing checklist whose
/// check-offs queue locally and sync automatically when reception returns.
class OfflinePackScreen extends ConsumerStatefulWidget {
  const OfflinePackScreen({super.key, required this.tripId});

  final String tripId;

  @override
  ConsumerState<OfflinePackScreen> createState() => _OfflinePackScreenState();
}

class _OfflinePackScreenState extends ConsumerState<OfflinePackScreen> {
  Map<String, dynamic>? _pack;
  Map<String, bool> _queue = {};
  String? _tilesPath;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final service = ref.read(offlinePackServiceProvider);
    final messenger = ScaffoldMessenger.of(context);
    final pack = await service.readPack(widget.tripId);
    final queue = await service.readQueue(widget.tripId);
    final tiles = await OfflinePackService.tilesDir();

    // Opportunistic sync — succeeds silently when there is reception.
    service.syncQueue(widget.tripId).then((synced) async {
      if (synced > 0 && mounted) {
        final fresh = await service.readQueue(widget.tripId);
        if (!mounted) return;
        setState(() => _queue = fresh);
        messenger.showSnackBar(SnackBar(
            content:
                Text('$synced packing update${synced == 1 ? '' : 's'} synced')));
      }
    });

    if (mounted) {
      setState(() {
        _pack = pack;
        _queue = queue;
        _tilesPath = tiles.path;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Offline pack')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    final pack = _pack;
    if (pack == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Offline pack')),
        body: const Center(child: Text('This trip has no offline pack yet')),
      );
    }

    final trip = pack['trip'] as Map? ?? {};
    final route = pack['route'] as Map?;
    final hasMap =
        ((route?['geometry'] as Map?)?['coordinates'] as List? ?? []).length > 1;

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text('${trip['name'] ?? 'Trip'} — offline'),
          bottom: const TabBar(tabs: [
            Tab(icon: Icon(Icons.map_outlined), text: 'Trail'),
            Tab(icon: Icon(Icons.sticky_note_2_outlined), text: 'Plan'),
            Tab(icon: Icon(Icons.backpack_outlined), text: 'Packing'),
          ]),
        ),
        body: TabBarView(
          children: [
            hasMap
                ? _TrailTab(route: route!, tilesPath: _tilesPath!)
                : const _EmptyTab(
                    icon: Icons.map_outlined,
                    text: 'No trail was on the board when this pack '
                        'was downloaded.'),
            _PlanTab(pack: pack),
            _PackingTab(
              pack: pack,
              queue: _queue,
              onToggle: (itemId, packed) async {
                setState(() => _queue[itemId] = packed);
                final service = ref.read(offlinePackServiceProvider);
                await service.queueToggle(widget.tripId, itemId, packed);
                // Try to sync right away; harmless when offline.
                service.syncQueue(widget.tripId);
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ── Trail: offline-first map tiles + the stored geometry ────────────────────
class _TrailTab extends StatelessWidget {
  const _TrailTab({required this.route, required this.tilesPath});

  final Map route;
  final String tilesPath;

  @override
  Widget build(BuildContext context) {
    final coords = ((route['geometry'] as Map)['coordinates'] as List)
        .whereType<List>()
        .map((c) => LatLng((c[1] as num).toDouble(), (c[0] as num).toDouble()))
        .toList();

    return Stack(
      children: [
        FlutterMap(
          options: MapOptions(
            initialCameraFit: CameraFit.bounds(
              bounds: LatLngBounds.fromPoints(coords),
              padding: const EdgeInsets.all(48),
            ),
            interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all & ~InteractiveFlag.rotate),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.dayla.app',
              tileProvider: _OfflineFirstTileProvider(tilesPath),
            ),
            PolylineLayer(polylines: [
              Polyline(
                  points: coords,
                  strokeWidth: 4.5,
                  color: const Color(0xFF059669)),
            ]),
            MarkerLayer(markers: [
              _dot(coords.first, const Color(0xFF10B981)),
              _dot(coords.last, const Color(0xFF0F172A)),
            ]),
          ],
        ),
        Positioned(
          top: 12,
          left: 12,
          right: 12,
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Text(
                '${route['title'] ?? 'Trail'} · '
                '${route['distanceKm'] ?? '?'} km · '
                '${route['elevationGainM'] ?? '?'} m up',
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ),
          ),
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

/// Serves tiles from the downloaded pack first; falls back to the network
/// for anything outside the cached area (no-op when offline).
class _OfflineFirstTileProvider extends TileProvider {
  _OfflineFirstTileProvider(this.tilesPath);

  final String tilesPath;

  @override
  ImageProvider getImage(TileCoordinates coordinates, TileLayer options) {
    final file = File(
        '$tilesPath${Platform.pathSeparator}${coordinates.z}${Platform.pathSeparator}${coordinates.x}${Platform.pathSeparator}${coordinates.y}.png');
    if (file.existsSync()) return FileImage(file);
    return NetworkImage(getTileUrl(coordinates, options));
  }
}

// ── Plan: the board's notes, read-only ──────────────────────────────────────
class _PlanTab extends StatelessWidget {
  const _PlanTab({required this.pack});

  final Map<String, dynamic> pack;

  @override
  Widget build(BuildContext context) {
    final notes = ((pack['board'] as Map?)?['notes'] as List? ?? [])
        .whereType<Map>()
        .where((n) => n['type'] != 'image' || true)
        .toList();
    if (notes.isEmpty) {
      return const _EmptyTab(
          icon: Icons.sticky_note_2_outlined,
          text: 'The board was empty when this pack was downloaded.');
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: notes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        final note = notes[i];
        final content = (note['content'] ?? '').toString();
        return Card(
          child: ListTile(
            leading: Icon(
              switch (note['type']) {
                'route' => Icons.route,
                'image' => Icons.image_outlined,
                'voice' => Icons.mic_outlined,
                'budget' => Icons.account_balance_wallet_outlined,
                'schedule' => Icons.calendar_today_outlined,
                _ => Icons.sticky_note_2_outlined,
              },
              color: AppColors.primary,
            ),
            title: Text(
              note['type'] == 'route'
                  ? ((note['metadata'] as Map?)?['title'] ?? content)
                      .toString()
                  : (note['type'] == 'image'
                      ? 'Photo (available online)'
                      : content),
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13.5),
            ),
          ),
        );
      },
    );
  }
}

// ── Packing: local check-offs that sync when reception returns ──────────────
class _PackingTab extends StatelessWidget {
  const _PackingTab({
    required this.pack,
    required this.queue,
    required this.onToggle,
  });

  final Map<String, dynamic> pack;
  final Map<String, bool> queue;
  final void Function(String itemId, bool packed) onToggle;

  @override
  Widget build(BuildContext context) {
    final items = ((pack['packing'] as Map?)?['items'] as List? ?? [])
        .whereType<Map>()
        .toList();
    if (items.isEmpty) {
      return const _EmptyTab(
          icon: Icons.backpack_outlined,
          text: 'No packing list was saved with this pack.');
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final item = items[i];
        final id = (item['_id'] ?? item['id'] ?? '$i').toString();
        final packed = queue.containsKey(id)
            ? queue[id]!
            : item['packed'] == true;
        return CheckboxListTile(
          value: packed,
          onChanged: (v) => onToggle(id, v ?? false),
          activeColor: AppColors.primary,
          title: Text(
            (item['name'] ?? 'Item').toString(),
            style: TextStyle(
              decoration: packed ? TextDecoration.lineThrough : null,
              color: packed ? Colors.grey : null,
            ),
          ),
          subtitle: item['category'] != null
              ? Text((item['category']).toString(),
                  style: const TextStyle(fontSize: 11))
              : null,
        );
      },
    );
  }
}

class _EmptyTab extends StatelessWidget {
  const _EmptyTab({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            Text(text,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600)),
          ],
        ),
      ),
    );
  }
}
