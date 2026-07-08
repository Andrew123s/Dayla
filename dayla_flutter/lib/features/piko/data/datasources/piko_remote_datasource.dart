import 'package:dio/dio.dart';

/// Piko trails API (`/api/piko`). Browsing is free; voting and add-to-plan
/// are Pro-gated server-side (403 with a message when unavailable).
class PikoRemoteDatasource {
  PikoRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> listRoutes({
    String? country,
    String? difficulty,
    String? filter,
    String? query,
    String? sort,
  }) async {
    final params = <String, dynamic>{};
    if (country != null && country != 'all') params['country'] = country;
    if (difficulty != null && difficulty != 'all') {
      params['difficulty'] = difficulty;
    }
    if (filter != null && filter != 'all') params['filter'] = filter;
    if (query != null && query.isNotEmpty) params['q'] = query;
    if (sort != null) params['sort'] = sort;

    final response =
        await _dio.get('/api/piko/routes', queryParameters: params);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getRoute(String id) async {
    final response = await _dio.get('/api/piko/routes/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSaved() async {
    final response = await _dio.get('/api/piko/saved');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> toggleSave(String id) async {
    final response = await _dio.post('/api/piko/routes/$id/save');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> vote(String id, int value) async {
    final response = await _dio.post(
      '/api/piko/routes/$id/vote',
      data: {'value': value},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> listComments(String id) async {
    final response = await _dio.get('/api/piko/routes/$id/comments');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addComment(String id, String content) async {
    final response = await _dio.post(
      '/api/piko/routes/$id/comments',
      data: {'content': content},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addToPlan(
    String id,
    String dashboardId,
  ) async {
    final response = await _dio.post(
      '/api/piko/routes/$id/add-to-plan',
      data: {'dashboardId': dashboardId},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> reportRoute(String id, {String? reason}) async {
    final response = await _dio.post(
      '/api/piko/routes/$id/report',
      data: {if (reason != null) 'reason': reason},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Plans the viewer can add a route to (their trips). Kept inside the piko
  /// feature so it stays self-contained.
  Future<Map<String, dynamic>> getTrips() async {
    final response = await _dio.get('/api/trips');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getBoardByTrip(String tripId) async {
    final response = await _dio.get('/api/board/by-trip/$tripId');
    return response.data as Map<String, dynamic>;
  }
}
