// ─────────────────────────────────────────────────────────────────────────────
// Currency helpers (pure)
//
// All amounts are reconciled through USD. Each currency carries a `usd` rate
// (value of 1 unit in USD). `display` formatting converts a USD value into the
// currently-selected display currency; `fmtCur` formats a native amount in its
// own currency without conversion.
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency, CurrencyCode } from '../types';

export function curOf(currencies: Currency[], code: CurrencyCode): Currency {
  return currencies.find((c) => c.code === code) || currencies[0];
}

/** Convert a native `amount` of currency `code` into USD. */
export function toUSD(currencies: Currency[], amount: number | string, code: CurrencyCode): number {
  return (Number(amount) || 0) * curOf(currencies, code).usd;
}

/** Convert a USD value into `displayCode`. */
export function fromUSD(currencies: Currency[], usd: number, displayCode: CurrencyCode): number {
  return usd / curOf(currencies, displayCode).usd;
}

/**
 * Format a number with grouping. Mirrors the prototype: no decimals for values
 * >= 1000 or whole numbers, otherwise 2 decimals.
 */
export function fmtNum(n: number): string {
  const abs = Math.abs(n);
  const dp = abs >= 1000 ? 0 : Math.round(n) === n ? 0 : 2;
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/**
 * A small bound helper bundle for a given currency set + display currency.
 * Created once per render via `useMemo` (see `useBudget`) and threaded through
 * the view components so they never have to repeat the `currencies`/`displayCode`
 * arguments.
 */
export interface Money {
  /** The active display currency code. */
  code: CurrencyCode;
  curOf: (code: CurrencyCode) => Currency;
  symbol: (code: CurrencyCode) => string;
  toUSD: (amount: number | string, code: CurrencyCode) => number;
  fromUSD: (usd: number) => number;
  /** Format a USD value in the display currency, e.g. `$1,240`. */
  fmt: (usd: number) => string;
  /** Format a native amount in its own currency, e.g. `₵2,400`. */
  fmtCur: (amount: number | string, code: CurrencyCode) => string;
}

export function createMoney(currencies: Currency[], displayCode: CurrencyCode): Money {
  return {
    code: displayCode,
    curOf: (code) => curOf(currencies, code),
    symbol: (code) => curOf(currencies, code).symbol,
    toUSD: (amount, code) => toUSD(currencies, amount, code),
    fromUSD: (usd) => fromUSD(currencies, usd, displayCode),
    fmt: (usd) => curOf(currencies, displayCode).symbol + fmtNum(fromUSD(currencies, usd, displayCode)),
    fmtCur: (amount, code) => curOf(currencies, code).symbol + fmtNum(Number(amount) || 0),
  };
}
