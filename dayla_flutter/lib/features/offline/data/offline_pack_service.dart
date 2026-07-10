import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';

/// Offline Adventure Pack — everything one trip needs, saved on-device
/// before departure so the app keeps working with zero signal on the trail:
///
///  - trip + board notes (read-only offline)
///  - packing list (check-offs queue locally, sync when back online)
///  - the first trail's geometry + OSM map tiles around it (zoom 11–14)
///
/// Storage layout (app documents dir):
///   `offline_packs/{tripId}/pack.json`   — trip/board/packing/route data
///   `offline_packs/{tripId}/queue.json`  — pending packed-toggles
///   `offline_packs/tiles/{z}/{x}/{y}.png` — shared tile cache
class OfflinePackService {
  OfflinePackService(this._dio);

  final Dio _dio;

  static const _maxTiles = 350;
  static const _tileZooms = [11, 12, 13, 14];

  Future<Directory> _packDir(String tripId) async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory(
        '${docs.path}${Platform.pathSeparator}offline_packs${Platform.pathSeparator}$tripId');
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  static Future<Directory> tilesDir() async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory(
        '${docs.path}${Platform.pathSeparator}offline_packs${Platform.pathSeparator}tiles');
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  Future<bool> hasPack(String tripId) async {
    final dir = await _packDir(tripId);
    return File('${dir.path}${Platform.pathSeparator}pack.json').exists();
  }

  Future<Map<String, dynamic>?> readPack(String tripId) async {
    try {
      final dir = await _packDir(tripId);
      final file = File('${dir.path}${Platform.pathSeparator}pack.json');
      if (!await file.exists()) return null;
      return jsonDecode(await file.readAsString()) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> deletePack(String tripId) async {
    final dir = await _packDir(tripId);
    if (await dir.exists()) await dir.delete(recursive: true);
  }

  /// Download the full pack. [onProgress] gets a 0..1 fraction and a label.
  Future<void> downloadPack(
    String tripId, {
    required void Function(double progress, String label) onProgress,
  }) async {
    onProgress(0.05, 'Fetching trip…');
    final trip = (await _dio.get('/api/trips/$tripId')).data['data']?['trip'];

    onProgress(0.15, 'Fetching board…');
    Map<String, dynamic>? board;
    try {
      final res = await _dio.get('/api/boards/by-trip/$tripId');
      board = Map<String, dynamic>.from(res.data['data']?['dashboard'] as Map);
    } catch (_) {/* board optional */}

    onProgress(0.25, 'Fetching packing list…');
    Map<String, dynamic>? packing;
    try {
      final res = await _dio.get('/api/packing/$tripId');
      final data = res.data['data'];
      packing = data is Map
          ? Map<String, dynamic>.from(
              (data['packingList'] ?? data) as Map)
          : null;
    } catch (_) {/* packing optional */}

    // First route note on the board → full route (geometry for the map).
    Map<String, dynamic>? route;
    final notes = (board?['notes'] as List?) ?? [];
    for (final note in notes.whereType<Map>()) {
      if (note['type'] == 'route' &&
          note['metadata'] is Map &&
          note['metadata']['routeId'] != null) {
        try {
          onProgress(0.35, 'Fetching trail…');
          final res = await _dio
              .get('/api/piko/routes/${note['metadata']['routeId']}');
          route = Map<String, dynamic>.from(res.data['data'] as Map);
        } catch (_) {/* trail optional */}
        break;
      }
    }

    // ── Map tiles around the trail (or the destination point) ──
    final coords =
        (route?['geometry'] as Map?)?['coordinates'] as List? ?? [];
    if (coords.length > 1) {
      await _downloadTiles(coords.whereType<List>().toList(), (f, done, total) {
        onProgress(0.4 + f * 0.55, 'Map tiles $done/$total…');
      });
    }

    onProgress(0.97, 'Saving pack…');
    final dir = await _packDir(tripId);
    await File('${dir.path}${Platform.pathSeparator}pack.json').writeAsString(
      jsonEncode({
        'savedAt': DateTime.now().toIso8601String(),
        'trip': trip,
        'board': board,
        'packing': packing,
        'route': route,
      }),
    );
    onProgress(1.0, 'Ready for the trail');
  }

  Future<void> _downloadTiles(
    List<List> coords,
    void Function(double fraction, int done, int total) onTileProgress,
  ) async {
    // Bounding box with a small margin.
    var minLat = double.infinity, maxLat = -double.infinity;
    var minLng = double.infinity, maxLng = -double.infinity;
    for (final c in coords) {
      final lng = (c[0] as num).toDouble(), lat = (c[1] as num).toDouble();
      minLat = math.min(minLat, lat);
      maxLat = math.max(maxLat, lat);
      minLng = math.min(minLng, lng);
      maxLng = math.max(maxLng, lng);
    }
    const margin = 0.02;
    minLat -= margin; maxLat += margin; minLng -= margin; maxLng += margin;

    // Collect tiles per zoom, lowest zoom first, capped so a long route
    // can't eat the phone's storage.
    final tiles = <(int, int, int)>[];
    for (final z in _tileZooms) {
      final (x1, y1) = _tileXY(maxLat, minLng, z);
      final (x2, y2) = _tileXY(minLat, maxLng, z);
      for (var x = x1; x <= x2; x++) {
        for (var y = y1; y <= y2; y++) {
          tiles.add((z, x, y));
          if (tiles.length >= _maxTiles) break;
        }
        if (tiles.length >= _maxTiles) break;
      }
      if (tiles.length >= _maxTiles) break;
    }

    final dir = await tilesDir();
    final tileDio = Dio(BaseOptions(
      responseType: ResponseType.bytes,
      headers: {'User-Agent': 'Dayla/1.0 (offline adventure pack)'},
    ));
    var done = 0;
    for (final (z, x, y) in tiles) {
      final file = File(
          '${dir.path}${Platform.pathSeparator}$z${Platform.pathSeparator}$x${Platform.pathSeparator}$y.png');
      if (!await file.exists()) {
        try {
          final res = await tileDio
              .get<List<int>>('https://tile.openstreetmap.org/$z/$x/$y.png');
          await file.create(recursive: true);
          await file.writeAsBytes(res.data!);
        } catch (_) {/* skip failed tiles — map falls back to network */}
      }
      done++;
      onTileProgress(done / tiles.length, done, tiles.length);
    }
  }

  static (int, int) _tileXY(double lat, double lng, int zoom) {
    final n = math.pow(2, zoom).toDouble();
    final x = ((lng + 180) / 360 * n).floor().clamp(0, n.toInt() - 1);
    final latRad = lat * math.pi / 180;
    final y = ((1 - math.log(math.tan(latRad) + 1 / math.cos(latRad)) / math.pi) /
            2 *
            n)
        .floor()
        .clamp(0, n.toInt() - 1);
    return (x, y);
  }

  // ── Packing check-offs offline: queue locally, sync when reachable ──

  Future<File> _queueFile(String tripId) async {
    final dir = await _packDir(tripId);
    return File('${dir.path}${Platform.pathSeparator}queue.json');
  }

  Future<Map<String, bool>> readQueue(String tripId) async {
    try {
      final file = await _queueFile(tripId);
      if (!await file.exists()) return {};
      final raw = jsonDecode(await file.readAsString()) as Map;
      return raw.map((k, v) => MapEntry(k.toString(), v == true));
    } catch (_) {
      return {};
    }
  }

  Future<void> queueToggle(String tripId, String itemId, bool packed) async {
    final queue = await readQueue(tripId);
    queue[itemId] = packed;
    final file = await _queueFile(tripId);
    await file.writeAsString(jsonEncode(queue));
  }

  /// Push queued toggles to the backend; returns how many synced.
  Future<int> syncQueue(String tripId) async {
    final queue = await readQueue(tripId);
    if (queue.isEmpty) return 0;
    var synced = 0;
    final remaining = Map<String, bool>.from(queue);
    for (final entry in queue.entries) {
      try {
        await _dio.put(
          '/api/packing/$tripId/items/${entry.key}',
          data: {'packed': entry.value},
        );
        remaining.remove(entry.key);
        synced++;
      } on DioException {
        break; // still offline — keep the rest queued
      }
    }
    final file = await _queueFile(tripId);
    await file.writeAsString(jsonEncode(remaining));
    return synced;
  }
}

final offlinePackServiceProvider = Provider<OfflinePackService>((ref) {
  return OfflinePackService(ref.watch(dioProvider));
});
