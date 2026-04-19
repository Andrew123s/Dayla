import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

class TripCard extends ConsumerWidget {
  const TripCard({super.key, required this.trip});

  final TripModel trip;

  static const _categoryIcons = <String, IconData>{
    'hiking': Icons.hiking,
    'business': Icons.business_center,
    'family': Icons.family_restroom,
    'camping': Icons.cabin,
    'exploring': Icons.explore,
    'beach': Icons.beach_access,
    'road_trip': Icons.directions_car,
    'cultural': Icons.museum,
    'other': Icons.travel_explore,
  };

  static const _statusColors = <String, Color>{
    'draft': Color(0xFF9E9E9E),
    'planning': Color(0xFF2196F3),
    'planned': Color(0xFF4CAF50),
    'booked': Color(0xFF9C27B0),
    'in_progress': Color(0xFFFF9800),
    'completed': Color(0xFF4CAF50),
    'cancelled': Color(0xFFF44336),
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final icon = _categoryIcons[trip.category] ?? Icons.travel_explore;
    final statusColor = _statusColors[trip.status] ?? Colors.grey;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.sage.withValues(alpha: 0.3)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          ref.read(selectedTripProvider.notifier).state = trip;
          context.push('/trip/${trip.id}');
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: AppColors.primary, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          trip.name,
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (trip.destination?.name != null &&
                            trip.destination!.name!.isNotEmpty)
                          Row(
                            children: [
                              Icon(Icons.location_on,
                                  size: 14, color: Colors.grey.shade500),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  trip.destination!.name!,
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 13,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      trip.status.replaceAll('_', ' '),
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              if (trip.description.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  trip.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  if (trip.dates?.startDate != null) ...[
                    Icon(Icons.calendar_today,
                        size: 14, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(
                      _formatDateRange(trip.dates!),
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  if (trip.collaborators.isNotEmpty) ...[
                    Icon(Icons.people_outline,
                        size: 14, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(
                      '${trip.collaborators.length}',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                  const Spacer(),
                  if (trip.ecoScore > 0)
                    Row(
                      children: [
                        const Icon(Icons.eco, size: 14, color: AppColors.sage),
                        const SizedBox(width: 4),
                        Text(
                          '${trip.ecoScore.toInt()}',
                          style: const TextStyle(
                            color: AppColors.sage,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDateRange(TripDates dates) {
    final df = DateFormat('MMM d');
    try {
      final start = DateTime.parse(dates.startDate!);
      if (dates.endDate != null) {
        final end = DateTime.parse(dates.endDate!);
        if (start.year == end.year && start.month == end.month) {
          return '${df.format(start)} - ${end.day}';
        }
        return '${df.format(start)} - ${df.format(end)}';
      }
      return df.format(start);
    } catch (_) {
      return dates.startDate ?? '';
    }
  }
}
