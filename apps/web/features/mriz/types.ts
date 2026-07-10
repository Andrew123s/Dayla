/**
 * Mriz — trips retold as cinematic, emotionally rich stories.
 * Types mirror backend/models/memory.model.js (`GET /api/memories`).
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface MemoryMedia {
  url: string;
  takenAt?: string | null;
  coords?: { lat: number; lng: number } | null;
  byUser?: string | null;
}

export interface MemoryPerson {
  _id: string;
  name: string;
  avatar?: string | null;
}

export interface MemoryStats {
  distanceKm: number;
  elevationGainM: number;
  days: number;
  companions: number;
}

export interface Memory {
  _id: string;
  tripId: string;
  title: string;
  coverPhoto?: string | null;
  season: Season;
  country?: string;
  stats: MemoryStats;
  moodTags: string[];
  milestones: string[];
  media: MemoryMedia[];
  /** GeoJSON-style [lng, lat, ele?] positions when the trip had a trail. */
  routeGeometry?: { coordinates: number[][] } | null;
  weatherDays?: { condition?: string; tempC?: number }[];
  owner?: MemoryPerson;
  participants?: MemoryPerson[];
  createdAt?: string;
}

/** Seasonal palette — calm, nature-inspired accents used across Mriz. */
export const SEASON_COLORS: Record<Season, string> = {
  spring: '#a3b18a',
  summer: '#d4a373',
  autumn: '#b5654d',
  winter: '#8fa7b3',
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

export const seasonColor = (s: string): string =>
  SEASON_COLORS[(s as Season) in SEASON_COLORS ? (s as Season) : 'summer'];

export const seasonLabel = (s: string): string =>
  SEASON_LABELS[(s as Season) in SEASON_LABELS ? (s as Season) : 'summer'];
