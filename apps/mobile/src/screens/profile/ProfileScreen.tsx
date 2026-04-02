import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

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

export default function ProfileScreen() {
  const { user, logout, refreshUser, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } catch (e) {
      Alert.alert(
        'Logout failed',
        e instanceof Error ? e.message : 'Try again'
      );
    } finally {
      setBusy(false);
    }
  };

  const onEditPlaceholder = () => {
    Alert.alert('Edit profile', 'Profile editing will be available soon.');
  };

  const initial = (user?.name ?? '?').charAt(0).toUpperCase();

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name ?? 'Traveler'}</Text>
          {user?.email ? (
            <Text style={styles.email}>{user.email}</Text>
          ) : null}
          <Text style={styles.bio}>
            {user?.bio?.trim()
              ? user.bio
              : 'Add a short bio to tell others about your adventures.'}
          </Text>
          {user?.interests && user.interests.length > 0 ? (
            <View style={styles.tags}>
              {user.interests.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedHint}>No interests listed yet.</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.tripCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.friendCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.postCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={async () => {
            try {
              await refreshUser();
            } catch (e) {
              Alert.alert(
                'Refresh failed',
                e instanceof Error ? e.message : 'Try again'
              );
            }
          }}
        >
          <Text style={styles.secondaryBtnText}>Refresh stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={onEditPlaceholder}
          activeOpacity={0.85}
        >
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, busy && styles.logoutDisabled]}
          onPress={onLogout}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.logoutText}>Log out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: colors.sageLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  mutedHint: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e7e5e4',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  secondaryBtnText: {
    color: colors.sage,
    fontSize: 15,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  editBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
