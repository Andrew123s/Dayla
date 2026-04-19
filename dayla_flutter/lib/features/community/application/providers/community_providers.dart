import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
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
    return repo.getPosts();
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
  }) async {
    final repo = ref.read(communityRepositoryProvider);
    final post = await repo.createPost(
      content: content,
      locationName: locationName,
      tags: tags,
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
