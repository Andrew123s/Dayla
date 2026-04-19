import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/packing/application/providers/packing_providers.dart';
import 'package:dayla_flutter/features/packing/data/models/packing_model.dart';

class PackingScreen extends ConsumerStatefulWidget {
  const PackingScreen(
      {super.key, required this.tripId, required this.tripName});

  final String tripId;
  final String tripName;

  @override
  ConsumerState<PackingScreen> createState() => _PackingScreenState();
}

class _PackingScreenState extends ConsumerState<PackingScreen>
    with SingleTickerProviderStateMixin {
  bool _generating = false;
  final _itemNameController = TextEditingController();
  late final TabController _tabController;
  List<PackingSuggestion> _suggestions = [];
  List<PackingTemplate> _templates = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadExtras();
  }

  @override
  void dispose() {
    _itemNameController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadExtras() async {
    final repo = ref.read(packingRepositoryProvider);
    final results = await Future.wait([
      repo.getSuggestions(widget.tripId),
      repo.getTemplates(),
    ]);
    if (mounted) {
      setState(() {
        _suggestions = results[0] as List<PackingSuggestion>;
        _templates = results[1] as List<PackingTemplate>;
      });
    }
  }

  Future<void> _generateList() async {
    setState(() => _generating = true);
    final repo = ref.read(packingRepositoryProvider);
    await repo.generateList(widget.tripId);
    ref.invalidate(packingListProvider(widget.tripId));
    await _loadExtras();
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

  Future<void> _addLuggage(Map<String, dynamic> data) async {
    final repo = ref.read(packingRepositoryProvider);
    await repo.addLuggage(widget.tripId, data);
    ref.invalidate(packingListProvider(widget.tripId));
  }

  Future<void> _removeLuggage(String luggageId) async {
    final repo = ref.read(packingRepositoryProvider);
    await repo.removeLuggage(widget.tripId, luggageId);
    ref.invalidate(packingListProvider(widget.tripId));
  }

  Future<void> _applyTemplate(String templateId) async {
    final repo = ref.read(packingRepositoryProvider);
    await repo.applyTemplate(widget.tripId, templateId);
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
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Items', icon: Icon(Icons.checklist, size: 18)),
            Tab(text: 'Luggage', icon: Icon(Icons.luggage, size: 18)),
            Tab(text: 'Insights', icon: Icon(Icons.lightbulb_outline, size: 18)),
          ],
        ),
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
          return TabBarView(
            controller: _tabController,
            children: [
              _buildItemsTab(packingList),
              _buildLuggageTab(packingList),
              _buildInsightsTab(packingList),
            ],
          );
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
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
            if (_templates.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('Or apply a template',
                  style: TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _templates
                    .take(4)
                    .map((t) => ActionChip(
                          label: Text(t.name, style: const TextStyle(fontSize: 12)),
                          avatar: const Icon(Icons.description, size: 16),
                          onPressed: () => _applyTemplate(t.id),
                        ))
                    .toList(),
              ),
            ],
            const SizedBox(height: 24),
            _buildAddItemField(),
          ],
        ),
      ),
    );
  }

  // ── Items Tab ──────────────────────────────────────────────────────────

  Widget _buildItemsTab(PackingListModel packingList) {
    final grouped = <String, List<PackingItemModel>>{};
    for (final item in packingList.items) {
      (grouped[item.category] ??= []).add(item);
    }
    final categories = grouped.keys.toList()..sort();

    return Column(
      children: [
        _buildProgressBar(packingList),
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
                              fontSize: 12, color: Colors.grey.shade500),
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

  // ── Luggage Tab ────────────────────────────────────────────────────────

  Widget _buildLuggageTab(PackingListModel packingList) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Your Bags',
                  style: Theme.of(context).textTheme.titleMedium),
              FilledButton.icon(
                onPressed: _showAddLuggage,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Bag'),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (packingList.luggage.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    Icon(Icons.luggage_outlined,
                        size: 48,
                        color: AppColors.sage.withValues(alpha: 0.5)),
                    const SizedBox(height: 12),
                    const Text('No bags added yet',
                        style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 4),
                    const Text(
                        'Add your luggage to track weight limits',
                        style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
            )
          else
            ...packingList.luggage.map((bag) => _buildBagCard(bag)),
          const SizedBox(height: 24),
          if (packingList.totalWeight > 0) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.sage.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  const Icon(Icons.scale, color: AppColors.primary),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Weight',
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey)),
                      Text(
                        '${packingList.totalWeight.toStringAsFixed(1)} kg',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBagCard(PackingLuggageModel bag) {
    final weightPercent =
        bag.maxWeight > 0 ? bag.currentWeight / bag.maxWeight : 0.0;
    final isOverWeight = weightPercent > 1.0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: isOverWeight
              ? Colors.red.shade300
              : AppColors.sage.withValues(alpha: 0.3),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(_luggageIcon(bag.type), color: AppColors.primary),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(bag.name,
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text(
                        bag.type.replaceAll('_', ' '),
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline,
                      size: 20, color: Colors.red),
                  onPressed: () => _removeLuggage(bag.id),
                ),
              ],
            ),
            if (bag.maxWeight > 0) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${bag.currentWeight.toStringAsFixed(1)} / ${bag.maxWeight.toStringAsFixed(0)} kg',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isOverWeight ? Colors.red : null,
                    ),
                  ),
                  if (isOverWeight)
                    const Row(
                      children: [
                        Icon(Icons.warning, size: 14, color: Colors.red),
                        SizedBox(width: 4),
                        Text('Over limit',
                            style:
                                TextStyle(color: Colors.red, fontSize: 12)),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: weightPercent.clamp(0.0, 1.0),
                  minHeight: 6,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation(
                    isOverWeight ? Colors.red : AppColors.primary,
                  ),
                ),
              ),
            ],
            if (bag.airline.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('Airline: ${bag.airline}',
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey.shade600)),
            ],
          ],
        ),
      ),
    );
  }

  void _showAddLuggage() {
    final nameCtrl = TextEditingController();
    final weightCtrl = TextEditingController(text: '23');
    final airlineCtrl = TextEditingController();
    String type = 'checked';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) => Padding(
            padding: EdgeInsets.fromLTRB(
                20, 20, 20, MediaQuery.viewInsetsOf(ctx).bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Add Bag',
                    style: Theme.of(ctx).textTheme.titleLarge),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  decoration: _inputDecor('Bag name (e.g. Main Suitcase)'),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    'carry_on',
                    'checked',
                    'personal',
                    'backpack',
                    'duffel'
                  ]
                      .map((t) => ChoiceChip(
                            label: Text(t.replaceAll('_', ' '),
                                style: const TextStyle(fontSize: 12)),
                            selected: type == t,
                            onSelected: (_) =>
                                setModalState(() => type = t),
                            selectedColor:
                                AppColors.primary.withValues(alpha: 0.15),
                            visualDensity: VisualDensity.compact,
                          ))
                      .toList(),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: weightCtrl,
                        keyboardType: TextInputType.number,
                        decoration: _inputDecor('Max weight (kg)'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: airlineCtrl,
                        decoration: _inputDecor('Airline (optional)'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      final name = nameCtrl.text.trim();
                      if (name.isEmpty) return;
                      _addLuggage({
                        'name': name,
                        'type': type,
                        'maxWeight':
                            double.tryParse(weightCtrl.text) ?? 23,
                        'airline': airlineCtrl.text.trim(),
                      });
                      Navigator.pop(ctx);
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Add Bag'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── Insights Tab ───────────────────────────────────────────────────────

  Widget _buildInsightsTab(PackingListModel packingList) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_suggestions.isNotEmpty) ...[
            Text('Suggestions',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ..._suggestions.map((s) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _suggestionColor(s.type),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(_suggestionIcon(s.type),
                          size: 18,
                          color: AppColors.primary),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(s.message,
                            style: const TextStyle(fontSize: 13)),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 24),
          ],
          Text('Templates',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (_templates.isEmpty)
            const Text('No templates available',
                style: TextStyle(color: Colors.grey))
          else
            ..._templates.map((t) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                        color: AppColors.sage.withValues(alpha: 0.3)),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.description,
                        color: AppColors.primary),
                    title: Text(t.name),
                    subtitle: t.description.isNotEmpty
                        ? Text(t.description,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12))
                        : Text('${t.items.length} items',
                            style: const TextStyle(fontSize: 12)),
                    trailing: FilledButton.tonal(
                      onPressed: () => _applyTemplate(t.id),
                      child: const Text('Apply'),
                    ),
                  ),
                )),
          const SizedBox(height: 24),
          Text('Stats',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          _buildStatsCard(packingList),
        ],
      ),
    );
  }

  Widget _buildStatsCard(PackingListModel list) {
    final grouped = <String, int>{};
    for (final item in list.items) {
      grouped[item.category] = (grouped[item.category] ?? 0) + 1;
    }
    final essentialCount =
        list.items.where((i) => i.isEssential).length;
    final packedEssentials =
        list.items.where((i) => i.isEssential && i.packed).length;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.sage.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _statRow('Total items', '${list.totalItems}'),
          _statRow('Packed', '${list.packedItems}'),
          _statRow('Categories', '${grouped.length}'),
          _statRow('Essentials',
              '$packedEssentials/$essentialCount packed'),
          if (list.totalWeight > 0)
            _statRow(
                'Total weight', '${list.totalWeight.toStringAsFixed(1)} kg'),
        ],
      ),
    );
  }

  Widget _statRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600)),
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Color _suggestionColor(String type) {
    return switch (type) {
      'warning' => Colors.orange.shade50,
      'tip' => AppColors.sage.withValues(alpha: 0.1),
      'info' => Colors.blue.shade50,
      _ => Colors.grey.shade50,
    };
  }

  IconData _suggestionIcon(String type) {
    return switch (type) {
      'warning' => Icons.warning_amber,
      'tip' => Icons.lightbulb_outline,
      'info' => Icons.info_outline,
      _ => Icons.auto_awesome,
    };
  }

  // ── Shared Widgets ─────────────────────────────────────────────────────

  Widget _buildProgressBar(PackingListModel list) {
    final progress =
        list.totalItems > 0 ? list.packedItems / list.totalItems : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.sage.withValues(alpha: 0.08),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${list.packedItems}/${list.totalItems} packed',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              Text(
                '${(progress * 100).toInt()}%',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color:
                      progress >= 1.0 ? Colors.green : AppColors.primary,
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
                  progress >= 1.0 ? Colors.green : AppColors.primary),
            ),
          ),
        ],
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
              borderRadius: BorderRadius.circular(4)),
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
                child: Text('x${item.quantity}',
                    style: const TextStyle(fontSize: 11)),
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

  InputDecoration _inputDecor(String hint) {
    return InputDecoration(
      hintText: hint,
      isDense: true,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide:
            const BorderSide(color: AppColors.primary, width: 1.5),
      ),
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
