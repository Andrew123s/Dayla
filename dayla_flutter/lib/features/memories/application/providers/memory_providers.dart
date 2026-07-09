import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/memories/data/datasources/memory_remote_datasource.dart';
import 'package:dayla_flutter/features/memories/data/models/memory_model.dart';
import 'package:dayla_flutter/features/memories/data/repositories/memory_repository.dart';

final memoryRemoteDatasourceProvider =
    Provider<MemoryRemoteDatasource>((ref) {
  return MemoryRemoteDatasource(ref.watch(dioProvider));
});

final memoryRepositoryProvider = Provider<MemoryRepository>((ref) {
  return MemoryRepository(ref.watch(memoryRemoteDatasourceProvider));
});

final memoriesProvider =
    AsyncNotifierProvider<MemoriesNotifier, List<MemoryModel>>(
        MemoriesNotifier.new);

class MemoriesNotifier extends AsyncNotifier<List<MemoryModel>> {
  @override
  Future<List<MemoryModel>> build() {
    return ref.watch(memoryRepositoryProvider).getMemories();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
        () => ref.read(memoryRepositoryProvider).getMemories());
  }
}

final memoryDetailProvider =
    FutureProvider.autoDispose.family<MemoryModel?, String>((ref, id) {
  return ref.watch(memoryRepositoryProvider).getMemory(id);
});
