import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/route_card.dart';

/// Piko Trails — Discover + Saved, mirroring the web app's embedded Piko page.
class PikoScreen extends ConsumerStatefulWidget {
  const PikoScreen({super.key});

  @override
  ConsumerState<PikoScreen> createState() => _PikoScreenState();
}

class _PikoScreenState extends ConsumerState<PikoScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  static const _chips = [
    ('all', 'All'),
    ('eco', 'Eco'),
    ('group', 'Group Friendly'),
    ('easy', 'Easy'),
    ('hard', 'Hard'),
  ];

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      ref
          .read(pikoFiltersProvider.notifier)
          .update((f) => f.copyWith(query: value.trim()));
    });
  }

  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(pikoFiltersProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Piko Trails'),
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.explore_outlined), text: 'Discover'),
              Tab(icon: Icon(Icons.bookmark_outline), text: 'Saved'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // ── Discover ──
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Search trails, places, tags…',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: filters.query.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                _onSearchChanged('');
                              },
                            )
                          : null,
                      isDense: true,
                      filled: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(999),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                SizedBox(
                  height: 48,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _chips.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final (value, label) = _chips[index];
                      final selected = filters.chip == value;
                      return FilterChip(
                        label: Text(label),
                        selected: selected,
                        onSelected: (_) => ref
                            .read(pikoFiltersProvider.notifier)
                            .update((f) => f.copyWith(chip: value)),
                        selectedColor:
                            AppColors.primary.withValues(alpha: 0.15),
                        checkmarkColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: selected
                              ? AppColors.primary
                              : Colors.grey.shade600,
                          fontWeight: selected
                              ? FontWeight.w600
                              : FontWeight.normal,
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
                Expanded(child: _DiscoverList()),
              ],
            ),
            // ── Saved ──
            _SavedList(),
          ],
        ),
      ),
    );
  }
}

class _DiscoverList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final routesAsync = ref.watch(pikoRoutesProvider);

    return routesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorRetry(
        onRetry: () => ref.read(pikoRoutesProvider.notifier).refresh(),
      ),
      data: (routes) {
        if (routes.isEmpty) {
          return const _EmptyState(
            icon: Icons.landscape_outlined,
            title: 'No trails found',
            subtitle: 'Try a different search or filter',
          );
        }
        return RefreshIndicator(
          onRefresh: () => ref.read(pikoRoutesProvider.notifier).refresh(),
          child: _RouteList(
            routes: routes,
            onToggleSave: (id) =>
                ref.read(pikoRoutesProvider.notifier).toggleSave(id),
          ),
        );
      },
    );
  }
}

class _SavedList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedAsync = ref.watch(pikoSavedRoutesProvider);

    return savedAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorRetry(
        onRetry: () => ref.read(pikoSavedRoutesProvider.notifier).refresh(),
      ),
      data: (routes) {
        if (routes.isEmpty) {
          return const _EmptyState(
            icon: Icons.bookmark_outline,
            title: 'No saved trails yet',
            subtitle: 'Bookmark routes you love from Discover',
          );
        }
        return RefreshIndicator(
          onRefresh: () =>
              ref.read(pikoSavedRoutesProvider.notifier).refresh(),
          child: _RouteList(
            routes: routes,
            onToggleSave: (id) async {
              // Toggling from Saved unsaves — reuse discover notifier's
              // repository call, then refresh this list.
              await ref.read(pikoRoutesProvider.notifier).toggleSave(id);
            },
          ),
        );
      },
    );
  }
}

class _RouteList extends StatelessWidget {
  const _RouteList({required this.routes, required this.onToggleSave});

  final List<RouteModel> routes;
  final void Function(String id) onToggleSave;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: routes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final route = routes[index];
        return RouteCard(
          route: route,
          onTap: () => context.push('/piko/routes/${route.id}'),
          onToggleSave: () => onToggleSave(route.id),
        );
      },
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
          Text(subtitle, style: TextStyle(color: Colors.grey.shade500)),
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
          Text('Failed to load trails',
              style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 12),
          FilledButton.tonal(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
