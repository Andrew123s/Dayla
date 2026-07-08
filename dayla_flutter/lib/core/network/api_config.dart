/// Backend base URL. Defaults to the production API so installed builds work
/// out of the box; override for local development, e.g.
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3005` (Android
/// emulator) or `http://localhost:3005` (iOS simulator).
abstract final class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://dayla.onrender.com',
  );
}
