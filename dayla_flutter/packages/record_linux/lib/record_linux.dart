import 'package:record_platform_interface/record_platform_interface.dart';

/// Stub: audio recording is not supported on Linux in this app.
/// `noSuchMethod` satisfies the (evolving) platform interface without having
/// to track its abstract members — any call throws [UnsupportedError].
class RecordLinux extends RecordPlatform {
  static void registerWith() {
    RecordPlatform.instance = RecordLinux();
  }

  @override
  dynamic noSuchMethod(Invocation invocation) {
    throw UnsupportedError('Audio recording is not supported on Linux.');
  }
}
