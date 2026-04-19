import 'package:dio/dio.dart';
import 'package:dayla_flutter/features/packing/data/datasources/packing_remote_datasource.dart';
import 'package:dayla_flutter/features/packing/data/models/packing_model.dart';

class PackingRepository {
  PackingRepository(this._remote);

  final PackingRemoteDatasource _remote;

  Future<PackingListModel?> getPackingList(String tripId) async {
    try {
      final json = await _remote.getPackingList(tripId);
      final data = json['data']?['packingList'] ?? json['data'];
      if (data != null) {
        return PackingListModel.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<PackingListModel?> generateList(String tripId) async {
    try {
      final json = await _remote.generateList(tripId);
      final data = json['data']?['packingList'] ?? json['data'];
      if (data != null) {
        return PackingListModel.fromJson(data as Map<String, dynamic>);
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<bool> addItem(String tripId, Map<String, dynamic> data) async {
    try {
      final json = await _remote.addItem(tripId, data);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> updateItem(
    String tripId,
    String itemId,
    Map<String, dynamic> data,
  ) async {
    try {
      final json = await _remote.updateItem(tripId, itemId, data);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> removeItem(String tripId, String itemId) async {
    try {
      final json = await _remote.removeItem(tripId, itemId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> addLuggage(String tripId, Map<String, dynamic> data) async {
    try {
      final json = await _remote.addLuggage(tripId, data);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<bool> removeLuggage(String tripId, String luggageId) async {
    try {
      final json = await _remote.removeLuggage(tripId, luggageId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }

  Future<List<PackingSuggestion>> getSuggestions(String tripId) async {
    try {
      final json = await _remote.getSuggestions(tripId);
      final suggestions = (json['data']?['suggestions'] as List?) ?? [];
      return suggestions
          .map((s) => PackingSuggestion.fromJson(s as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<List<PackingTemplate>> getTemplates() async {
    try {
      final json = await _remote.getTemplates();
      final templates = (json['data']?['templates'] as List?) ?? [];
      return templates
          .map((t) => PackingTemplate.fromJson(t as Map<String, dynamic>))
          .toList();
    } on DioException {
      return [];
    }
  }

  Future<bool> applyTemplate(String tripId, String templateId) async {
    try {
      final json = await _remote.applyTemplate(tripId, templateId);
      return json['success'] == true;
    } on DioException {
      return false;
    }
  }
}
