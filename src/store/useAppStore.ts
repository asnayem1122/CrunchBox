import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../utils/themeTokens';
import { HardwareMode } from '../components/chassis/ModeSelector';
import {
  evaluateExpression,
  AngleMode,
  formatCalcNumber,
} from '../features/calculator/calcEngine';
import { BUNDLED_RATES_USD } from '../features/currency/bundledRates';
import { fetchExchangeRates } from '../services/exchange-rate/api';
import { UnitCategory, UNIT_DEFINITIONS } from '../features/units/unitDefinitions';
import i18n from '../localization/i18n';

export interface PaperTapeEntry {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  mode: HardwareMode;
}

export interface AppState {
  // Mode & System Appearance
  activeMode: HardwareMode;
  themeMode: ThemeMode;
  language: 'en' | 'bn';
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // Calculator State
  calcExpression: string;
  calcResult: string;
  calcMemory: number;
  angleMode: AngleMode;
  calcError: string | null;
  paperTape: PaperTapeEntry[];

  // Currency Converter State
  fromCurrency: string;
  toCurrency: string;
  currencyAmount: string;
  exchangeRates: Record<string, number>;
  ratesEffectiveDate: string;
  ratesFetchedAt: number;
  ratesSource: 'live' | 'cache' | 'bundled';
  ratesStale: boolean;
  favoriteCurrencyPairs: Array<{ from: string; to: string }>;

  // Unit Converter State
  unitCategory: UnitCategory;
  fromUnit: string;
  toUnit: string;
  unitAmount: string;

  // Actions: System
  setMode: (mode: HardwareMode) => void;
  toggleTheme: () => void;
  setThemeMode: (theme: ThemeMode) => void;
  setLanguage: (lang: 'en' | 'bn') => void;
  toggleSound: () => void;
  toggleHaptics: () => void;

  // Actions: Calculator
  inputCalcKey: (key: string) => void;
  evaluateCalc: () => void;
  clearCalc: () => void;
  deleteCalcLast: () => void;
  toggleAngleMode: () => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
  sendCalcToCurrency: () => void;

  // Actions: Paper Tape
  addPaperTapeEntry: (entry: Omit<PaperTapeEntry, 'id' | 'timestamp'>) => void;
  tearTape: () => void;
  recallTapeEntry: (id: string) => void;

  // Actions: Currency
  setCurrencies: (from: string, to: string) => void;
  swapCurrencies: () => void;
  setCurrencyAmount: (amount: string) => void;
  toggleFavoritePair: (from: string, to: string) => void;
  refreshExchangeRates: () => Promise<void>;

  // Actions: Units
  setUnitCategory: (category: UnitCategory) => void;
  setUnits: (from: string, to: string) => void;
  swapUnits: () => void;
  setUnitAmount: (amount: string) => void;
}

// SSR-safe in-memory storage fallback for web exports & testing
const memoryStorageMap = new Map<string, string>();
const ssrSafeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return memoryStorageMap.get(name) || null;
    }
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return memoryStorageMap.get(name) || null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    memoryStorageMap.set(name, value);
    if (typeof window !== 'undefined') {
      try {
        await AsyncStorage.setItem(name, value);
      } catch {
        // Fallback silently
      }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    memoryStorageMap.delete(name);
    if (typeof window !== 'undefined') {
      try {
        await AsyncStorage.removeItem(name);
      } catch {
        // Fallback silently
      }
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      activeMode: 'CALC',
      themeMode: 'field',
      language: 'en',
      soundEnabled: true,
      hapticsEnabled: true,

      // Calculator defaults
      calcExpression: '',
      calcResult: '0',
      calcMemory: 0,
      angleMode: 'deg',
      calcError: null,
      paperTape: [],

      // Currency defaults
      fromCurrency: 'USD',
      toCurrency: 'BDT',
      currencyAmount: '100',
      exchangeRates: { ...BUNDLED_RATES_USD, USD: 1.0 },
      ratesEffectiveDate: '2026-10-30',
      ratesFetchedAt: 0,
      ratesSource: 'bundled',
      ratesStale: true,
      favoriteCurrencyPairs: [
        { from: 'USD', to: 'BDT' },
        { from: 'EUR', to: 'BDT' },
        { from: 'SAR', to: 'BDT' },
        { from: 'AED', to: 'BDT' },
        { from: 'GBP', to: 'BDT' },
      ],

      // Unit Converter defaults
      unitCategory: 'AREA',
      fromUnit: 'bigha',
      toUnit: 'katha',
      unitAmount: '1',

      // System Actions
      setMode: (mode) => set({ activeMode: mode }),
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'field' ? 'tactical' : 'field',
        })),
      setThemeMode: (theme) => set({ themeMode: theme }),
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptics: () =>
        set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),

      // Calculator Keypad Actions
      inputCalcKey: (key) =>
        set((state) => {
          // If we had an error, clear it before input
          if (state.calcError) {
            return { calcError: null, calcExpression: key };
          }
          return { calcExpression: state.calcExpression + key };
        }),

      evaluateCalc: () => {
        const { calcExpression, angleMode, addPaperTapeEntry } = get();
        if (!calcExpression) return;

        const { result, error } = evaluateExpression(calcExpression, angleMode);
        if (error || Number.isNaN(result)) {
          set({ calcError: 'ERROR' });
        } else {
          const formatted = formatCalcNumber(result);
          addPaperTapeEntry({
            expression: calcExpression,
            result: formatted,
            mode: 'CALC',
          });
          set({
            calcResult: formatted,
            calcExpression: '',
            calcError: null,
          });
        }
      },

      clearCalc: () =>
        set({
          calcExpression: '',
          calcResult: '0',
          calcError: null,
        }),

      deleteCalcLast: () =>
        set((state) => {
          if (state.calcError) {
            return { calcError: null, calcExpression: '' };
          }
          return { calcExpression: state.calcExpression.slice(0, -1) };
        }),

      toggleAngleMode: () =>
        set((state) => ({
          angleMode: state.angleMode === 'deg' ? 'rad' : 'deg',
        })),

      memoryAdd: () => {
        const { calcExpression, calcResult, calcMemory, angleMode } = get();
        const target = calcExpression || calcResult;
        const { result } = evaluateExpression(target, angleMode);
        if (!Number.isNaN(result)) {
          set({ calcMemory: calcMemory + result });
        }
      },

      memorySubtract: () => {
        const { calcExpression, calcResult, calcMemory, angleMode } = get();
        const target = calcExpression || calcResult;
        const { result } = evaluateExpression(target, angleMode);
        if (!Number.isNaN(result)) {
          set({ calcMemory: calcMemory - result });
        }
      },

      memoryRecall: () => {
        const { calcMemory } = get();
        set((state) => ({
          calcExpression: state.calcExpression + calcMemory.toString(),
          calcError: null,
        }));
      },

      memoryClear: () => set({ calcMemory: 0 }),

      // Calc-to-Currency Bridge (Mandatory Rule #5)
      sendCalcToCurrency: () => {
        const { calcExpression, calcResult, angleMode, evaluateCalc } = get();
        let targetValue = calcResult;

        // If an expression is currently pending, evaluate it first
        if (calcExpression.trim()) {
          const { result, error } = evaluateExpression(calcExpression, angleMode);
          if (!error && !Number.isNaN(result)) {
            targetValue = formatCalcNumber(result);
            evaluateCalc();
          }
        }

        // Clean out negative signs or invalid chars, fallback to 100
        const numeric = Math.abs(parseFloat(targetValue.replace(/,/g, '')));
        const cleanAmount = Number.isNaN(numeric) || numeric === 0 ? '100' : numeric.toString();

        set({
          currencyAmount: cleanAmount,
          activeMode: 'CURR',
        });
      },

      // Paper Tape Receipt Actions
      addPaperTapeEntry: (entry) =>
        set((state) => {
          const newEntry: PaperTapeEntry = {
            id: `tape_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            ...entry,
          };
          // Keep up to 50 entries
          const updatedTape = [newEntry, ...state.paperTape].slice(0, 50);
          return { paperTape: updatedTape };
        }),

      tearTape: () => set({ paperTape: [] }),

      recallTapeEntry: (id) => {
        const { paperTape } = get();
        const entry = paperTape.find((item) => item.id === id);
        if (entry) {
          set({
            calcResult: entry.result,
            calcExpression: '',
            calcError: null,
            activeMode: 'CALC',
          });
        }
      },

      // Currency Actions
      setCurrencies: (from, to) =>
        set({
          fromCurrency: from.toUpperCase(),
          toCurrency: to.toUpperCase(),
        }),

      swapCurrencies: () =>
        set((state) => ({
          fromCurrency: state.toCurrency,
          toCurrency: state.fromCurrency,
        })),

      setCurrencyAmount: (amount) => set({ currencyAmount: amount }),

      toggleFavoritePair: (from, to) =>
        set((state) => {
          const existing = state.favoriteCurrencyPairs.some(
            (p) => p.from === from && p.to === to
          );
          if (existing) {
            return {
              favoriteCurrencyPairs: state.favoriteCurrencyPairs.filter(
                (p) => !(p.from === from && p.to === to)
              ),
            };
          }
          return {
            favoriteCurrencyPairs: [...state.favoriteCurrencyPairs, { from, to }],
          };
        }),

      refreshExchangeRates: async () => {
        try {
          const payload = await fetchExchangeRates();
          set({
            exchangeRates: payload.rates,
            ratesEffectiveDate: payload.effectiveDate,
            ratesFetchedAt: payload.fetchedAt,
            ratesSource: payload.source,
            ratesStale: payload.isStale,
          });
        } catch {
          // If refresh fails, keep current rates
        }
      },

      // Unit Converter Actions
      setUnitCategory: (category) => {
        const meta = UNIT_DEFINITIONS[category];
        const defaultFrom = meta?.units[0]?.id || '';
        const defaultTo = meta?.units[1]?.id || defaultFrom;
        set({
          unitCategory: category,
          fromUnit: defaultFrom,
          toUnit: defaultTo,
        });
      },

      setUnits: (from, to) => set({ fromUnit: from, toUnit: to }),

      swapUnits: () =>
        set((state) => ({
          fromUnit: state.toUnit,
          toUnit: state.fromUnit,
        })),

      setUnitAmount: (amount) => set({ unitAmount: amount }),
    }),
    {
      name: '@crunchbox_cb09_store',
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        angleMode: state.angleMode,
        calcMemory: state.calcMemory,
        paperTape: state.paperTape,
        fromCurrency: state.fromCurrency,
        toCurrency: state.toCurrency,
        currencyAmount: state.currencyAmount,
        favoriteCurrencyPairs: state.favoriteCurrencyPairs,
        unitCategory: state.unitCategory,
        fromUnit: state.fromUnit,
        toUnit: state.toUnit,
      }),
    }
  )
);
