/// Backend base URL (matches Vite proxy / mobile `EXPO_PUBLIC_API_URL` conventions).
/// Override via `--dart-define=API_BASE_URL=https://example.com` for release builds.
abstract final class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3005',
  );
}
