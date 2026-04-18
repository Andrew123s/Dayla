import 'package:flutter_riverpod/flutter_riverpod.dart';

/// JWT for [Authorization: Bearer] — wired to real auth in a later phase.
final authTokenProvider = StateProvider<String?>((ref) => null);
