import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/climatiq/application/providers/climatiq_providers.dart';
import 'package:dayla_flutter/features/climatiq/data/models/climatiq_model.dart';

class ClimatiqScreen extends ConsumerStatefulWidget {
  const ClimatiqScreen({super.key, required this.tripId, required this.tripName});

  final String tripId;
  final String tripName;

  @override
  ConsumerState<ClimatiqScreen> createState() => _ClimatiqScreenState();
}

class _ClimatiqScreenState extends ConsumerState<ClimatiqScreen> {
  String _selectedTab = 'transport';
  bool _calculating = false;
  EmissionResult? _lastResult;

  final _distanceController = TextEditingController();
  final _nightsController = TextEditingController();
  final _mealsController = TextEditingController();

  String _transportMode = 'flight';
  int _passengers = 1;
  String? _cabinClass;
  String _accommodationType = 'hotel';
  String _country = 'GB';
  String _mealType = 'average';
  String _countryCode = 'GB';

  @override
  void dispose() {
    _distanceController.dispose();
    _nightsController.dispose();
    _mealsController.dispose();
    super.dispose();
  }

  Future<void> _calculateTransport() async {
    final distance = double.tryParse(_distanceController.text.trim());
    if (distance == null || distance <= 0) return;

    setState(() {
      _calculating = true;
      _lastResult = null;
    });

    final repo = ref.read(climatiqRepositoryProvider);
    final result = await repo.calculateTransport(TransportInput(
      mode: _transportMode,
      distance: distance,
      passengers: _passengers,
      cabinClass: _cabinClass,
    ));

    setState(() {
      _calculating = false;
      _lastResult = result;
    });
  }

  Future<void> _calculateAccommodation() async {
    final nights = int.tryParse(_nightsController.text.trim());
    if (nights == null || nights <= 0) return;

    setState(() {
      _calculating = true;
      _lastResult = null;
    });

    final repo = ref.read(climatiqRepositoryProvider);
    final result = await repo.calculateAccommodation(AccommodationInput(
      type: _accommodationType,
      nights: nights,
      country: _country,
    ));

    setState(() {
      _calculating = false;
      _lastResult = result;
    });
  }

  Future<void> _calculateFood() async {
    final meals = int.tryParse(_mealsController.text.trim());
    if (meals == null || meals <= 0) return;

    setState(() {
      _calculating = true;
      _lastResult = null;
    });

    final repo = ref.read(climatiqRepositoryProvider);
    final result = await repo.calculateFood(FoodInput(
      mealType: _mealType,
      countryCode: _countryCode,
      numberOfMeals: meals,
    ));

    setState(() {
      _calculating = false;
      _lastResult = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    final connectionAsync = ref.watch(climatiqConnectionProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Carbon — ${widget.tripName}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildConnectionStatus(connectionAsync),
            const SizedBox(height: 16),
            _buildTabSelector(),
            const SizedBox(height: 16),
            if (_selectedTab == 'transport') _buildTransportForm(),
            if (_selectedTab == 'accommodation') _buildAccommodationForm(),
            if (_selectedTab == 'food') _buildFoodForm(),
            if (_lastResult != null) ...[
              const SizedBox(height: 24),
              _buildResultCard(_lastResult!),
            ],
            const SizedBox(height: 24),
            _buildFallbackInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionStatus(AsyncValue<bool> connectionAsync) {
    return connectionAsync.when(
      loading: () => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Row(
          children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            SizedBox(width: 10),
            Text('Checking API connection...', style: TextStyle(fontSize: 13)),
          ],
        ),
      ),
      error: (_, __) => _statusBanner(
        icon: Icons.warning_amber_rounded,
        color: Colors.orange,
        bgColor: Colors.orange.shade50,
        text: 'Using fallback emission calculations',
      ),
      data: (connected) => connected
          ? _statusBanner(
              icon: Icons.check_circle,
              color: Colors.green,
              bgColor: Colors.green.shade50,
              text: 'Connected to Climatiq API',
            )
          : _statusBanner(
              icon: Icons.info_outline,
              color: Colors.orange,
              bgColor: Colors.orange.shade50,
              text: 'Offline — using estimated emission factors',
            ),
    );
  }

  Widget _statusBanner({
    required IconData icon,
    required Color color,
    required Color bgColor,
    required String text,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: TextStyle(fontSize: 13, color: color)),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 18),
            onPressed: () => ref.invalidate(climatiqConnectionProvider),
            visualDensity: VisualDensity.compact,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabSelector() {
    return Row(
      children: [
        _tabChip('transport', Icons.flight, 'Transport'),
        const SizedBox(width: 8),
        _tabChip('accommodation', Icons.hotel, 'Stay'),
        const SizedBox(width: 8),
        _tabChip('food', Icons.restaurant, 'Food'),
      ],
    );
  }

  Widget _tabChip(String tab, IconData icon, String label) {
    final selected = _selectedTab == tab;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _selectedTab = tab;
          _lastResult = null;
        }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary.withValues(alpha: 0.1)
                : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppColors.primary : Colors.transparent,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Icon(icon,
                  size: 20,
                  color: selected ? AppColors.primary : Colors.grey),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                  color: selected ? AppColors.primary : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransportForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Transport Mode',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _modeChip('flight', Icons.flight, 'Flight'),
            _modeChip('train', Icons.train, 'Train'),
            _modeChip('bus', Icons.directions_bus, 'Bus'),
            _modeChip('car', Icons.directions_car, 'Car'),
            _modeChip('ferry', Icons.directions_boat, 'Ferry'),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _distanceController,
          keyboardType: TextInputType.number,
          decoration: _inputDecoration('Distance (km)', Icons.straighten),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<int>(
                value: _passengers,
                decoration: _inputDecoration('Passengers', Icons.people),
                items: List.generate(
                  10,
                  (i) => DropdownMenuItem(
                    value: i + 1,
                    child: Text('${i + 1}'),
                  ),
                ),
                onChanged: (v) => setState(() => _passengers = v ?? 1),
              ),
            ),
            if (_transportMode == 'flight') ...[
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String?>(
                  value: _cabinClass,
                  decoration: _inputDecoration('Cabin', Icons.airline_seat_recline_normal),
                  items: const [
                    DropdownMenuItem(value: null, child: Text('Any')),
                    DropdownMenuItem(value: 'economy', child: Text('Economy')),
                    DropdownMenuItem(value: 'business', child: Text('Business')),
                    DropdownMenuItem(value: 'first', child: Text('First')),
                  ],
                  onChanged: (v) => setState(() => _cabinClass = v),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 20),
        _buildCalculateButton(_calculateTransport),
      ],
    );
  }

  Widget _modeChip(String mode, IconData icon, String label) {
    final selected = _transportMode == mode;
    return ChoiceChip(
      avatar: Icon(icon, size: 16,
          color: selected ? Colors.white : AppColors.primary),
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() => _transportMode = mode),
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: selected ? Colors.white : AppColors.primary,
        fontSize: 12,
      ),
      side: BorderSide(color: AppColors.primary.withValues(alpha: 0.3)),
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildAccommodationForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Accommodation Type',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _accommodationChip('hotel', Icons.hotel, 'Hotel'),
            _accommodationChip('hostel', Icons.single_bed, 'Hostel'),
            _accommodationChip('apartment', Icons.apartment, 'Apartment'),
            _accommodationChip('camping', Icons.forest, 'Camping'),
            _accommodationChip('resort', Icons.pool, 'Resort'),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _nightsController,
          keyboardType: TextInputType.number,
          decoration: _inputDecoration('Number of nights', Icons.nights_stay),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _country,
          decoration: _inputDecoration('Country', Icons.flag),
          items: const [
            DropdownMenuItem(value: 'GB', child: Text('United Kingdom')),
            DropdownMenuItem(value: 'US', child: Text('United States')),
            DropdownMenuItem(value: 'FR', child: Text('France')),
            DropdownMenuItem(value: 'DE', child: Text('Germany')),
            DropdownMenuItem(value: 'ES', child: Text('Spain')),
            DropdownMenuItem(value: 'IT', child: Text('Italy')),
            DropdownMenuItem(value: 'JP', child: Text('Japan')),
            DropdownMenuItem(value: 'AU', child: Text('Australia')),
            DropdownMenuItem(value: 'TH', child: Text('Thailand')),
            DropdownMenuItem(value: 'BR', child: Text('Brazil')),
            DropdownMenuItem(value: 'IN', child: Text('India')),
            DropdownMenuItem(value: 'ZA', child: Text('South Africa')),
          ],
          onChanged: (v) => setState(() => _country = v ?? 'GB'),
        ),
        const SizedBox(height: 20),
        _buildCalculateButton(_calculateAccommodation),
      ],
    );
  }

  Widget _accommodationChip(String type, IconData icon, String label) {
    final selected = _accommodationType == type;
    return ChoiceChip(
      avatar: Icon(icon, size: 16,
          color: selected ? Colors.white : AppColors.primary),
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() => _accommodationType = type),
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: selected ? Colors.white : AppColors.primary,
        fontSize: 12,
      ),
      side: BorderSide(color: AppColors.primary.withValues(alpha: 0.3)),
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildFoodForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Meal Type',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _foodChip('average', Icons.restaurant, 'Average'),
            _foodChip('vegan', Icons.eco, 'Vegan'),
            _foodChip('vegetarian', Icons.grass, 'Vegetarian'),
            _foodChip('meat_heavy', Icons.kebab_dining, 'Meat Heavy'),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _mealsController,
          keyboardType: TextInputType.number,
          decoration: _inputDecoration('Number of meals', Icons.restaurant_menu),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _countryCode,
          decoration: _inputDecoration('Country', Icons.flag),
          items: const [
            DropdownMenuItem(value: 'GB', child: Text('United Kingdom')),
            DropdownMenuItem(value: 'US', child: Text('United States')),
            DropdownMenuItem(value: 'FR', child: Text('France')),
            DropdownMenuItem(value: 'DE', child: Text('Germany')),
            DropdownMenuItem(value: 'ES', child: Text('Spain')),
            DropdownMenuItem(value: 'IT', child: Text('Italy')),
            DropdownMenuItem(value: 'JP', child: Text('Japan')),
            DropdownMenuItem(value: 'AU', child: Text('Australia')),
            DropdownMenuItem(value: 'TH', child: Text('Thailand')),
            DropdownMenuItem(value: 'BR', child: Text('Brazil')),
          ],
          onChanged: (v) => setState(() => _countryCode = v ?? 'GB'),
        ),
        const SizedBox(height: 20),
        _buildCalculateButton(_calculateFood),
      ],
    );
  }

  Widget _foodChip(String type, IconData icon, String label) {
    final selected = _mealType == type;
    return ChoiceChip(
      avatar: Icon(icon, size: 16,
          color: selected ? Colors.white : AppColors.primary),
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() => _mealType = type),
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: selected ? Colors.white : AppColors.primary,
        fontSize: 12,
      ),
      side: BorderSide(color: AppColors.primary.withValues(alpha: 0.3)),
      visualDensity: VisualDensity.compact,
    );
  }

  Widget _buildCalculateButton(VoidCallback onPressed) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: _calculating ? null : onPressed,
        icon: _calculating
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.calculate),
        label: Text(_calculating ? 'Calculating...' : 'Calculate Emissions'),
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard(EmissionResult result) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.sage.withValues(alpha: 0.15),
            AppColors.primary.withValues(alpha: 0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.sage.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        children: [
          const Icon(Icons.eco, size: 36, color: AppColors.sage),
          const SizedBox(height: 8),
          Text(
            '${result.emissions.toStringAsFixed(1)} ${result.unit}',
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _getResultDescription(result),
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          _buildComparisonRow(result.emissions),
        ],
      ),
    );
  }

  String _getResultDescription(EmissionResult result) {
    if (result.mode != null && result.distance != null) {
      return '${result.mode} · ${result.distance!.toStringAsFixed(0)} km';
    }
    if (result.type != null && result.nights != null) {
      return '${result.type} · ${result.nights} night${result.nights! > 1 ? "s" : ""}';
    }
    if (result.mealType != null && result.numberOfMeals != null) {
      return '${result.mealType} · ${result.numberOfMeals} meal${result.numberOfMeals! > 1 ? "s" : ""}';
    }
    return 'Carbon emissions estimate';
  }

  Widget _buildComparisonRow(double emissions) {
    final treeDays = (emissions / 0.06).round();
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.park, size: 16, color: Colors.green),
          const SizedBox(width: 6),
          Text(
            'Equivalent to $treeDays tree-days of absorption',
            style: const TextStyle(fontSize: 12, color: Colors.green),
          ),
        ],
      ),
    );
  }

  Widget _buildFallbackInfo() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Colors.blue.shade700),
              const SizedBox(width: 8),
              Text(
                'Emission Factors',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: Colors.blue.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _factorRow('Flight', '255g CO2/km per passenger'),
          _factorRow('Train', '41g CO2/km per passenger'),
          _factorRow('Bus', '89g CO2/km per passenger'),
          _factorRow('Car', '171g CO2/km per passenger'),
          _factorRow('Hotel', '25kg CO2 per night'),
        ],
      ),
    );
  }

  Widget _factorRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 60,
            child: Text(label,
                style: TextStyle(fontSize: 12, color: Colors.blue.shade600)),
          ),
          Text(value,
              style: TextStyle(fontSize: 12, color: Colors.blue.shade800)),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, size: 20),
      isDense: true,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );
  }
}
