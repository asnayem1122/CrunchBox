import {
  convertCurrency,
  getExchangeRatePair,
  formatRateSubtitle,
} from '../../src/services/exchange-rate/rateService';
import {
  normalizeRateMap,
  mergeRateMaps,
} from '../../src/services/exchange-rate/api';
import { BUNDLED_RATES_USD } from '../../src/features/currency/bundledRates';

describe('rateService - Cross-Rate Engine & Normalization', () => {
  describe('normalizeRateMap', () => {
    it('normalizes lowercase currency codes to uppercase', () => {
      const raw = { bdt: 124.11, aed: 3.6725, eur: 0.92 };
      const normalized = normalizeRateMap(raw);
      expect(normalized.BDT).toBe(124.11);
      expect(normalized.AED).toBe(3.6725);
      expect(normalized.EUR).toBe(0.92);
      expect(normalized.bdt).toBeUndefined();
    });

    it('filters out non-positive, non-finite, and invalid values', () => {
      const raw = {
        bdt: 124.11,
        invalidNegative: -5,
        invalidZero: 0,
        invalidString: '12',
        invalidNaN: NaN,
      };
      const normalized = normalizeRateMap(raw as any);
      expect(normalized.BDT).toBe(124.11);
      expect(normalized.INVALIDNEGATIVE).toBeUndefined();
      expect(normalized.INVALIDZERO).toBeUndefined();
      expect(normalized.INVALIDSTRING).toBeUndefined();
      expect(normalized.INVALIDNAN).toBeUndefined();
    });
  });

  describe('mergeRateMaps', () => {
    it('merges in priority order and enforces USD = 1.0', () => {
      const bundled = { USD: 1.0, BDT: 120.0, EUR: 0.9 };
      const fawaz = { BDT: 124.0, AED: 3.67 };
      const frankfurter = { EUR: 0.925 };

      const merged = mergeRateMaps(bundled, fawaz, frankfurter);
      expect(merged.USD).toBe(1.0);
      expect(merged.BDT).toBe(124.0); // updated by fawaz
      expect(merged.AED).toBe(3.67);  // added by fawaz
      expect(merged.EUR).toBe(0.925); // updated by frankfurter
    });

    it('preserves all bundled 165+ currencies even if Frankfurter only provides ~32', () => {
      const frankfurterSubset = { EUR: 0.92, GBP: 0.77 };
      const merged = mergeRateMaps(BUNDLED_RATES_USD, {}, frankfurterSubset);
      expect(merged.BDT).toBe(BUNDLED_RATES_USD.BDT);
      expect(merged.SAR).toBe(BUNDLED_RATES_USD.SAR);
      expect(merged.KWD).toBe(BUNDLED_RATES_USD.KWD);
    });
  });

  describe('convertCurrency & Cross-Rates', () => {
    const mockRates = {
      USD: 1.0,
      BDT: 124.11,
      EUR: 0.92,
      GBP: 0.77,
      JPY: 150.0,
      KWD: 0.30,
    };

    it('converts USD to BDT directly', () => {
      const converted = convertCurrency(100, 'USD', 'BDT', mockRates);
      expect(converted).toBeCloseTo(12411.0, 4);
    });

    it('converts BDT to USD directly', () => {
      const converted = convertCurrency(124.11, 'BDT', 'USD', mockRates);
      expect(converted).toBeCloseTo(1.0, 4);
    });

    it('converts EUR to BDT via triangular cross-rate (amount * rate[to] / rate[from])', () => {
      // 100 EUR in BDT: 100 * (124.11 / 0.92) = 13490.217
      const converted = convertCurrency(100, 'EUR', 'BDT', mockRates);
      const expected = 100 * (124.11 / 0.92);
      expect(converted).toBeCloseTo(expected, 4);
    });

    it('returns original amount when from and to currencies match', () => {
      expect(convertCurrency(500, 'BDT', 'BDT', mockRates)).toBe(500);
      expect(convertCurrency(100, 'USD', 'usd', mockRates)).toBe(100);
    });

    it('returns 0 when amount is 0, NaN, or non-finite', () => {
      expect(convertCurrency(0, 'USD', 'BDT', mockRates)).toBe(0);
      expect(convertCurrency(NaN, 'USD', 'BDT', mockRates)).toBe(0);
      expect(convertCurrency(Infinity, 'USD', 'BDT', mockRates)).toBe(0);
    });

    it('falls back to bundled rates if requested currency is missing from rate map', () => {
      const partialRates = { USD: 1.0 };
      const converted = convertCurrency(1, 'USD', 'BDT', partialRates);
      expect(converted).toBe(BUNDLED_RATES_USD.BDT);
    });
  });

  describe('getExchangeRatePair & formatRateSubtitle', () => {
    const mockRates = {
      USD: 1.0,
      BDT: 124.11,
    };

    it('returns single unit exchange rate', () => {
      expect(getExchangeRatePair('USD', 'BDT', mockRates)).toBeCloseTo(124.11, 4);
    });

    it('formats rate subtitle cleanly', () => {
      expect(formatRateSubtitle('USD', 'BDT', mockRates)).toBe('1 USD = 124.11 BDT');
    });
  });
});
