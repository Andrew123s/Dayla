import 'package:dayla_flutter/features/dashboard/data/datasources/dashboard_remote_datasource.dart';
import 'package:dayla_flutter/features/dashboard/data/models/expense_model.dart';
import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

class DashboardRepository {
  DashboardRepository(this._remote);

  final DashboardRemoteDatasource _remote;

  Future<List<TripModel>> getTrips() async {
    try {
      final json = await _remote.getTrips();
      final trips = (json['data']?['trips'] as List?) ?? [];
      // Parse per entry so one malformed trip can't blank the whole list.
      final parsed = <TripModel>[];
      for (final t in trips) {
        try {
          parsed.add(TripModel.fromJson(t as Map<String, dynamic>));
        } catch (_) {
          // Skip unparseable entries.
        }
      }
      return parsed;
    } catch (_) {
      return [];
    }
  }

  Future<TripModel?> getTrip(String id) async {
    try {
      final json = await _remote.getTrip(id);
      final data = json['data'];
      if (data == null) return null;
      final tripJson = data is Map && data.containsKey('trip')
          ? data['trip']
          : data;
      return TripModel.fromJson(tripJson as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<TripModel?> createTrip({
    required String name,
    String? description,
    String? category,
    String? destination,
    Map<String, String>? dates,
  }) async {
    try {
      final json = await _remote.createTrip(
        name: name,
        description: description,
        category: category,
        destination: destination,
        dates: dates,
      );
      if (json['success'] == true && json['data']?['trip'] != null) {
        return TripModel.fromJson(
            json['data']['trip'] as Map<String, dynamic>);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> updateTrip(String id, Map<String, dynamic> data) async {
    try {
      final json = await _remote.updateTrip(id, data);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteTrip(String id) async {
    try {
      final json = await _remote.deleteTrip(id);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<BoardModel?> getBoardByTrip(String tripId) async {
    try {
      final json = await _remote.getBoardByTrip(tripId);
      if (json['success'] == true && json['data'] != null) {
        final boardJson = json['data'] is Map && json['data'].containsKey('dashboard')
            ? json['data']['dashboard']
            : json['data'];
        return BoardModel.fromJson(boardJson as Map<String, dynamic>);
      }
      return null;
    } catch (_) {
      // 404 (no board yet), auth errors, or an unexpected payload shape —
      // the screen falls back to its no-board state either way.
      return null;
    }
  }

  /// Expenses + the trip's budget total (USD), from the budget module.
  Future<({List<ExpenseModel> expenses, double budgetUSD})> getBudget(
      String tripId) async {
    try {
      final json = await _remote.getBudget(tripId);
      final data = json['data'] as Map? ?? {};
      final raw = (data['expenses'] as List?) ?? [];
      final expenses =
          raw.map(ExpenseModel.fromJson).whereType<ExpenseModel>().toList();
      final budget = data['budgetUSD'];
      return (
        expenses: expenses,
        budgetUSD: budget is num ? budget.toDouble() : 0.0,
      );
    } catch (_) {
      return (expenses: <ExpenseModel>[], budgetUSD: 0.0);
    }
  }

  Future<bool> createExpense(String tripId, Map<String, dynamic> data) async {
    try {
      final json = await _remote.createExpense(tripId, data);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteExpense(String tripId, String expenseId) async {
    try {
      final json = await _remote.deleteExpense(tripId, expenseId);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> addCollaborator(String tripId, String email) async {
    try {
      final json = await _remote.addCollaborator(tripId, email);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> inviteToBoard(String boardId, String email) async {
    try {
      final json = await _remote.inviteToBoard(boardId, email);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> createStickyNote(
    String tripId,
    Map<String, dynamic> data,
  ) async {
    try {
      final json = await _remote.createStickyNote(tripId, data);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateStickyNote(
    String tripId,
    String noteId,
    Map<String, dynamic> data,
  ) async {
    try {
      final json = await _remote.updateStickyNote(tripId, noteId, data);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteStickyNote(String tripId, String noteId) async {
    try {
      final json = await _remote.deleteStickyNote(tripId, noteId);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  /// Upload a voice memo (Cloudinary via the backend); returns its URL.
  Future<String?> uploadAudio(String filePath) async {
    try {
      final json = await _remote.uploadAudio(filePath);
      if (json['success'] == true) {
        return json['data']?['url'] as String?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Upload an image (Cloudinary via the backend); returns its URL.
  Future<String?> uploadImage(String filePath) async {
    try {
      final json = await _remote.uploadImage(filePath);
      if (json['success'] == true) {
        return json['data']?['url'] as String?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> getWeather(
    String location, {
    int days = 5,
  }) async {
    try {
      final json = await _remote.getWeather(location, days: days);
      if (json['success'] == true) return json['data'] as Map<String, dynamic>?;
      return null;
    } catch (_) {
      return null;
    }
  }
}
