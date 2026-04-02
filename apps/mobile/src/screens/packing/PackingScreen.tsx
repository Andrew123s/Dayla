import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const colors = {
  primary: '#3a5a40',
  sage: '#588157',
  sageLight: '#a3b18a',
  bg: '#f5f5f4',
  text: '#44403c',
  muted: '#a8a29e',
  white: '#ffffff',
};

/**
 * Packing list (Ntelipak) — wire `GET /api/packing/:tripId` once a trip is selected.
 */
export default function PackingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Ntelipak</Text>
        <Text style={styles.subtitle}>Your smart packing list</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select a trip</Text>
        <Text style={styles.cardBody}>
          Select a trip to view your packing list. Trip selection will be
          connected here; for now, open a trip from My Plans to pass a trip id.
        </Text>
      </View>
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 15,
    color: colors.sage,
    lineHeight: 22,
  },
});
