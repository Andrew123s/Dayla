import 'package:dio/dio.dart';

class PackingRemoteDatasource {
  PackingRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> getPackingList(String tripId) async {
    final response = await _dio.get('/api/packing/$tripId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> generateList(String tripId) async {
    final response = await _dio.post('/api/packing/$tripId/generate');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addItem(
    String tripId,
    Map<String, dynamic> data,
  ) async {
    final response =
        await _dio.post('/api/packing/$tripId/items', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateItem(
    String tripId,
    String itemId,
    Map<String, dynamic> data,
  ) async {
    final response =
        await _dio.put('/api/packing/$tripId/items/$itemId', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> removeItem(
    String tripId,
    String itemId,
  ) async {
    final response =
        await _dio.delete('/api/packing/$tripId/items/$itemId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addLuggage(
    String tripId,
    Map<String, dynamic> data,
  ) async {
    final response =
        await _dio.post('/api/packing/$tripId/luggage', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> removeLuggage(
    String tripId,
    String luggageId,
  ) async {
    final response =
        await _dio.delete('/api/packing/$tripId/luggage/$luggageId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSuggestions(String tripId) async {
    final response =
        await _dio.get('/api/packing/$tripId/suggestions');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMemory() async {
    final response = await _dio.get('/api/packing/memory');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getTemplates() async {
    final response = await _dio.get('/api/packing/templates');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> applyTemplate(
    String tripId,
    String templateId,
  ) async {
    final response = await _dio.post(
      '/api/packing/$tripId/apply-template',
      data: {'templateId': templateId},
    );
    return response.data as Map<String, dynamic>;
  }
}
