import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/memories/application/providers/memory_providers.dart';
import 'package:dayla_flutter/features/memories/data/models/memory_model.dart';

/// Mriz — the seasonal memory timeline. Trips-turned-stories grouped by
/// season + year, each section tinted with its season's palette.
class MemoriesScreen extends ConsumerWidget {
  const MemoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final memoriesAsync = ref.watch(memoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Memories')),
      body: memoriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: FilledButton.tonal(
            onPressed: () => ref.read(memoriesProvider.notifier).refresh(),
            child: const Text('Retry'),
          ),
        ),
        data: (memories) {
          if (memories.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.auto_awesome,
                        size: 56,
                        color: AppColors.sage.withValues(alpha: 0.5)),
                    const SizedBox(height: 16),
                    Text(
                      'No memories yet',
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'When a trip completes, Dayla turns it into a story '
                      'you can relive and share. Mark a past trip as '
                      'completed to create its memory.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: Colors.grey.shade500, fontSize: 13.5),
                    ),
                  ],
                ),
              ),
            );
          }

          // Group by season + year, newest first.
          final sections = <String, List<MemoryModel>>{};
          for (final m in memories) {
            final year = (m.createdAt ?? DateTime.now()).year;
            final key = '${m.season}|$year';
            sections.putIfAbsent(key, () => []).add(m);
          }

          return RefreshIndicator(
            onRefresh: () => ref.read(memoriesProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
              children: [
                for (final entry in sections.entries) ...[
                  _SeasonHeader(
                    season: entry.key.split('|').first,
                    year: entry.key.split('|').last,
                  ),
                  for (final memory in entry.value)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _MemoryCard(memory: memory),
                    ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SeasonHeader extends StatelessWidget {
  const _SeasonHeader({required this.season, required this.year});

  final String season;
  final String year;

  @override
  Widget build(BuildContext context) {
    final color = SeasonPalette.of(season);
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 16, 4, 10),
      child: Row(
        children: [
          Icon(SeasonPalette.icon(season), size: 18, color: color),
          const SizedBox(width: 8),
          Text(
            '${SeasonPalette.label(season)} $year',
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 15,
              color: color,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              height: 1.5,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [color.withValues(alpha: 0.5), Colors.transparent],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MemoryCard extends StatelessWidget {
  const _MemoryCard({required this.memory});

  final MemoryModel memory;

  @override
  Widget build(BuildContext context) {
    final color = SeasonPalette.of(memory.season);
    final s = memory.stats;

    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: InkWell(
        onTap: () => context.push('/memories/${memory.id}'),
        child: Stack(
          children: [
            // Cover — photo when there is one, seasonal gradient otherwise.
            AspectRatio(
              aspectRatio: 16 / 10,
              child: memory.coverPhoto != null
                  ? CachedNetworkImage(
                      imageUrl: memory.coverPhoto!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorWidget: (_, __, ___) =>
                          _gradientFallback(color),
                    )
                  : _gradientFallback(color),
            ),
            // Bottom scrim with the story line.
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.65),
                    ],
                    stops: const [0.45, 1],
                  ),
                ),
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 14,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    memory.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    [
                      if (s.distanceKm > 0)
                        '${s.distanceKm.toStringAsFixed(1)} km',
                      '${s.days} day${s.days == 1 ? '' : 's'}',
                      if (s.companions > 0)
                        'with ${s.companions} friend${s.companions == 1 ? '' : 's'}',
                    ].join(' · '),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 12.5,
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  SeasonPalette.label(memory.season).toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _gradientFallback(Color color) => Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color.withValues(alpha: 0.75), color],
          ),
        ),
        child: const Center(
          child: Icon(Icons.landscape_outlined,
              size: 52, color: Colors.white54),
        ),
      );
}
