import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TripDetailScreen from '../screens/dashboard/TripDetailScreen';
import WeatherScreen from '../screens/dashboard/weather/WeatherScreen';
import CarbonScreen from '../screens/dashboard/carbon/CarbonScreen';
import CanvasScreen from '../screens/dashboard/canvas/CanvasScreen';
import PackingScreen from '../screens/packing/PackingScreen';

export type DashboardStackParamList = {
  Dashboard: undefined;
  TripDetail: {
    tripId: string;
    tripName: string;
    dashboardId?: string;
    destination?: string;
  };
  Weather: { location: string; tripName?: string };
  Carbon: { tripName?: string };
  Canvas: { dashboardId: string; tripName?: string };
  TripPacking: { tripId: string; tripName?: string };
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
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={({ route }) => ({ title: route.params.tripName })}
      />
      <Stack.Screen
        name="Weather"
        component={WeatherScreen}
        options={{ title: 'Weather' }}
      />
      <Stack.Screen
        name="Carbon"
        component={CarbonScreen}
        options={{ title: 'Carbon Footprint' }}
      />
      <Stack.Screen
        name="Canvas"
        component={CanvasScreen}
        options={{ title: 'Planning Board' }}
      />
      <Stack.Screen
        name="TripPacking"
        component={PackingScreen}
        options={{ title: 'Ntelipak' }}
      />
    </Stack.Navigator>
  );
}
