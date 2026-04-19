import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';

class CommunityRemoteDatasource {
  CommunityRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> getPosts() async {
    final response = await _dio.get('/api/community/posts');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPost(String id) async {
    final response = await _dio.get('/api/community/posts/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createPost(Map<String, dynamic> data) async {
    final response = await _dio.post('/api/community/posts', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updatePost(
    String id,
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.put('/api/community/posts/$id', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deletePost(String id) async {
    final response = await _dio.delete('/api/community/posts/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> likePost(String id) async {
    final response = await _dio.post('/api/community/posts/$id/likes');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> unlikePost(String id) async {
    final response = await _dio.delete('/api/community/posts/$id/likes');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addComment(
    String postId,
    String content,
  ) async {
    final response = await _dio.post(
      '/api/community/posts/$postId/comments',
      data: {'content': content},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deleteComment(
    String postId,
    String commentId,
  ) async {
    final response =
        await _dio.delete('/api/community/posts/$postId/comments/$commentId');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> savePost(String id) async {
    final response = await _dio.post('/api/community/posts/$id/save');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSavedPosts() async {
    final response = await _dio.get('/api/community/saved');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getTrending() async {
    final response = await _dio.get('/api/community/trending');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> uploadImage(String filePath) async {
    final fileName = filePath.split('/').last;
    final ext = fileName.split('.').last.toLowerCase();
    final mimeType = switch (ext) {
      'png' => 'image/png',
      'gif' => 'image/gif',
      'webp' => 'image/webp',
      _ => 'image/jpeg',
    };
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        filePath,
        filename: fileName,
        contentType: MediaType.parse(mimeType),
      ),
    });
    final response = await _dio.post('/api/upload/images', data: formData);
    return response.data as Map<String, dynamic>;
  }
}
