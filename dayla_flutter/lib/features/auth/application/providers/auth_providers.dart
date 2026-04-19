import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/core/network/token_storage.dart';
import 'package:dayla_flutter/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:dayla_flutter/features/auth/data/repositories/auth_repository.dart';

final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

final authRemoteDatasourceProvider = Provider<AuthRemoteDatasource>((ref) {
  return AuthRemoteDatasource(ref.watch(dioProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(authRemoteDatasourceProvider));
});
