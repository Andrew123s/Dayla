import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';
import 'package:dayla_flutter/features/piko/data/repositories/piko_repository.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/plan_picker_sheet.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/route_card.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/route_mini_map.dart';

class RouteDetailScreen extends ConsumerStatefulWidget {
  const RouteDetailScreen({super.key, required this.routeId});

  final String routeId;

  @override
  ConsumerState<RouteDetailScreen> createState() => _RouteDetailScreenState();
}

class _RouteDetailScreenState extends ConsumerState<RouteDetailScreen> {
  final _commentController = TextEditingController();
  bool _sendingComment = false;
  bool _addingToPlan = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _vote(int value) async {
    try {
      await ref
          .read(pikoRouteDetailProvider(widget.routeId).notifier)
          .vote(value);
    } on PikoActionException catch (e) {
      _showMessage(e.message);
    }
  }

  Future<void> _addToPlan() async {
    final plan = await PlanPickerSheet.show(context);
    if (plan == null) return;
    setState(() => _addingToPlan = true);
    try {
      await ref
          .read(pikoRepositoryProvider)
          .addToPlan(widget.routeId, plan.tripId);
      _showMessage('Added to "${plan.name}"');
    } on PikoActionException catch (e) {
      _showMessage(e.message);
    } finally {
      if (mounted) setState(() => _addingToPlan = false);
    }
  }

  Future<void> _sendComment() async {
    final content = _commentController.text.trim();
    if (content.isEmpty || _sendingComment) return;
    setState(() => _sendingComment = true);
    final ok = await ref
        .read(pikoCommentsProvider(widget.routeId).notifier)
        .addComment(content);
    if (mounted) {
      setState(() => _sendingComment = false);
      if (ok) {
        _commentController.clear();
        FocusScope.of(context).unfocus();
      } else {
        _showMessage('Failed to add comment');
      }
    }
  }

  Future<void> _report() async {
    final ok = await ref
        .read(pikoRepositoryProvider)
        .reportRoute(widget.routeId);
    _showMessage(ok
        ? 'Thanks — this route has been reported for review.'
        : 'Failed to report route');
  }

  @override
  Widget build(BuildContext context) {
    final routeAsync = ref.watch(pikoRouteDetailProvider(widget.routeId));

    return Scaffold(
      body: routeAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const Center(child: Text('Failed to load route')),
        data: (route) {
          if (route == null) {
            return const Center(child: Text('Route not found'));
          }
          return _buildDetail(route);
        },
      ),
    );
  }

  Widget _buildDetail(RouteModel route) {
    final commentsAsync = ref.watch(pikoCommentsProvider(widget.routeId));
    final notifier =
        ref.read(pikoRouteDetailProvider(widget.routeId).notifier);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          expandedHeight: route.photos.isNotEmpty ? 240 : 0,
          actions: [
            IconButton(
              icon: Icon(
                route.isSaved ? Icons.bookmark : Icons.bookmark_outline,
              ),
              tooltip: route.isSaved ? 'Unsave' : 'Save',
              onPressed: notifier.toggleSave,
            ),
            PopupMenuButton<String>(
              onSelected: (v) {
                if (v == 'report') _report();
              },
              itemBuilder: (_) => const [
                PopupMenuItem(
                  value: 'report',
                  child: Text('Report route'),
                ),
              ],
            ),
          ],
          flexibleSpace: route.photos.isNotEmpty
              ? FlexibleSpaceBar(
                  background: CachedNetworkImage(
                    imageUrl: route.photos.first,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) =>
                        Container(color: AppColors.sage),
                  ),
                )
              : null,
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title + badges
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        route.title,
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: RouteCard.difficultyColor(route.difficulty),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        route.difficulty.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.place_outlined,
                        size: 15, color: Colors.grey.shade600),
                    const SizedBox(width: 3),
                    Expanded(
                      child: Text(
                        route.location,
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'By ${route.creatorName}',
                  style:
                      TextStyle(fontSize: 12, color: Colors.grey.shade500),
                ),
                if (route.moderationStatus == 'pending') ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber.shade200),
                    ),
                    child: Text(
                      'Awaiting moderation — only you can see this route.',
                      style: TextStyle(
                          fontSize: 12, color: Colors.amber.shade900),
                    ),
                  ),
                ],
                const SizedBox(height: 16),

                // Route shape preview
                if (route.geometry != null) ...[
                  RouteMiniMap(geometry: route.geometry),
                  const SizedBox(height: 16),
                ],

                // Stats
                Row(
                  children: [
                    _StatTile(
                      icon: Icons.straighten,
                      label: 'Distance',
                      value: '${route.distanceKm.toStringAsFixed(1)} km',
                    ),
                    _StatTile(
                      icon: Icons.terrain,
                      label: 'Elevation',
                      value: '${route.elevationGainM.round()} m',
                    ),
                    _StatTile(
                      icon: Icons.schedule,
                      label: 'Duration',
                      value: RouteCard.formatDuration(
                          route.estimatedDurationMins),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                if (route.description.isNotEmpty) ...[
                  Text(
                    route.description,
                    style: TextStyle(
                        color: Colors.grey.shade800, height: 1.45),
                  ),
                  const SizedBox(height: 16),
                ],

                if (route.tags.isNotEmpty) ...[
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final tag in route.tags)
                        Chip(
                          label: Text(tag),
                          labelStyle: const TextStyle(fontSize: 12),
                          visualDensity: VisualDensity.compact,
                          backgroundColor:
                              AppColors.sage.withValues(alpha: 0.15),
                          side: BorderSide.none,
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],

                // Scores
                _ScoreBar(label: 'Eco score', value: route.ecoScore),
                _ScoreBar(label: 'Weather', value: route.weatherScore),
                _ScoreBar(
                    label: 'Accessibility',
                    value: route.accessibilityScore),
                const SizedBox(height: 16),

                // Eco impact card
                if (route.ecoImpact != null)
                  _EcoImpactCard(impact: route.ecoImpact!),
                const SizedBox(height: 20),

                // Actions: vote + add to plan
                Row(
                  children: [
                    _VoteButton(
                      icon: Icons.thumb_up,
                      active: route.userVote == 1,
                      onPressed: () =>
                          _vote(route.userVote == 1 ? 0 : 1),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${route.voteScore}',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(width: 4),
                    _VoteButton(
                      icon: Icons.thumb_down,
                      active: route.userVote == -1,
                      onPressed: () =>
                          _vote(route.userVote == -1 ? 0 : -1),
                    ),
                    const Spacer(),
                    FilledButton.icon(
                      onPressed: _addingToPlan ? null : _addToPlan,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                      ),
                      icon: _addingToPlan
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.add_location_alt_outlined),
                      label: const Text('Add to plan'),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 8),

                // Comments
                Text(
                  'Comments',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                commentsAsync.when(
                  loading: () => const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (e, _) => Text('Failed to load comments',
                      style: TextStyle(color: Colors.grey.shade600)),
                  data: (comments) {
                    if (comments.isEmpty) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: Text(
                          'No comments yet — be the first!',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      );
                    }
                    return Column(
                      children: [
                        for (final c in comments) _CommentTile(comment: c),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _commentController,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendComment(),
                        decoration: InputDecoration(
                          hintText: 'Add a comment…',
                          isDense: true,
                          filled: true,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(999),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _sendingComment ? null : _sendComment,
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.primary,
                      ),
                      icon: const Icon(Icons.send, size: 18),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.sage.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: AppColors.primary),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                  fontWeight: FontWeight.w700, fontSize: 14),
            ),
            Text(
              label,
              style:
                  TextStyle(fontSize: 11, color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScoreBar extends StatelessWidget {
  const _ScoreBar({required this.label, required this.value});

  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: (value / 100).clamp(0.0, 1.0),
                minHeight: 8,
                backgroundColor: Colors.grey.shade200,
                color: value >= 85
                    ? const Color(0xFF059669)
                    : value >= 60
                        ? AppColors.sage
                        : AppColors.sand,
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 28,
            child: Text(
              '${value.round()}',
              textAlign: TextAlign.right,
              style: const TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _EcoImpactCard extends StatelessWidget {
  const _EcoImpactCard({required this.impact});

  final RouteEcoImpact impact;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFA7F3D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.eco, size: 18, color: Color(0xFF059669)),
              const SizedBox(width: 6),
              const Text(
                'Eco impact',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF065F46),
                ),
              ),
              const Spacer(),
              Text(
                '${impact.co2EstimateKg.toStringAsFixed(1)} kg CO₂',
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF059669),
                ),
              ),
            ],
          ),
          if (impact.transportMode.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Getting there: ${impact.transportMode}',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
            ),
          ],
          if (impact.greenerAlternatives.isNotEmpty) ...[
            const SizedBox(height: 6),
            for (final alt in impact.greenerAlternatives)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('🌱 ', style: TextStyle(fontSize: 12)),
                    Expanded(
                      child: Text(
                        alt,
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey.shade700),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _VoteButton extends StatelessWidget {
  const _VoteButton({
    required this.icon,
    required this.active,
    required this.onPressed,
  });

  final IconData icon;
  final bool active;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onPressed,
      icon: Icon(
        active ? icon : (icon == Icons.thumb_up
            ? Icons.thumb_up_outlined
            : Icons.thumb_down_outlined),
        size: 20,
        color: active ? AppColors.primary : Colors.grey.shade600,
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({required this.comment});

  final RouteCommentModel comment;

  @override
  Widget build(BuildContext context) {
    final createdAt = DateTime.tryParse(comment.createdAt ?? '');
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.sage.withValues(alpha: 0.3),
            child: Text(
              comment.author.isNotEmpty
                  ? comment.author[0].toUpperCase()
                  : '?',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      comment.author,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                    const SizedBox(width: 6),
                    if (createdAt != null)
                      Text(
                        timeago.format(createdAt),
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey.shade500),
                      ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(comment.content,
                    style: const TextStyle(fontSize: 13, height: 1.35)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
