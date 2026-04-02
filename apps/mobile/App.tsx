import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import {
  registerForPushNotifications,
  setupNotificationListeners,
} from './src/services/notifications';
import { authFetch } from './src/services/api';

function RootNavigator() {
  const { user, loading } = useAuth();
  const notifCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        try {
          await authFetch('/api/auth/push-token', {
            method: 'POST',
            body: JSON.stringify({ pushToken: token }),
          });
        } catch {
          /* backend may not support this yet */
        }
      }
    })();

    notifCleanup.current = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification.request.content.title);
      },
      (response) => {
        console.log('Notification tapped:', response.notification.request.content.data);
      },
    );

    return () => {
      notifCleanup.current?.();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3a5a40" />
      </View>
    );
  }

  return user ? <TabNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f3ee',
  },
});
