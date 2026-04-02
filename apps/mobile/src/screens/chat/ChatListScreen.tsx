import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { authFetch } from '../../services/api';

const colors = {
  primary: '#3a5a40',
  sage: '#588157',
  sageLight: '#a3b18a',
  bg: '#f5f5f4',
  text: '#44403c',
  muted: '#a8a29e',
  white: '#ffffff',
  error: '#b91c1c',
};

type Participant = {
  user?: { _id?: string; name?: string; avatar?: string | null };
};

type LastMessage = {
  content?: string;
  createdAt?: string;
};

type Conversation = {
  _id: string;
  name?: string;
  isGroup?: boolean;
  participants?: Participant[];
  lastMessage?: LastMessage | null;
  updatedAt?: string;
};

type ChatListScreenProps = {
  navigation: {
    navigate: (
      name: 'Chat',
      params: { conversationId: string; title?: string }
    ) => void;
  };
};

function formatTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ChatListScreen({ navigation }: ChatListScreenProps) {
  const { user } = useAuth();
  const myId = user?.id ?? user?._id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch('/api/chat/conversations');
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { conversations?: Conversation[] };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load conversations');
      }
      setConversations(json.data?.conversations ?? []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to load conversations'
      );
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadConversations();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadConversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const resolveTitle = (c: Conversation): string => {
    if (c.isGroup && c.name) return c.name;
    const others =
      c.participants?.filter(
        (p) =>
          p.user &&
          String(p.user._id ?? '') !== String(myId ?? '')
      ) ?? [];
    const other = others[0]?.user;
    return other?.name ?? c.name ?? 'Chat';
  };

  const resolveAvatar = (c: Conversation): string | null | undefined => {
    const others =
      c.participants?.filter(
        (p) =>
          p.user &&
          String(p.user._id ?? '') !== String(myId ?? '')
      ) ?? [];
    return others[0]?.user?.avatar ?? undefined;
  };

  const onFab = () => {
    Alert.alert('New conversation', 'Composer will open here.');
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const rowTitle = resolveTitle(item);
    const avatar = resolveAvatar(item);
    const initial = rowTitle.charAt(0).toUpperCase();
    const preview = item.lastMessage?.content ?? 'No messages yet';
    const time = formatTime(
      item.lastMessage?.createdAt ?? item.updatedAt
    );

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item._id,
            title: rowTitle,
          })
        }
        activeOpacity={0.75}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>
        )}
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {rowTitle}
            </Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={2}>
            {preview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {error ? <Text style={styles.bannerError}>{error}</Text> : null}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No conversations yet</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={onFab}
        activeOpacity={0.85}
        accessibilityLabel="New conversation"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  bannerError: {
    color: colors.error,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    alignItems: 'center',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.muted,
  },
  preview: {
    fontSize: 14,
    color: colors.muted,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
