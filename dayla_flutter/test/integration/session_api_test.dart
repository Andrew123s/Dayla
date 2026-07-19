@Tags(['integration'])
library;

/// End-to-end proof of the session lifecycle against PRODUCTION: login,
/// validate, ROTATE the token via /auth/refresh, and confirm the rotated
/// token is accepted — the mechanism that keeps users signed in across app
/// launches (rolling sessions).
///
/// Run: flutter test test/integration --tags integration
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dayla_flutter/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:dayla_flutter/features/auth/data/repositories/auth_repository.dart';

const _base = 'https://dayla.onrender.com';
const _email = 'playreview@daylapp.com';
const _password = 'DaylaReview2026!';

Dio _dioWith(String? token) => Dio(BaseOptions(
      baseUrl: _base,
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 60),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    ));

void main() {
  test('login → check → refresh → rotated token still valid', () async {
    final anon = AuthRepository(AuthRemoteDatasource(_dioWith(null)));
    final login = await anon.login(email: _email, password: _password);
    expect(login.success, isTrue, reason: 'login must succeed');
    final token = login.data!.token!;

    final authed = AuthRepository(AuthRemoteDatasource(_dioWith(token)));
    final check = await authed.checkAuth();
    expect(check.success, isTrue, reason: 'stored token must validate');
    expect(check.networkError, isFalse);

    final fresh = await authed.refreshToken();
    expect(fresh, isNotNull,
        reason: 'the /auth/refresh endpoint must issue a rotated token');
    expect(fresh, isNot(token), reason: 'rotation must mint a NEW token');

    final rotated = AuthRepository(AuthRemoteDatasource(_dioWith(fresh)));
    final recheck = await rotated.checkAuth();
    expect(recheck.success, isTrue,
        reason: 'the rotated token must be accepted by the server');
  });

  test('a garbage token is rejected as a REAL auth failure, not network',
      () async {
    final bad = AuthRepository(AuthRemoteDatasource(_dioWith('not-a-jwt')));
    final check = await bad.checkAuth();
    expect(check.success, isFalse);
    expect(check.networkError, isFalse,
        reason: 'server rejection must be distinguishable from a timeout — '
            'session restore only logs out when networkError is false');
  });
}
