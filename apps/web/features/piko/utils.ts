import { RouteDifficulty } from './types';

/** Formats a duration in minutes as e.g. "3h 00m" or "45m". */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Poland: '🇵🇱',
  Italy: '🇮🇹',
  France: '🇫🇷',
  Spain: '🇪🇸',
  Switzerland: '🇨🇭',
  Austria: '🇦🇹',
  Germany: '🇩🇪',
  Norway: '🇳🇴',
  'United Kingdom': '🇬🇧',
  Iceland: '🇮🇸',
  Portugal: '🇵🇹',
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  Mexico: '🇲🇽',
};

/** Flag emoji for a country (falls back to a globe). */
export function countryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '🌍';
}

/** Tailwind classes for a difficulty pill (solid/light variant). */
export function difficultyStyles(difficulty: RouteDifficulty): {
  solid: string;
  soft: string;
  label: string;
} {
  switch (difficulty) {
    case 'easy':
      return { solid: 'bg-green-500 text-white', soft: 'bg-green-100 text-green-700', label: 'Easy' };
    case 'moderate':
      return { solid: 'bg-amber-500 text-white', soft: 'bg-amber-100 text-amber-700', label: 'Moderate' };
    case 'hard':
      return { solid: 'bg-rose-500 text-white', soft: 'bg-rose-100 text-rose-700', label: 'Hard' };
  }
}
