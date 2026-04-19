import 'package:dio/dio.dart';

class DashboardRemoteDatasource {
  DashboardRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> getTrips() async {
    final response = await _dio.get('/api/trips');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getTrip(String id) async {
    final response = await _dio.get('/api/trips/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createTrip({
    required String name,
    String? description,
    String? category,
    String? destination,
    Map<String, String>? dates,
    String? status,
  }) async {
    final data = <String, dynamic>{'name': name};
    if (description != null) data['description'] = description;
    if (category != null) data['category'] = category;
    if (destination != null) {
      data['destination'] = {'name': destination};
    }
    if (dates != null) data['dates'] = dates;
    if (status != null) data['status'] = status;

    final response = await _dio.post('/api/trips', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateTrip(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.put('/api/trips/$id', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deleteTrip(String id) async {
    final response = await _dio.delete('/api/trips/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addCollaborator(
    String tripId,
    String email,
  ) async {
    final response = await _dio.post(
      '/api/trips/$tripId/collaborators',
      data: {'email': email},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> removeCollaborator(
    String tripId,
    String userId,
  ) async {
    final response =
        await _dio.delete('/api/trips/$tripId/collaborators/$userId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getBoardByTrip(String tripId) async {
    final response = await _dio.get('/api/board/by-trip/$tripId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getBoard(String boardId) async {
    final response = await _dio.get('/api/board/$boardId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> inviteToBoard(
    String boardId,
    String email,
  ) async {
    final response = await _dio.post(
      '/api/board/$boardId/invite',
      data: {'email': email},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createStickyNote(
    String tripId,
    Map<String, dynamic> noteData,
  ) async {
    final response =
        await _dio.post('/api/trips/$tripId/notes', data: noteData);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateStickyNote(
    String tripId,
    String noteId,
    Map<String, dynamic> noteData,
  ) async {
    final response =
        await _dio.put('/api/trips/$tripId/notes/$noteId', data: noteData);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deleteStickyNote(
    String tripId,
    String noteId,
  ) async {
    final response = await _dio.delete('/api/trips/$tripId/notes/$noteId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getWeather(
    String location, {
    int days = 5,
  }) async {
    final response = await _dio.get(
      '/api/weather',
      queryParameters: {'location': location, 'days': days},
    );
    return response.data as Map<String, dynamic>;
  }
}
