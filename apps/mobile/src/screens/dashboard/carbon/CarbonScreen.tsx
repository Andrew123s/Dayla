import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type TransportMode = 'flight' | 'train' | 'bus' | 'car';
type AccommodationType = 'hotel' | 'hostel' | 'vacation_rental' | 'camping';
type MealType = 'vegan' | 'vegetarian' | 'meat_heavy' | 'average_meal';

type TripResult = {
  transport: number;
  accommodation: number;
  activities: number;
  food: number;
  total: number;
  breakdown: {
    transport_details?: unknown[];
    accommodation_details?: unknown[];
    activity_details?: unknown[];
    food_details?: unknown[];
  };
};

type CarbonScreenProps = {
  route: {
    params?: {
      tripName?: string;
    };
  };
};

const TRANSPORT_MODES: { value: TransportMode; label: string }[] = [
  { value: 'flight', label: 'Flight' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'car', label: 'Car' },
];

const ACCOMMODATION_TYPES: { value: AccommodationType; label: string }[] = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'vacation_rental', label: 'Vacation rental' },
  { value: 'camping', label: 'Camping' },
];

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'meat_heavy', label: 'Meat-heavy' },
  { value: 'average_meal', label: 'Average' },
];

function parsePositiveNumber(raw: string, fallback: number) {
  const n = parseFloat(raw.replace(',', '.'));
  if (Number.isFinite(n) && n >= 0) return n;
  return fallback;
}

function ecoTipsForHighest(
  transport: number,
  accommodation: number,
  food: number,
  activities: number
): string[] {
  const entries: { key: string; value: number; tips: string[] }[] = [
    {
      key: 'transport',
      value: transport,
      tips: [
        'Prefer rail or coach over short flights when travel time allows — often far lower CO₂e per km.',
        'Share rides or choose direct routes to cut duplicate takeoff and landing emissions.',
      ],
    },
    {
      key: 'accommodation',
      value: accommodation,
      tips: [
        'Pick smaller lodgings or eco-certified stays; fewer nights in high-energy hotels helps.',
        'Reuse towels, limit AC, and turn off lights when you leave the room.',
      ],
    },
    {
      key: 'food',
      value: food,
      tips: [
        'Shift a few meals to plant-forward options — footprint often drops sharply vs meat-heavy menus.',
        'Choose local seasonal dishes to avoid extra cold-chain and air-freight impacts.',
      ],
    },
    {
      key: 'activities',
      value: activities,
      tips: [
        'Favor walking, cycling, or human-powered outings over fuel-heavy tours.',
        'Bundle activities in one area to reduce repeated transfers.',
      ],
    },
  ];
  const max = Math.max(...entries.map((e) => e.value), 0);
  const top = entries.filter((e) => e.value === max && max > 0);
  if (top.length === 0) {
    return [
      'Great baseline — small tweaks to transport, lodging, and meals can still trim your footprint further.',
    ];
  }
  return top.flatMap((t) => t.tips).slice(0, 3);
}

function BarSegment({
  label,
  valueKg,
  maxVal,
  color,
}: {
  label: string;
  valueKg: number;
  maxVal: number;
  color: string;
}) {
  const widthPct = maxVal > 0 ? Math.min(100, (valueKg / maxVal) * 100) : 0;
  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.track}>
        <View
          style={[barStyles.fill, { width: `${widthPct}%`, backgroundColor: color }]}
        />
      </View>
      <Text style={barStyles.value}>
        {valueKg < 10 ? valueKg.toFixed(1) : Math.round(valueKg)}
      </Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#e7e5e4',
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  value: {
    fontSize: 12,
    color: colors.muted,
  },
});

export default function CarbonScreen({ route }: CarbonScreenProps) {
  const tripName = route.params?.tripName;

  const [transportMode, setTransportMode] = useState<TransportMode>('flight');
  const [distanceKm, setDistanceKm] = useState('500');
  const [passengers, setPassengers] = useState('1');

  const [accType, setAccType] = useState<AccommodationType>('hotel');
  const [nights, setNights] = useState('3');
  const [accCountry, setAccCountry] = useState('US');

  const [mealType, setMealType] = useState<MealType>('average_meal');
  const [mealCount, setMealCount] = useState('9');
  const [foodCountry, setFoodCountry] = useState('US');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TripResult | null>(null);

  const maxBar = useMemo(() => {
    if (!result) return 1;
    return Math.max(
      result.transport,
      result.accommodation,
      result.food,
      result.activities,
      1
    );
  }, [result]);

  const calculate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const dist = parsePositiveNumber(distanceKm, 0);
      const pass = Math.max(1, Math.round(parsePositiveNumber(passengers, 1)));
      const n = Math.max(0, Math.round(parsePositiveNumber(nights, 0)));
      const meals = Math.max(0, Math.round(parsePositiveNumber(mealCount, 0)));

      const accCode = accCountry.trim() || 'US';
      const foodCode = foodCountry.trim() || 'US';

      const body = {
        transport: [
          {
            mode: transportMode,
            distance: dist,
            passengers: pass,
          },
        ],
        accommodation: [
          {
            type: accType,
            nights: n,
            country: accCode,
          },
        ],
        food: [
          {
            meal_type: mealType,
            country_code: foodCode,
            number_of_meals: meals,
          },
        ],
      };

      const res = await authFetch('/api/climatiq/trip', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: TripResult;
        message?: string;
      };
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message ?? 'Calculation failed');
      }
      setResult(json.data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [
    accCountry,
    accType,
    distanceKm,
    foodCountry,
    mealCount,
    mealType,
    nights,
    passengers,
    transportMode,
  ]);

  const tips = useMemo(() => {
    if (!result) return [];
    return ecoTipsForHighest(
      result.transport,
      result.accommodation,
      result.food,
      result.activities
    );
  }, [result]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {tripName ? (
          <Text style={styles.tripBadge}>{tripName}</Text>
        ) : null}

        <Text style={styles.screenTitle}>Trip footprint</Text>
        <Text style={styles.subtitle}>
          Estimate CO₂e for transport, stay, and meals (kg CO₂e).
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transport</Text>
          <Text style={styles.fieldLabel}>Mode</Text>
          <View style={styles.pickerRow}>
            {TRANSPORT_MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.pill,
                  transportMode === m.value && styles.pillActive,
                ]}
                onPress={() => setTransportMode(m.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pillText,
                    transportMode === m.value && styles.pillTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Distance (km)</Text>
          <TextInput
            style={styles.input}
            value={distanceKm}
            onChangeText={setDistanceKm}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.fieldLabel}>Passengers</Text>
          <TextInput
            style={styles.input}
            value={passengers}
            onChangeText={setPassengers}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accommodation</Text>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.pickerRowWrap}>
            {ACCOMMODATION_TYPES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.pill, accType === m.value && styles.pillActive]}
                onPress={() => setAccType(m.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pillText,
                    accType === m.value && styles.pillTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Nights</Text>
          <TextInput
            style={styles.input}
            value={nights}
            onChangeText={setNights}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.fieldLabel}>Country code</Text>
          <TextInput
            style={styles.input}
            value={accCountry}
            onChangeText={setAccCountry}
            autoCapitalize="characters"
            placeholder="e.g. US"
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Food</Text>
          <Text style={styles.fieldLabel}>Meal type</Text>
          <View style={styles.pickerRowWrap}>
            {MEAL_TYPES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.pill, mealType === m.value && styles.pillActive]}
                onPress={() => setMealType(m.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.pillText,
                    mealType === m.value && styles.pillTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Number of meals</Text>
          <TextInput
            style={styles.input}
            value={mealCount}
            onChangeText={setMealCount}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.fieldLabel}>Country code</Text>
          <TextInput
            style={styles.input}
            value={foodCountry}
            onChangeText={setFoodCountry}
            autoCapitalize="characters"
            placeholder="e.g. US"
            placeholderTextColor={colors.muted}
          />
        </View>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.calcBtn, loading && styles.calcBtnDisabled]}
          onPress={calculate}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.calcBtnText}>Calculate</Text>
          )}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Total emissions</Text>
            <Text style={styles.resultTotal}>
              {result.total < 10
                ? result.total.toFixed(1)
                : Math.round(result.total)}
            </Text>
            <Text style={styles.resultUnit}>kg CO₂e</Text>

            <Text style={styles.breakdownTitle}>Breakdown</Text>
            <BarSegment
              label="Transport"
              valueKg={result.transport}
              maxVal={maxBar}
              color={colors.primary}
            />
            <BarSegment
              label="Accommodation"
              valueKg={result.accommodation}
              maxVal={maxBar}
              color={colors.sage}
            />
            <BarSegment
              label="Food"
              valueKg={result.food}
              maxVal={maxBar}
              color={colors.sageLight}
            />
            {result.activities > 0 ? (
              <BarSegment
                label="Activities"
                valueKg={result.activities}
                maxVal={maxBar}
                color="#78716c"
              />
            ) : null}
          </View>
        ) : null}

        {result && tips.length > 0 ? (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Eco tips</Text>
            {tips.map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipBody}>{t}</Text>
              </View>
            ))}
          </View>
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
    paddingBottom: 40,
    paddingTop: 8,
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
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
    marginBottom: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pickerRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  pillTextActive: {
    color: colors.white,
  },
  errorBanner: {
    color: colors.error,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  calcBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  calcBtnDisabled: {
    opacity: 0.75,
  },
  calcBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
  },
  resultTotal: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  resultUnit: {
    fontSize: 15,
    color: colors.sage,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tipsCard: {
    backgroundColor: colors.sageLight + '44',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sageLight,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    color: colors.sage,
    fontSize: 16,
    marginRight: 8,
    lineHeight: 22,
  },
  tipBody: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
