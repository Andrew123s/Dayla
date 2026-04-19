import 'package:dio/dio.dart';

class ClimatiqRemoteDatasource {
  ClimatiqRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> validateConnection() async {
    final response = await _dio.get('/api/climatiq/validate');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> calculateTransport(
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.post('/api/climatiq/transport', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> calculateAccommodation(
    Map<String, dynamic> data,
  ) async {
    final response =
        await _dio.post('/api/climatiq/accommodation', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> calculateFood(
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.post('/api/climatiq/food', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> calculateTrip(
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.post('/api/climatiq/trip', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> calculateRealtime(
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.post('/api/climatiq/realtime', data: data);
    return response.data as Map<String, dynamic>;
  }
}
