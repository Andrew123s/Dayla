import 'package:flutter/material.dart';

/// Mriz memory DTOs — plain classes over GET /api/memories.
class MemoryModel {
  const MemoryModel({
    required this.id,
    required this.tripId,
    required this.title,
    this.coverPhoto,
    required this.season,
    required this.stats,
    required this.moodTags,
    required this.media,
    this.weatherCondition,
    this.weatherTempC,
    required this.participants,
    this.routeCoordinates = const [],
    this.createdAt,
  });

  final String id;
  final String tripId;
  final String title;
  final String? coverPhoto;

  /// spring | summer | autumn | winter
  final String season;
  final MemoryStats stats;
  final List<String> moodTags;
  final List<MemoryMedia> media;
  final String? weatherCondition;
  final double? weatherTempC;
  final List<MemoryPerson> participants;

  /// `[lng, lat, ele?]` — present when the trip had a Piko route (Phase 3).
  final List<List<double>> routeCoordinates;
  final DateTime? createdAt;

  factory MemoryModel.fromJson(Map<String, dynamic> json) {
    final stats = json['stats'] as Map? ?? {};
    final weather = (json['weatherDays'] as List?)?.cast<dynamic>() ?? [];
    final firstWeather = weather.isNotEmpty ? weather.first as Map : null;
    final geometry = json['routeGeometry'] as Map?;
    return MemoryModel(
      id: (json['_id'] ?? json['id']).toString(),
      tripId: (json['tripId'] ?? '').toString(),
      title: (json['title'] ?? 'A trip').toString(),
      coverPhoto: json['coverPhoto'] as String?,
      season: (json['season'] ?? 'summer').toString(),
      stats: MemoryStats(
        distanceKm: (stats['distanceKm'] as num?)?.toDouble() ?? 0,
        elevationGainM: (stats['elevationGainM'] as num?)?.toDouble() ?? 0,
        days: (stats['days'] as num?)?.toInt() ?? 1,
        companions: (stats['companions'] as num?)?.toInt() ?? 0,
      ),
      moodTags: (json['moodTags'] as List? ?? [])
          .map((t) => t.toString())
          .toList(),
      media: (json['media'] as List? ?? [])
          .whereType<Map>()
          .map((m) => MemoryMedia.fromJson(Map<String, dynamic>.from(m)))
          .toList(),
      weatherCondition: firstWeather?['condition'] as String?,
      weatherTempC: (firstWeather?['tempC'] as num?)?.toDouble(),
      participants: (json['participants'] as List? ?? [])
          .whereType<Map>()
          .map((p) => MemoryPerson.fromJson(Map<String, dynamic>.from(p)))
          .toList(),
      routeCoordinates: (geometry?['coordinates'] as List? ?? [])
          .whereType<List>()
          .map((c) => c.map((v) => (v as num).toDouble()).toList())
          .toList(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
    );
  }
}

class MemoryStats {
  const MemoryStats({
    required this.distanceKm,
    required this.elevationGainM,
    required this.days,
    required this.companions,
  });

  final double distanceKm;
  final double elevationGainM;
  final int days;
  final int companions;
}

class MemoryMedia {
  const MemoryMedia({required this.url, this.takenAt, this.lat, this.lng});

  final String url;
  final DateTime? takenAt;
  final double? lat;
  final double? lng;

  factory MemoryMedia.fromJson(Map<String, dynamic> json) {
    final coords = json['coords'] as Map?;
    return MemoryMedia(
      url: (json['url'] ?? '').toString(),
      takenAt: DateTime.tryParse((json['takenAt'] ?? '').toString()),
      lat: (coords?['lat'] as num?)?.toDouble(),
      lng: (coords?['lng'] as num?)?.toDouble(),
    );
  }
}

class MemoryPerson {
  const MemoryPerson({required this.name, this.avatar});

  final String name;
  final String? avatar;

  factory MemoryPerson.fromJson(Map<String, dynamic> json) {
    return MemoryPerson(
      name: (json['name'] ?? '').toString(),
      avatar: json['avatar'] as String?,
    );
  }
}

/// Seasonal palette — each season colors its timeline section and card
/// accents (calm, nature-inspired; used across Mriz).
abstract final class SeasonPalette {
  static Color of(String season) => switch (season) {
        'spring' => const Color(0xFFA3B18A),
        'summer' => const Color(0xFFD4A373),
        'autumn' => const Color(0xFFB5654D),
        _ => const Color(0xFF8FA7B3), // winter
      };

  static String label(String season) => switch (season) {
        'spring' => 'Spring',
        'summer' => 'Summer',
        'autumn' => 'Autumn',
        _ => 'Winter',
      };

  static IconData icon(String season) => switch (season) {
        'spring' => Icons.local_florist_outlined,
        'summer' => Icons.wb_sunny_outlined,
        'autumn' => Icons.energy_savings_leaf_outlined,
        _ => Icons.ac_unit,
      };
}
