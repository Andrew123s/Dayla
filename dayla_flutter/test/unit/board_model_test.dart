/// Regression: one malformed legacy note used to throw during parsing and
/// take the whole board down — the screen then showed "No board available"
/// even though the dashboard existed.
library;

import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/features/dashboard/data/models/trip_model.dart';

void main() {
  test('legacy board with messy notes parses instead of dying', () {
    final board = BoardModel.fromJson({
      '_id': 'b1',
      'tripId': {'_id': 't1'},
      // no name — legacy boards may lack it
      'notes': [
        // Healthy modern note
        {
          'id': 'n1',
          'type': 'text',
          'x': 10,
          'y': 20,
          'width': 220,
          'height': 170,
          'content': 'hello',
        },
        // Legacy: only _id, int coords, Date-ish scheduledDate, Mixed junk
        {
          '_id': 'n2',
          'type': 'schedule',
          'x': 1,
          'y': 2,
          'width': 200,
          'height': 100,
          'content': 42, // non-string content
          'metadata': 'not-a-map',
          'scheduledDate': 1699999999,
          'scale': 'big',
          'emoji': 5,
        },
        // Hopeless: no id at all — skipped, not fatal
        {'type': 'text', 'x': 0, 'y': 0},
        // Not even a map — skipped
        'garbage',
        // Missing coords/dims — defaulted, not fatal
        {'id': 'n3', 'type': 'voice', 'content': 'memo'},
      ],
    });

    expect(board.id, 'b1');
    expect(board.tripId, 't1');
    expect(board.notes.length, 3, reason: 'n1, n2, n3 survive; junk dropped');
    expect(board.notes[1].id, 'n2', reason: 'id derived from _id');
    expect(board.notes[1].content, '42');
    expect(board.notes[1].metadata, isNull);
    expect(board.notes[2].x, 40, reason: 'missing coords get defaults');
    expect(board.notes[2].width, 220);
  });

  test('board with no notes field parses', () {
    final board = BoardModel.fromJson({'_id': 'b2', 'tripId': 't2'});
    expect(board.notes, isEmpty);
  });
}
