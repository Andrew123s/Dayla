import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'dart:io';

import 'package:exif/exif.dart';
import 'package:image_picker/image_picker.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/network/socket_service.dart';
import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';
import 'package:dayla_flutter/features/dashboard/presentation/widgets/board_canvas.dart';
import 'package:dayla_flutter/features/dashboard/presentation/widgets/voice_memo_sheet.dart';
import 'package:dayla_flutter/features/billing/data/models/billing_models.dart';
import 'package:dayla_flutter/features/billing/presentation/widgets/pro_gate.dart';
import 'package:dayla_flutter/features/compass/presentation/widgets/compass_sheet.dart';
import 'package:dayla_flutter/features/memories/application/providers/memory_providers.dart';
import 'package:dayla_flutter/features/offline/data/offline_pack_service.dart';

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
  bool _boardAsList = false;

  /// Sticky-note palette, shared by the create and edit dialogs.
  static const _notePalette = [
    '#faedcd', '#fefae0', '#e9edc9', '#ccd5ae', '#d8e2dc', '#f8edeb',
    '#ffd7ba', '#fec89a', '#cdeac0', '#bde0fe', '#e2cfea', '#f4acb7',
  ];
  // Live presence: who else has this board open right now (socket-driven).
  final Map<String, String> _activeUsers = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    // Rebuild on tab change so the TabBarView's physics can switch: the
    // board tab disables page swiping (its drag gestures move notes and
    // pan the canvas), the other tabs keep it.
    _tabController.addListener(_onTabChanged);
    _loadData();
  }

  void _onTabChanged() {
    if (mounted) setState(() {});
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
      if (board != null) _setupPresence(board.id);
    }
  }

  void _setupPresence(String boardId) {
    final socket = ref.read(socketServiceProvider);
    socket.joinDashboard(boardId);
    socket.on('user_joined', _handleUserJoined);
    socket.on('user_left', _handleUserLeft);
    socket.on('note_updated', _handleBoardChanged);
    socket.on('note_deleted', _handleBoardChanged);
    socket.on('route:added', _handleBoardChanged);
  }

  void _handleUserJoined(dynamic data) {
    if (!mounted || data is! Map) return;
    final id = data['userId']?.toString();
    final name = data['name'] as String?;
    if (id != null && name != null) {
      setState(() => _activeUsers[id] = name);
    }
  }

  void _handleUserLeft(dynamic data) {
    if (!mounted || data is! Map) return;
    final id = data['userId']?.toString();
    if (id != null) setState(() => _activeUsers.remove(id));
  }

  void _handleBoardChanged(dynamic data) {
    if (!mounted) return;
    // Skip our own echoes — the local flow already reloaded; reloading again
    // mid-gesture makes dragging feel jumpy.
    final byUser = data is Map ? data['updatedBy'] ?? data['deletedBy'] : null;
    final byId = byUser is Map ? byUser['userId']?.toString() : null;
    final myId = ref.read(authSessionProvider).user?.id;
    if (byId != null && myId != null && byId == myId) return;
    _loadData();
  }

  @override
  void dispose() {
    final boardId = _board?.id;
    if (boardId != null) {
      final socket = ref.read(socketServiceProvider);
      socket.leaveDashboard(boardId);
      socket.off('user_joined', _handleUserJoined);
      socket.off('user_left', _handleUserLeft);
      socket.off('note_updated', _handleBoardChanged);
      socket.off('note_deleted', _handleBoardChanged);
      socket.off('route:added', _handleBoardChanged);
    }
    _tabController.removeListener(_onTabChanged);
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
          if (_activeUsers.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Tooltip(
                message:
                    'Online now: ${_activeUsers.values.join(', ')}',
                child: Chip(
                  visualDensity: VisualDensity.compact,
                  avatar: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  label: Text(
                    '${_activeUsers.length} online',
                    style: const TextStyle(fontSize: 12),
                  ),
                  backgroundColor:
                      AppColors.sage.withValues(alpha: 0.2),
                  side: BorderSide.none,
                ),
              ),
            ),
          PopupMenuButton<String>(
            onSelected: (action) async {
              if (action == 'memory') {
                // Assemble (or refresh) the Mriz memory for this trip and
                // open its story card.
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Creating your memory…')));
                final memory = await ref
                    .read(memoryRepositoryProvider)
                    .generateForTrip(trip.id);
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
                if (memory != null) {
                  context.push('${RoutePaths.memories}/${memory.id}');
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                      content: Text('Could not create the memory')));
                }
              }
              if (action == 'offline') {
                await _downloadOfflinePack();
              }
              if (!context.mounted) return;
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
              if (trip.status == 'completed')
                const PopupMenuItem(
                  value: 'memory',
                  child: Row(
                    children: [
                      Icon(Icons.auto_awesome,
                          color: AppColors.primary, size: 20),
                      SizedBox(width: 8),
                      Text('View memory'),
                    ],
                  ),
                ),
              const PopupMenuItem(
                value: 'offline',
                child: Row(
                  children: [
                    Icon(Icons.download_for_offline_outlined,
                        color: AppColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Offline pack'),
                  ],
                ),
              ),
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
            Tab(text: 'Board'),
            Tab(text: 'Overview'),
            Tab(text: 'Details'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        // On the board tab, horizontal swipes must always drag notes /
        // pan the canvas — never switch pages. TabBarView's horizontal
        // recognizer needs less movement (kTouchSlop) than a pan
        // recognizer (kPanSlop), so left enabled it steals every
        // horizontal-ish note drag. Tabs remain switchable by tapping.
        physics: _tabController.index == 0
            ? const NeverScrollableScrollPhysics()
            : null,
        children: [
          _buildBoard(),
          _buildOverview(trip),
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

    return Stack(
      children: [
        if (!_boardAsList)
          BoardCanvas(
            notes: notes,
            onMove: _moveNote,
            onTap: _showEditNote,
            onDelete: _confirmDeleteNote,
            onLink: _linkNote,
          )
        else
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
        if (notes.isEmpty)
          Positioned(
            top: 24,
            left: 24,
            right: 24,
            child: IgnorePointer(
              child: Card(
                color: Colors.white.withValues(alpha: 0.92),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.sticky_note_2_outlined,
                          size: 32, color: AppColors.sage),
                      const SizedBox(height: 8),
                      Text(
                        'Your shared planning canvas',
                        style: Theme.of(context)
                            .textTheme
                            .titleSmall
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Add notes, photos or voice memos from the toolbar '
                        'below. Pinch to zoom, drag notes anywhere — your '
                        'friends see changes live.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 12.5, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        // Web-style board toolbar: create tools, then module shortcuts.
        Positioned(
          left: 12,
          right: 12,
          bottom: 12,
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            child: Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _toolbarItem(Icons.explore_outlined, 'Compass', () async {
                      final drafted = await CompassSheet.show(context,
                          tripId: widget.tripId);
                      if (drafted == true) _loadData();
                    }),
                    Container(
                      width: 1,
                      height: 34,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      color: Colors.grey.shade300,
                    ),
                    _toolbarItem(Icons.title, 'Note', _showAddNote),
                    _toolbarItem(
                        Icons.image_outlined, 'Image', _addImageNote),
                    _toolbarItem(Icons.mic_outlined, 'Voice', _addVoiceNote),
                    Container(
                      width: 1,
                      height: 34,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      color: Colors.grey.shade300,
                    ),
                    _toolbarItem(
                      Icons.account_balance_wallet_outlined,
                      'Budget',
                      () => context.push(
                        '/trip/${_trip!.id}/budget?name=${Uri.encodeComponent(_trip!.name)}',
                      ),
                    ),
                    _toolbarItem(
                      Icons.terrain_outlined,
                      'Trails',
                      () => context.push(RoutePaths.piko),
                    ),
                    _toolbarItem(
                      Icons.backpack_outlined,
                      'Pack',
                      () => context.push(
                        '/trip/${_trip!.id}/packing?name=${Uri.encodeComponent(_trip!.name)}',
                      ),
                    ),
                    _toolbarItem(
                      Icons.eco_outlined,
                      'Carbon',
                      () => context.push(
                        '/trip/${_trip!.id}/carbon?name=${Uri.encodeComponent(_trip!.name)}',
                      ),
                    ),
                    Container(
                      width: 1,
                      height: 34,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      color: Colors.grey.shade300,
                    ),
                    _toolbarItem(
                      _boardAsList ? Icons.grid_view : Icons.view_list,
                      _boardAsList ? 'Canvas' : 'List',
                      () => setState(() => _boardAsList = !_boardAsList),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _toolbarItem(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 22, color: AppColors.primary),
            const SizedBox(height: 2),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.6,
                color: Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _moveNote(StickyNoteModel note, double x, double y) async {
    // Broadcast the FULL note over the socket (the server replaces the whole
    // subdocument), so collaborators watching the board see it move live.
    final boardId = _board?.id;
    if (boardId != null) {
      final full = note.copyWith(x: x, y: y).toJson();
      ref.read(socketServiceProvider).updateNote(boardId, note.id, full);
    }
    await ref
        .read(dashboardRepositoryProvider)
        .updateStickyNote(widget.tripId, note.id, {'x': x, 'y': y});
  }

  /// Mind-map linking: persist the note's linkTo (null = unlink) and
  /// broadcast the full note so collaborators see the line live.
  Future<void> _linkNote(StickyNoteModel note, String? targetId) async {
    final boardId = _board?.id;
    if (boardId != null) {
      final full = note.copyWith(linkTo: targetId).toJson();
      ref.read(socketServiceProvider).updateNote(boardId, note.id, full);
    }
    await ref
        .read(dashboardRepositoryProvider)
        .updateStickyNote(widget.tripId, note.id, {'linkTo': targetId});
    await _loadData();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(targetId == null ? 'Link removed' : 'Notes linked')));
    }
  }

  void _confirmDeleteNote(StickyNoteModel note) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete note'),
        content: const Text('Remove this sticky note from the board?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      final boardId = _board?.id;
      if (boardId != null) {
        ref.read(socketServiceProvider).deleteNote(boardId, note.id);
      }
      await ref
          .read(dashboardRepositoryProvider)
          .deleteStickyNote(widget.tripId, note.id);
      _loadData();
    }
  }

  void _showEditNote(StickyNoteModel note) {
    // Media and route notes have nothing to edit inline.
    if (note.type == 'image' || note.type == 'voice' || note.type == 'route') {
      return;
    }
    final contentCtrl = TextEditingController(text: note.content);
    String color = note.color;
    const palette = _notePalette;
    showDialog(
      context: context,
      builder: (ctx) {
        bool saving = false;
        return StatefulBuilder(
          builder: (ctx, setDialogState) => AlertDialog(
            title: const Text('Edit note'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: contentCtrl,
                  maxLines: 4,
                  autofocus: true,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: [
                    for (final c in palette)
                      GestureDetector(
                        onTap: () => setDialogState(() => color = c),
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: _parseColor(c),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color == c
                                  ? AppColors.primary
                                  : Colors.grey.shade300,
                              width: color == c ? 2.5 : 1,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: saving
                    ? null
                    : () async {
                        setDialogState(() => saving = true);
                        await ref
                            .read(dashboardRepositoryProvider)
                            .updateStickyNote(widget.tripId, note.id, {
                          'content': contentCtrl.text.trim(),
                          'color': color,
                        });
                        _loadData();
                        if (ctx.mounted) Navigator.pop(ctx);
                      },
                style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary),
                child: Text(saving ? 'Saving...' : 'Save'),
              ),
            ],
          ),
        );
      },
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
                        // Proper invitation flow (same as web): creates an
                        // invitation on the board, emails it via Resend, and
                        // notifies existing users in-app + push. Accepting
                        // adds them to the board AND the trip. The old code
                        // posted {email} to an endpoint that expected
                        // {userId}, so every invite failed.
                        var board = _board;
                        board ??= await repo.getBoardByTrip(tripId);
                        final ok = board != null &&
                            await repo.inviteToBoard(board.id, email);
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
                            error =
                                'Could not send the invite. Check the email '
                                '(Free plans allow up to 3 collaborators).';
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

  /// Offline Adventure Pack (Pro): download the trip's data + map tiles
  /// on-device, or open the pack when it already exists.
  Future<void> _downloadOfflinePack() async {
    final service = ref.read(offlinePackServiceProvider);

    if (await service.hasPack(widget.tripId)) {
      if (mounted) {
        context.push('/trip/${widget.tripId}/offline');
      }
      return;
    }

    if (!mounted ||
        !ProGate.check(context, ref,
            featureKey: ProFeatures.trailsCreate,
            featureLabel: 'Offline Adventure Packs')) {
      return;
    }

    final progress = ValueNotifier<(double, String)>((0, 'Starting…'));
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Downloading offline pack'),
        content: ValueListenableBuilder<(double, String)>(
          valueListenable: progress,
          builder: (_, value, __) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LinearProgressIndicator(
                  value: value.$1, color: AppColors.primary),
              const SizedBox(height: 12),
              Text(value.$2, style: const TextStyle(fontSize: 13)),
            ],
          ),
        ),
      ),
    );

    try {
      await service.downloadPack(
        widget.tripId,
        onProgress: (f, label) => progress.value = (f, label),
      );
      if (mounted) {
        Navigator.of(context, rootNavigator: true).pop();
        context.push('/trip/${widget.tripId}/offline');
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context, rootNavigator: true).pop();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content:
                Text('Download failed — check your connection and retry')));
      }
    }
  }

  // New notes land in a loose grid near the canvas origin instead of
  // stacking at one point.
  Map<String, double> _nextNotePosition() {
    final count = _board?.notes.length ?? 0;
    return {
      'x': 40.0 + (count % 4) * 240.0,
      'y': 40.0 + (count ~/ 4) * 200.0,
    };
  }

  Future<void> _addVoiceNote() async {
    final path = await VoiceMemoSheet.show(context);
    if (path == null || !mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Uploading voice memo…')),
    );
    final repo = ref.read(dashboardRepositoryProvider);
    final url = await repo.uploadAudio(path);
    if (url == null) {
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
              const SnackBar(content: Text('Voice memo upload failed')));
      }
      return;
    }
    final pos = _nextNotePosition();
    await repo.createStickyNote(widget.tripId, {
      'content': 'Voice memo',
      'type': 'voice',
      'audioUrl': url,
      'width': 200,
      'height': 80,
      ...pos,
    });
    if (mounted) ScaffoldMessenger.of(context).hideCurrentSnackBar();
    _loadData();
  }

  Future<void> _addImageNote() async {
    final picker = ImagePicker();
    // Pick the ORIGINAL file (no resize) so EXIF survives — Mriz memories
    // use the photo's GPS position and capture time for the route replay.
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked == null || !mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Uploading image…')),
    );

    final exifMeta = await _readPhotoExif(picked.path);

    final repo = ref.read(dashboardRepositoryProvider);
    final url = await repo.uploadImage(picked.path);
    if (url == null) {
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
              const SnackBar(content: Text('Image upload failed')));
      }
      return;
    }
    await repo.createStickyNote(widget.tripId, {
      'content': url,
      'type': 'image',
      'width': 220,
      'height': 180,
      if (exifMeta.isNotEmpty) 'metadata': exifMeta,
      ..._nextNotePosition(),
    });
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
    }
    _loadData();
  }

  /// Extract capture time + GPS position for Mriz memories. Best effort —
  /// screenshots and messenger images simply have none.
  Future<Map<String, dynamic>> _readPhotoExif(String path) async {
    try {
      final tags = await readExifFromBytes(await File(path).readAsBytes());
      final meta = <String, dynamic>{};

      final dateTag =
          tags['EXIF DateTimeOriginal'] ?? tags['Image DateTime'];
      if (dateTag != null) {
        // EXIF format: "2026:07:09 14:32:11" → ISO.
        final raw = dateTag.printable.trim();
        final match = RegExp(
                r'^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})')
            .firstMatch(raw);
        if (match != null) {
          meta['takenAt'] =
              '${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}';
        }
      }

      final lat = _gpsToDecimal(
          tags['GPS GPSLatitude'], tags['GPS GPSLatitudeRef']?.printable);
      final lng = _gpsToDecimal(
          tags['GPS GPSLongitude'], tags['GPS GPSLongitudeRef']?.printable);
      if (lat != null && lng != null) {
        meta['lat'] = lat;
        meta['lng'] = lng;
      }
      return meta;
    } catch (_) {
      return {};
    }
  }

  static double? _gpsToDecimal(IfdTag? tag, String? ref) {
    final values = tag?.values.toList();
    if (values == null || values.length < 3) return null;
    double toDouble(dynamic v) =>
        v is Ratio ? v.numerator / v.denominator : (v as num).toDouble();
    try {
      final deg = toDouble(values[0]);
      final min = toDouble(values[1]);
      final sec = toDouble(values[2]);
      var decimal = deg + min / 60 + sec / 3600;
      if (ref == 'S' || ref == 'W') decimal = -decimal;
      return double.parse(decimal.toStringAsFixed(6));
    } catch (_) {
      return null;
    }
  }

  void _showAddNote() {
    final contentCtrl = TextEditingController();
    String noteType = 'text';
    String noteColor = _notePalette.first;
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
                const SizedBox(height: 10),
                // Color picker
                SizedBox(
                  height: 34,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      for (final c in _notePalette)
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () =>
                                setDialogState(() => noteColor = c),
                            child: Container(
                              width: 30,
                              height: 30,
                              decoration: BoxDecoration(
                                color: _parseColor(c),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: noteColor == c
                                      ? AppColors.primary
                                      : Colors.grey.shade300,
                                  width: noteColor == c ? 2.5 : 1,
                                ),
                              ),
                              child: noteColor == c
                                  ? const Icon(Icons.check,
                                      size: 16, color: AppColors.primary)
                                  : null,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(
                      child: TextButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _addImageNote();
                        },
                        icon: const Icon(Icons.image_outlined, size: 18),
                        label: const Text('Photo'),
                      ),
                    ),
                    Expanded(
                      child: TextButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _addVoiceNote();
                        },
                        icon: const Icon(Icons.mic_outlined, size: 18),
                        label: const Text('Voice memo'),
                      ),
                    ),
                  ],
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
                        final ok =
                            await repo.createStickyNote(widget.tripId, {
                          'content': contentCtrl.text.trim(),
                          'type': noteType,
                          'color': noteColor,
                          'width': 220,
                          'height': 170,
                          ..._nextNotePosition(),
                        });
                        if (ok) {
                          _loadData();
                          if (ctx.mounted) Navigator.pop(ctx);
                        } else {
                          setDialogState(() => saving = false);
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Could not add the note — try again')));
                          }
                        }
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
