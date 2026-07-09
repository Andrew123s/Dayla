import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/memories/application/providers/memory_providers.dart';
import 'package:dayla_flutter/features/memories/data/models/memory_model.dart';

/// The Mriz story card: full-bleed cover, stats, mood tags, companions and
/// the photo strip. Route Replay (Phase 3) will launch from here.
class MemoryDetailScreen extends ConsumerStatefulWidget {
  const MemoryDetailScreen({super.key, required this.memoryId});

  final String memoryId;

  @override
  ConsumerState<MemoryDetailScreen> createState() =>
      _MemoryDetailScreenState();
}

class _MemoryDetailScreenState extends ConsumerState<MemoryDetailScreen> {
  bool _sharing = false;
  // Per-person perspective filter for the Moments strip (Phase 4).
  String? _personFilter;

  Future<void> _shareToCommunity() async {
    setState(() => _sharing = true);
    final ok =
        await ref.read(memoryRepositoryProvider).share(widget.memoryId);
    if (mounted) {
      setState(() => _sharing = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(ok
            ? 'Shared to the community feed'
            : 'Could not share this memory'),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final memoryAsync = ref.watch(memoryDetailProvider(widget.memoryId));

    return Scaffold(
      body: memoryAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) =>
            const Center(child: Text('Could not load this memory')),
        data: (memory) {
          if (memory == null) {
            return const Center(child: Text('Memory not found'));
          }
          return _buildStory(memory);
        },
      ),
      floatingActionButton: memoryAsync.valueOrNull != null &&
              (memoryAsync.valueOrNull!.routeCoordinates.length > 1 ||
                  memoryAsync.valueOrNull!.media.isNotEmpty)
          ? FloatingActionButton.extended(
              onPressed: () => context.push(
                  '/memories/${widget.memoryId}/replay'),
              backgroundColor:
                  SeasonPalette.of(memoryAsync.valueOrNull!.season),
              foregroundColor: Colors.white,
              icon: const Icon(Icons.play_arrow_rounded),
              label: const Text('Relive'),
            )
          : null,
    );
  }

  Widget _buildStory(MemoryModel memory) {
    final color = SeasonPalette.of(memory.season);
    final s = memory.stats;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          expandedHeight: 300,
          backgroundColor: color,
          foregroundColor: Colors.white,
          actions: [
            IconButton(
              tooltip: 'Share to community',
              onPressed: _sharing ? null : _shareToCommunity,
              icon: _sharing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.ios_share),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              fit: StackFit.expand,
              children: [
                if (memory.coverPhoto != null)
                  CachedNetworkImage(
                    imageUrl: memory.coverPhoto!,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(color: color),
                  )
                else
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [color.withValues(alpha: 0.7), color],
                      ),
                    ),
                  ),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.55),
                      ],
                      stops: const [0.5, 1],
                    ),
                  ),
                ),
                Positioned(
                  left: 20,
                  right: 20,
                  bottom: 18,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        memory.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${SeasonPalette.label(memory.season)}'
                        '${memory.weatherCondition != null ? ' · ${memory.weatherCondition}' : ''}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stats row
                Row(
                  children: [
                    if (s.distanceKm > 0)
                      _stat(Icons.straighten,
                          '${s.distanceKm.toStringAsFixed(1)} km', color),
                    if (s.elevationGainM > 0)
                      _stat(Icons.terrain,
                          '${s.elevationGainM.round()} m', color),
                    _stat(Icons.calendar_today_outlined,
                        '${s.days} day${s.days == 1 ? '' : 's'}', color),
                    if (s.companions > 0)
                      _stat(Icons.group_outlined, '${s.companions + 1}',
                          color),
                  ],
                ),
                const SizedBox(height: 16),

                // Mood tags
                if (memory.moodTags.isNotEmpty) ...[
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final tag in memory.moodTags)
                        Chip(
                          label: Text(tag),
                          labelStyle: TextStyle(
                            fontSize: 12.5,
                            color: color,
                            fontWeight: FontWeight.w600,
                          ),
                          backgroundColor: color.withValues(alpha: 0.12),
                          side: BorderSide.none,
                          visualDensity: VisualDensity.compact,
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],

                // Companions
                if (memory.participants.isNotEmpty) ...[
                  Text('Together with',
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 56,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: memory.participants.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, i) {
                        final p = memory.participants[i];
                        return Column(
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundColor:
                                  AppColors.sage.withValues(alpha: 0.3),
                              backgroundImage: p.avatar != null
                                  ? NetworkImage(p.avatar!)
                                  : null,
                              child: p.avatar == null
                                  ? Text(
                                      p.name.isNotEmpty
                                          ? p.name[0].toUpperCase()
                                          : '?',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w700),
                                    )
                                  : null,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              p.name.split(' ').first,
                              style: const TextStyle(fontSize: 10.5),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Milestones — quiet superlatives vs your own history.
                if (memory.milestones.isNotEmpty) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (final line in memory.milestones)
                          Padding(
                            padding:
                                const EdgeInsets.symmetric(vertical: 3),
                            child: Row(
                              children: [
                                Icon(Icons.auto_awesome,
                                    size: 15, color: color),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    line,
                                    style: const TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Photo strip with per-person perspectives (Phase 4).
                if (memory.media.isNotEmpty) ...[
                  Text('Moments',
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  ..._buildMomentsFilter(memory, color),
                  SizedBox(
                    height: 150,
                    child: Builder(builder: (context) {
                      final shown = _personFilter == null
                          ? memory.media
                          : memory.media
                              .where((m) => m.byUser == _personFilter)
                              .toList();
                      if (shown.isEmpty) {
                        return Center(
                          child: Text(
                            'No moments from them yet',
                            style: TextStyle(color: Colors.grey.shade500),
                          ),
                        );
                      }
                      return ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: shown.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(width: 10),
                        itemBuilder: (context, i) => ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: CachedNetworkImage(
                            imageUrl: shown[i].url,
                            height: 150,
                            width: 120,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(
                              width: 120,
                              color: Colors.grey.shade200,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Person chips above Moments — only when photos came from 2+ people.
  List<Widget> _buildMomentsFilter(MemoryModel memory, Color color) {
    final contributors = memory.media
        .map((m) => m.byUser)
        .whereType<String>()
        .toSet();
    if (contributors.length < 2) return const [];

    final people = memory.participants
        .where((p) => contributors.contains(p.id))
        .toList();
    if (people.length < 2) return const [];

    return [
      SizedBox(
        height: 38,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: [
            ChoiceChip(
              label: const Text('Everyone'),
              selected: _personFilter == null,
              onSelected: (_) => setState(() => _personFilter = null),
              selectedColor: color.withValues(alpha: 0.2),
              visualDensity: VisualDensity.compact,
            ),
            const SizedBox(width: 8),
            for (final p in people) ...[
              ChoiceChip(
                avatar: CircleAvatar(
                  backgroundImage:
                      p.avatar != null ? NetworkImage(p.avatar!) : null,
                  child: p.avatar == null
                      ? Text(p.name.isNotEmpty ? p.name[0] : '?',
                          style: const TextStyle(fontSize: 10))
                      : null,
                ),
                label: Text(p.name.split(' ').first),
                selected: _personFilter == p.id,
                onSelected: (_) =>
                    setState(() => _personFilter = p.id),
                selectedColor: color.withValues(alpha: 0.2),
                visualDensity: VisualDensity.compact,
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),
      ),
      const SizedBox(height: 10),
    ];
  }

  Widget _stat(IconData icon, String value, Color color) => Expanded(
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Text(value,
                style: const TextStyle(
                    fontWeight: FontWeight.w800, fontSize: 13.5)),
          ],
        ),
      );
}
