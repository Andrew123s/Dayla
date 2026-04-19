import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

class BudgetScreen extends ConsumerStatefulWidget {
  const BudgetScreen({super.key, required this.tripId, required this.tripName});

  final String tripId;
  final String tripName;

  @override
  ConsumerState<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends ConsumerState<BudgetScreen> {
  TripModel? _trip;
  bool _loading = true;
  String _currency = 'USD';
  final List<_Expense> _expenses = [];

  static const _currencies = [
    ('USD', '\$'),
    ('GHC', '₵'),
    ('EUR', '€'),
    ('GBP', '£'),
    ('JPY', '¥'),
  ];

  static const _categoryColors = <String, Color>{
    'Accommodation': AppColors.sand,
    'Transportation': AppColors.sage,
    'Food & Dining': Color(0xFFCCD5AE),
    'Activities': AppColors.primary,
    'Shopping': Color(0xFFFAEDCD),
    'Other': Color(0xFFD1D5DB),
  };

  @override
  void initState() {
    super.initState();
    _loadTrip();
  }

  Future<void> _loadTrip() async {
    final repo = ref.read(dashboardRepositoryProvider);
    final trip = await repo.getTrip(widget.tripId);
    if (!mounted) return;
    setState(() {
      _trip = trip;
      _currency = trip?.budget?.currency ?? 'USD';
      _loading = false;
    });
  }

  String get _symbol {
    for (final c in _currencies) {
      if (c.$1 == _currency) return c.$2;
    }
    return '\$';
  }

  double get _totalBudget => _trip?.budget?.total ?? 0;

  double get _totalSpent =>
      _expenses.fold(0.0, (sum, e) => sum + e.amount);

  Map<String, double> get _spentByCategory {
    final map = <String, double>{};
    for (final e in _expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return map;
  }

  Future<void> _updateBudget(double total) async {
    final repo = ref.read(dashboardRepositoryProvider);
    final ok = await repo.updateTrip(widget.tripId, {
      'budget': {
        'total': total,
        'currency': _currency,
      },
    });
    if (ok) await _loadTrip();
  }

  void _showSetBudgetDialog() {
    final controller = TextEditingController(
      text: _totalBudget > 0 ? _totalBudget.toStringAsFixed(0) : '',
    );
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Set Budget'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            prefixText: '$_symbol ',
            hintText: '0.00',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final val = double.tryParse(controller.text) ?? 0;
              Navigator.pop(ctx);
              _updateBudget(val);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showAddExpenseDialog() {
    final titleController = TextEditingController();
    final amountController = TextEditingController();
    var category = 'Food & Dining';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('New Expense'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: InputDecoration(
                  hintText: 'What for? (e.g. Dinner)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  prefixText: '$_symbol ',
                  hintText: '0.00',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: category,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: _categoryColors.keys
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) {
                  if (v != null) setDialogState(() => category = v);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final title = titleController.text.trim();
                final amount = double.tryParse(amountController.text) ?? 0;
                if (title.isEmpty || amount <= 0) return;
                setState(() {
                  _expenses.add(_Expense(
                    title: title,
                    amount: amount,
                    category: category,
                    date: DateTime.now(),
                  ));
                });
                Navigator.pop(ctx);
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.tripName)),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final budgetCategories = _trip?.budget?.categories;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip Budget'),
        actions: [
          PopupMenuButton<String>(
            initialValue: _currency,
            onSelected: (v) => setState(() => _currency = v),
            itemBuilder: (_) => _currencies
                .map((c) => PopupMenuItem(
                      value: c.$1,
                      child: Text('${c.$1} (${c.$2})'),
                    ))
                .toList(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Chip(label: Text(_currency)),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Total budget card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TOTAL SPENT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                            color: AppColors.sage,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$_symbol${_totalSpent.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.pie_chart,
                          color: Colors.white, size: 28),
                    ),
                  ],
                ),
                if (_totalBudget > 0) ...[
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (_totalSpent / _totalBudget).clamp(0.0, 1.0),
                      minHeight: 8,
                      backgroundColor: Colors.white.withValues(alpha: 0.1),
                      valueColor:
                          AlwaysStoppedAnimation(AppColors.sage),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Budget: $_symbol${_totalBudget.toStringAsFixed(0)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: _showSetBudgetDialog,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(
                          color: Colors.white.withValues(alpha: 0.3)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                        _totalBudget > 0 ? 'Edit Budget' : 'Set Budget'),
                  ),
                ),
              ],
            ),
          ),

          // Budget allocation (from trip data)
          if (budgetCategories != null) ...[
            const SizedBox(height: 24),
            Text('Budget Allocation',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _CategoryRow(
                label: 'Accommodation',
                amount: budgetCategories.accommodation,
                symbol: _symbol),
            _CategoryRow(
                label: 'Transportation',
                amount: budgetCategories.transportation,
                symbol: _symbol),
            _CategoryRow(
                label: 'Food',
                amount: budgetCategories.food,
                symbol: _symbol),
            _CategoryRow(
                label: 'Activities',
                amount: budgetCategories.activities,
                symbol: _symbol),
            _CategoryRow(
                label: 'Other',
                amount: budgetCategories.other,
                symbol: _symbol),
          ],

          // Spent by category
          if (_spentByCategory.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text('Spent by Category',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _spentByCategory.entries.map((e) {
                final color =
                    _categoryColors[e.key] ?? Colors.grey.shade300;
                return Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 4,
                        height: 28,
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            e.key,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.grey.shade500,
                            ),
                          ),
                          Text(
                            '$_symbol${e.value.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],

          // Expenses list
          const SizedBox(height: 24),
          Text('Expenses',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (_expenses.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  Icon(Icons.receipt_long,
                      size: 48, color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  Text(
                    'No expenses yet',
                    style: TextStyle(
                      color: Colors.grey.shade500,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Tap + to add your first expense',
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            )
          else
            ...List.generate(_expenses.length, (i) {
              final exp = _expenses[i];
              final color =
                  _categoryColors[exp.category] ?? Colors.grey.shade300;
              return Dismissible(
                key: ValueKey(exp.hashCode),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  decoration: BoxDecoration(
                    color: Colors.red.shade400,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child:
                      const Icon(Icons.delete, color: Colors.white),
                ),
                onDismissed: (_) =>
                    setState(() => _expenses.removeAt(i)),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.attach_money,
                            color: color, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              exp.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                            Text(
                              exp.category,
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey.shade500,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '$_symbol${exp.amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          const SizedBox(height: 80),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddExpenseDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Expense'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({
    required this.label,
    required this.amount,
    required this.symbol,
  });

  final String label;
  final double amount;
  final String symbol;

  @override
  Widget build(BuildContext context) {
    if (amount <= 0) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
          Text('$symbol${amount.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _Expense {
  _Expense({
    required this.title,
    required this.amount,
    required this.category,
    required this.date,
  });

  final String title;
  final double amount;
  final String category;
  final DateTime date;
}
