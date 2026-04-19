import 'package:dio/dio.dart';
import 'package:dayla_flutter/features/community/data/datasources/community_remote_datasource.dart';
import 'package:dayla_flutter/features/community/data/models/post_model.dart';

class CommunityRepository {
  CommunityRepository(this._remote);

  final CommunityRemoteDatasource _remote;

  Future<List<PostModel>> getPosts() async {
    try {
      final json = await _remote.getPosts();
      final posts = (json['data']?['posts'] as List?) ?? [];
      return posts
          .map((p) => PostModel.fromJson(p as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<PostModel?> getPost(String id) async {
    try {
      final json = await _remote.getPost(id);
      final post = json['data']?['post'];
      if (post != null) {
        return PostModel.fromJson(post as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<PostModel?> createPost({
    required String content,
    String? locationName,
    List<String>? tags,
    String? visibility,
  }) async {
    try {
      final data = <String, dynamic>{'content': content};
      if (locationName != null) {
        data['location'] = {'name': locationName};
      }
      if (tags != null) {
        data['tags'] = tags.map((t) => {'name': t, 'category': 'general'}).toList();
      }
      if (visibility != null) data['visibility'] = visibility;
      final json = await _remote.createPost(data);
      final post = json['data']?['post'];
      if (post != null) {
        return PostModel.fromJson(post as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<bool> likePost(String id) async {
    try {
      final json = await _remote.likePost(id);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> unlikePost(String id) async {
    try {
      final json = await _remote.unlikePost(id);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> addComment(String postId, String content) async {
    try {
      final json = await _remote.addComment(postId, content);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> deleteComment(String postId, String commentId) async {
    try {
      final json = await _remote.deleteComment(postId, commentId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> savePost(String id) async {
    try {
      final json = await _remote.savePost(id);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> deletePost(String id) async {
    try {
      final json = await _remote.deletePost(id);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<List<PostModel>> getTrending() async {
    try {
      final json = await _remote.getTrending();
      final posts = (json['data']?['posts'] as List?) ?? [];
      return posts
          .map((p) => PostModel.fromJson(p as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<List<PostModel>> getSavedPosts() async {
    try {
      final json = await _remote.getSavedPosts();
      final posts = (json['data']?['posts'] as List?) ?? [];
      return posts
          .map((p) => PostModel.fromJson(p as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }
}
