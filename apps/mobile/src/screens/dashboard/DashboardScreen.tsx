import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

/** Trip shape aligned with the Dayla API */
type Trip = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  destination?: {
    name?: string;
    country?: string;
    region?: string;
  };
  status?: string;
  dates?: { startDate?: string; endDate?: string };
  category?: string;
};

function formatDateRange(dates?: Trip['dates']) {
  if (!dates?.startDate && !dates?.endDate) return 'Dates TBD';
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const start = dates.startDate
    ? new Date(dates.startDate).toLocaleDateString(undefined, opts)
    : '?';
  const end = dates.endDate
    ? new Date(dates.endDate).toLocaleDateString(undefined, opts)
    : '?';
  return `${start} – ${end}`;
}

export default function DashboardScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch('/api/trips');
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { trips?: Trip[] };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load trips');
      }
      setTrips(json.data?.trips ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trips');
      setTrips([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadTrips();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadTrips]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [loadTrips]);

  const onFab = () => {
    Alert.alert('Create trip', 'Trip creation will open here.');
  };

  const renderItem = ({ item }: { item: Trip }) => {
    const dest =
      item.destination?.name ||
      item.destination?.region ||
      item.destination?.country ||
      'Destination TBD';
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDest}>{dest}</Text>
        <View style={styles.cardRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.status?.replace(/_/g, ' ') ?? 'planning'}
            </Text>
          </View>
          <Text style={styles.cardDates}>{formatDateRange(item.dates)}</Text>
        </View>
        {item.category ? (
          <Text style={styles.category}>{item.category}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Plans</Text>
      </View>

      {error ? <Text style={styles.bannerError}>{error}</Text> : null}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item._id ?? item.id ?? item.name)}
          renderItem={renderItem}
          contentContainerStyle={
            trips.length === 0 ? styles.emptyList : styles.list
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
              No trips yet. Tap + to start planning!
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={onFab}
        activeOpacity={0.85}
        accessibilityLabel="Create trip"
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
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDest: {
    fontSize: 15,
    color: colors.sage,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.sageLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDates: {
    fontSize: 13,
    color: colors.muted,
  },
  category: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'capitalize',
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
