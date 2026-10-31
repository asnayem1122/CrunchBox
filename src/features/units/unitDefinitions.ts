export type UnitCategory =
  | 'LENGTH'
  | 'WEIGHT'
  | 'TEMP'
  | 'AREA'
  | 'DATA'
  | 'SPEED';

export interface UnitDef {
  id: string;
  nameEn: string;
  nameBn: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

export interface CategoryMeta {
  id: UnitCategory;
  nameEn: string;
  nameBn: string;
  iconName: string;
  units: UnitDef[];
}

export const UNIT_DEFINITIONS: Record<UnitCategory, CategoryMeta> = {
  LENGTH: {
    id: 'LENGTH',
    nameEn: 'Length',
    nameBn: 'দৈর্ঘ্য',
    iconName: 'ruler',
    units: [
      { id: 'm', nameEn: 'Meter', nameBn: 'মিটার', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', nameEn: 'Kilometer', nameBn: 'কিলোমিটার', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', nameEn: 'Centimeter', nameBn: 'সেন্টিমিটার', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01 },
      { id: 'mm', nameEn: 'Millimeter', nameBn: 'মিলিমিটার', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: 'in', nameEn: 'Inch', nameBn: 'ইঞ্চি', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'ft', nameEn: 'Foot', nameBn: 'ফুট', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'yd', nameEn: 'Yard', nameBn: 'গজ', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'mi', nameEn: 'Mile', nameBn: 'মাইল', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  WEIGHT: {
    id: 'WEIGHT',
    nameEn: 'Weight / Mass',
    nameBn: 'ওজন ও ভর',
    iconName: 'scale',
    units: [
      { id: 'kg', nameEn: 'Kilogram', nameBn: 'কিলোগ্রাম', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', nameEn: 'Gram', nameBn: 'গ্রাম', symbol: 'g', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
      { id: 'mg', nameEn: 'Milligram', nameBn: 'মিলিগ্রাম', symbol: 'mg', toBase: (v) => v * 1e-6, fromBase: (v) => v / 1e-6 },
      { id: 't', nameEn: 'Metric Ton', nameBn: 'মেট্রিক টন', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'lb', nameEn: 'Pound', nameBn: 'পাউন্ড', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', nameEn: 'Ounce', nameBn: 'আউন্স', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      { id: 'st', nameEn: 'Stone', nameBn: 'স্টোন', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
    ],
  },
  TEMP: {
    id: 'TEMP',
    nameEn: 'Temperature',
    nameBn: 'তাপমাত্রা',
    iconName: 'thermometer',
    units: [
      {
        id: 'c',
        nameEn: 'Celsius',
        nameBn: 'সেলসিয়াস',
        symbol: '°C',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'f',
        nameEn: 'Fahrenheit',
        nameBn: 'ফারেনহাইট',
        symbol: '°F',
        toBase: (v) => (v - 32) * (5 / 9),
        fromBase: (v) => v * (9 / 5) + 32,
      },
      {
        id: 'k',
        nameEn: 'Kelvin',
        nameBn: 'কেলভিন',
        symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  AREA: {
    id: 'AREA',
    nameEn: 'Area & Land',
    nameBn: 'ক্ষেত্রফল ও জমি',
    iconName: 'square',
    units: [
      { id: 'sqm', nameEn: 'Square Meter', nameBn: 'বর্গমিটার', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqft', nameEn: 'Square Foot', nameBn: 'বর্গফুট', symbol: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
      { id: 'sqyd', nameEn: 'Square Yard', nameBn: 'বর্গগজ', symbol: 'yd²', toBase: (v) => v * 0.83612736, fromBase: (v) => v / 0.83612736 },
      { id: 'acre', nameEn: 'Acre', nameBn: 'একর', symbol: 'ac', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      { id: 'hectare', nameEn: 'Hectare', nameBn: 'হেক্টর', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      // Regional South Asian / Bangladeshi Land Units
      {
        id: 'bigha',
        nameEn: 'Bigha',
        nameBn: 'বিঘা',
        symbol: 'বিঘা',
        toBase: (v) => v * 1337.803776,
        fromBase: (v) => v / 1337.803776,
      },
      {
        id: 'katha',
        nameEn: 'Katha',
        nameBn: 'কাঠা',
        symbol: 'কাঠা',
        toBase: (v) => v * 66.8901888,
        fromBase: (v) => v / 66.8901888,
      },
      {
        id: 'decimal',
        nameEn: 'Decimal / Shotangsho',
        nameBn: 'শতাংশ / ডেসিমাল',
        symbol: 'শতাংশ',
        toBase: (v) => v * 40.468564224,
        fromBase: (v) => v / 40.468564224,
      },
    ],
  },
  DATA: {
    id: 'DATA',
    nameEn: 'Data Storage',
    nameBn: 'ডাটা স্টোরেজ',
    iconName: 'database',
    units: [
      { id: 'b', nameEn: 'Byte', nameBn: 'বাইট', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', nameEn: 'Kilobyte', nameBn: 'কিলোবাইট', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', nameEn: 'Megabyte', nameBn: 'মেগাবাইট', symbol: 'MB', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
      { id: 'gb', nameEn: 'Gigabyte', nameBn: 'গিগাবাইট', symbol: 'GB', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
      { id: 'tb', nameEn: 'Terabyte', nameBn: 'টেরাবাইট', symbol: 'TB', toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
      { id: 'pb', nameEn: 'Petabyte', nameBn: 'পেটাবাইট', symbol: 'PB', toBase: (v) => v * 1024 ** 5, fromBase: (v) => v / 1024 ** 5 },
    ],
  },
  SPEED: {
    id: 'SPEED',
    nameEn: 'Speed',
    nameBn: 'গতিবেগ',
    iconName: 'zap',
    units: [
      { id: 'mps', nameEn: 'Meter per second', nameBn: 'মিটার/সেকেন্ড', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kmh', nameEn: 'Kilometer per hour', nameBn: 'কিলোমিটার/ঘণ্টা', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', nameEn: 'Mile per hour', nameBn: 'মাইল/ঘণ্টা', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', nameEn: 'Knot', nameBn: 'নট', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
};

/**
 * Converts value from one unit to another within a given category.
 */
export function convertUnitValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UnitCategory
): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  if (fromUnitId === toUnitId) {
    return value;
  }

  const catMeta = UNIT_DEFINITIONS[category];
  if (!catMeta) return value;

  const fromUnit = catMeta.units.find((u) => u.id === fromUnitId);
  const toUnit = catMeta.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  const baseVal = fromUnit.toBase(value);
  const converted = toUnit.fromBase(baseVal);

  // Floating point cleanup
  return parseFloat(converted.toPrecision(12));
}
