import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Registers for push notifications, requests permissions, and returns the Expo push token.
 * On simulators and non-device environments, logs a short message and returns null.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn(
      '[notifications] Push notifications require a physical device; skipping registration.'
    );
    return null;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn(
        '[notifications] Notification permission not granted; cannot obtain push token.'
      );
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync();
    return tokenResult.data;
  } catch (err) {
    console.warn(
      '[notifications] Failed to register for push notifications:',
      err
    );
    return null;
  }
}

/**
 * Configures foreground notification behavior and subscribes to received / response events.
 * Returns a cleanup function that removes listeners (handler stays global until app reload).
 */
export function setupNotificationListeners(
  onNotification: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void
): () => void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const receivedSub = Notifications.addNotificationReceivedListener(
    onNotification
  );
  const responseSub =
    Notifications.addNotificationResponseReceivedListener(onResponse);

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
