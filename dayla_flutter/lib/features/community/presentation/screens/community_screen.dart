import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/community/application/providers/community_providers.dart';
import 'package:dayla_flutter/features/community/data/models/post_model.dart';
import 'package:dayla_flutter/features/community/presentation/widgets/create_post_sheet.dart';
import 'package:dayla_flutter/features/community/presentation/widgets/post_card.dart';

class CommunityScreen extends ConsumerWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Community'),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () {
                ref.read(postsProvider.notifier).refresh();
                ref.invalidate(trendingPostsProvider);
                ref.invalidate(savedPostsProvider);
              },
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Feed'),
              Tab(text: 'Trending'),
              Tab(text: 'Saved'),
            ],
          ),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              useSafeArea: true,
              shape: const RoundedRectangleBorder(
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(24)),
              ),
              builder: (_) => const CreatePostSheet(),
            );
          },
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          child: const Icon(Icons.edit),
        ),
        body: const TabBarView(
          children: [
            _FeedTab(),
            _TrendingTab(),
            _SavedTab(),
          ],
        ),
      ),
    );
  }
}

class _FeedTab extends ConsumerWidget {
  const _FeedTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(postsProvider);

    return postsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorRetry(
        onRetry: () => ref.read(postsProvider.notifier).refresh(),
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return const _EmptyState(
            icon: Icons.public_outlined,
            title: 'No posts yet',
            subtitle: 'Be the first to share an adventure!',
          );
        }
        return RefreshIndicator(
          onRefresh: () => ref.read(postsProvider.notifier).refresh(),
          child: _PostList(posts: posts),
        );
      },
    );
  }
}

class _TrendingTab extends ConsumerWidget {
  const _TrendingTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trendingAsync = ref.watch(trendingPostsProvider);

    return trendingAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorRetry(
        onRetry: () => ref.invalidate(trendingPostsProvider),
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return const _EmptyState(
            icon: Icons.trending_up,
            title: 'Nothing trending yet',
            subtitle: 'Popular posts will show up here',
          );
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(trendingPostsProvider),
          child: _PostList(posts: posts),
        );
      },
    );
  }
}

class _SavedTab extends ConsumerWidget {
  const _SavedTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedAsync = ref.watch(savedPostsProvider);

    return savedAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorRetry(
        onRetry: () => ref.invalidate(savedPostsProvider),
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return const _EmptyState(
            icon: Icons.bookmark_outline,
            title: 'No saved posts',
            subtitle: 'Bookmark posts to find them here later',
          );
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(savedPostsProvider),
          child: _PostList(posts: posts),
        );
      },
    );
  }
}

class _PostList extends StatelessWidget {
  const _PostList({required this.posts});

  final List<PostModel> posts;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
      itemCount: posts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => PostCard(post: posts[index]),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 64, color: AppColors.sage.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(
            title,
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 8),
          Text(subtitle, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class _ErrorRetry extends StatelessWidget {
  const _ErrorRetry({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
          const SizedBox(height: 12),
          Text('Failed to load posts',
              style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 12),
          FilledButton.tonal(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
