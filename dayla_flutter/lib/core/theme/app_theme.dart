import 'package:flutter/material.dart';

import 'package:dayla_flutter/core/theme/app_colors.dart';

/// Material 3 theme derived from web branding (Quicksand on web → system UI here).
abstract final class AppTheme {
  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
      surface: AppColors.background,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: AppBarTheme(
        centerTitle: true,
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: colorScheme.surface,
        indicatorColor: AppColors.sage.withValues(alpha: 0.35),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      ),
      textTheme: _textTheme(colorScheme),
    );
  }

  static TextTheme _textTheme(ColorScheme scheme) {
    const base = TextTheme(
      displayLarge: TextStyle(fontWeight: FontWeight.w600, letterSpacing: -0.5),
      displayMedium: TextStyle(fontWeight: FontWeight.w600, letterSpacing: -0.25),
      titleLarge: TextStyle(fontWeight: FontWeight.w600),
      titleMedium: TextStyle(fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontWeight: FontWeight.w500, height: 1.35),
      bodyMedium: TextStyle(fontWeight: FontWeight.w500, height: 1.35),
      labelLarge: TextStyle(fontWeight: FontWeight.w600),
    );
    return base.apply(
      bodyColor: scheme.onSurface,
      displayColor: scheme.onSurface,
    );
  }
}
