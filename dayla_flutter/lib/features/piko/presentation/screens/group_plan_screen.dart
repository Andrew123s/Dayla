import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';
import 'package:dayla_flutter/features/piko/data/repositories/piko_repository.dart';
import 'package:dayla_flutter/features/piko/presentation/widgets/plan_picker_sheet.dart';

/// Group trail planning: the candidates are the route notes on a trip's
/// board (added via "Add to plan"); the group votes and the leader is
/// highlighted (mobile take on the web GroupPlanPage).
class GroupPlanScreen extends ConsumerStatefulWidget {
  const GroupPlanScreen({super.key});

  @override
  ConsumerState<GroupPlanScreen> createState() => _GroupPlanScreenState();
}

class _GroupPlanScreenState extends ConsumerState<GroupPlanScreen> {
  PikoPlan? _plan;
  List<RouteModel> _candidates = [];
  bool _loading = false;

  Future<void> _pickPlan() async {
    final plan = await PlanPickerSheet.show(context);
    if (plan == null) return;
    setState(() {
      _plan = plan;
      _loading = true;
      _candidates = [];
    });
    await _loadCandidates(plan);
  }

  Future<void> _loadCandidates(PikoPlan plan) async {
    final datasource = ref.read(pikoRemoteDatasourceProvider);
    final repo = ref.read(pikoRepositoryProvider);
    try {
      final boardJson = await datasource.getBoardByTrip(plan.tripId);
      final board =
          (boardJson['data'] as Map?)?['dashboard'] as Map? ?? {};
      final notes = (board['notes'] as List? ?? []).whereType<Map>();
      final routeIds = <String>{};
      for (final note in notes) {
        if (note['type'] == 'route') {
          final id = (note['metadata'] as Map?)?['routeId']?.toString();
          if (id != null) routeIds.add(id);
        }
      }
      final routes = <RouteModel>[];
      for (final id in routeIds) {
        final route = await repo.getRoute(id);
        if (route != null) routes.add(route);
      }
      routes.sort((a, b) => b.voteScore.compareTo(a.voteScore));
      if (mounted) {
        setState(() {
          _candidates = routes;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not load that plan')),
        );
      }
    }
  }

  Future<void> _vote(RouteModel route, int value) async {
    try {
      final result = await ref
          .read(pikoRepositoryProvider)
          .vote(route.id, route.userVote == value ? 0 : value);
      setState(() {
        _candidates = [
          for (final r in _candidates)
            if (r.id == route.id)
              r.copyWith(
                  voteScore: result.voteScore, userVote: result.userVote)
            else
              r,
        ]..sort((a, b) => b.voteScore.compareTo(a.voteScore));
      });
    } on PikoActionException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Group plan'),
        actions: [
          TextButton.icon(
            onPressed: _pickPlan,
            icon: const Icon(Icons.swap_horiz, size: 18),
            label: Text(_plan?.name ?? 'Pick a plan'),
          ),
        ],
      ),
      body: _plan == null
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.how_to_vote_outlined,
                      size: 64,
                      color: AppColors.sage.withValues(alpha: 0.5)),
                  const SizedBox(height: 16),
                  const Text('Vote on trails with your group'),
                  const SizedBox(height: 8),
                  Text(
                    'Pick a trip plan — its saved trail candidates appear here.',
                    style: TextStyle(
                        color: Colors.grey.shade600, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _pickPlan,
                    style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary),
                    child: const Text('Choose a plan'),
                  ),
                ],
              ),
            )
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : _candidates.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Text(
                          'No trail candidates on "${_plan!.name}" yet.\n'
                          'Browse Piko and use "Add to plan" to nominate trails.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => _loadCandidates(_plan!),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _candidates.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final route = _candidates[index];
                          final leading = index == 0;
                          return Card(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: leading
                                  ? const BorderSide(
                                      color: Color(0xFF059669), width: 1.5)
                                  : BorderSide.none,
                            ),
                            child: ListTile(
                              onTap: () => context
                                  .push('/piko/routes/${route.id}'),
                              leading: leading
                                  ? const Icon(Icons.emoji_events,
                                      color: Color(0xFFF59E0B))
                                  : const Icon(Icons.hiking,
                                      color: AppColors.sage),
                              title: Text(route.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis),
                              subtitle: Text(
                                '${route.distanceKm.toStringAsFixed(1)} km · ${route.difficulty}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: Icon(
                                      Icons.thumb_up,
                                      size: 18,
                                      color: route.userVote == 1
                                          ? AppColors.primary
                                          : Colors.grey.shade400,
                                    ),
                                    onPressed: () => _vote(route, 1),
                                  ),
                                  Text('${route.voteScore}',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w800)),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: Icon(
                                      Icons.thumb_down,
                                      size: 18,
                                      color: route.userVote == -1
                                          ? Colors.red.shade400
                                          : Colors.grey.shade400,
                                    ),
                                    onPressed: () => _vote(route, -1),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
