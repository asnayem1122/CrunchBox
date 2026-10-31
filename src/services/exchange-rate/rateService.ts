import { BUNDLED_RATES_USD } from '../../features/currency/bundledRates';
import { formatCurrencyAmount } from '../../utils/formatCurrency';

/**
 * Converts a currency amount using triangular cross-rate conversion relative to USD.
 * Formula: amount * (rate[to] / rate[from])
 */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Record<string, number>
): number {
  if (Number.isNaN(amount) || !Number.isFinite(amount) || amount === 0) {
    return 0;
  }

  const from = fromCode.toUpperCase();
  const to = toCode.toUpperCase();

  if (from === to) {
    return amount;
  }

  const fromRate = rates[from] || BUNDLED_RATES_USD[from] || 1.0;
  const toRate = rates[to] || BUNDLED_RATES_USD[to] || 1.0;

  if (fromRate <= 0) return 0;

  const result = amount * (toRate / fromRate);
  return Number.isFinite(result) ? result : 0;
}

/**
 * Returns the single unit exchange rate from one currency to another (e.g. 1 USD in BDT).
 */
export function getExchangeRatePair(
  fromCode: string,
  toCode: string,
  rates: Record<string, number>
): number {
  return convertCurrency(1, fromCode, toCode, rates);
}

/**
 * Formats a clean reference subtitle, e.g. "1 USD = 124.11 BDT"
 */
export function formatRateSubtitle(
  fromCode: string,
  toCode: string,
  rates: Record<string, number>
): string {
  const from = fromCode.toUpperCase();
  const to = toCode.toUpperCase();
  const rate = getExchangeRatePair(from, to, rates);
  const formattedRate = formatCurrencyAmount(rate, to);
  return `1 ${from} = ${formattedRate} ${to}`;
}
