import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/budget_providers.dart';
import 'package:dayla_flutter/features/dashboard/data/models/expense_model.dart';

/// Trip budget: total (USD), expenses and per-category breakdown. All data
/// is owned by [budgetProvider] — this screen only renders and forwards
/// user intent to the notifier (chat-thread provider pattern).
class BudgetScreen extends ConsumerStatefulWidget {
  const BudgetScreen({super.key, required this.tripId, required this.tripName});

  final String tripId;
  final String tripName;

  @override
  ConsumerState<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends ConsumerState<BudgetScreen> {
  /// Currency for NEW expenses; defaults to the trip's stored currency.
  String? _currencyOverride;

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

  BudgetNotifier get _notifier =>
      ref.read(budgetProvider(widget.tripId).notifier);

  String _currencyOf(BudgetState s) =>
      _currencyOverride ?? s.trip?.budget?.currency ?? 'USD';

  String _symbolFor(String code) {
    for (final c in _currencies) {
      if (c.$1 == code) return c.$2;
    }
    return code;
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  // Totals use the server's USD snapshot so mixed-currency expenses add up.
  double _totalSpent(BudgetState s) =>
      s.expenses.fold(0.0, (sum, e) => sum + e.amountUSD);

  Map<String, double> _spentByCategory(BudgetState s) {
    final map = <String, double>{};
    for (final e in s.expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amountUSD;
    }
    return map;
  }

  Future<void> _createExpense({
    required String title,
    required double amount,
    required String category,
  }) async {
    final userId = ref.read(authSessionProvider).user?.id;
    if (userId == null) {
      _showError('Not signed in');
      return;
    }
    final state = ref.read(budgetProvider(widget.tripId)).valueOrNull;
    final currency =
        state != null ? _currencyOf(state) : (_currencyOverride ?? 'USD');
    final ok = await _notifier.createExpense({
      'title': title,
      'amount': amount,
      'currency': currency,
      'category': category,
      'date': DateTime.now().toIso8601String().substring(0, 10),
      'paidBy': userId,
      'splitMethod': 'equal',
      'splits': [
        {'user': userId, 'amount': amount},
      ],
    });
    if (!ok) _showError('Could not save the expense — try again');
  }

  void _showSetBudgetDialog(double currentTotal) {
    final controller = TextEditingController(
      text: currentTotal > 0 ? currentTotal.toStringAsFixed(0) : '',
    );
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Set Budget'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            prefixText: '\$ ',
            hintText: '0.00',
            helperText: 'Budget is tracked in USD',
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
            onPressed: () async {
              final val = double.tryParse(controller.text) ?? 0;
              Navigator.pop(ctx);
              final ok = await _notifier.setBudget(val);
              if (!ok) {
                _showError('Could not save the budget — try again');
              }
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
    final state = ref.read(budgetProvider(widget.tripId)).valueOrNull;
    final symbol = _symbolFor(
        state != null ? _currencyOf(state) : (_currencyOverride ?? 'USD'));

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
                  prefixText: '$symbol ',
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
                Navigator.pop(ctx);
                _createExpense(
                  title: title,
                  amount: amount,
                  category: category,
                );
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
    final budgetAsync = ref.watch(budgetProvider(widget.tripId));

    return budgetAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(title: Text(widget.tripName)),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: Text(widget.tripName)),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Failed to load the budget'),
              const SizedBox(height: 12),
              FilledButton.tonal(
                onPressed: () =>
                    ref.invalidate(budgetProvider(widget.tripId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      data: (state) => _buildLoaded(context, state),
    );
  }

  Widget _buildLoaded(BuildContext context, BudgetState state) {
    final currency = _currencyOf(state);
    final totalBudget = state.trip?.budget?.total ?? 0;
    final totalSpent = _totalSpent(state);
    final spentByCategory = _spentByCategory(state);
    final budgetCategories = state.trip?.budget?.categories;
    final expenses = state.expenses;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip Budget'),
        actions: [
          PopupMenuButton<String>(
            initialValue: currency,
            onSelected: (v) => setState(() => _currencyOverride = v),
            itemBuilder: (_) => _currencies
                .map((c) => PopupMenuItem(
                      value: c.$1,
                      child: Text('${c.$1} (${c.$2})'),
                    ))
                .toList(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Chip(label: Text(currency)),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _notifier.refresh(),
        child: ListView(
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
                            '\$${totalSpent.toStringAsFixed(2)}',
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
                  if (totalBudget > 0) ...[
                    const SizedBox(height: 16),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (totalSpent / totalBudget).clamp(0.0, 1.0),
                        minHeight: 8,
                        backgroundColor:
                            Colors.white.withValues(alpha: 0.1),
                        valueColor:
                            AlwaysStoppedAnimation(AppColors.sage),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Budget: \$${totalBudget.toStringAsFixed(0)}',
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
                      onPressed: () => _showSetBudgetDialog(totalBudget),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(
                            color: Colors.white.withValues(alpha: 0.3)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                          totalBudget > 0 ? 'Edit Budget' : 'Set Budget'),
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
                  symbol: '\$'),
              _CategoryRow(
                  label: 'Transportation',
                  amount: budgetCategories.transportation,
                  symbol: '\$'),
              _CategoryRow(
                  label: 'Food',
                  amount: budgetCategories.food,
                  symbol: '\$'),
              _CategoryRow(
                  label: 'Activities',
                  amount: budgetCategories.activities,
                  symbol: '\$'),
              _CategoryRow(
                  label: 'Other',
                  amount: budgetCategories.other,
                  symbol: '\$'),
            ],

            // Spent by category
            if (spentByCategory.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Spent by Category',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: spentByCategory.entries.map((e) {
                  final color =
                      _categoryColors[e.key] ?? Colors.grey.shade300;
                  return Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
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
                              '\$${e.value.toStringAsFixed(2)}',
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
            if (expenses.isEmpty)
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
              ...expenses.map((exp) => _buildExpenseTile(exp)),
            const SizedBox(height: 80),
          ],
        ),
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

  Widget _buildExpenseTile(ExpenseModel exp) {
    final color = _categoryColors[exp.category] ?? Colors.grey.shade300;
    return Dismissible(
      key: ValueKey(exp.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) async {
        final ok = await _notifier.deleteExpense(exp.id);
        if (!ok) _showError('Could not delete the expense');
      },
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
              child: Icon(Icons.attach_money, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
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
              '${_symbolFor(exp.currency)}${exp.amount.toStringAsFixed(2)}',
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 15,
              ),
            ),
          ],
        ),
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
