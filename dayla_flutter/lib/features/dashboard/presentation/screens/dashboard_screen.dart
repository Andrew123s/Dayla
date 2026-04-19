import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';
import 'package:dayla_flutter/features/dashboard/presentation/widgets/create_trip_modal.dart';
import 'package:dayla_flutter/features/dashboard/presentation/widgets/trip_card.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  String _statusFilter = 'all';

  static const _statusFilters = [
    ('all', 'All Trips'),
    ('planning', 'Planning'),
    ('planned', 'Planned'),
    ('booked', 'Booked'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
  ];

  List<TripModel> _filterTrips(List<TripModel> trips) {
    if (_statusFilter == 'all') return trips;
    return trips.where((t) => t.status == _statusFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final tripsAsync = ref.watch(tripsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Trips'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(tripsProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateTrip(context),
        icon: const Icon(Icons.add),
        label: const Text('New Trip'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _statusFilters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final (value, label) = _statusFilters[index];
                final selected = _statusFilter == value;
                return FilterChip(
                  label: Text(label),
                  selected: selected,
                  onSelected: (_) => setState(() => _statusFilter = value),
                  selectedColor: AppColors.primary.withValues(alpha: 0.15),
                  checkmarkColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: selected ? AppColors.primary : Colors.grey.shade600,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                    fontSize: 13,
                  ),
                  side: BorderSide(
                    color: selected
                        ? AppColors.primary
                        : Colors.grey.shade300,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: tripsAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48, color: Colors.red.shade300),
                    const SizedBox(height: 12),
                    Text('Failed to load trips',
                        style: TextStyle(color: Colors.grey.shade600)),
                    const SizedBox(height: 12),
                    FilledButton.tonal(
                      onPressed: () =>
                          ref.read(tripsProvider.notifier).refresh(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (trips) {
                final filtered = _filterTrips(trips);
                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.map_outlined,
                            size: 64,
                            color: AppColors.sage.withValues(alpha: 0.5)),
                        const SizedBox(height: 16),
                        Text(
                          _statusFilter == 'all'
                              ? 'No trips yet'
                              : 'No $_statusFilter trips',
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap + to start planning your adventure',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () =>
                      ref.read(tripsProvider.notifier).refresh(),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) =>
                        TripCard(trip: filtered[index]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showCreateTrip(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const CreateTripModal(),
    );
  }
}
