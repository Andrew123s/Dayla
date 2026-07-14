
import 'package:dayla_flutter/features/memories/data/datasources/memory_remote_datasource.dart';
import 'package:dayla_flutter/features/memories/data/models/memory_model.dart';

class MemoryRepository {
  MemoryRepository(this._remote);

  final MemoryRemoteDatasource _remote;

  Future<List<MemoryModel>> getMemories() async {
    try {
      final json = await _remote.listMemories();
      final memories = (json['data']?['memories'] as List?) ?? [];
      return memories
          .whereType<Map>()
          .map((m) => MemoryModel.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<MemoryModel?> getMemory(String id) async {
    try {
      final json = await _remote.getMemory(id);
      final memory = json['data']?['memory'];
      if (memory is Map) {
        return MemoryModel.fromJson(Map<String, dynamic>.from(memory));
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<MemoryModel?> generateForTrip(String tripId) async {
    try {
      final json = await _remote.generateForTrip(tripId);
      final memory = json['data']?['memory'];
      if (memory is Map) {
        return MemoryModel.fromJson(Map<String, dynamic>.from(memory));
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> share(String id) async {
    try {
      final json = await _remote.share(id);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }
}
