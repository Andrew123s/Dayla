import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:dayla_flutter/features/auth/application/providers/notification_providers.dart';

import 'breakpoints.dart';

/// Bottom navigation shell matching the web app’s primary sections.
/// Uses [NavigationBar] on narrow viewports and [NavigationRail] on tablet/web.
/// The Profile tab carries the live unread-notification badge.
class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const _destinations = [
    _NavSpec(
      label: 'Dashboard',
      icon: Icons.dashboard_outlined,
      selectedIcon: Icons.dashboard,
    ),
    _NavSpec(
      label: 'Community',
      icon: Icons.groups_outlined,
      selectedIcon: Icons.groups,
    ),
    _NavSpec(
      label: 'Chat',
      icon: Icons.chat_bubble_outline,
      selectedIcon: Icons.chat_bubble,
    ),
    _NavSpec(
      label: 'Profile',
      icon: Icons.person_outline,
      selectedIcon: Icons.person,
    ),
  ];

  void _onDestinationSelected(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  Widget _icon(_NavSpec spec, {required bool selected, required int badge}) {
    final icon = Icon(selected ? spec.selectedIcon : spec.icon);
    if (spec.label == 'Profile' && badge > 0) {
      return Badge(label: Text('$badge'), child: icon);
    }
    return icon;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unread = ref.watch(unreadNotificationCountProvider);

    return LayoutBuilder(
      builder: (context, constraints) {
        final useRail = constraints.maxWidth >= Breakpoints.tablet;
        if (useRail) {
          return Scaffold(
            body: Row(
              children: [
                NavigationRail(
                  selectedIndex: navigationShell.currentIndex,
                  onDestinationSelected: _onDestinationSelected,
                  labelType: NavigationRailLabelType.all,
                  destinations: [
                    for (final d in _destinations)
                      NavigationRailDestination(
                        icon: _icon(d, selected: false, badge: unread),
                        selectedIcon:
                            _icon(d, selected: true, badge: unread),
                        label: Text(d.label),
                      ),
                  ],
                ),
                const VerticalDivider(width: 1),
                Expanded(child: navigationShell),
              ],
            ),
          );
        }
        return Scaffold(
          body: navigationShell,
          bottomNavigationBar: NavigationBar(
            selectedIndex: navigationShell.currentIndex,
            onDestinationSelected: _onDestinationSelected,
            destinations: [
              for (final d in _destinations)
                NavigationDestination(
                  icon: _icon(d, selected: false, badge: unread),
                  selectedIcon: _icon(d, selected: true, badge: unread),
                  label: d.label,
                ),
            ],
          ),
        );
      },
    );
  }
}

class _NavSpec {
  const _NavSpec({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}
