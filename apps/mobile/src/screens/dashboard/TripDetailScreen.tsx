import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authFetch } from '../../services/api';

const colors = {
  primary: '#3a5a40',
  sage: '#588157',
  sageLight: '#a3b18a',
  bg: '#f5f5f4',
  text: '#44403c',
  muted: '#a8a29e',
  white: '#ffffff',
};

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

type TripDetailParams = {
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

type Props = NativeStackScreenProps<TripDetailParams, 'TripDetail'>;

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

function destinationLabel(trip: Trip | null, fallback?: string) {
  if (fallback?.trim()) return fallback.trim();
  const d = trip?.destination;
  return d?.name || d?.region || d?.country || '';
}

type FeatureCard = {
  key: string;
  emoji: string;
  title: string;
  description: string;
  screen: string;
  params: Record<string, string | undefined>;
};

export default function TripDetailScreen({ route, navigation }: Props) {
  const { tripId, tripName, dashboardId, destination: destParam } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrip = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch(`/api/trips/${tripId}`);
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { trip?: Trip };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load trip');
      }
      setTrip(json.data?.trip ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trip');
      setTrip(null);
    }
  }, [tripId]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadTrip();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadTrip]);

  const displayName = trip?.name?.trim() || tripName;
  const destText = destinationLabel(trip, destParam);
  const status = trip?.status ?? 'planning';
  const dateRange = formatDateRange(trip?.dates);

  useLayoutEffect(() => {
    navigation.setOptions({ title: displayName });
  }, [navigation, displayName]);

  const features: FeatureCard[] = [
    {
      key: 'board',
      emoji: '🗺️',
      title: 'Planning Board',
      description: 'Sticky notes and ideas on a shared canvas.',
      screen: 'Canvas',
      params: { dashboardId, tripName: displayName },
    },
    {
      key: 'weather',
      emoji: '🌤️',
      title: 'Weather',
      description: 'Check forecasts for your destination.',
      screen: 'Weather',
      params: { location: destText || destParam, tripName: displayName },
    },
    {
      key: 'packing',
      emoji: '🎒',
      title: 'Packing',
      description: 'Smart packing lists for this trip.',
      screen: 'TripPacking',
      params: { tripId, tripName: displayName },
    },
    {
      key: 'carbon',
      emoji: '🌿',
      title: 'Carbon Calculator',
      description: 'Estimate the footprint of your journey.',
      screen: 'Carbon',
      params: { tripName: displayName },
    },
  ];

  const onCardPress = (f: FeatureCard) => {
    type Nav = { navigate: (name: string, params?: Record<string, string | undefined>) => void };
    (navigation as unknown as Nav).navigate(f.screen, f.params);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.tripTitle}>{displayName}</Text>
          {destText ? <Text style={styles.destination}>{destText}</Text> : null}
        </View>

        {error ? <Text style={styles.bannerError}>{error}</Text> : null}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingHint}>Loading trip…</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{status.replace(/_/g, ' ')}</Text>
              </View>
              <Text style={styles.dateRange}>{dateRange}</Text>
            </View>

            <Text style={styles.sectionLabel}>Trip tools</Text>
            <View style={styles.grid}>
              {features.map((f) => (
                <Pressable
                  key={f.key}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => onCardPress(f)}
                >
                  <Text style={styles.cardEmoji}>{f.emoji}</Text>
                  <Text style={styles.cardTitle}>{f.title}</Text>
                  <Text style={styles.cardDesc}>{f.description}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    paddingTop: 8,
    marginBottom: 20,
  },
  tripTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  destination: {
    fontSize: 16,
    color: colors.sage,
    fontWeight: '500',
  },
  bannerError: {
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  centered: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingHint: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  badge: {
    backgroundColor: colors.sageLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateRange: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    minHeight: 148,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    opacity: 0.9,
  },
});
