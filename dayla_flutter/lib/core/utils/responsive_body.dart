import 'package:flutter/material.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';

import 'breakpoints.dart';

/// Horizontally constrained, padded content for mobile / tablet / web viewports.
class ResponsiveBody extends StatelessWidget {
  const ResponsiveBody({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final pad = switch (width) {
          < Breakpoints.mobile => 16.0,
          < Breakpoints.tablet => 24.0,
          _ => 32.0,
        };
        final maxContent = switch (width) {
          < Breakpoints.mobile => width,
          < Breakpoints.tablet => 720.0,
          _ => 1040.0,
        };
        return Align(
          alignment: Alignment.topCenter,
          child: SingleChildScrollView(
            padding: EdgeInsets.all(pad),
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxContent),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.sage.withValues(alpha: 0.35),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: child,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
