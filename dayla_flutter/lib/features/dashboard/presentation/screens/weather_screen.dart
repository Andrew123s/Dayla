import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';

class WeatherScreen extends ConsumerStatefulWidget {
  const WeatherScreen({
    super.key,
    required this.tripName,
    this.defaultLocation,
  });

  final String tripName;
  final String? defaultLocation;

  @override
  ConsumerState<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends ConsumerState<WeatherScreen> {
  final _locationCtrl = TextEditingController();
  Map<String, dynamic>? _weatherData;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final loc = widget.defaultLocation ?? 'London';
    _locationCtrl.text = loc;
    _fetchWeather(loc);
  }

  @override
  void dispose() {
    _locationCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchWeather(String location) async {
    if (location.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    final repo = ref.read(dashboardRepositoryProvider);
    final data = await repo.getWeather(location);
    if (mounted) {
      setState(() {
        _loading = false;
        _weatherData = data;
        if (data == null) _error = 'Failed to fetch weather data';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Weather — ${widget.tripName}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSearchBar(),
            const SizedBox(height: 16),
            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_error != null)
              _buildErrorState()
            else if (_weatherData != null) ...[
              _buildCurrentWeather(),
              const SizedBox(height: 16),
              if (_weatherData!['suggestion'] != null)
                _buildSuggestion(),
              const SizedBox(height: 16),
              _buildForecast(),
              if (_weatherData!['alerts'] != null &&
                  (_weatherData!['alerts'] as List).isNotEmpty) ...[
                const SizedBox(height: 16),
                _buildAlerts(),
              ],
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _locationCtrl,
            decoration: InputDecoration(
              hintText: 'Search city...',
              prefixIcon: const Icon(Icons.search, size: 20),
              isDense: true,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
            onSubmitted: _fetchWeather,
          ),
        ),
        const SizedBox(width: 8),
        IconButton.filled(
          onPressed: () => _fetchWeather(_locationCtrl.text.trim()),
          icon: const Icon(Icons.search, size: 20),
          style: IconButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(Icons.cloud_off, size: 48, color: Colors.red.shade300),
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Colors.red.shade600)),
            const SizedBox(height: 12),
            FilledButton.tonal(
              onPressed: () => _fetchWeather(_locationCtrl.text.trim()),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentWeather() {
    final current = _weatherData!['current'] as Map<String, dynamic>;
    final condition = current['condition'] as String? ?? 'Sunny';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF588157)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Text(
            current['location'] as String? ?? '',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 12),
          Icon(_conditionIcon(condition), size: 64, color: Colors.amber),
          const SizedBox(height: 8),
          Text(
            '${current['temp_c']}°C',
            style: const TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          Text(
            current['conditionText'] as String? ?? condition,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Feels like ${current['feelslike_c']}°C · Humidity ${current['humidity']}% · Wind ${current['wind_kph']} km/h',
            style: const TextStyle(color: Colors.white60, fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestion() {
    final suggestion = _weatherData!['suggestion'] as String;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.sage.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.sage.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.lightbulb_outline, size: 20, color: AppColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Activity Tip',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                        letterSpacing: 0.5)),
                const SizedBox(height: 4),
                Text(suggestion,
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey.shade700)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForecast() {
    final forecast = (_weatherData!['forecast'] as List).cast<Map<String, dynamic>>();
    if (forecast.length <= 1) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Forecast',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3,
          ),
          itemCount: forecast.length > 1 ? forecast.length - 1 : 0,
          itemBuilder: (context, i) {
            final day = forecast[i + 1];
            final condition = day['condition'] as String? ?? 'Sunny';
            final rainChance = day['chance_of_rain'] as int? ?? 0;
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    day['dayName'] as String? ?? '',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Colors.grey.shade500,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Icon(_conditionIcon(condition),
                      size: 24, color: AppColors.sage),
                  const SizedBox(height: 6),
                  Text(
                    '${day['temp_c']}°',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    day['conditionText'] as String? ?? condition,
                    style: TextStyle(
                        fontSize: 10, color: Colors.grey.shade500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (rainChance > 30)
                    Text(
                      '💧 $rainChance% rain',
                      style: const TextStyle(
                          fontSize: 10, color: Colors.blue),
                    ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildAlerts() {
    final alerts =
        (_weatherData!['alerts'] as List).cast<Map<String, dynamic>>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Alerts',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold, color: Colors.orange)),
        const SizedBox(height: 8),
        ...alerts.map((alert) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.warning_amber_rounded,
                      size: 20, color: Colors.orange.shade700),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          alert['event'] as String? ?? 'Weather Alert',
                          style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                              color: Colors.orange.shade800),
                        ),
                        if (alert['headline'] != null) ...[
                          const SizedBox(height: 4),
                          Text(alert['headline'] as String,
                              style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade700)),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }

  IconData _conditionIcon(String condition) {
    return switch (condition) {
      'Sunny' => Icons.wb_sunny,
      'Cloudy' => Icons.cloud,
      'Rainy' => Icons.water_drop,
      'Windy' => Icons.air,
      'Stormy' => Icons.thunderstorm,
      _ => Icons.wb_sunny,
    };
  }
}
