import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _currentStep = 0;
  final _controller = PageController();

  static const _steps = [
    _OnboardingStep(
      title: 'Welcome to Dayla!',
      subtitle: 'Your adventure planning companion',
      description:
          'Plan, explore, and connect with fellow outdoor enthusiasts in one beautiful app.',
      icon: Icons.dashboard_outlined,
      gradientStart: AppColors.primary,
      gradientEnd: Color(0xFF588157),
    ),
    _OnboardingStep(
      title: 'Plan Your Adventures',
      subtitle: 'Visual planning made easy',
      description:
          'Drag and drop notes, add photos, record voice memos, and create your perfect trip itinerary.',
      icon: Icons.add_circle_outline,
      gradientStart: Color(0xFF588157),
      gradientEnd: AppColors.sage,
      features: [
        'Sticky notes for ideas',
        'Photo uploads from your trips',
        'Voice recordings',
        'Budget tracking',
      ],
    ),
    _OnboardingStep(
      title: 'Discover New Trails',
      subtitle: 'Connect with the community',
      description:
          'See posts from fellow explorers, save locations, and get inspired for your next adventure.',
      icon: Icons.explore_outlined,
      gradientStart: AppColors.sage,
      gradientEnd: AppColors.sand,
      features: [
        'Community posts',
        'Location saving',
        'Trail inspiration',
        'Eco-friendly tips',
      ],
    ),
    _OnboardingStep(
      title: 'Chat & Collaborate',
      subtitle: 'Plan together with friends',
      description:
          'Invite friends to chat, share trip details, and collaborate on adventure planning.',
      icon: Icons.chat_outlined,
      gradientStart: AppColors.sand,
      gradientEnd: Color(0xFFFAEDCD),
      features: [
        'Group chats',
        'Photo sharing',
        'Voice messages',
        'Location pins',
      ],
    ),
    _OnboardingStep(
      title: 'Your Profile',
      subtitle: 'Track your outdoor journey',
      description:
          'Manage your trips, view your eco-impact, and showcase your favorite outdoor activities.',
      icon: Icons.person_outline,
      gradientStart: Color(0xFFFAEDCD),
      gradientEnd: Color(0xFFFEFAE0),
      features: [
        'Trip history',
        'Eco-score tracking',
        'Achievement badges',
        'Personal preferences',
      ],
    ),
  ];

  void _next() {
    if (_currentStep < _steps.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutCubic,
      );
    } else {
      ref.read(authSessionProvider.notifier).completeOnboarding();
    }
  }

  void _skip() {
    ref.read(authSessionProvider.notifier).completeOnboarding();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authSessionProvider);
    final userName = authState.user?.name.split(' ').first ?? '';
    final progress = (_currentStep + 1) / _steps.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Text(
                        'D',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dayla',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        'Welcome, $userName!',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  if (_currentStep < _steps.length - 1)
                    TextButton(
                      onPressed: _skip,
                      child: Text(
                        'Skip',
                        style: TextStyle(color: Colors.grey.shade500),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: Colors.grey.shade200,
                      valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(_steps.length, (i) {
                      return Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: i <= _currentStep
                              ? AppColors.primary
                              : Colors.grey.shade300,
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _currentStep = i),
                itemCount: _steps.length,
                itemBuilder: (context, index) {
                  final step = _steps[index];
                  return _buildStep(step);
                },
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                12,
                20,
                MediaQuery.paddingOf(context).bottom + 16,
              ),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton(
                  onPressed: _next,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_currentStep == _steps.length - 1) ...[
                        const Icon(Icons.check_circle, size: 22),
                        const SizedBox(width: 8),
                        const Text('Get Started'),
                      ] else ...[
                        const Text('Continue'),
                        const SizedBox(width: 8),
                        const Icon(Icons.chevron_right, size: 22),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep(_OnboardingStep step) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [step.gradientStart, step.gradientEnd],
              ),
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: step.gradientStart.withValues(alpha: 0.3),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(step.icon, size: 72, color: AppColors.sage),
                const SizedBox(height: 20),
                Text(
                  step.title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  step.subtitle,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  step.description,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.8),
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          if (step.features != null) ...[
            const SizedBox(height: 20),
            ...step.features!.map((feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle,
                            size: 20, color: Colors.green.shade500),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            feature,
                            style: TextStyle(
                              color: Colors.grey.shade700,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )),
          ],
        ],
      ),
    );
  }
}

class _OnboardingStep {
  const _OnboardingStep({
    required this.title,
    required this.subtitle,
    required this.description,
    required this.icon,
    required this.gradientStart,
    required this.gradientEnd,
    this.features,
  });

  final String title;
  final String subtitle;
  final String description;
  final IconData icon;
  final Color gradientStart;
  final Color gradientEnd;
  final List<String>? features;
}
