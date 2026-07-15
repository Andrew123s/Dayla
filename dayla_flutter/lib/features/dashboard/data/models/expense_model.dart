/// Trip expense (backend: GET/POST /api/trips/:tripId/expenses).
/// Plain class with defensive parsing — server docs come from `.lean()` so
/// ids arrive as `_id` and numbers may be int or double.
class ExpenseModel {
  const ExpenseModel({
    required this.id,
    required this.title,
    required this.amount,
    required this.currency,
    required this.amountUSD,
    required this.category,
    required this.date,
    this.settled = false,
  });

  final String id;
  final String title;
  final double amount;
  final String currency;
  final double amountUSD;
  final String category;
  final String date;
  final bool settled;

  static ExpenseModel? fromJson(dynamic json) {
    if (json is! Map) return null;
    final id = (json['_id'] ?? json['id'] ?? '').toString();
    if (id.isEmpty) return null;
    double numOf(dynamic v) => v is num ? v.toDouble() : 0;
    return ExpenseModel(
      id: id,
      title: (json['title'] ?? '').toString(),
      amount: numOf(json['amount']),
      currency: (json['currency'] ?? 'USD').toString(),
      amountUSD: numOf(json['amountUSD']),
      category: (json['category'] ?? 'other').toString(),
      date: (json['date'] ?? '').toString(),
      settled: json['settled'] == true,
    );
  }
}
