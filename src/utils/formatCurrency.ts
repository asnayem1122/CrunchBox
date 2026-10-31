import { CURRENCY_CATALOGUE } from '../features/currency/currencyCatalogue';

/**
 * Returns the exact ISO 4217 decimal precision for a given currency code.
 * Defaults to 2 decimals if code is unrecognized.
 */
export function getCurrencyDecimals(currencyCode: string): number {
  const upper = currencyCode.toUpperCase();
  if (CURRENCY_CATALOGUE[upper]) {
    return CURRENCY_CATALOGUE[upper].decimals;
  }
  return 2;
}

/**
 * Formats a numeric currency amount with strict ISO 4217 decimal precision.
 * 0 decimals: JPY, KRW, VND, IDR, etc.
 * 3 decimals: KWD, BHD, OMR, JOD, TND, etc.
 * 2 decimals: BDT, USD, EUR, GBP, INR, etc.
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string {
  if (Number.isNaN(amount) || !Number.isFinite(amount)) {
    return '0';
  }

  const decimals = getCurrencyDecimals(currencyCode);

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    }).format(amount);
  } catch {
    return amount.toFixed(decimals);
  }
}

/**
 * Formats currency amount paired with its official currency symbol.
 * e.g., "৳ 1,420.50", "KD 12.345", "$ 150.00"
 */
export function formatCurrencyWithSymbol(
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string {
  const upper = currencyCode.toUpperCase();
  const info = CURRENCY_CATALOGUE[upper];
  const symbol = info ? info.symbol : upper;
  const formattedAmount = formatCurrencyAmount(amount, upper, locale);

  return `${symbol} ${formattedAmount}`;
}

/**
 * Safely parses a string input into a sanitized number.
 */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/,/g, '').trim();
  const val = parseFloat(cleaned);
  return Number.isNaN(val) ? 0 : val;
}
