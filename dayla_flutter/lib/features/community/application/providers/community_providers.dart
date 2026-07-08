import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/core/network/socket_service.dart';
import 'package:dayla_flutter/features/community/data/datasources/community_remote_datasource.dart';
import 'package:dayla_flutter/features/community/data/models/post_model.dart';
import 'package:dayla_flutter/features/community/data/repositories/community_repository.dart';

final communityRemoteDatasourceProvider =
    Provider<CommunityRemoteDatasource>((ref) {
  return CommunityRemoteDatasource(ref.watch(dioProvider));
});

final communityRepositoryProvider = Provider<CommunityRepository>((ref) {
  return CommunityRepository(ref.watch(communityRemoteDatasourceProvider));
});

final postsProvider =
    AsyncNotifierProvider<PostsNotifier, List<PostModel>>(PostsNotifier.new);

class PostsNotifier extends AsyncNotifier<List<PostModel>> {
  @override
  Future<List<PostModel>> build() async {
    final repo = ref.watch(communityRepositoryProvider);
    _setupSocket();
    return repo.getPosts();
  }

  // Live feed updates, mirroring Community.tsx on the web: like counts update
  // in place; comment changes refetch just the affected post.
  void _setupSocket() {
    final socket = ref.watch(socketServiceProvider);

    void onLiked(dynamic data) {
      if (data is! Map) return;
      final postId = data['postId']?.toString();
      final likeCount = (data['likeCount'] as num?)?.toInt();
      final current = state.valueOrNull;
      if (postId == null || likeCount == null || current == null) return;
      state = AsyncValue.data([
        for (final p in current)
          if (p.id == postId) p.copyWith(likeCount: likeCount) else p,
      ]);
    }

    void onCommentChanged(dynamic data) {
      if (data is! Map) return;
      final postId = data['postId']?.toString();
      if (postId != null) _refreshPost(postId);
    }

    void onPostCreated(dynamic _) => refresh();

    socket.on('post:liked', onLiked);
    socket.on('comment:added', onCommentChanged);
    socket.on('comment:deleted', onCommentChanged);
    socket.on('post:created', onPostCreated);
    ref.onDispose(() {
      socket.off('post:liked', onLiked);
      socket.off('comment:added', onCommentChanged);
      socket.off('comment:deleted', onCommentChanged);
      socket.off('post:created', onPostCreated);
    });
  }

  Future<void> _refreshPost(String postId) async {
    final post =
        await ref.read(communityRepositoryProvider).getPost(postId);
    final current = state.valueOrNull;
    if (post == null || current == null) return;
    state = AsyncValue.data([
      for (final p in current)
        if (p.id == postId) post else p,
    ]);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() {
      return ref.read(communityRepositoryProvider).getPosts();
    });
  }

  Future<bool> createPost({
    required String content,
    String? locationName,
    List<String>? tags,
    List<String>? imageUrls,
  }) async {
    final repo = ref.read(communityRepositoryProvider);
    final post = await repo.createPost(
      content: content,
      locationName: locationName,
      tags: tags,
      imageUrls: imageUrls,
    );
    if (post != null) {
      await refresh();
      return true;
    }
    return false;
  }

  Future<void> toggleLike(String postId, bool isLiked) async {
    final repo = ref.read(communityRepositoryProvider);
    if (isLiked) {
      await repo.unlikePost(postId);
    } else {
      await repo.likePost(postId);
    }
    await refresh();
  }

  Future<void> deletePost(String postId) async {
    final repo = ref.read(communityRepositoryProvider);
    await repo.deletePost(postId);
    await refresh();
  }
}
