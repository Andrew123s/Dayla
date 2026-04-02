/**
 * Tab stacks are imported statically (not React.lazy). React Native does not
 * support React.lazy/Suspense for screen bundles the way web React does; lazy
 * loading here is handled by React Navigation: a tab’s stack mounts when that
 * tab is first focused, which is the standard RN pattern for deferring work.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import ChatStack from './ChatStack';
import CommunityStack from './CommunityStack';
import DashboardStack from './DashboardStack';
import PackingStack from './PackingStack';
import ProfileStack from './ProfileStack';

export type MainTabParamList = {
  Dashboard: undefined;
  Community: undefined;
  Chat: undefined;
  Packing: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabBarStyle = {
  backgroundColor: '#fff',
  borderTopColor: '#f5f5f4',
  borderTopWidth: 1,
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3a5a40',
        tabBarInactiveTintColor: '#a8a29e',
        tabBarStyle,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🌍</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Packing"
        component={PackingStack}
        options={{
          tabBarLabel: 'Packing',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🎒</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
