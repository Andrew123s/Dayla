/// Regression: the create-trip endpoint returns the RAW document where
/// `owner` is a plain id string (unlike list/detail endpoints, which
/// populate it into an object). Parsing that shape used to throw, which
/// escaped the repository's DioException-only catch and left the Create
/// Trip button spinning forever.
library;

import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

void main() {
  test('parses the raw create-trip payload (owner as string id)', () {
    // Verbatim shape captured from POST /api/trips on production.
    final json = <String, dynamic>{
      'name': 'Parse probe trip',
      'owner': '6a50ec0233092c929530d5b0',
      'collaborators': <dynamic>[],
      'items': <dynamic>[],
      'budget': {'currency': 'USD'},
      'status': 'planning',
      'tags': <dynamic>[],
      'category': 'exploring',
      'ecoScore': 0,
      'carbonFootprint': {'unit': 'kg CO2'},
      'isPublic': false,
      '_id': '6a56a679d6f464938fdaba02',
      'createdAt': '2026-07-14T21:13:29.838Z',
      'updatedAt': '2026-07-14T21:13:29.838Z',
      '__v': 0,
      'duration': null,
      'collaboratorCount': 0,
      'progress': 0,
      'id': '6a56a679d6f464938fdaba02',
    };

    final trip = TripModel.fromJson(json);
    expect(trip.id, '6a56a679d6f464938fdaba02');
    expect(trip.name, 'Parse probe trip');
    expect(trip.owner, isNull, reason: 'string owner is dropped, not fatal');
    expect(trip.collaborators, isEmpty);
  });

  test('parses the populated list payload (owner as object)', () {
    final json = <String, dynamic>{
      '_id': 'abc123',
      'name': 'Compass Test',
      'owner': {
        '_id': 'u1',
        'name': 'Play Reviewer',
        'avatar': null,
      },
      'collaborators': [
        {'_id': 'u2', 'name': 'Friend', 'avatar': null},
        {
          'user': {'_id': 'u3', 'name': 'Nested Friend'},
          'role': 'editor',
        },
        'unpopulated-id-string',
      ],
      'destination': {'name': 'Zittau Mountains'},
      'status': 'planning',
    };

    final trip = TripModel.fromJson(json);
    expect(trip.owner?.name, 'Play Reviewer');
    expect(trip.collaborators.map((c) => c.name),
        containsAll(['Friend', 'Nested Friend']),
        reason: 'both flat and {user:{...}} collaborator shapes parse');
    expect(trip.collaborators.length, 2,
        reason: 'unpopulated string entries are skipped');
    expect(trip.destination?.name, 'Zittau Mountains');
  });
}
