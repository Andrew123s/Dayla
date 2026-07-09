# Dayla — Flutter (Android & iOS)

The native mobile client for **Dayla**, the collaborative eco-travel planning app.
It talks to the same Express backend as the web app (`backend/`) and mirrors its
features: trips & plan boards, budget, weather, Ntelipak smart packing, carbon
footprint (Climatiq), Piko Trails, community feed, chat, and profile.

## Structure

Feature-first + clean architecture (see `docs/Architecture Guidelines.md`):

```
lib/
  core/            # theme, routing (go_router), Dio client, socket, storage
  features/
    auth/          # login, register, onboarding, session
    dashboard/     # trips, plan boards, budget, weather
    packing/       # Ntelipak smart packing
    climatiq/      # carbon footprint
    piko/          # Piko Trails — discover, saved, route detail, add-to-plan
    community/     # posts, likes, comments
    chat/          # conversations, real-time messages
    profile/       # profile & settings
```

State: Riverpod (`AsyncNotifierProvider`). Models: freezed + json_serializable.

## Running

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # after model changes

# By default the app talks to production: https://dayla.onrender.com
flutter run

# Local backend instead (backend/ on port 3005):
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3005    # Android emulator
flutter run --dart-define=API_BASE_URL=http://localhost:3005   # iOS simulator
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3005 # physical device
```

`API_BASE_URL` defaults to `https://dayla.onrender.com` (see `lib/core/network/api_config.dart`).

## Builds

```bash
# Production API (https://dayla.onrender.com) is the default — no flags needed.
flutter build apk --release
flutter build appbundle --release   # Play Store
flutter build ipa --release        # macOS only
```

Android cleartext HTTP is enabled for local development; production should use HTTPS.

## Store readiness

**Branding** — app icons (Android adaptive + iOS set) and the launch splash are
generated from the Dayla badge (`assets/icons/`). Regenerate after changing them:
`dart run flutter_launcher_icons && dart run flutter_native_splash:create`.

**Android release signing** — the app id is `com.dayla.app`. Create a keystore
once, then `android/key.properties` (gitignored):

```
keytool -genkey -v -keystore dayla-release.keystore -alias dayla -keyalg RSA -keysize 2048 -validity 10000
```

```properties
storeFile=../dayla-release.keystore
storePassword=...
keyAlias=dayla
keyPassword=...
```

Without `key.properties`, release builds fall back to debug signing (fine for
testing, not for the Play Store).

**iOS** — building/signing requires a Mac with Xcode: open `ios/Runner.xcworkspace`,
set your Team + bundle id (e.g. `com.dayla.app`), then `flutter build ipa`.
Permissions strings are already in `Info.plist`.

**Subscriptions in stores (RevenueCat)** — integrated but dormant until API
keys exist. The pricing screen automatically uses Google Play / App Store
billing when the app is built with RevenueCat keys, and falls back to the
web's Stripe checkout otherwise. Backend sync happens via
`POST /api/billing/revenuecat-webhook`.

Once the Play Console is active:

1. Create a [RevenueCat](https://app.revenuecat.com) project → add the
   **Google Play** app (`com.dayla.app`) with a Play service-account JSON.
2. In Play Console → Monetize → Subscriptions: create products
   `dayla_pro_monthly` (€15/mo) and `dayla_pro_annual` (€180/yr).
3. In RevenueCat: import both products, create an entitlement named **`pro`**,
   attach the products, and put them in the **default offering** (the app
   picks `offering.monthly` / `offering.annual`).
4. RevenueCat → Project settings → Webhooks: URL
   `https://dayla.onrender.com/api/billing/revenuecat-webhook`, and set an
   Authorization header value; put the same value in Render env as
   `REVENUECAT_WEBHOOK_AUTH`.
5. Build the store bundle with the public SDK key:
   `flutter build appbundle --release --dart-define=REVENUECAT_ANDROID_KEY=goog_xxxx`
   (iOS later: `--dart-define=REVENUECAT_IOS_KEY=appl_xxxx`.)

Without the `--dart-define` keys the whole flow is a no-op and Stripe is used —
fine for sideloaded builds, **not allowed on Play**, so always pass the key for
store uploads.

## Play Store submission

1. **One-time**: [Play Console](https://play.google.com/console) account
   ($25) → Create app → name "Dayla", App, Free. App id `com.dayla.app` is
   read from the bundle.
2. **Build**: `flutter build appbundle --release` (plus the RevenueCat
   `--dart-define` above) → upload
   `build/app/outputs/bundle/release/app-release.aab`.
3. **Listing**: descriptions, ≥2 phone screenshots, 512×512 icon
   (`assets/icons/app_icon.png`), 1024×500 feature graphic, privacy policy
   URL (`https://daylapp.com/privacy`).
4. **Data safety**: declares email/name (account), photos (user content),
   location (trail recording), data encrypted in transit.
5. **Content rating** questionnaire (has UGC + chat).
6. **App access**: provide a test account (email + password) since login is
   required.
7. **Internal testing** first, then Production → roll out. First review
   takes ~3–7 days.

**Push notifications (FCM)** — implemented end-to-end:

- App: `firebase_core` + `firebase_messaging`; the device token is registered
  on login (`POST /api/auth/push-token`) and removed on logout. Android reads
  `android/app/google-services.json` (in place, package `com.dayla.app`).
- Backend: `backend/services/push.service.js` sends pushes wherever the
  Socket.io `notification:new` events fire (likes, comments, friend requests,
  board joins, chat messages). **Required env on the deployed backend**:
  `FIREBASE_SERVICE_ACCOUNT` = the service-account JSON string (Firebase
  console → Project settings → Service accounts → Generate new private key),
  or `FIREBASE_SERVICE_ACCOUNT_PATH` = path to that file. Without it, push
  sending silently no-ops (sockets still work).
- iOS: still needs `GoogleService-Info.plist` in `ios/Runner` plus an APNs
  key uploaded to Firebase and the Push Notifications capability in Xcode
  (requires a Mac).
