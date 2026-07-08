import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';
import 'package:dayla_flutter/features/piko/data/repositories/piko_repository.dart';

/// Admin moderation queue (ADMIN_EMAILS on the backend): pending and flagged
/// user-generated trails, oldest first — approve or remove.
class ModerationScreen extends ConsumerStatefulWidget {
  const ModerationScreen({super.key});

  @override
  ConsumerState<ModerationScreen> createState() => _ModerationScreenState();
}

class _ModerationScreenState extends ConsumerState<ModerationScreen> {
  late Future<List<ModerationEntry>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(pikoRepositoryProvider).getModerationQueue();
  }

  void _reload() {
    setState(() {
      _future = ref.read(pikoRepositoryProvider).getModerationQueue();
    });
  }

  Future<void> _moderate(ModerationEntry entry, String action) async {
    final ok = await ref
        .read(pikoRepositoryProvider)
        .moderateRoute(entry.route.id, action);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(ok
          ? (action == 'approve' ? 'Route approved' : 'Route removed')
          : 'Action failed'),
    ));
    if (ok) {
      _reload();
      ref.read(pikoRoutesProvider.notifier).refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Moderation queue')),
      body: FutureBuilder<List<ModerationEntry>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  snapshot.error.toString(),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ),
            );
          }
          final entries = snapshot.data ?? [];
          if (entries.isEmpty) {
            return Center(
              child: Text('Queue is empty — nothing to review 🎉',
                  style: TextStyle(color: Colors.grey.shade600)),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: entries.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final entry = entries[index];
                final route = entry.route;
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                route.title,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700),
                              ),
                            ),
                            Chip(
                              visualDensity: VisualDensity.compact,
                              label: Text(
                                route.moderationStatus.toUpperCase(),
                                style: const TextStyle(fontSize: 10),
                              ),
                              backgroundColor:
                                  route.moderationStatus == 'flagged'
                                      ? Colors.red.shade50
                                      : Colors.amber.shade50,
                              side: BorderSide.none,
                            ),
                          ],
                        ),
                        Text(
                          '${route.location} · ${route.distanceKm.toStringAsFixed(1)} km '
                          '· by ${route.creatorName}',
                          style: TextStyle(
                              fontSize: 12.5,
                              color: Colors.grey.shade600),
                        ),
                        if (entry.reportCount > 0) ...[
                          const SizedBox(height: 6),
                          Text(
                            '${entry.reportCount} report(s)'
                            '${entry.reportReasons.isNotEmpty ? ': ${entry.reportReasons.join(' · ')}' : ''}',
                            style: TextStyle(
                                fontSize: 12,
                                color: Colors.red.shade700),
                          ),
                        ],
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: FilledButton.tonal(
                                onPressed: () =>
                                    _moderate(entry, 'approve'),
                                child: const Text('Approve'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () =>
                                    _moderate(entry, 'remove'),
                                style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.red),
                                child: const Text('Remove'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
