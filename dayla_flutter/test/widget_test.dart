import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/app.dart';

void main() {
  testWidgets('App loads auth entry', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: DaylaApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Dayla'), findsOneWidget);
    expect(find.text('Explore together'), findsOneWidget);
  });
}
