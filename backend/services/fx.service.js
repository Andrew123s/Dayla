const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// FX service
//
// Source of truth for currency conversion used by the Budget feature. Rates are
// expressed as `usd` = value of 1 unit of the currency in USD (the same base the
// frontend module uses).
//
// Live rates are fetched lazily from the free, keyless exchangerate provider
// `open.er-api.com` (USD base) and cached in memory for 6 hours. If the network
// fetch fails (or hasn't completed yet) we fall back to a maintained static
// table so the feature always works. The refresh is fire-and-forget so it never
// blocks an API request.
// ─────────────────────────────────────────────────────────────────────────────

// Display metadata for the currencies we surface in the UI. `code` is what the
// app stores/displays; `iso` is the code used to look up the live rate (e.g. the
// app's "GHC" maps to ISO "GHS").
const CURRENCY_META = [
  { code: 'USD', iso: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', iso: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', iso: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'GHC', iso: 'GHS', symbol: '₵', name: 'Ghana Cedi' },
  { code: 'CNY', iso: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'JPY', iso: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Static fallback: value of 1 unit in USD. Used before the first live refresh
// completes and whenever the provider is unreachable.
const FALLBACK_USD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  GHC: 0.064,
  CNY: 0.139,
  JPY: 0.0067,
};

const SIX_HOURS = 6 * 60 * 60 * 1000;
const PROVIDER_URL = 'https://open.er-api.com/v6/latest/USD';

let cachedUsdByCode = { ...FALLBACK_USD };
let lastFetched = 0;
let refreshing = false;

async function refreshRates() {
  if (refreshing) return;
  refreshing = true;
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(PROVIDER_URL, { timeout: 8000 });
    if (!response.ok) throw new Error(`FX provider responded ${response.status}`);
    const data = await response.json();
    // Provider returns `rates` as units-per-USD; value of 1 unit in USD = 1 / rate.
    const rates = data && data.rates;
    if (!rates || typeof rates !== 'object') throw new Error('FX provider returned no rates');

    const next = {};
    for (const meta of CURRENCY_META) {
      const perUsd = rates[meta.iso];
      next[meta.code] = perUsd && perUsd > 0 ? 1 / perUsd : FALLBACK_USD[meta.code];
    }
    next.USD = 1;
    cachedUsdByCode = next;
    lastFetched = Date.now();
    logger.info('FX rates refreshed from provider');
  } catch (error) {
    // Keep whatever we had (fallback or previous live values).
    logger.warn(`FX rate refresh failed, using cached/fallback rates: ${error.message}`);
  } finally {
    refreshing = false;
  }
}

function maybeRefresh() {
  if (Date.now() - lastFetched > SIX_HOURS) {
    // Fire-and-forget; current request uses whatever is already cached.
    refreshRates();
  }
}

/** value of 1 unit of `code` in USD. */
function usdRate(code) {
  return cachedUsdByCode[code] != null ? cachedUsdByCode[code] : (FALLBACK_USD[code] != null ? FALLBACK_USD[code] : 1);
}

/** Convert a native amount of `code` into USD using the current rate. */
function toUSD(amount, code) {
  const n = Number(amount) || 0;
  return n * usdRate(code);
}

/** The currency table the frontend consumes: [{ code, symbol, name, usd }]. */
function getCurrencies() {
  maybeRefresh();
  return CURRENCY_META.map((m) => ({
    code: m.code,
    symbol: m.symbol,
    name: m.name,
    usd: usdRate(m.code),
  }));
}

function isSupported(code) {
  return CURRENCY_META.some((m) => m.code === code);
}

// Kick off an initial refresh at startup (non-blocking).
refreshRates();

module.exports = { getCurrencies, toUSD, usdRate, isSupported, CURRENCY_META };
