import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

export type DashboardStackParamList = {
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#fff' as const },
  headerTintColor: '#3a5a40',
  headerTitleStyle: { fontWeight: 'bold' as const },
  headerShadowVisible: false,
};

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'My Plans' }}
      />
    </Stack.Navigator>
  );
}
