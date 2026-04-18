import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dayla')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Explore together',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go(RoutePaths.dashboard),
                child: const Text('Continue to app'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.push(RoutePaths.verifyEmail),
                child: const Text('Verify email (link flow)'),
              ),
              OutlinedButton(
                onPressed: () => context.push(RoutePaths.invitation),
                child: const Text('Board invitation'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
