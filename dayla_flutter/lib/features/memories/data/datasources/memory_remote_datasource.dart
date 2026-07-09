import 'package:dio/dio.dart';

class MemoryRemoteDatasource {
  MemoryRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> listMemories() async {
    final response = await _dio.get('/api/memories');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMemory(String id) async {
    final response = await _dio.get('/api/memories/$id');
    return response.data as Map<String, dynamic>;
  }

  /// Assemble (or refresh) the memory for a trip — also the backfill path
  /// for trips completed before Mriz existed.
  Future<Map<String, dynamic>> generateForTrip(String tripId) async {
    final response = await _dio.post('/api/memories/generate/$tripId');
    return response.data as Map<String, dynamic>;
  }

  /// Share the story card into the community feed.
  Future<Map<String, dynamic>> share(String id) async {
    final response = await _dio.post('/api/memories/$id/share');
    return response.data as Map<String, dynamic>;
  }
}
