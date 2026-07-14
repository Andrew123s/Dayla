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

/// Result of snapping waypoints to real trails (GraphHopper).
class SnappedRoute {
  const SnappedRoute({
    required this.coordinates,
    required this.distanceKm,
    required this.elevationGainM,
    required this.durationMins,
  });

  /// `[lng, lat, ele?]` positions.
  final List<List<double>> coordinates;
  final double distanceKm;
  final double elevationGainM;
  final double durationMins;
}

class ModerationEntry {
  const ModerationEntry({
    required this.route,
    required this.reportCount,
    required this.reportReasons,
  });

  final RouteModel route;
  final int reportCount;
  final List<String> reportReasons;
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
    } catch (_) {
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
    } catch (_) {
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
    } catch (_) {
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
    } on PikoActionException {
      rethrow;
    } catch (_) {
      throw const PikoActionException('Failed to vote');
    }
  }

  Future<List<RouteCommentModel>> getComments(String id) async {
    try {
      final json = await _remote.listComments(id);
      final comments = (json['data'] as List?) ?? [];
      return comments
          .map((c) => RouteCommentModel.fromJson(c as Map<String, dynamic>))
          .toList();
    } catch (_) {
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
    } catch (_) {
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
    } on PikoActionException {
      rethrow;
    } catch (_) {
      throw const PikoActionException('Failed to add to plan');
    }
  }

  /// Snap waypoints (`[lng, lat]` pairs) to real trails.
  /// Throws [PikoActionException] with the server's message on failure
  /// (missing GraphHopper key, no walkable route, Pro gate).
  Future<SnappedRoute> snapRoute(
    List<List<double>> points, {
    String profile = 'hike',
  }) async {
    try {
      final json = await _remote.snapRoute(points, profile: profile);
      final data = json['data'] as Map? ?? {};
      final geometry = data['geometry'] as Map? ?? {};
      final coords = (geometry['coordinates'] as List? ?? [])
          .map((c) => (c as List)
              .map((v) => (v as num).toDouble())
              .toList())
          .toList();
      return SnappedRoute(
        coordinates: coords,
        distanceKm: (data['distanceKm'] as num?)?.toDouble() ?? 0,
        elevationGainM: (data['elevationGainM'] as num?)?.toDouble() ?? 0,
        durationMins: (data['durationMins'] as num?)?.toDouble() ?? 0,
      );
    } on DioException catch (e) {
      throw PikoActionException(_messageFrom(e, 'Routing failed'));
    } on PikoActionException {
      rethrow;
    } catch (_) {
      throw const PikoActionException('Routing failed');
    }
  }

  /// Create a user-generated route (enters moderation).
  Future<RouteModel> createRoute(Map<String, dynamic> data) async {
    try {
      final json = await _remote.createRoute(data);
      return RouteModel.fromJson(
          Map<String, dynamic>.from(json['data'] as Map));
    } on DioException catch (e) {
      throw PikoActionException(_messageFrom(e, 'Failed to create route'));
    } on PikoActionException {
      rethrow;
    } catch (_) {
      throw const PikoActionException('Failed to create route');
    }
  }

  /// Moderation queue — throws with the server message on 403 (not admin).
  Future<List<ModerationEntry>> getModerationQueue() async {
    try {
      final json = await _remote.getModerationQueue();
      final routes = (json['data'] as List?) ?? [];
      return routes.whereType<Map>().map((r) {
        final map = Map<String, dynamic>.from(r);
        return ModerationEntry(
          route: RouteModel.fromJson(map),
          reportCount: (map['reportCount'] as num?)?.toInt() ?? 0,
          reportReasons: (map['reportReasons'] as List? ?? [])
              .map((x) => x.toString())
              .toList(),
        );
      }).toList();
    } on DioException catch (e) {
      throw PikoActionException(
          _messageFrom(e, 'Failed to load moderation queue'));
    } on PikoActionException {
      rethrow;
    } catch (_) {
      throw const PikoActionException('Failed to load moderation queue');
    }
  }

  Future<bool> moderateRoute(String id, String action) async {
    try {
      final json = await _remote.moderateRoute(id, action);
      return json['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> reportRoute(String id, {String? reason}) async {
    try {
      final json = await _remote.reportRoute(id, reason: reason);
      return json['success'] == true;
    } catch (_) {
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
    } catch (_) {
      return [];
    }
  }
}
