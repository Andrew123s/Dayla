import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authFetch } from '../../../services/api';

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

type CurrentWeather = {
  location: string;
  temp_c: number;
  feelslike_c: number;
  condition: string;
  conditionText: string;
  icon: string;
  humidity: number;
  wind_kph: number;
  uv: number;
};

type ForecastDay = {
  date: string;
  dayName: string;
  temp_c: number;
  maxtemp_c: number;
  mintemp_c: number;
  condition: string;
  icon: string;
  chance_of_rain: number;
  humidity: number;
};

type WeatherAlert = {
  headline: string;
  severity: string;
  event: string;
};

type WeatherData = {
  current: CurrentWeather;
  forecast: ForecastDay[];
  alerts: WeatherAlert[];
  suggestion: string;
};

type WeatherScreenProps = {
  route: {
    params?: {
      location?: string;
      tripName?: string;
    };
  };
};

function alertCardStyle(severity: string) {
  const s = severity?.toLowerCase() ?? 'info';
  if (s === 'critical' || s === 'severe' || s === 'extreme') {
    return { bg: '#fef2f2', border: '#fecaca', accent: colors.error };
  }
  if (s === 'warning' || s === 'moderate') {
    return { bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c' };
  }
  return { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' };
}

export default function WeatherScreen({ route }: WeatherScreenProps) {
  const locationParam = route.params?.location?.trim();
  const tripName = route.params?.tripName;
  const location = locationParam || 'Accra';

  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setError(null);
    try {
      const q = `/api/weather?location=${encodeURIComponent(location)}&days=5`;
      const res = await authFetch(q);
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: WeatherData;
        message?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Could not load weather');
      }
      if (!json.data) {
        throw new Error('Invalid weather response');
      }
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load weather');
      setData(null);
    }
  }, [location]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await fetchWeather();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchWeather]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWeather();
    setRefreshing(false);
  }, [fetchWeather]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingHint}>Loading weather…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.errorScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {tripName ? (
            <Text style={styles.tripBadge}>{tripName}</Text>
          ) : null}
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={async () => {
              setLoading(true);
              await fetchWeather();
              setLoading(false);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = data?.current;
  const forecast = data?.forecast ?? [];
  const alerts = data?.alerts ?? [];
  const suggestion = data?.suggestion ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {tripName ? (
          <Text style={styles.tripBadge}>{tripName}</Text>
        ) : null}

        {current ? (
          <View style={styles.hero}>
            <Text style={styles.heroIcon}>{current.icon}</Text>
            <Text style={styles.heroTemp}>{current.temp_c}°</Text>
            <Text style={styles.heroLocation}>{current.location}</Text>
            <Text style={styles.heroFeels}>
              Feels like {current.feelslike_c}° · {current.conditionText}
            </Text>
          </View>
        ) : null}

        {suggestion ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>Tip</Text>
            <Text style={styles.tipText}>{suggestion}</Text>
          </View>
        ) : null}

        {forecast.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5-day outlook</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.forecastRow}
            >
              {forecast.map((day) => (
                <View key={day.date} style={styles.forecastCard}>
                  <Text style={styles.forecastDay}>{day.dayName}</Text>
                  <Text style={styles.forecastIcon}>{day.icon}</Text>
                  <Text style={styles.forecastTemps}>
                    {day.maxtemp_c}° / {day.mintemp_c}°
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {alerts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            {alerts.map((a, idx) => {
              const palette = alertCardStyle(a.severity);
              return (
                <View
                  key={`${a.headline}-${idx}`}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.alertStripe, { backgroundColor: palette.accent }]}
                  />
                  <View style={styles.alertBody}>
                    <Text style={styles.alertEvent}>{a.event || 'Weather alert'}</Text>
                    <Text style={styles.alertHeadline}>{a.headline}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {current ? (
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Humidity</Text>
              <Text style={styles.infoValue}>{current.humidity}%</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Wind</Text>
              <Text style={styles.infoValue}>{current.wind_kph} km/h</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>UV</Text>
              <Text style={styles.infoValue}>{current.uv}</Text>
            </View>
          </View>
        ) : null}

        {error ? (
          <Text style={styles.inlineError}>{error}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingHint: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 15,
  },
  tripBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sageLight,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginTop: 8,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 56,
    marginBottom: 4,
  },
  heroTemp: {
    fontSize: 52,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 58,
  },
  heroLocation: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.sageLight,
    marginTop: 4,
    textAlign: 'center',
  },
  heroFeels: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.92,
    marginTop: 8,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  forecastRow: {
    paddingRight: 8,
    gap: 12,
    flexDirection: 'row',
  },
  forecastCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  forecastDay: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
  },
  forecastIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  forecastTemps: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  alertCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  alertStripe: {
    width: 4,
  },
  alertBody: {
    flex: 1,
    padding: 12,
  },
  alertEvent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  alertHeadline: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    marginTop: 4,
  },
  infoCell: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  errorScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  inlineError: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
  },
});
