// ─────────────────────────────────────────────────────────────────────────────
// Structural defaults for the Budget module.
//
// All user-facing data (expenses, payments, participants, trip budget, and live
// FX rates) comes from the backend via props — there is NO demo/seed data here.
// What remains is purely structural: the fixed category taxonomy (with glyphs)
// and a USD-only fallback currency table used only if the module is ever
// rendered before real currencies have loaded.
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency, Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'accommodation', name: 'Accommodation', short: 'Stay', color: '#c1734a', icon: 'M3 10.7 12 4l9 6.7M5 9.5V20h14V9.5' },
  { id: 'transport', name: 'Transport', short: 'Travel', color: '#7c9b86', icon: 'M5 16.5h14M6.7 16.5 8 11h8l1.3 5.5M8.5 11 9.4 8h5.2l.9 3M8 16.5V18.5M16 16.5V18.5' },
  { id: 'food', name: 'Food & Dining', short: 'Food', color: '#d2a93f', icon: 'M6 3v6a2 2 0 0 0 4 0V3M8 11v10M17.5 3c-1.6 0-2.5 2-2.5 5s.9 4 2.5 4V21' },
  { id: 'activities', name: 'Activities', short: 'Activity', color: '#3a5a40', icon: 'M12 4l2.3 4.9 5.2.7-3.75 3.65L16.6 19 12 16.4 7.4 19l1.35-6.1L5 9.6l5.2-.7z' },
  { id: 'shopping', name: 'Shopping', short: 'Shop', color: '#c98694', icon: 'M6.5 8h11l-1 11.5h-9zM9.3 8V6.2a2.7 2.7 0 0 1 5.4 0V8' },
  { id: 'other', name: 'Other', short: 'Other', color: '#a9a396', icon: 'M4 7h16M4 12h16M4 17h10' },
];

/**
 * USD-only fallback. The real currency list (with live FX rates) is supplied by
 * the backend through the `currencies` prop; this exists only so currency
 * helpers never operate on an empty table.
 */
export const FALLBACK_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', usd: 1 },
];
