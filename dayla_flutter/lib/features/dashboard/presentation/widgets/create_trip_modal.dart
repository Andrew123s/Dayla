import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';

class CreateTripModal extends ConsumerStatefulWidget {
  const CreateTripModal({super.key});

  @override
  ConsumerState<CreateTripModal> createState() => _CreateTripModalState();
}

class _CreateTripModalState extends ConsumerState<CreateTripModal> {
  int _step = 0;
  bool _loading = false;
  String? _error;

  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _destinationController = TextEditingController();
  String _category = 'exploring';
  DateTimeRange? _dateRange;

  static const _categories = [
    ('hiking', 'Hiking', Icons.hiking),
    ('business', 'Business', Icons.business_center),
    ('family', 'Family', Icons.family_restroom),
    ('camping', 'Camping', Icons.cabin),
    ('exploring', 'Exploring', Icons.explore),
    ('beach', 'Beach', Icons.beach_access),
    ('road_trip', 'Road Trip', Icons.directions_car),
    ('cultural', 'Cultural', Icons.museum),
    ('other', 'Other', Icons.travel_explore),
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _destinationController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.trim().isEmpty) {
      setState(() => _error = 'Trip name is required');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    Map<String, String>? dates;
    if (_dateRange != null) {
      dates = {
        'startDate': _dateRange!.start.toIso8601String(),
        'endDate': _dateRange!.end.toIso8601String(),
      };
    }

    final trip = await ref.read(tripsProvider.notifier).createTrip(
          name: _nameController.text.trim(),
          description: _descriptionController.text.trim().isNotEmpty
              ? _descriptionController.text.trim()
              : null,
          category: _category,
          destination: _destinationController.text.trim().isNotEmpty
              ? _destinationController.text.trim()
              : null,
          dates: dates,
        );

    if (mounted) {
      if (trip != null) {
        Navigator.of(context).pop();
      } else {
        setState(() {
          _loading = false;
          _error = 'Failed to create trip. Try again.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.85,
        ),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Create Trip',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            _buildStepIndicator(),
            const SizedBox(height: 20),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _error!,
                    style: TextStyle(color: Colors.red.shade700, fontSize: 13),
                  ),
                ),
              ),
            Flexible(
              child: SingleChildScrollView(
                child: _buildStep(),
              ),
            ),
            const SizedBox(height: 16),
            _buildButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (i) {
        return Container(
          width: i == _step ? 24 : 8,
          height: 8,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          decoration: BoxDecoration(
            color: i <= _step ? AppColors.primary : Colors.grey.shade300,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }

  Widget _buildStep() {
    return switch (_step) {
      0 => _buildNameStep(),
      1 => _buildCategoryStep(),
      _ => _buildDetailsStep(),
    };
  }

  Widget _buildNameStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('What\'s your trip called?',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        TextField(
          controller: _nameController,
          autofocus: true,
          textCapitalization: TextCapitalization.words,
          decoration: InputDecoration(
            hintText: 'e.g. Summer in Bali',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _descriptionController,
          maxLines: 3,
          textCapitalization: TextCapitalization.sentences,
          decoration: InputDecoration(
            hintText: 'Description (optional)',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('What kind of trip?',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: _categories.map((c) {
            final (value, label, icon) = c;
            final selected = _category == value;
            return ChoiceChip(
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon,
                      size: 18,
                      color: selected ? Colors.white : AppColors.primary),
                  const SizedBox(width: 6),
                  Text(label),
                ],
              ),
              selected: selected,
              onSelected: (_) => setState(() => _category = value),
              selectedColor: AppColors.primary,
              labelStyle: TextStyle(
                color: selected ? Colors.white : Colors.grey.shade700,
                fontWeight: FontWeight.w500,
              ),
              side: BorderSide(
                color:
                    selected ? AppColors.primary : Colors.grey.shade300,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDetailsStep() {
    final df = DateFormat('MMM d, yyyy');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Where and when?',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        TextField(
          controller: _destinationController,
          textCapitalization: TextCapitalization.words,
          decoration: InputDecoration(
            hintText: 'Destination (optional)',
            prefixIcon: const Icon(Icons.location_on_outlined),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 16),
        InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () async {
            final picked = await showDateRangePicker(
              context: context,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 730)),
              builder: (context, child) {
                return Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme:
                        Theme.of(context).colorScheme.copyWith(
                              primary: AppColors.primary,
                            ),
                  ),
                  child: child!,
                );
              },
            );
            if (picked != null) setState(() => _dateRange = picked);
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade400),
            ),
            child: Row(
              children: [
                Icon(Icons.date_range, color: Colors.grey.shade600),
                const SizedBox(width: 12),
                Text(
                  _dateRange != null
                      ? '${df.format(_dateRange!.start)} — ${df.format(_dateRange!.end)}'
                      : 'Select dates (optional)',
                  style: TextStyle(
                    color: _dateRange != null
                        ? Colors.grey.shade800
                        : Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildButtons() {
    return Row(
      children: [
        if (_step > 0)
          Expanded(
            child: OutlinedButton(
              onPressed: _loading ? null : () => setState(() => _step--),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Back'),
            ),
          ),
        if (_step > 0) const SizedBox(width: 12),
        Expanded(
          child: FilledButton(
            onPressed: _loading
                ? null
                : () {
                    if (_step < 2) {
                      if (_step == 0 && _nameController.text.trim().isEmpty) {
                        setState(() => _error = 'Trip name is required');
                        return;
                      }
                      setState(() {
                        _step++;
                        _error = null;
                      });
                    } else {
                      _submit();
                    }
                  },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(_step < 2 ? 'Continue' : 'Create Trip'),
          ),
        ),
      ],
    );
  }
}
