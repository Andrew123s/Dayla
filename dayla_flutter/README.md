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

**Subscriptions in stores** — the current upgrade flow opens Stripe Checkout in
the browser. Apple (and Google, for apps distributed on Play) require digital
subscriptions to use their in-app purchase systems; before submission, either
integrate `in_app_purchase` (RevenueCat makes cross-platform + Stripe sync easier)
or hide the upgrade button on the store builds and treat Pro as web-managed.

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
