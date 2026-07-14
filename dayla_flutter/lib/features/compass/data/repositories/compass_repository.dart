import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';

/// Result of a Compass draft.
class CompassDraft {
  const CompassDraft({
    required this.notesAdded,
    required this.trailCandidates,
    required this.overview,
  });

  final int notesAdded;
  final int trailCandidates;
  final String overview;
}

class CompassException implements Exception {
  const CompassException(this.message, {this.upgradeRequired = false});

  final String message;

  /// True when the free draft is used up (403 UPGRADE_REQUIRED).
  final bool upgradeRequired;

  @override
  String toString() => message;
}

/// Dayla Compass — POST /api/compass/draft. The backend drafts the whole
/// starting point onto the trip's board (day plan, trail candidates, budget
/// sketch, packing seed); the group edits from there.
class CompassRepository {
  CompassRepository(this._dio);

  final Dio _dio;

  Future<CompassDraft> draft({
    required String tripId,
    required String vibe,
    required List<String> interests,
  }) async {
    try {
      final response = await _dio.post(
        '/api/compass/draft',
        data: {
          'tripId': tripId,
          'vibe': vibe,
          'interests': interests,
        },
        // One Gemini round-trip + a possibly cold backend: give the draft
        // more room than the default 30s before declaring failure.
        options: Options(
          receiveTimeout: const Duration(seconds: 90),
          sendTimeout: const Duration(seconds: 30),
        ),
      );
      final data = response.data['data'] as Map? ?? {};
      return CompassDraft(
        notesAdded: (data['notesAdded'] as num?)?.toInt() ?? 0,
        trailCandidates: (data['trailCandidates'] as num?)?.toInt() ?? 0,
        overview: (data['overview'] ?? '').toString(),
      );
    } on DioException catch (e) {
      final body = e.response?.data;
      final message = body is Map && body['message'] is String
          ? body['message'] as String
          : 'Compass could not draft this trip.';
      throw CompassException(
        message,
        upgradeRequired: body is Map && body['code'] == 'UPGRADE_REQUIRED',
      );
    } catch (_) {
      throw const CompassException('Compass could not draft this trip.');
    }
  }
}

final compassRepositoryProvider = Provider<CompassRepository>((ref) {
  return CompassRepository(ref.watch(dioProvider));
});
