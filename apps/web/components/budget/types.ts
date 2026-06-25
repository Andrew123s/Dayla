// ─────────────────────────────────────────────────────────────────────────────
// Budget module — shared types
// Ported from the design-sync "Dayla Budget" prototype into clean React/TS.
// ─────────────────────────────────────────────────────────────────────────────

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'GHC' | 'CNY' | 'JPY' | string;

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  /** Value of 1 unit of this currency in USD (used as the conversion base). */
  usd: number;
}

export type CategoryId =
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'other'
  | string;

export interface Category {
  id: CategoryId;
  name: string;
  /** Short label used on filter chips / the add-form grid. */
  short: string;
  color: string;
  /** Raw SVG `path` d-attribute for the category glyph. */
  icon: string;
}

export interface Participant {
  id: string;
  /** Short display name (chips, avatars). */
  name: string;
  /** Full name (per-person list). */
  full: string;
  initials: string;
  color: string;
  you?: boolean;
}

export type SplitMethod = 'equal' | 'percent' | 'custom';

export interface Split {
  pid: string;
  /** Amount in the expense's native currency. */
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  /** Amount in `currency`. */
  amount: number;
  currency: CurrencyCode;
  category: CategoryId;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  location: string;
  /** Participant id of whoever paid. */
  paidBy: string;
  splitMethod: SplitMethod;
  splits: Split[];
  /** URL of the uploaded receipt (image/PDF), or null when none is attached. */
  receiptUrl: string | null;
  settled: boolean;
}

export interface Payment {
  id: string;
  from: string;
  to: string;
  /** Settlement payments are stored directly in USD. */
  amountUSD: number;
  date: string;
}

/** A suggested or recorded transfer between two participants (USD). */
export interface Transfer {
  from: string;
  to: string;
  amountUSD: number;
}

export type Tab = 'overview' | 'transactions' | 'settle';
export type SettleView = 'minimized' | 'pairwise';

/** Draft state for the add/edit expense sheet. */
export interface ExpenseForm {
  title: string;
  /** Kept as a string while editing the input. */
  amount: string;
  currency: CurrencyCode;
  category: CategoryId;
  description: string;
  date: string;
  location: string;
  paidBy: string;
  splitters: string[];
  splitMethod: SplitMethod;
  /** Per-participant percent inputs (strings while typing). */
  percents: Record<string, string>;
  /** Per-participant custom-amount inputs (strings while typing). */
  customs: Record<string, string>;
  /** URL of the uploaded receipt, or null when none is attached. */
  receiptUrl: string | null;
}
