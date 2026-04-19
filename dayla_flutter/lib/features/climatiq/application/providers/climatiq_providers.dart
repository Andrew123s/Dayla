import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/climatiq/data/datasources/climatiq_remote_datasource.dart';
import 'package:dayla_flutter/features/climatiq/data/repositories/climatiq_repository.dart';

final climatiqRemoteDatasourceProvider =
    Provider<ClimatiqRemoteDatasource>((ref) {
  return ClimatiqRemoteDatasource(ref.watch(dioProvider));
});

final climatiqRepositoryProvider = Provider<ClimatiqRepository>((ref) {
  return ClimatiqRepository(ref.watch(climatiqRemoteDatasourceProvider));
});

final climatiqConnectionProvider = FutureProvider<bool>((ref) async {
  final repo = ref.watch(climatiqRepositoryProvider);
  return repo.validateConnection();
});
