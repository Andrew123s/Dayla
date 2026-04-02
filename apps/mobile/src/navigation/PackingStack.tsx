import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PackingScreen from '../screens/packing/PackingScreen';

export type PackingStackParamList = {
  Packing: undefined;
};

const Stack = createNativeStackNavigator<PackingStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#fff' as const },
  headerTintColor: '#3a5a40',
  headerTitleStyle: { fontWeight: 'bold' as const },
  headerShadowVisible: false,
};

export default function PackingStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Packing"
        component={PackingScreen}
        options={{ title: 'Ntelipak' }}
      />
    </Stack.Navigator>
  );
}
