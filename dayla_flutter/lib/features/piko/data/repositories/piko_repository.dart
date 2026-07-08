import 'package:dio/dio.dart';

import 'package:dayla_flutter/features/piko/data/datasources/piko_remote_datasource.dart';
import 'package:dayla_flutter/features/piko/data/models/route_model.dart';

/// Thrown for actions where the server message matters to the user —
/// e.g. Pro-gated voting / add-to-plan returns 403 with an upgrade hint.
class PikoActionException implements Exception {
  const PikoActionException(this.message);

  final String message;

  @override
  String toString() => message;
}

class PikoRepository {
  PikoRepository(this._remote);

  final PikoRemoteDatasource _remote;

  static String _messageFrom(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    return fallback;
  }

  Future<List<RouteModel>> getRoutes({
    String? country,
    String? difficulty,
    String? filter,
    String? query,
    String? sort,
  }) async {
    final json = await _remote.listRoutes(
      country: country,
      difficulty: difficulty,
      filter: filter,
      query: query,
      sort: sort,
    );
    final routes = (json['data'] as List?) ?? [];
    return routes
        .map((r) => RouteModel.fromJson(r as Map<String, dynamic>))
        .toList();
  }

  Future<RouteModel?> getRoute(String id) async {
    try {
      final json = await _remote.getRoute(id);
      final route = json['data'];
      if (route != null) {
        return RouteModel.fromJson(route as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<List<RouteModel>> getSaved() async {
    try {
      final json = await _remote.getSaved();
      final routes = (json['data'] as List?) ?? [];
      return routes
          .map((r) => RouteModel.fromJson(r as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  /// Returns `(isSaved, saveCount)` after toggling, or null on failure.
  Future<({bool isSaved, int saveCount})?> toggleSave(String id) async {
    try {
      final json = await _remote.toggleSave(id);
      final data = json['data'];
      if (data is Map) {
        return (
          isSaved: data['isSaved'] == true,
          saveCount: (data['saveCount'] as num?)?.toInt() ?? 0,
        );
      }
      return null;
    } on DioException {
      return null;
    }
  }

  /// Returns `(voteScore, userVote)` after voting. Throws
  /// [PikoActionException] when gated (Pro) or rejected.
  Future<({int voteScore, int userVote})> vote(String id, int value) async {
    try {
      final json = await _remote.vote(id, value);
      final data = json['data'] as Map? ?? {};
      return (
        voteScore: (data['voteScore'] as num?)?.toInt() ?? 0,
        userVote: (data['userVote'] as num?)?.toInt() ?? 0,
      );
    } on DioException catch (e) {
      throw PikoActionException(_messageFrom(e, 'Failed to vote'));
    }
  }

  Future<List<RouteCommentModel>> getComments(String id) async {
    try {
      final json = await _remote.listComments(id);
      final comments = (json['data'] as List?) ?? [];
      return comments
          .map((c) => RouteCommentModel.fromJson(c as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<RouteCommentModel?> addComment(String id, String content) async {
    try {
      final json = await _remote.addComment(id, content);
      final comment = json['data'];
      if (comment != null) {
        return RouteCommentModel.fromJson(comment as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  /// Adds the route to a trip's dashboard as a `route` sticky note.
  /// Throws [PikoActionException] when gated (Pro) or rejected.
  Future<void> addToPlan(String routeId, String tripId) async {
    try {
      final boardJson = await _remote.getBoardByTrip(tripId);
      final board = boardJson['data'] as Map? ?? {};
      final dashboardId =
          (board['dashboard'] as Map?)?['_id'] ?? board['_id'] ?? board['id'];
      if (dashboardId == null) {
        throw const PikoActionException('No plan board found for this trip');
      }
      await _remote.addToPlan(routeId, dashboardId.toString());
    } on DioException catch (e) {
      throw PikoActionException(_messageFrom(e, 'Failed to add to plan'));
    }
  }

  Future<bool> reportRoute(String id, {String? reason}) async {
    try {
      final json = await _remote.reportRoute(id, reason: reason);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<List<PikoPlan>> getPlans() async {
    try {
      final json = await _remote.getTrips();
      final data = json['data'];
      final trips = data is Map
          ? (data['trips'] as List?) ?? []
          : (data as List?) ?? [];
      return trips.whereType<Map<String, dynamic>>().map((t) {
        final collaborators = (t['collaborators'] as List?)?.length ?? 0;
        return PikoPlan(
          tripId: (t['id'] ?? t['_id']).toString(),
          name: (t['name'] ?? 'Trip').toString(),
          subtitle: collaborators > 0
              ? '$collaborators collaborator${collaborators == 1 ? '' : 's'}'
              : null,
        );
      }).toList();
    } on DioException {
      return [];
    }
  }
}
