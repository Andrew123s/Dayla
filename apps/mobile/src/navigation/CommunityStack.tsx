import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityScreen from '../screens/community/CommunityScreen';

export type CommunityStackParamList = {
  Community: undefined;
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#fff' as const },
  headerTintColor: '#3a5a40',
  headerTitleStyle: { fontWeight: 'bold' as const },
  headerShadowVisible: false,
};

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Community"
        component={CommunityScreen}
        options={{ title: 'Explore' }}
      />
    </Stack.Navigator>
  );
}
