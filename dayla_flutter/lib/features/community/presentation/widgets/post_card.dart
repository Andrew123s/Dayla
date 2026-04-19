import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/community/application/providers/community_providers.dart';
import 'package:dayla_flutter/features/community/data/models/post_model.dart';

class PostCard extends ConsumerStatefulWidget {
  const PostCard({super.key, required this.post});

  final PostModel post;

  @override
  ConsumerState<PostCard> createState() => _PostCardState();
}

class _PostCardState extends ConsumerState<PostCard> {
  bool _showComments = false;
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.sage.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.sage.withValues(alpha: 0.3),
                  backgroundImage: post.author?.avatar != null
                      ? NetworkImage(post.author!.avatar!)
                      : null,
                  child: post.author?.avatar == null
                      ? Text(
                          post.author?.name.isNotEmpty == true
                              ? post.author!.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post.author?.name ?? 'Unknown',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      if (post.createdAt != null)
                        Text(
                          _formatTime(post.createdAt!),
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 12,
                          ),
                        ),
                    ],
                  ),
                ),
                if (post.location?.name != null &&
                    post.location!.name!.isNotEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.sage.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on,
                            size: 12, color: AppColors.primary),
                        const SizedBox(width: 3),
                        Text(
                          post.location!.name!,
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          if (post.content.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Text(
                post.content,
                style: const TextStyle(fontSize: 14, height: 1.5),
              ),
            ),
          if (post.images.isNotEmpty) ...[
            const SizedBox(height: 10),
            SizedBox(
              height: 200,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: post.images.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) => ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: CachedNetworkImage(
                    imageUrl: post.images[i].url,
                    width: 200,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      width: 200,
                      color: Colors.grey.shade200,
                      child: const Center(child: CircularProgressIndicator()),
                    ),
                    errorWidget: (_, __, ___) => Container(
                      width: 200,
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.broken_image),
                    ),
                  ),
                ),
              ),
            ),
          ],
          if (post.tags.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Wrap(
                spacing: 6,
                runSpacing: 4,
                children: post.tags
                    .map((t) => Text(
                          '#${t.name}',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ))
                    .toList(),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 8, 4),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(
                    post.liked ? Icons.favorite : Icons.favorite_border,
                    color: post.liked ? Colors.red : Colors.grey,
                    size: 20,
                  ),
                  onPressed: () => ref
                      .read(postsProvider.notifier)
                      .toggleLike(post.id, post.liked),
                ),
                Text(
                  '${post.likeCount}',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.chat_bubble_outline,
                      size: 20, color: Colors.grey),
                  onPressed: () =>
                      setState(() => _showComments = !_showComments),
                ),
                Text(
                  '${post.comments.length}',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const Spacer(),
                IconButton(
                  icon: Icon(
                    post.saved ? Icons.bookmark : Icons.bookmark_border,
                    color: post.saved ? AppColors.sand : Colors.grey,
                    size: 20,
                  ),
                  onPressed: () async {
                    final repo = ref.read(communityRepositoryProvider);
                    await repo.savePost(post.id);
                    ref.read(postsProvider.notifier).refresh();
                  },
                ),
              ],
            ),
          ),
          if (_showComments) ...[
            const Divider(height: 1),
            if (post.comments.isNotEmpty)
              ...post.comments.map((c) => Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundColor:
                              AppColors.sage.withValues(alpha: 0.3),
                          child: Text(
                            c.author?.name.isNotEmpty == true
                                ? c.author!.name[0].toUpperCase()
                                : '?',
                            style: const TextStyle(fontSize: 10),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                c.author?.name ?? 'User',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                              Text(c.content,
                                  style: const TextStyle(fontSize: 13)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      decoration: InputDecoration(
                        hintText: 'Add a comment...',
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide:
                              BorderSide(color: Colors.grey.shade300),
                        ),
                      ),
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.send,
                        size: 20, color: AppColors.primary),
                    onPressed: () async {
                      final text = _commentController.text.trim();
                      if (text.isEmpty) return;
                      final repo = ref.read(communityRepositoryProvider);
                      await repo.addComment(post.id, text);
                      _commentController.clear();
                      ref.read(postsProvider.notifier).refresh();
                    },
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatTime(String iso) {
    try {
      return timeago.format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }
}
