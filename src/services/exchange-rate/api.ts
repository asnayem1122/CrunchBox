import { BUNDLED_RATES_USD } from '../../features/currency/bundledRates';
import { getCachedRates, saveCachedRates, CachedRatesData } from './cache';

export interface ExchangeRatePayload {
  rates: Record<string, number>;
  effectiveDate: string;
  fetchedAt: number;
  source: 'live' | 'cache' | 'bundled';
  isStale: boolean;
}

const PRIMARY_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const FALLBACK_PAGES_URL =
  'https://latest.currency-api.pages.dev/v1/currencies/usd.json';
const FRANKFURTER_BASE_URL =
  'https://api.frankfurter.dev/v1/latest?base=USD';

const ONE_DAY_MS = 86_400_000; // 24 hours

/**
 * Normalizes all currency keys to uppercase and filters for valid, finite, positive rates.
 */
export function normalizeRateMap(
  rawMap: Record<string, unknown>
): Record<string, number> {
  const normalized: Record<string, number> = {};
  if (!rawMap || typeof rawMap !== 'object') return normalized;

  for (const [key, val] of Object.entries(rawMap)) {
    const upper = key.trim().toUpperCase();
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      normalized[upper] = val;
    }
  }

  return normalized;
}

/**
 * Merges rate sources in strict priority order:
 * BUNDLED_RATES_USD -> Fawazahmed0 (165+) -> Frankfurter (ECB overlay) -> USD = 1.0.
 */
export function mergeRateMaps(
  bundled: Record<string, number>,
  fawaz?: Record<string, number>,
  frankfurter?: Record<string, number>
): Record<string, number> {
  return {
    ...bundled,
    ...(fawaz || {}),
    ...(frankfurter || {}),
    USD: 1.0,
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number = 5000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches latest exchange rates from dual-tier CDN and Frankfurt overlay.
 * Falls back to AsyncStorage cache, and finally to bundled rates.
 */
export async function fetchExchangeRates(): Promise<ExchangeRatePayload> {
  const now = Date.now();

  try {
    let fawazData: any = null;
    let effectiveDate = new Date().toISOString().split('T')[0];

    // 1. Try Primary Fawazahmed0 CDN (165+ currencies)
    try {
      fawazData = await fetchWithTimeout(PRIMARY_CDN_URL, 5000);
    } catch {
      // 2. Try Fallback 1 Cloudflare Pages CDN
      try {
        fawazData = await fetchWithTimeout(FALLBACK_PAGES_URL, 5000);
      } catch {
        fawazData = null;
      }
    }

    // 3. Try Supplemental Frankfurter overlay (ECB reference)
    let frankfurterRates: Record<string, number> = {};
    try {
      const frankData = await fetchWithTimeout(FRANKFURTER_BASE_URL, 3500);
      if (frankData && frankData.rates) {
        frankfurterRates = normalizeRateMap(frankData.rates);
      }
    } catch {
      // Non-fatal if Frankfurter fails
    }

    if (fawazData && fawazData.usd) {
      if (fawazData.date) {
        effectiveDate = fawazData.date;
      }
      const normalizedFawaz = normalizeRateMap(fawazData.usd);
      const mergedRates = mergeRateMaps(
        BUNDLED_RATES_USD,
        normalizedFawaz,
        frankfurterRates
      );

      // Save to cache
      const cachePayload: CachedRatesData = {
        rates: mergedRates,
        effectiveDate,
        fetchedAt: now,
      };
      await saveCachedRates(cachePayload);

      return {
        rates: mergedRates,
        effectiveDate,
        fetchedAt: now,
        source: 'live',
        isStale: false,
      };
    }
  } catch {
    // Proceed to cache fallback
  }

  // Fallback to AsyncStorage cache
  const cached = await getCachedRates();
  if (cached && cached.rates && Object.keys(cached.rates).length > 0) {
    const isStale = now - cached.fetchedAt > ONE_DAY_MS;
    return {
      rates: { ...BUNDLED_RATES_USD, ...cached.rates, USD: 1.0 },
      effectiveDate: cached.effectiveDate,
      fetchedAt: cached.fetchedAt,
      source: 'cache',
      isStale,
    };
  }

  // Final offline fallback: Bundled rates
  return {
    rates: { ...BUNDLED_RATES_USD, USD: 1.0 },
    effectiveDate: '2026-10-30',
    fetchedAt: 0,
    source: 'bundled',
    isStale: true,
  };
}
