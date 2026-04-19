import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

class TripDetailScreen extends ConsumerStatefulWidget {
  const TripDetailScreen({super.key, required this.tripId});

  final String tripId;

  @override
  ConsumerState<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends ConsumerState<TripDetailScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  TripModel? _trip;
  BoardModel? _board;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    final repo = ref.read(dashboardRepositoryProvider);
    final trip = await repo.getTrip(widget.tripId);
    final board = await repo.getBoardByTrip(widget.tripId);
    if (mounted) {
      setState(() {
        _trip = trip;
        _board = board;
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_trip == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Trip not found')),
      );
    }

    final trip = _trip!;

    return Scaffold(
      appBar: AppBar(
        title: Text(trip.name),
        actions: [
          PopupMenuButton<String>(
            onSelected: (action) async {
              if (action == 'delete') {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Delete Trip'),
                    content: Text('Delete "${trip.name}"? This cannot be undone.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: const Text('Delete'),
                      ),
                    ],
                  ),
                );
                if (confirm == true && context.mounted) {
                  await ref.read(tripsProvider.notifier).deleteTrip(trip.id);
                  if (context.mounted) Navigator.of(context).pop();
                }
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete_outline, color: Colors.red, size: 20),
                    SizedBox(width: 8),
                    Text('Delete Trip',
                        style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Board'),
            Tab(text: 'Details'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverview(trip),
          _buildBoard(),
          _buildDetails(trip),
        ],
      ),
    );
  }

  Widget _buildOverview(TripModel trip) {
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
                onPressed: () => _showInviteCollaborator(trip.id),
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

  Widget _buildBoard() {
    if (_board == null) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.dashboard_outlined,
                size: 48, color: AppColors.sage),
            SizedBox(height: 12),
            Text('No board available'),
          ],
        ),
      );
    }

    final notes = _board!.notes;
    if (notes.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.sticky_note_2_outlined,
                size: 48, color: AppColors.sage),
            const SizedBox(height: 12),
            const Text('No sticky notes yet'),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _showAddNote,
              icon: const Icon(Icons.add),
              label: const Text('Add Note'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      );
    }

    return Stack(
      children: [
        ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
      itemCount: notes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final note = notes[index];
        return Card(
          color: _parseColor(note.color),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      _noteTypeIcon(note.type),
                      size: 16,
                      color: Colors.grey.shade700,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      note.type.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey.shade700,
                        letterSpacing: 1,
                      ),
                    ),
                    if (note.emoji != null) ...[
                      const Spacer(),
                      Text(note.emoji!, style: const TextStyle(fontSize: 18)),
                    ],
                  ],
                ),
                if (note.content.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    note.content,
                    style: const TextStyle(fontSize: 14),
                    maxLines: 6,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    ),
        Positioned(
          bottom: 16,
          right: 16,
          child: FloatingActionButton(
            mini: true,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            onPressed: _showAddNote,
            child: const Icon(Icons.add),
          ),
        ),
      ],
    );
  }

  Widget _buildDetails(TripModel trip) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (trip.budget != null && trip.budget!.total > 0) ...[
            Text('Budget', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.sand.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${trip.budget!.currency} ${trip.budget!.total.toStringAsFixed(0)}',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                  ),
                  const SizedBox(height: 4),
                  const Text('Total budget',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          if (trip.ecoScore > 0) ...[
            Text('Sustainability',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.sage.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  const Icon(Icons.eco, color: AppColors.sage, size: 32),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Eco Score: ${trip.ecoScore.toInt()}/100',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const Text('Keep exploring sustainably!',
                          style: TextStyle(color: Colors.grey, fontSize: 13)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          Text('Trip Info', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          _DetailRow(label: 'Created by', value: trip.owner?.name ?? 'You'),
          if (trip.createdAt != null)
            _DetailRow(
              label: 'Created',
              value: _formatDate(trip.createdAt!),
            ),
          _DetailRow(
            label: 'Visibility',
            value: trip.isPublic ? 'Public' : 'Private',
          ),
        ],
      ),
    );
  }

  void _showInviteCollaborator(String tripId) {
    final emailCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        bool sending = false;
        String? error;
        String? success;
        return StatefulBuilder(
          builder: (ctx, setDialogState) => AlertDialog(
            title: const Text('Invite Collaborator'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    hintText: 'friend@example.com',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                if (error != null) ...[
                  const SizedBox(height: 8),
                  Text(error!,
                      style:
                          const TextStyle(color: Colors.red, fontSize: 13)),
                ],
                if (success != null) ...[
                  const SizedBox(height: 8),
                  Text(success!,
                      style:
                          const TextStyle(color: Colors.green, fontSize: 13)),
                ],
              ],
            ),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Close')),
              FilledButton(
                onPressed: sending
                    ? null
                    : () async {
                        final email = emailCtrl.text.trim();
                        if (email.isEmpty) return;
                        setDialogState(() {
                          sending = true;
                          error = null;
                          success = null;
                        });
                        final repo = ref.read(dashboardRepositoryProvider);
                        final ok =
                            await repo.addCollaborator(tripId, email);
                        if (ok) {
                          setDialogState(() {
                            sending = false;
                            success = 'Invitation sent!';
                          });
                          emailCtrl.clear();
                          _loadData();
                        } else {
                          setDialogState(() {
                            sending = false;
                            error = 'Failed to invite. Check the email.';
                          });
                        }
                      },
                style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary),
                child: Text(sending ? 'Sending...' : 'Invite'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAddNote() {
    final contentCtrl = TextEditingController();
    String noteType = 'text';
    showDialog(
      context: context,
      builder: (ctx) {
        bool saving = false;
        return StatefulBuilder(
          builder: (ctx, setDialogState) => AlertDialog(
            title: const Text('Add Note'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Wrap(
                  spacing: 6,
                  children: ['text', 'schedule', 'budget', 'sustainability']
                      .map((t) => ChoiceChip(
                            label: Text(t),
                            selected: noteType == t,
                            onSelected: (_) =>
                                setDialogState(() => noteType = t),
                            selectedColor:
                                AppColors.primary.withValues(alpha: 0.15),
                            visualDensity: VisualDensity.compact,
                          ))
                      .toList(),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentCtrl,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Note content...',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel')),
              FilledButton(
                onPressed: saving
                    ? null
                    : () async {
                        if (contentCtrl.text.trim().isEmpty) return;
                        setDialogState(() => saving = true);
                        final repo = ref.read(dashboardRepositoryProvider);
                        await repo.createStickyNote(widget.tripId, {
                          'content': contentCtrl.text.trim(),
                          'type': noteType,
                        });
                        _loadData();
                        if (ctx.mounted) Navigator.pop(ctx);
                      },
                style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary),
                child: Text(saving ? 'Saving...' : 'Add'),
              ),
            ],
          ),
        );
      },
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

  String _formatDate(String iso) {
    try {
      return DateFormat('MMM d, yyyy').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return const Color(0xFFFAEDCD);
    }
  }

  IconData _noteTypeIcon(String type) {
    return switch (type) {
      'text' => Icons.short_text,
      'image' => Icons.image,
      'voice' => Icons.mic,
      'weather' => Icons.cloud,
      'schedule' => Icons.schedule,
      'budget' => Icons.attach_money,
      'sustainability' => Icons.eco,
      _ => Icons.note,
    };
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

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(label,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
