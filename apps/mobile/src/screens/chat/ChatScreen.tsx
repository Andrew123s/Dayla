import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { authFetch } from '../../services/api';

type ChatNav = {
  Chat: { conversationId: string; title?: string };
};

type ChatScreenProps = {
  route: RouteProp<ChatNav, 'Chat'>;
  navigation: NativeStackNavigationProp<ChatNav, 'Chat'>;
};

const colors = {
  primary: '#3a5a40',
  sageLight: '#a3b18a',
  bg: '#f5f5f4',
  text: '#44403c',
  muted: '#a8a29e',
  white: '#ffffff',
  bubbleIn: '#e7e5e4',
  error: '#b91c1c',
};

type Message = {
  _id: string;
  content?: string;
  createdAt?: string;
  sender?: { _id?: string; name?: string };
};

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { conversationId } = route.params;
  const { user } = useAuth();
  const myId = String(user?.id ?? user?._id ?? '');

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch(
        `/api/chat/conversations/${conversationId}/messages`
      );
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { messages?: Message[] };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load messages');
      }
      setMessages(json.data?.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadMessages();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadMessages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await authFetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content: text, messageType: 'text' }),
        }
      );
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { message?: Message };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to send');
      }
      const newMsg = json.data?.message;
      if (newMsg) {
        setMessages((prev) => [newMsg, ...prev]);
      } else {
        await loadMessages();
      }
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const sid = String(item.sender?._id ?? '');
    const isMine = sid === myId && myId !== '';
    return (
      <View
        style={[
          styles.bubbleWrap,
          isMine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
            ]}
          >
            {item.content ?? ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.bannerError}>{error}</Text> : null}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            inverted
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={send}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.sendLabel}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  back: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: '600',
  },
  bannerError: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  bubbleWrap: {
    marginBottom: 8,
    maxWidth: '100%',
  },
  bubbleWrapMine: {
    alignSelf: 'flex-end',
  },
  bubbleWrapTheirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
  },
  bubbleTheirs: {
    backgroundColor: colors.bubbleIn,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  bubbleTextTheirs: {
    color: colors.text,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.sageLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendLabel: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
