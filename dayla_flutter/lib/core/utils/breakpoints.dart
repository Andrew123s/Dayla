import 'package:flutter/material.dart';

/// Layout breakpoints for mobile / tablet / web (Architecture Guidelines — Responsiveness).
abstract final class Breakpoints {
  static const double mobile = 600;
  static const double tablet = 1024;

  static bool isMobileWidth(double width) => width < mobile;
  static bool isTabletWidth(double width) => width >= mobile && width < tablet;
  static bool isDesktopWidth(double width) => width >= tablet;

  static bool isMobile(BuildContext context) =>
      isMobileWidth(MediaQuery.sizeOf(context).width);
}
