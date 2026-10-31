import {
  convertUnitValue,
  UNIT_DEFINITIONS,
} from '../../src/features/units/unitDefinitions';

describe('Unit Definitions & Converter Engine', () => {
  describe('South Asian Land Unit Math Precision', () => {
    it('converts 1 Bigha to exactly 20 Katha', () => {
      const katha = convertUnitValue(1, 'bigha', 'katha', 'AREA');
      expect(katha).toBeCloseTo(20, 5);
    });

    it('converts 1 Katha to approximately 1.65289 Decimal (720 / 435.6)', () => {
      const decimal = convertUnitValue(1, 'katha', 'decimal', 'AREA');
      const expected = 720 / 435.6; // 1.65289256198
      expect(decimal).toBeCloseTo(expected, 4);
      expect(decimal).toBeCloseTo(1.65289, 4);
    });

    it('converts 1 Bigha to approximately 33.05785 Decimal (14,400 / 435.6)', () => {
      const decimal = convertUnitValue(1, 'bigha', 'decimal', 'AREA');
      const expected = 14400 / 435.6; // 33.05785124
      expect(decimal).toBeCloseTo(expected, 4);
      expect(decimal).toBeCloseTo(33.05785, 4);
    });

    it('converts 1 Acre to exactly 100 Decimal / Shotangsho', () => {
      const decimal = convertUnitValue(1, 'acre', 'decimal', 'AREA');
      expect(decimal).toBeCloseTo(100, 5);
    });

    it('converts land units to square meters with exact definition factors', () => {
      expect(convertUnitValue(1, 'bigha', 'sqm', 'AREA')).toBeCloseTo(1337.803776, 5);
      expect(convertUnitValue(1, 'katha', 'sqm', 'AREA')).toBeCloseTo(66.8901888, 5);
      expect(convertUnitValue(1, 'decimal', 'sqm', 'AREA')).toBeCloseTo(40.468564224, 5);
    });
  });

  describe('Temperature Exact Affine Conversions', () => {
    it('converts Celsius to Fahrenheit and back (0°C = 32°F, 100°C = 212°F)', () => {
      expect(convertUnitValue(0, 'c', 'f', 'TEMP')).toBe(32);
      expect(convertUnitValue(100, 'c', 'f', 'TEMP')).toBe(212);
      expect(convertUnitValue(32, 'f', 'c', 'TEMP')).toBe(0);
      expect(convertUnitValue(212, 'f', 'c', 'TEMP')).toBe(100);
      expect(convertUnitValue(-40, 'c', 'f', 'TEMP')).toBe(-40);
    });

    it('converts Celsius to Kelvin and back (0°C = 273.15 K)', () => {
      expect(convertUnitValue(0, 'c', 'k', 'TEMP')).toBe(273.15);
      expect(convertUnitValue(273.15, 'k', 'c', 'TEMP')).toBe(0);
    });
  });

  describe('Length, Weight, Data, and Speed Conversions', () => {
    it('converts length (1 km = 1000 m, 1 in = 2.54 cm)', () => {
      expect(convertUnitValue(1, 'km', 'm', 'LENGTH')).toBe(1000);
      expect(convertUnitValue(1, 'in', 'cm', 'LENGTH')).toBe(2.54);
    });

    it('converts weight (1 kg = 1000 g, 1 lb ≈ 0.45359 kg)', () => {
      expect(convertUnitValue(1, 'kg', 'g', 'WEIGHT')).toBe(1000);
      expect(convertUnitValue(1, 'lb', 'kg', 'WEIGHT')).toBeCloseTo(0.453592, 4);
    });

    it('converts binary data storage (1 GB = 1024 MB)', () => {
      expect(convertUnitValue(1, 'gb', 'mb', 'DATA')).toBe(1024);
      expect(convertUnitValue(1024, 'kb', 'mb', 'DATA')).toBe(1);
    });

    it('converts speed (36 km/h = 10 m/s)', () => {
      expect(convertUnitValue(36, 'kmh', 'mps', 'SPEED')).toBe(10);
    });
  });

  describe('Edge Cases and Stability', () => {
    it('returns original value when from and to units match', () => {
      expect(convertUnitValue(42, 'm', 'm', 'LENGTH')).toBe(42);
    });

    it('returns 0 for NaN or invalid numbers', () => {
      expect(convertUnitValue(NaN, 'm', 'km', 'LENGTH')).toBe(0);
    });
  });
});
