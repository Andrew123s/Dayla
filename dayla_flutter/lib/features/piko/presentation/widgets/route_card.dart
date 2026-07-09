import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/route_mini_map.dart';

class RouteCard extends StatelessWidget {
  const RouteCard({
    super.key,
    required this.route,
    required this.onTap,
    required this.onToggleSave,
  });

  final RouteModel route;
  final VoidCallback onTap;
  final VoidCallback onToggleSave;

  static Color difficultyColor(String difficulty) => switch (difficulty) {
        'easy' => const Color(0xFF10B981),
        'hard' => const Color(0xFFE11D48),
        _ => const Color(0xFFF59E0B),
      };

  static String formatDuration(double mins) {
    if (mins <= 0) return '—';
    final h = mins ~/ 60;
    final m = (mins % 60).round();
    if (h == 0) return '${m}m';
    return m == 0 ? '${h}h' : '${h}h ${m}m';
  }

  @override
  Widget build(BuildContext context) {
    final photo = route.photos.isNotEmpty ? route.photos.first : null;

    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Stack(
              children: [
                // Fixed 16:9 frame filled edge-to-edge so photos are never
                // letterboxed or clipped to a partial width.
                if (photo != null)
                  AspectRatio(
                    aspectRatio: 16 / 9,
                    child: CachedNetworkImage(
                      imageUrl: photo,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: AppColors.sage.withValues(alpha: 0.2),
                      ),
                      errorWidget: (_, __, ___) => _fallback(),
                    ),
                  )
                else if (route.geometry != null)
                  RouteMiniMap(geometry: route.geometry, height: 180)
                else
                  _fallback(),
                Positioned(
                  top: 10,
                  left: 10,
                  child: _chip(
                    route.difficulty.toUpperCase(),
                    difficultyColor(route.difficulty),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Material(
                    color: Colors.white.withValues(alpha: 0.9),
                    shape: const CircleBorder(),
                    child: IconButton(
                      visualDensity: VisualDensity.compact,
                      icon: Icon(
                        route.isSaved
                            ? Icons.bookmark
                            : Icons.bookmark_outline,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      onPressed: onToggleSave,
                    ),
                  ),
                ),
                if (route.ecoScore >= 85)
                  Positioned(
                    bottom: 10,
                    left: 10,
                    child: _chip('ECO ${route.ecoScore.round()}',
                        const Color(0xFF059669)),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    route.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(Icons.place_outlined,
                          size: 14, color: Colors.grey.shade600),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          route.location,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                              fontSize: 13, color: Colors.grey.shade600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _stat(Icons.straighten,
                          '${route.distanceKm.toStringAsFixed(route.distanceKm % 1 == 0 ? 0 : 1)} km'),
                      const SizedBox(width: 14),
                      _stat(Icons.terrain,
                          '${route.elevationGainM.round()} m'),
                      const SizedBox(width: 14),
                      _stat(Icons.schedule,
                          formatDuration(route.estimatedDurationMins)),
                      const Spacer(),
                      if (route.voteScore != 0 || route.commentCount != 0) ...[
                        Icon(Icons.thumb_up_outlined,
                            size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 3),
                        Text('${route.voteScore}',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey.shade600)),
                        const SizedBox(width: 10),
                        Icon(Icons.chat_bubble_outline,
                            size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 3),
                        Text('${route.commentCount}',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey.shade600)),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fallback() => Container(
        height: 160,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.sage.withValues(alpha: 0.4),
              AppColors.primary.withValues(alpha: 0.3),
            ],
          ),
        ),
        child: const Center(
          child: Icon(Icons.hiking, size: 48, color: Colors.white70),
        ),
      );

  Widget _chip(String label, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            letterSpacing: 0.5,
          ),
        ),
      );

  Widget _stat(IconData icon, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey.shade600),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      );
}
