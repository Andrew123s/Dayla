import 'package:dio/dio.dart';

class BillingRemoteDatasource {
  BillingRemoteDatasource(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>> getPlans() async {
    final response = await _dio.get('/api/billing/plans');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSubscription() async {
    final response = await _dio.get('/api/billing/subscription');
    return response.data as Map<String, dynamic>;
  }

  /// Returns a Stripe Checkout URL to open in the browser.
  Future<Map<String, dynamic>> createCheckoutSession(String cycle) async {
    final response = await _dio.post(
      '/api/billing/create-checkout-session',
      data: {'cycle': cycle},
    );
    return response.data as Map<String, dynamic>;
  }

  /// Returns a Stripe Customer Portal URL (manage/cancel subscription).
  Future<Map<String, dynamic>> createCustomerPortal() async {
    final response = await _dio.post('/api/billing/customer-portal');
    return response.data as Map<String, dynamic>;
  }
}
