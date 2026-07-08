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

# Start the backend first (backend/ on port 3005), then:
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3005    # Android emulator
flutter run --dart-define=API_BASE_URL=http://localhost:3005   # iOS simulator
flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3005 # physical device
```

`API_BASE_URL` defaults to `http://localhost:3005` (see `lib/core/network/api_config.dart`).

## Builds

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.daylapp.com
flutter build ipa --release --dart-define=API_BASE_URL=https://api.daylapp.com  # macOS only
```

Android cleartext HTTP is enabled for local development; production should use HTTPS.
