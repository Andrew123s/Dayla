import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:video_player/video_player.dart';

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
          if (post.repostedFrom != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Row(
                children: [
                  Icon(Icons.repeat, size: 14, color: Colors.grey.shade500),
                  const SizedBox(width: 5),
                  Text(
                    'Reposted from ${post.repostedFrom!.authorName ?? 'someone'}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade500,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
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
            // Photos display uncropped: a single image keeps its natural
            // aspect ratio at full width; multiple images scroll
            // horizontally, each letterboxed (contain) rather than cropped.
            if (post.images.length == 1)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: post.images.first.isVideo
                      ? _VideoAttachment(url: post.images.first.url)
                      : CachedNetworkImage(
                          imageUrl: post.images.first.url,
                          width: double.infinity,
                          fit: BoxFit.fitWidth,
                          placeholder: (_, __) => AspectRatio(
                            aspectRatio: 4 / 3,
                            child: Container(
                              color: Colors.grey.shade200,
                              child: const Center(
                                  child: CircularProgressIndicator()),
                            ),
                          ),
                          errorWidget: (_, __, ___) => AspectRatio(
                            aspectRatio: 4 / 3,
                            child: Container(
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.broken_image),
                            ),
                          ),
                        ),
                ),
              )
            else
              SizedBox(
                height: 240,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: post.images.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      color: Colors.grey.shade100,
                      constraints: const BoxConstraints(
                          minWidth: 140, maxWidth: 300),
                      child: post.images[i].isVideo
                          ? SizedBox(
                              width: 280,
                              child:
                                  _VideoAttachment(url: post.images[i].url),
                            )
                          : CachedNetworkImage(
                              imageUrl: post.images[i].url,
                              height: 240,
                              fit: BoxFit.contain,
                              placeholder: (_, __) => Container(
                                width: 200,
                                color: Colors.grey.shade200,
                                child: const Center(
                                    child: CircularProgressIndicator()),
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
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.repeat, size: 20, color: Colors.grey),
                  tooltip: 'Repost',
                  onPressed: () async {
                    final messenger = ScaffoldMessenger.of(context);
                    final ok = await ref
                        .read(postsProvider.notifier)
                        .repost(post);
                    messenger.showSnackBar(SnackBar(
                      content: Text(ok
                          ? 'Reposted to your feed'
                          : 'Failed to repost'),
                    ));
                  },
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

/// Inline video attachment: shows a play cover, initializes the player on
/// first tap, then tap toggles play/pause. (Videos used to render through
/// the image widget and appeared permanently broken.)
class _VideoAttachment extends StatefulWidget {
  const _VideoAttachment({required this.url});

  final String url;

  @override
  State<_VideoAttachment> createState() => _VideoAttachmentState();
}

class _VideoAttachmentState extends State<_VideoAttachment> {
  VideoPlayerController? _controller;
  bool _initializing = false;
  bool _failed = false;

  Future<void> _start() async {
    if (_initializing) return;
    setState(() => _initializing = true);
    try {
      final controller =
          VideoPlayerController.networkUrl(Uri.parse(widget.url));
      await controller.initialize();
      controller.setLooping(true);
      if (!mounted) {
        controller.dispose();
        return;
      }
      setState(() {
        _controller = controller;
        _initializing = false;
      });
      controller.play();
    } catch (_) {
      if (mounted) {
        setState(() {
          _failed = true;
          _initializing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;

    if (controller != null && controller.value.isInitialized) {
      return GestureDetector(
        onTap: () => setState(() {
          controller.value.isPlaying ? controller.pause() : controller.play();
        }),
        child: AspectRatio(
          aspectRatio: controller.value.aspectRatio,
          child: Stack(
            alignment: Alignment.center,
            children: [
              VideoPlayer(controller),
              if (!controller.value.isPlaying)
                const Icon(Icons.play_circle_fill,
                    size: 56, color: Colors.white70),
            ],
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: _failed ? null : _start,
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          color: Colors.black87,
          child: Center(
            child: _initializing
                ? const CircularProgressIndicator(color: Colors.white70)
                : _failed
                    ? const Icon(Icons.videocam_off,
                        color: Colors.white54, size: 40)
                    : const Icon(Icons.play_circle_fill,
                        size: 56, color: Colors.white),
          ),
        ),
      ),
    );
  }
}
