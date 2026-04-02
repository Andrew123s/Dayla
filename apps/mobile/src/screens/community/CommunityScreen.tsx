import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

type PostAuthor = {
  _id?: string;
  name?: string;
  avatar?: string | null;
};

type CommunityPost = {
  _id: string;
  content: string;
  images?: { url: string }[];
  author?: PostAuthor;
  likeCount?: number;
  comments?: unknown[];
  liked?: boolean;
};

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch('/api/community/posts');
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { posts?: CommunityPost[] };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load posts');
      }
      setPosts(json.data?.posts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadPosts();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const toggleLike = async (post: CommunityPost) => {
    try {
      const res = await authFetch(`/api/community/posts/${post._id}/likes`, {
        method: 'POST',
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { liked?: boolean; likeCount?: number };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Could not update like');
      }
      const liked = json.data?.liked;
      const likeCount = json.data?.likeCount;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? {
                ...p,
                ...(liked !== undefined ? { liked } : {}),
                ...(likeCount !== undefined ? { likeCount } : {}),
              }
            : p
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Like failed');
    }
  };

  const renderItem = ({ item }: { item: CommunityPost }) => {
    const author = item.author;
    const initial = (author?.name ?? '?').charAt(0).toUpperCase();
    const commentCount = Array.isArray(item.comments)
      ? item.comments.length
      : 0;
    const likeCount = item.likeCount ?? 0;
    const imageUrl = item.images?.[0]?.url;

    return (
      <View style={styles.card}>
        <View style={styles.authorRow}>
          {author?.avatar ? (
            <Image
              source={{ uri: author.avatar }}
              style={styles.avatarImg}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
          )}
          <Text style={styles.authorName}>{author?.name ?? 'Someone'}</Text>
        </View>
        <Text style={styles.content}>{item.content}</Text>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.postImage} />
        ) : null}
        <View style={styles.metaRow}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => toggleLike(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.likeIcon,
                item.liked && { color: colors.error },
              ]}
            >
              ♥
            </Text>
            <Text style={styles.metaText}>{likeCount}</Text>
          </TouchableOpacity>
          <Text style={styles.metaText}>{commentCount} comments</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      {error ? <Text style={styles.bannerError}>{error}</Text> : null}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={
            posts.length === 0 ? styles.emptyList : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No posts yet. Be the first to share!
            </Text>
          }
        />
      )}
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
    paddingBottom: 24,
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
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#e7e5e4',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 20,
    color: colors.muted,
  },
  metaText: {
    fontSize: 14,
    color: colors.muted,
  },
});
