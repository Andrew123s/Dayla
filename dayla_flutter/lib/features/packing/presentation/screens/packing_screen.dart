import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/packing/application/providers/packing_providers.dart';
import 'package:dayla_flutter/features/packing/data/models/packing_model.dart';

class PackingScreen extends ConsumerStatefulWidget {
  const PackingScreen({super.key, required this.tripId, required this.tripName});

  final String tripId;
  final String tripName;

  @override
  ConsumerState<PackingScreen> createState() => _PackingScreenState();
}

class _PackingScreenState extends ConsumerState<PackingScreen> {
  bool _generating = false;
  final _itemNameController = TextEditingController();

  @override
  void dispose() {
    _itemNameController.dispose();
    super.dispose();
  }

  Future<void> _generateList() async {
    setState(() => _generating = true);
    final repo = ref.read(packingRepositoryProvider);
    await repo.generateList(widget.tripId);
    ref.invalidate(packingListProvider(widget.tripId));
    setState(() => _generating = false);
  }

  Future<void> _addItem() async {
    final name = _itemNameController.text.trim();
    if (name.isEmpty) return;

    final repo = ref.read(packingRepositoryProvider);
    await repo.addItem(widget.tripId, {
      'name': name,
      'category': 'other',
      'quantity': 1,
    });
    _itemNameController.clear();
    ref.invalidate(packingListProvider(widget.tripId));
  }

  Future<void> _togglePacked(PackingItemModel item) async {
    final repo = ref.read(packingRepositoryProvider);
    await repo.updateItem(widget.tripId, item.id, {'packed': !item.packed});
    ref.invalidate(packingListProvider(widget.tripId));
  }

  Future<void> _removeItem(String itemId) async {
    final repo = ref.read(packingRepositoryProvider);
    await repo.removeItem(widget.tripId, itemId);
    ref.invalidate(packingListProvider(widget.tripId));
  }

  @override
  Widget build(BuildContext context) {
    final packingAsync = ref.watch(packingListProvider(widget.tripId));

    return Scaffold(
      appBar: AppBar(
        title: Text('Packing — ${widget.tripName}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            tooltip: 'AI Generate',
            onPressed: _generating ? null : _generateList,
          ),
        ],
      ),
      body: packingAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
              const SizedBox(height: 12),
              const Text('Failed to load packing list'),
              const SizedBox(height: 12),
              FilledButton.tonal(
                onPressed: () =>
                    ref.invalidate(packingListProvider(widget.tripId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (packingList) {
          if (packingList == null || packingList.items.isEmpty) {
            return _buildEmptyState();
          }
          return _buildList(packingList);
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.luggage_outlined,
                size: 64, color: AppColors.sage.withValues(alpha: 0.5)),
            const SizedBox(height: 16),
            Text(
              'No packing list yet',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 8),
            const Text(
              'Generate a smart packing list with AI or add items manually',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _generating ? null : _generateList,
              icon: _generating
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.auto_awesome),
              label: Text(_generating ? 'Generating...' : 'AI Generate List'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
            const SizedBox(height: 24),
            _buildAddItemField(),
          ],
        ),
      ),
    );
  }

  Widget _buildList(PackingListModel packingList) {
    final grouped = <String, List<PackingItemModel>>{};
    for (final item in packingList.items) {
      (grouped[item.category] ??= []).add(item);
    }
    final categories = grouped.keys.toList()..sort();

    return Column(
      children: [
        _buildProgressBar(packingList),
        if (packingList.luggage.isNotEmpty) _buildLuggageSummary(packingList),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: _buildAddItemField(),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
            itemCount: categories.length,
            itemBuilder: (context, catIndex) {
              final category = categories[catIndex];
              final items = grouped[category]!;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 12, 0, 6),
                    child: Row(
                      children: [
                        Icon(_categoryIcon(category),
                            size: 16, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          category.replaceAll('_', ' ').toUpperCase(),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                            letterSpacing: 1,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${items.where((i) => i.packed).length}/${items.length}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ...items.map((item) => _buildItemTile(item)),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProgressBar(PackingListModel list) {
    final progress = list.totalItems > 0
        ? list.packedItems / list.totalItems
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.sage.withValues(alpha: 0.08),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${list.packedItems}/${list.totalItems} packed',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: progress >= 1.0
                      ? Colors.green
                      : AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: Colors.grey.shade200,
              valueColor: AlwaysStoppedAnimation(
                progress >= 1.0 ? Colors.green : AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLuggageSummary(PackingListModel list) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Wrap(
        spacing: 8,
        runSpacing: 6,
        children: list.luggage.map((l) => Chip(
              avatar: Icon(_luggageIcon(l.type), size: 16),
              label: Text(
                '${l.name} (${l.currentWeight.toStringAsFixed(1)}/${l.maxWeight.toStringAsFixed(0)} kg)',
                style: const TextStyle(fontSize: 12),
              ),
              visualDensity: VisualDensity.compact,
              side: BorderSide.none,
              backgroundColor: AppColors.sage.withValues(alpha: 0.15),
            )).toList(),
      ),
    );
  }

  Widget _buildItemTile(PackingItemModel item) {
    return Dismissible(
      key: Key(item.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        color: Colors.red.shade400,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => _removeItem(item.id),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Checkbox(
          value: item.packed,
          onChanged: (_) => _togglePacked(item),
          activeColor: AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        title: Text(
          item.name,
          style: TextStyle(
            decoration: item.packed ? TextDecoration.lineThrough : null,
            color: item.packed ? Colors.grey : null,
          ),
        ),
        subtitle: item.notes.isNotEmpty
            ? Text(item.notes,
                style: const TextStyle(fontSize: 12, color: Colors.grey))
            : null,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (item.isEssential)
              const Icon(Icons.priority_high,
                  size: 16, color: Colors.orange),
            if (item.quantity > 1)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'x${item.quantity}',
                  style: const TextStyle(fontSize: 11),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddItemField() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _itemNameController,
            decoration: InputDecoration(
              hintText: 'Add item...',
              prefixIcon: const Icon(Icons.add, size: 20),
              isDense: true,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
            onSubmitted: (_) => _addItem(),
          ),
        ),
        const SizedBox(width: 8),
        IconButton.filled(
          onPressed: _addItem,
          icon: const Icon(Icons.add, size: 20),
          style: IconButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
        ),
      ],
    );
  }

  IconData _categoryIcon(String category) {
    return switch (category) {
      'clothing' => Icons.checkroom,
      'toiletries' => Icons.clean_hands,
      'electronics' => Icons.devices,
      'documents' => Icons.description,
      'medicine' => Icons.medical_services,
      'gear' => Icons.backpack,
      'food' => Icons.restaurant,
      'accessories' => Icons.watch,
      'footwear' => Icons.ice_skating,
      'weather_essentials' => Icons.umbrella,
      'entertainment' => Icons.headphones,
      'safety' => Icons.health_and_safety,
      _ => Icons.inventory_2,
    };
  }

  IconData _luggageIcon(String type) {
    return switch (type) {
      'carry_on' => Icons.luggage,
      'checked' => Icons.work,
      'personal' => Icons.shopping_bag,
      'backpack' => Icons.backpack,
      'duffel' => Icons.sports_handball,
      _ => Icons.luggage,
    };
  }
}
