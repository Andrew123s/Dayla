import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  Chat: { conversationId: string; title?: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: '#fff' as const },
  headerTintColor: '#3a5a40',
  headerTitleStyle: { fontWeight: 'bold' as const },
  headerShadowVisible: false,
};

export default function ChatStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.title ?? 'Chat',
        })}
      />
    </Stack.Navigator>
  );
}
