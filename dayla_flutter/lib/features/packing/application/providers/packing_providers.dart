import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/packing/data/datasources/packing_remote_datasource.dart';
import 'package:dayla_flutter/features/packing/data/models/packing_model.dart';
import 'package:dayla_flutter/features/packing/data/repositories/packing_repository.dart';

final packingRemoteDatasourceProvider =
    Provider<PackingRemoteDatasource>((ref) {
  return PackingRemoteDatasource(ref.watch(dioProvider));
});

final packingRepositoryProvider = Provider<PackingRepository>((ref) {
  return PackingRepository(ref.watch(packingRemoteDatasourceProvider));
});

final packingListProvider =
    FutureProvider.family<PackingListModel?, String>((ref, tripId) async {
  final repo = ref.watch(packingRepositoryProvider);
  return repo.getPackingList(tripId);
});

final packingTemplatesProvider =
    FutureProvider<List<PackingTemplate>>((ref) async {
  final repo = ref.watch(packingRepositoryProvider);
  return repo.getTemplates();
});
