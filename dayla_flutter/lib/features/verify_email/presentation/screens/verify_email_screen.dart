import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_providers.dart';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  bool _loading = false;
  String? _message;
  bool _success = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _verifyFromUrl());
  }

  Future<void> _verifyFromUrl() async {
    final token = GoRouterState.of(context).uri.queryParameters['token'];
    if (token == null || token.isEmpty) return;
    setState(() => _loading = true);
    final repo = ref.read(authRepositoryProvider);
    final response = await repo.verifyEmail(token);
    setState(() {
      _loading = false;
      _success = response.success;
      _message = response.message;
    });
  }

  @override
  Widget build(BuildContext context) {
    final token = GoRouterState.of(context).uri.queryParameters['token'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Verify Email')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _success ? Icons.check_circle : Icons.mark_email_read_outlined,
                  size: 64,
                  color: _success ? Colors.green : AppColors.primary,
                ),
                const SizedBox(height: 20),
                Text(
                  _success ? 'Email Verified!' : 'Confirm Your Email',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                if (_loading)
                  const Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(),
                  )
                else if (_message != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _success
                          ? Colors.green.withValues(alpha: 0.1)
                          : Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _success
                            ? Colors.green.withValues(alpha: 0.3)
                            : Colors.red.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Text(
                      _message!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _success ? Colors.green.shade700 : Colors.red.shade700,
                      ),
                    ),
                  ),
                ] else if (token == null || token.isEmpty)
                  Text(
                    'Open the verification link from your email to confirm your account.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                    onPressed: () => context.go(RoutePaths.auth),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(_success ? 'Sign In' : 'Back to Login'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
