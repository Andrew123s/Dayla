import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

/// The "Overview" tab of the trip screen: destination, dates, tools grid,
/// collaborators and tags. Extracted from trip_detail_screen.dart — pure
/// presentation; the screen supplies the trip and the invite action.
class TripOverviewTab extends StatelessWidget {
  const TripOverviewTab({
    super.key,
    required this.trip,
    required this.onInvite,
  });

  final TripModel trip;
  final VoidCallback onInvite;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (trip.destination?.name != null &&
              trip.destination!.name!.isNotEmpty) ...[
            Row(
              children: [
                const Icon(Icons.location_on, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  trip.destination!.name!,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
          if (trip.dates?.startDate != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.sage.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today,
                      color: AppColors.primary, size: 20),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Dates',
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey)),
                      Text(
                        _formatDateRange(trip.dates!),
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          if (trip.description.isNotEmpty) ...[
            Text(
              trip.description,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 16),
          ],
          Row(
            children: [
              _InfoChip(
                icon: Icons.flag,
                label: trip.status.replaceAll('_', ' '),
              ),
              const SizedBox(width: 8),
              if (trip.category != null)
                _InfoChip(
                  icon: Icons.category,
                  label: trip.category!.replaceAll('_', ' '),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Text('Tools', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.luggage,
                  label: 'Packing',
                  color: AppColors.sage,
                  onTap: () => context.push(
                    '/trip/${trip.id}/packing?name=${Uri.encodeComponent(trip.name)}',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ActionCard(
                  icon: Icons.eco,
                  label: 'Carbon',
                  color: Colors.green,
                  onTap: () => context.push(
                    '/trip/${trip.id}/carbon?name=${Uri.encodeComponent(trip.name)}',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.cloud,
                  label: 'Weather',
                  color: Colors.blue,
                  onTap: () {
                    final loc = trip.destination?.name;
                    final params = 'name=${Uri.encodeComponent(trip.name)}'
                        '${loc != null ? "&location=${Uri.encodeComponent(loc)}" : ""}';
                    context.push('/trip/${trip.id}/weather?$params');
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ActionCard(
                  icon: Icons.wallet,
                  label: 'Budget',
                  color: AppColors.sand,
                  onTap: () => context.push(
                    '/trip/${trip.id}/budget?name=${Uri.encodeComponent(trip.name)}',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Collaborators',
                  style: Theme.of(context).textTheme.titleMedium),
              IconButton(
                icon: const Icon(Icons.person_add, size: 20),
                color: AppColors.primary,
                onPressed: onInvite,
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (trip.collaborators.isEmpty)
            Text('No collaborators yet',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
          ...trip.collaborators.map((c) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundColor:
                      AppColors.sage.withValues(alpha: 0.3),
                  backgroundImage:
                      c.avatar != null ? NetworkImage(c.avatar!) : null,
                  child: c.avatar == null
                      ? Text(c.name[0].toUpperCase())
                      : null,
                ),
                title: Text(c.name),
              )),
          if (trip.tags.isNotEmpty) ...[
            const SizedBox(height: 16),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: trip.tags
                  .map((t) => Chip(
                        label: Text(t, style: const TextStyle(fontSize: 12)),
                        visualDensity: VisualDensity.compact,
                        side: BorderSide.none,
                        backgroundColor:
                            AppColors.sage.withValues(alpha: 0.15),
                      ))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDateRange(TripDates dates) {
    final df = DateFormat('MMM d, yyyy');
    try {
      final start = DateTime.parse(dates.startDate!);
      if (dates.endDate != null) {
        final end = DateTime.parse(dates.endDate!);
        return '${df.format(start)} — ${df.format(end)}';
      }
      return df.format(start);
    } catch (_) {
      return dates.startDate ?? '';
    }
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.sage.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.primary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 28, color: color),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: color,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
