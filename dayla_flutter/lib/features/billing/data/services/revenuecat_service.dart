import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

/// RevenueCat in-app purchases (Google Play / App Store).
///
/// Store policy requires digital subscriptions to go through the platform's
/// billing — this replaces the browser Stripe checkout on store builds.
///
/// Entirely inert until API keys are baked in at build time:
///   flutter build appbundle --release \
///     --dart-define=REVENUECAT_ANDROID_KEY=goog_xxx \
///     --dart-define=REVENUECAT_IOS_KEY=appl_xxx
///
/// Setup still pending on the RevenueCat/Play side (see README): create the
/// RevenueCat project, add the Play app, create products
/// `dayla_pro_monthly` / `dayla_pro_annual`, attach them to the `pro`
/// entitlement in the `default` offering, and point the webhook at
/// POST /api/billing/revenuecat-webhook with REVENUECAT_WEBHOOK_AUTH.
abstract final class RevenueCatBilling {
  static const _androidKey = String.fromEnvironment('REVENUECAT_ANDROID_KEY');
  static const _iosKey = String.fromEnvironment('REVENUECAT_IOS_KEY');

  /// The entitlement identifier configured in RevenueCat. Dayla sells one
  /// tier, so ANY active entitlement counts as Pro — this tolerates the
  /// dashboard's entitlement being named 'pro', 'Dayla', or anything else.
  static const proEntitlement = 'pro';

  static bool _hasPro(CustomerInfo info) =>
      info.entitlements.active.isNotEmpty;

  static bool _configured = false;

  static String get _platformKey {
    if (kIsWeb) return '';
    if (Platform.isAndroid) return _androidKey;
    if (Platform.isIOS) return _iosKey;
    return '';
  }

  /// True when an API key for this platform was provided at build time.
  static bool get isAvailable => _platformKey.isNotEmpty;

  /// Configure the SDK for the signed-in Dayla user. `appUserID` is the
  /// Mongo user id so the backend webhook can map events to the user.
  /// Safe to call when unavailable (no-op) or repeatedly (logs in).
  static Future<void> logIn(String userId) async {
    if (!isAvailable) return;
    try {
      if (!_configured) {
        await Purchases.configure(
          PurchasesConfiguration(_platformKey)..appUserID = userId,
        );
        _configured = true;
      } else {
        await Purchases.logIn(userId);
      }
    } catch (e) {
      debugPrint('RevenueCat configure/login skipped: $e');
    }
  }

  static Future<void> logOut() async {
    if (!isAvailable || !_configured) return;
    try {
      await Purchases.logOut();
    } catch (e) {
      debugPrint('RevenueCat logout skipped: $e');
    }
  }

  /// Purchase Pro through the store. Returns true when the `pro`
  /// entitlement is active afterwards. Throws [RevenueCatException] with a
  /// user-readable message on real failures; user cancellation returns false.
  static Future<bool> purchasePro({required bool annual}) async {
    if (!_configured) {
      throw const RevenueCatException(
          'In-app purchases are not set up on this build yet.');
    }
    try {
      final offerings = await Purchases.getOfferings();
      final offering = offerings.current;
      if (offering == null) {
        throw const RevenueCatException(
            'No subscription offering is configured yet.');
      }
      final fallback = offering.availablePackages.isEmpty
          ? null
          : offering.availablePackages.first;
      final package =
          (annual ? offering.annual : offering.monthly) ?? fallback;
      if (package == null) {
        throw const RevenueCatException(
            'No subscription package is available.');
      }
      final result =
          await Purchases.purchase(PurchaseParams.package(package));
      return _hasPro(result.customerInfo);
    } on PlatformException catch (e) {
      final code = PurchasesErrorHelper.getErrorCode(e);
      if (code == PurchasesErrorCode.purchaseCancelledError) return false;
      // The SDK's raw messages ("There is an issue with your configuration…")
      // give the user nothing to act on — translate the common ones.
      switch (code) {
        case PurchasesErrorCode.configurationError:
        case PurchasesErrorCode.productNotAvailableForPurchaseError:
          throw const RevenueCatException(
              'Subscriptions are not available on this install. Make sure '
              'the app was installed from Google Play (testing track) and '
              'your Google account is a licensed tester.');
        case PurchasesErrorCode.offlineConnectionError:
        case PurchasesErrorCode.networkError:
          throw const RevenueCatException(
              'No connection to the store — check your internet and retry.');
        case PurchasesErrorCode.paymentPendingError:
          throw const RevenueCatException(
              'Your payment is pending — Pro activates once it completes.');
        case PurchasesErrorCode.productAlreadyPurchasedError:
          throw const RevenueCatException(
              'You already own Pro — try "Restore purchases".');
        default:
          throw RevenueCatException(e.message ?? 'Purchase failed');
      }
    } catch (e) {
      if (e is RevenueCatException) rethrow;
      throw RevenueCatException('Purchase failed: $e');
    }
  }

  /// Restore previous purchases (store requirement). Returns true when the
  /// pro entitlement is active after restoring.
  static Future<bool> restore() async {
    if (!_configured) return false;
    try {
      final info = await Purchases.restorePurchases();
      return _hasPro(info);
    } catch (e) {
      debugPrint('RevenueCat restore failed: $e');
      return false;
    }
  }
}

class RevenueCatException implements Exception {
  const RevenueCatException(this.message);

  final String message;

  @override
  String toString() => message;
}
