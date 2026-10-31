import {
  formatCurrencyAmount,
  formatCurrencyWithSymbol,
  getCurrencyDecimals,
  parseCurrencyInput,
} from '../../src/utils/formatCurrency';

describe('formatCurrency - Strict ISO 4217 Decimal Precision', () => {
  describe('getCurrencyDecimals', () => {
    it('returns 0 decimals for zero-fraction currencies (JPY, KRW, VND, IDR)', () => {
      expect(getCurrencyDecimals('JPY')).toBe(0);
      expect(getCurrencyDecimals('KRW')).toBe(0);
      expect(getCurrencyDecimals('VND')).toBe(0);
      expect(getCurrencyDecimals('IDR')).toBe(0);
    });

    it('returns 3 decimals for Middle-Eastern 3-decimal currencies (KWD, BHD, OMR, JOD)', () => {
      expect(getCurrencyDecimals('KWD')).toBe(3);
      expect(getCurrencyDecimals('BHD')).toBe(3);
      expect(getCurrencyDecimals('OMR')).toBe(3);
      expect(getCurrencyDecimals('JOD')).toBe(3);
    });

    it('returns 2 decimals for standard global currencies (BDT, USD, EUR, GBP, INR)', () => {
      expect(getCurrencyDecimals('BDT')).toBe(2);
      expect(getCurrencyDecimals('USD')).toBe(2);
      expect(getCurrencyDecimals('EUR')).toBe(2);
      expect(getCurrencyDecimals('GBP')).toBe(2);
      expect(getCurrencyDecimals('INR')).toBe(2);
    });

    it('defaults to 2 decimals for unknown currency codes', () => {
      expect(getCurrencyDecimals('UNKNOWN')).toBe(2);
    });
  });

  describe('formatCurrencyAmount', () => {
    it('formats JPY without decimal places (1500 -> 1,500)', () => {
      expect(formatCurrencyAmount(1500, 'JPY')).toBe('1,500');
      expect(formatCurrencyAmount(1500.8, 'JPY')).toBe('1,501');
    });

    it('formats KWD with exactly 3 decimal places (12.3456 -> 12.346)', () => {
      expect(formatCurrencyAmount(12.3456, 'KWD')).toBe('12.346');
      expect(formatCurrencyAmount(5, 'KWD')).toBe('5.000');
    });

    it('formats BDT with exactly 2 decimal places (1420.5 -> 1,420.50)', () => {
      expect(formatCurrencyAmount(1420.5, 'BDT')).toBe('1,420.50');
    });

    it('formats USD with exactly 2 decimal places (100 -> 100.00)', () => {
      expect(formatCurrencyAmount(100, 'USD')).toBe('100.00');
    });

    it('handles NaN and Infinity safely', () => {
      expect(formatCurrencyAmount(NaN, 'USD')).toBe('0');
      expect(formatCurrencyAmount(Infinity, 'BDT')).toBe('0');
    });
  });

  describe('formatCurrencyWithSymbol', () => {
    it('prepends official symbol for BDT (৳)', () => {
      expect(formatCurrencyWithSymbol(1420.5, 'BDT')).toBe('৳ 1,420.50');
    });

    it('prepends official symbol for USD ($)', () => {
      expect(formatCurrencyWithSymbol(120, 'USD')).toBe('$ 120.00');
    });

    it('prepends official symbol for KWD (KD)', () => {
      expect(formatCurrencyWithSymbol(15.2, 'KWD')).toBe('KD 15.200');
    });
  });

  describe('parseCurrencyInput', () => {
    it('parses formatted input string with commas', () => {
      expect(parseCurrencyInput('1,420.50')).toBe(1420.5);
      expect(parseCurrencyInput('100')).toBe(100);
      expect(parseCurrencyInput('')).toBe(0);
      expect(parseCurrencyInput('invalid')).toBe(0);
    });
  });
});
