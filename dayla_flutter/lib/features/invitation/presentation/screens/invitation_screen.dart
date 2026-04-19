import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';

import 'package:dayla_flutter/core/constants/route_paths.dart';
import 'package:dayla_flutter/core/theme/app_colors.dart';
import 'package:dayla_flutter/core/network/dio_provider.dart';
import 'package:dayla_flutter/features/auth/application/providers/auth_session_provider.dart';

class InvitationScreen extends ConsumerStatefulWidget {
  const InvitationScreen({super.key});

  @override
  ConsumerState<InvitationScreen> createState() => _InvitationScreenState();
}

class _InvitationScreenState extends ConsumerState<InvitationScreen> {
  _InviteStatus _status = _InviteStatus.loading;
  String _message = '';
  String? _dashboardName;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _handleInvitation());
  }

  Future<void> _handleInvitation() async {
    final invitationId =
        GoRouterState.of(context).uri.queryParameters['invitationId'];
    if (invitationId == null || invitationId.isEmpty) {
      setState(() {
        _status = _InviteStatus.error;
        _message = 'No invitation ID provided.';
      });
      return;
    }

    final auth = ref.read(authSessionProvider);
    if (auth.status != AuthStatus.authenticated) {
      setState(() {
        _status = _InviteStatus.loginRequired;
        _message = 'Please log in to accept this invitation';
      });
      return;
    }

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post(
        '/api/boards/invitations/$invitationId/accept',
      );
      final data = response.data as Map<String, dynamic>;
      if (data['success'] == true) {
        setState(() {
          _status = _InviteStatus.success;
          _message = (data['message'] as String?) ??
              'Invitation accepted successfully!';
          _dashboardName =
              (data['data']?['dashboard']?['name'] as String?) ??
                  'the dashboard';
        });
        await Future.delayed(const Duration(seconds: 3));
        if (mounted) context.go(RoutePaths.dashboard);
      } else {
        setState(() {
          _status = _InviteStatus.error;
          _message = (data['message'] as String?) ??
              'Failed to accept invitation.';
        });
      }
    } on DioException catch (e) {
      final msg = (e.response?.data is Map)
          ? (e.response!.data as Map)['message'] as String?
          : null;
      setState(() {
        _status = _InviteStatus.error;
        _message =
            msg ?? 'Failed to accept invitation. The link may be invalid or expired.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: AppColors.primary,
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: const Icon(Icons.eco, size: 56, color: AppColors.sage),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Dayla',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'Dashboard Invitation',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 24),
                          _buildContent(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    return switch (_status) {
      _InviteStatus.loading => Column(
          children: [
            const SizedBox(
              width: 44,
              height: 44,
              child: CircularProgressIndicator(
                color: AppColors.sage,
                strokeWidth: 3,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Accepting invitation...',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.8)),
            ),
          ],
        ),
      _InviteStatus.loginRequired => Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16),
                border:
                    Border.all(color: Colors.amber.withValues(alpha: 0.3)),
              ),
              child: Text(
                _message,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.amber.shade200),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton(
                onPressed: () => context.go(RoutePaths.auth),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.sage,
                  foregroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'Go to Login',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      _InviteStatus.success => Column(
          children: [
            Icon(Icons.check_circle, size: 48, color: Colors.green.shade400),
            const SizedBox(height: 12),
            Text(
              _message,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.green.shade200),
            ),
            if (_dashboardName != null) ...[
              const SizedBox(height: 8),
              Text(
                'You now have access to "$_dashboardName"',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.8),
                  fontSize: 13,
                ),
              ),
            ],
            const SizedBox(height: 12),
            Text(
              'Redirecting to dashboard...',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.6),
                fontSize: 12,
              ),
            ),
          ],
        ),
      _InviteStatus.error => Column(
          children: [
            Icon(Icons.cancel, size: 48, color: Colors.red.shade400),
            const SizedBox(height: 12),
            Text(
              _message,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.red.shade200),
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () => context.go(RoutePaths.dashboard),
              child: const Text(
                'Back to Dashboard',
                style: TextStyle(color: AppColors.sage),
              ),
            ),
          ],
        ),
    };
  }
}

enum _InviteStatus { loading, loginRequired, success, error }
