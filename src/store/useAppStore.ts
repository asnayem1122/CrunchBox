import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, LcdBacklightMode } from '../utils/themeTokens';
import { HardwareMode } from '../components/chassis/ModeSelector';
import {
  evaluateExpression,
  AngleMode,
  formatCalcNumber,
  decimalToFraction,
  primeFactorize,
} from '../features/calculator/calcEngine';
import { BUNDLED_RATES_USD } from '../features/currency/bundledRates';
import { fetchExchangeRates } from '../services/exchange-rate/api';
import { UnitCategory, UNIT_DEFINITIONS } from '../features/units/unitDefinitions';
import {
  DevBase,
  DevWordSize,
  BitwiseOp,
  isValidDigitForBase,
  parseToBigInt,
  formatBigIntBase,
  toggleBit,
  twosComplementNegate,
  getWordMask,
} from '../features/dev/devEngine';
import i18n from '../localization/i18n';

export interface PaperTapeEntry {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  mode: HardwareMode;
  isPinned?: boolean;
}

export type DevSubDeck = 'BIN_CALC' | 'BASES' | 'ALU' | 'FLOAT' | 'TEXT' | 'DISCRETE';

export interface AppState {
  // Mode & System Appearance
  activeMode: HardwareMode;
  themeMode: ThemeMode;
  lcdBacklightMode: LcdBacklightMode;
  digitGroupingMode: 'BD' | 'INTL';
  language: 'en' | 'bn';
  soundEnabled: boolean;
  hapticsEnabled: boolean;

    // Calculator State
  calcExpression: string;
  calcResult: string;
  calcMemory: number;
  angleMode: AngleMode;
  calcError: string | null;
  fractionMode: 'DEC' | 'FRAC' | 'MIXED';
  fractionDisplay: string | null;
  primeFactorsDisplay: string | null;
  paperTape: PaperTapeEntry[];

  // Modals & Overlays
  isGuidebookOpen: boolean;
  isDiagnosticsOpen: boolean;

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

  // DEV Mode State (Strictly Strings for JSON persistence safety - Mandatory Rule 2)
  devBase: DevBase;
  devWordSize: DevWordSize;
  devOperandA: string;
  devOperandB: string;
  devOperandABase: DevBase;
  devOperandBBase: DevBase;
  devActiveRegister: 'A' | 'B';
  devSubDeck: DevSubDeck;
  devFloatInput: string;
  devTextInput: string;
  devIsSigned: boolean;
  devAluOp: BitwiseOp;

  // Actions: System & Ergonomics
  setMode: (mode: HardwareMode) => void;
  toggleTheme: () => void;
  setThemeMode: (theme: ThemeMode) => void;
  setLcdBacklightMode: (mode: LcdBacklightMode) => void;
  toggleLcdBacklight: () => void;
  toggleDigitGroupingMode: () => void;
  setLanguage: (lang: 'en' | 'bn') => void;
  toggleSound: () => void;
  toggleHaptics: () => void;

    // Actions: Calculator
  inputCalcKey: (key: string) => void;
  evaluateCalc: () => void;
  clearCalc: () => void;
  deleteCalcLast: () => void;
  cycleFractionMode: () => void;
  primeFactorizeCalc: () => void;
  toggleAngleMode: () => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
  sendCalcToCurrency: () => void;

  // Actions: Modals
  setGuidebookOpen: (open: boolean) => void;
  setDiagnosticsOpen: (open: boolean) => void;

  // Actions: Paper Tape
  addPaperTapeEntry: (entry: Omit<PaperTapeEntry, 'id' | 'timestamp'>) => void;
  tearTape: () => void;
  recallTapeEntry: (id: string) => void;
  togglePinTapeEntry: (id: string) => void;
  deleteTapeEntry: (id: string) => void;
  loadTapeToCalc: (entry: PaperTapeEntry, useAnsOnly?: boolean) => void;

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

  // Actions: DEV Mode
  setDevBase: (base: DevBase) => void;
  setDevWordSize: (size: DevWordSize) => void;
  setDevOperandA: (val: string) => void;
  setDevOperandB: (val: string) => void;
  setDevOperandABase: (base: DevBase) => void;
  setDevOperandBBase: (base: DevBase) => void;
  swapDevOperands: () => void;
  loadDevResultToA: (resultStr: string) => void;
  setDevActiveRegister: (reg: 'A' | 'B') => void;
  setDevSubDeck: (deck: DevSubDeck) => void;
  setDevFloatInput: (val: string) => void;
  setDevTextInput: (val: string) => void;
  toggleDevSigned: () => void;
  setDevAluOp: (op: BitwiseOp) => void;
  inputDevKey: (char: string) => void;
  deleteDevLast: () => void;
  clearDev: () => void;
  toggleDevBit: (bitIndex: number) => void;
  negateDevTwosComp: () => void;
  sendDevToCalc: () => void;
  sendDevToCurrency: () => void;
}

// SSR-safe in-memory storage with trailing 250ms debounced disk writes
const memoryStorageMap = new Map<string, string>();
const pendingDiskWrites = new Map<string, string>();
let diskWriteTimer: ReturnType<typeof setTimeout> | null = null;

export const flushPendingDiskWrites = async (): Promise<void> => {
  if (diskWriteTimer) {
    clearTimeout(diskWriteTimer);
    diskWriteTimer = null;
  }
  const entries = Array.from(pendingDiskWrites.entries());
  pendingDiskWrites.clear();
  for (const [key, val] of entries) {
    try {
      await AsyncStorage.setItem(key, val);
    } catch {
      // Fallback silently
    }
  }
};

const ssrSafeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (memoryStorageMap.has(name)) {
      return memoryStorageMap.get(name)!;
    }
    try {
      const val = await AsyncStorage.getItem(name);
      if (val !== null) {
        memoryStorageMap.set(name, val);
      }
      return val;
    } catch {
      return memoryStorageMap.get(name) || null;
    }
  },
  setItem: (name: string, value: string): void => {
    // 1. Immediately store in memory (0ms synchronous RAM access)
    memoryStorageMap.set(name, value);
    pendingDiskWrites.set(name, value);

    // 2. Trailing 250ms debounce before flushing to disk
    if (diskWriteTimer) {
      clearTimeout(diskWriteTimer);
    }
    diskWriteTimer = setTimeout(() => {
      diskWriteTimer = null;
      const val = pendingDiskWrites.get(name);
      if (val !== undefined) {
        pendingDiskWrites.delete(name);
        AsyncStorage.setItem(name, val).catch(() => {});
      }
    }, 250);
  },
  removeItem: async (name: string): Promise<void> => {
    if (diskWriteTimer) {
      clearTimeout(diskWriteTimer);
      diskWriteTimer = null;
    }
    pendingDiskWrites.delete(name);
    memoryStorageMap.delete(name);
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Fallback silently
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // System Defaults
      activeMode: 'CALC',
      themeMode: 'field',
      lcdBacklightMode: 'sage',
      digitGroupingMode: 'INTL',
      language: 'en',
      soundEnabled: true,
      hapticsEnabled: true,

            // Calculator Defaults
      calcExpression: '',
      calcResult: '0',
      calcMemory: 0,
      angleMode: 'deg',
      calcError: null,
      fractionMode: 'DEC',
      fractionDisplay: null,
      primeFactorsDisplay: null,
      paperTape: [],

      // Modals
      isGuidebookOpen: false,
      isDiagnosticsOpen: false,

      // Currency Defaults
      fromCurrency: 'USD',
      toCurrency: 'BDT',
      currencyAmount: '1',
      exchangeRates: { ...BUNDLED_RATES_USD, USD: 1 },
      ratesEffectiveDate: '2026-10-30',
      ratesFetchedAt: 0,
      ratesSource: 'bundled',
      ratesStale: true,
      favoriteCurrencyPairs: [
        { from: 'USD', to: 'BDT' },
        { from: 'EUR', to: 'BDT' },
        { from: 'SAR', to: 'BDT' },
        { from: 'AED', to: 'BDT' },
      ],

      // Units Defaults
      unitCategory: 'AREA',
      fromUnit: 'bigha',
      toUnit: 'katha',
      unitAmount: '1',

      // DEV Mode Defaults (Strings for state safety)
      devBase: 'HEX',
      devWordSize: 32,
      devOperandA: '172',
      devOperandB: '15',
      devOperandABase: 'BIN',
      devOperandBBase: 'DEC',
      devActiveRegister: 'A',
      devSubDeck: 'BIN_CALC',
      devFloatInput: '-12.375',
      devTextInput: 'Crunch',
      devIsSigned: false,
      devAluOp: 'AND',

      // System Actions
      setMode: (mode) => set({ activeMode: mode }),

      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'field' ? 'tactical' : 'field',
        })),

      setThemeMode: (theme) => set({ themeMode: theme }),

      setLcdBacklightMode: (mode) => set({ lcdBacklightMode: mode }),

      toggleLcdBacklight: () =>
        set((state) => {
          const next =
            state.lcdBacklightMode === 'sage'
              ? 'amber'
              : state.lcdBacklightMode === 'amber'
              ? 'stealth'
              : 'sage';
          return { lcdBacklightMode: next };
        }),

      toggleDigitGroupingMode: () =>
        set((state) => ({
          digitGroupingMode: state.digitGroupingMode === 'INTL' ? 'BD' : 'INTL',
        })),

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),

            // Calculator Actions
      inputCalcKey: (key) =>
        set((state) => {
          if (state.calcError) {
            return {
              calcError: null,
              calcExpression: key,
              calcResult: key,
              fractionMode: 'DEC',
              fractionDisplay: null,
              primeFactorsDisplay: null,
            };
          }
          const nextExpr = state.calcExpression + key;
          return {
            calcExpression: nextExpr,
            fractionMode: 'DEC',
            fractionDisplay: null,
            primeFactorsDisplay: null,
          };
        }),

      evaluateCalc: () => {
        const { calcExpression, angleMode, addPaperTapeEntry, activeMode } = get();
        if (!calcExpression || calcExpression.trim() === '') return;

        try {
          const evalResult = evaluateExpression(calcExpression, angleMode);
          if (evalResult.error) {
            set({ calcError: evalResult.error });
            return;
          }
          const formatted = formatCalcNumber(evalResult.result);
          addPaperTapeEntry({
            expression: calcExpression,
            result: formatted,
            mode: activeMode,
          });
          set({
            calcResult: formatted,
            calcExpression: '',
            calcError: null,
            fractionMode: 'DEC',
            fractionDisplay: null,
            primeFactorsDisplay: null,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error';
          set({ calcError: msg });
        }
      },

      clearCalc: () =>
        set({
          calcExpression: '',
          calcResult: '0',
          calcError: null,
          fractionMode: 'DEC',
          fractionDisplay: null,
          primeFactorsDisplay: null,
        }),

      deleteCalcLast: () =>
        set((state) => {
          if (state.calcError) {
            return {
              calcError: null,
              calcResult: '0',
              fractionMode: 'DEC',
              fractionDisplay: null,
              primeFactorsDisplay: null,
            };
          }
          if (state.calcExpression.length > 0) {
            return {
              calcExpression: state.calcExpression.slice(0, -1),
              fractionMode: 'DEC',
              fractionDisplay: null,
              primeFactorsDisplay: null,
            };
          }
          return {};
        }),

      cycleFractionMode: () => {
        const { calcResult, fractionMode } = get();
        const num = parseFloat(calcResult.replace(/,/g, ''));
        if (Number.isNaN(num) || !Number.isFinite(num)) return;
        const frac = decimalToFraction(num);
        if (!frac) return;

        const nextMode =
          fractionMode === 'DEC' ? 'FRAC' : fractionMode === 'FRAC' ? 'MIXED' : 'DEC';

        let display: string | null = null;
        if (nextMode === 'FRAC') display = frac.displayFrac;
        else if (nextMode === 'MIXED') display = frac.displayMixed;
        else display = null;

        set({ fractionMode: nextMode, fractionDisplay: display });
      },

      primeFactorizeCalc: () => {
        const { calcResult } = get();
        const num = parseFloat(calcResult.replace(/,/g, ''));
        const fact = primeFactorize(num);
        if (fact) {
          set({ primeFactorsDisplay: fact });
        }
      },

      // Modal Actions
      setGuidebookOpen: (open) => set({ isGuidebookOpen: open }),
      setDiagnosticsOpen: (open) => set({ isDiagnosticsOpen: open }),

      toggleAngleMode: () =>
        set((state) => ({
          angleMode: state.angleMode === 'deg' ? 'rad' : 'deg',
        })),

      memoryAdd: () => {
        const { calcResult, calcMemory } = get();
        const num = parseFloat(calcResult.replace(/,/g, ''));
        if (!Number.isNaN(num)) {
          set({ calcMemory: calcMemory + num });
        }
      },

      memorySubtract: () => {
        const { calcResult, calcMemory } = get();
        const num = parseFloat(calcResult.replace(/,/g, ''));
        if (!Number.isNaN(num)) {
          set({ calcMemory: calcMemory - num });
        }
      },

      memoryRecall: () => {
        const { calcMemory } = get();
        const formatted = formatCalcNumber(calcMemory);
        set({
          calcResult: formatted,
          calcExpression: formatted,
          calcError: null,
        });
      },

      memoryClear: () => set({ calcMemory: 0 }),

      sendCalcToCurrency: () => {
        const { calcExpression, calcResult, angleMode, evaluateCalc } = get();
        let targetValue = calcResult;

        // If an expression is currently pending, evaluate it first
        if (calcExpression.trim()) {
          const evalRes = evaluateExpression(calcExpression, angleMode);
          if (!evalRes.error && !Number.isNaN(evalRes.result)) {
            targetValue = formatCalcNumber(evalRes.result);
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

      // Paper Tape Actions
      addPaperTapeEntry: (entry) =>
        set((state) => {
          const newEntry: PaperTapeEntry = {
            ...entry,
            id: `tape_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: Date.now(),
            isPinned: false,
          };
          const updatedTape = [newEntry, ...state.paperTape].slice(0, 50);
          return { paperTape: updatedTape };
        }),

      tearTape: () =>
        set((state) => {
          // Keep pinned entries, clear unpinned
          const pinnedOnly = state.paperTape.filter((item) => item.isPinned);
          return { paperTape: pinnedOnly.length === state.paperTape.length ? [] : pinnedOnly };
        }),

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

      togglePinTapeEntry: (id) =>
        set((state) => ({
          paperTape: state.paperTape.map((item) =>
            item.id === id ? { ...item, isPinned: !item.isPinned } : item
          ),
        })),

      deleteTapeEntry: (id) =>
        set((state) => ({
          paperTape: state.paperTape.filter((item) => item.id !== id),
        })),

      loadTapeToCalc: (entry, useAnsOnly = false) =>
        set((state) => {
          if (useAnsOnly) {
            const nextExpr = state.calcExpression ? state.calcExpression + entry.result : entry.result;
            return {
              calcExpression: nextExpr,
              fractionMode: 'DEC',
              fractionDisplay: null,
              primeFactorsDisplay: null,
              activeMode: 'CALC',
            };
          }
          return {
            calcExpression: entry.expression,
            calcResult: entry.result,
            fractionMode: 'DEC',
            fractionDisplay: null,
            primeFactorsDisplay: null,
            activeMode: 'CALC',
          };
        }),

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

      // DEV Mode Actions
      setDevBase: (base) => set({ devBase: base }),

      setDevWordSize: (size) =>
        set((state) => {
          const mask = getWordMask(size);
          const a = (parseToBigInt(state.devOperandA, state.devBase) & mask).toString(10);
          const b = (parseToBigInt(state.devOperandB, state.devBase) & mask).toString(10);
          return {
            devWordSize: size,
            devOperandA: a,
            devOperandB: b,
          };
        }),

      setDevOperandA: (val) => set({ devOperandA: val }),

      setDevOperandB: (val) => set({ devOperandB: val }),

      setDevOperandABase: (base) => set({ devOperandABase: base, devBase: base }),

      setDevOperandBBase: (base) => set({ devOperandBBase: base, devBase: base }),

      swapDevOperands: () =>
        set((state) => ({
          devOperandA: state.devOperandB,
          devOperandB: state.devOperandA,
          devOperandABase: state.devOperandBBase,
          devOperandBBase: state.devOperandABase,
        })),

      loadDevResultToA: (resultStr) => {
        const mask = getWordMask(get().devWordSize);
        const parsed = parseToBigInt(resultStr, 'DEC') & mask;
        set({ devOperandA: parsed.toString(10), devActiveRegister: 'A' });
      },

      setDevActiveRegister: (reg) => set({ devActiveRegister: reg }),

      setDevSubDeck: (deck) => set({ devSubDeck: deck }),

      setDevFloatInput: (val) => set({ devFloatInput: val }),

      setDevTextInput: (val) => set({ devTextInput: val }),

      toggleDevSigned: () => set((state) => ({ devIsSigned: !state.devIsSigned })),

      setDevAluOp: (op) => set({ devAluOp: op }),

      inputDevKey: (char) =>
        set((state) => {
          const { devBase, devWordSize, devActiveRegister } = state;
          if (!isValidDigitForBase(char, devBase)) return {};

          const currentVal = devActiveRegister === 'A' ? state.devOperandA : state.devOperandB;
          let currentDisplay = '';
          const currentBig = parseToBigInt(currentVal, 'DEC');
          if (devBase === 'HEX') currentDisplay = currentBig.toString(16).toUpperCase();
          else if (devBase === 'BIN') currentDisplay = currentBig.toString(2);
          else if (devBase === 'OCT') currentDisplay = currentBig.toString(8);
          else currentDisplay = currentBig.toString(10);

          if (currentDisplay === '0') currentDisplay = '';
          const nextDisplay = currentDisplay + char.toUpperCase();

          const parsed = parseToBigInt(nextDisplay, devBase);
          const mask = getWordMask(devWordSize);
          const clamped = (parsed & mask).toString(10);

          if (devActiveRegister === 'A') {
            return { devOperandA: clamped };
          }
          return { devOperandB: clamped };
        }),

      deleteDevLast: () =>
        set((state) => {
          const { devBase, devActiveRegister } = state;
          const currentVal = devActiveRegister === 'A' ? state.devOperandA : state.devOperandB;
          const currentBig = parseToBigInt(currentVal, 'DEC');

          let str = '';
          if (devBase === 'HEX') str = currentBig.toString(16).toUpperCase();
          else if (devBase === 'BIN') str = currentBig.toString(2);
          else if (devBase === 'OCT') str = currentBig.toString(8);
          else str = currentBig.toString(10);

          if (str.length <= 1) {
            return devActiveRegister === 'A' ? { devOperandA: '0' } : { devOperandB: '0' };
          }
          const sliced = str.slice(0, -1);
          const parsed = parseToBigInt(sliced, devBase).toString(10);
          return devActiveRegister === 'A' ? { devOperandA: parsed } : { devOperandB: parsed };
        }),

      clearDev: () =>
        set((state) =>
          state.devActiveRegister === 'A' ? { devOperandA: '0' } : { devOperandB: '0' }
        ),

      toggleDevBit: (bitIndex) =>
        set((state) => {
          const { devActiveRegister, devWordSize } = state;
          const currentVal = devActiveRegister === 'A' ? state.devOperandA : state.devOperandB;
          const nextVal = toggleBit(currentVal, bitIndex, devWordSize);
          return devActiveRegister === 'A' ? { devOperandA: nextVal } : { devOperandB: nextVal };
        }),

      negateDevTwosComp: () =>
        set((state) => {
          const { devActiveRegister, devWordSize } = state;
          const currentVal = devActiveRegister === 'A' ? state.devOperandA : state.devOperandB;
          const negated = twosComplementNegate(currentVal, devWordSize);
          return devActiveRegister === 'A' ? { devOperandA: negated } : { devOperandB: negated };
        }),

      sendDevToCalc: () => {
        const { devOperandA } = get();
        const big = parseToBigInt(devOperandA, 'DEC');
        if (big <= BigInt(Number.MAX_SAFE_INTEGER) && big >= BigInt(-Number.MAX_SAFE_INTEGER)) {
          set({
            calcResult: big.toString(10),
            calcExpression: '',
            calcError: null,
            activeMode: 'CALC',
          });
        }
      },

      sendDevToCurrency: () => {
        const { devOperandA } = get();
        const big = parseToBigInt(devOperandA, 'DEC');
        if (big <= BigInt(Number.MAX_SAFE_INTEGER) && big >= 0n) {
          set({
            currencyAmount: big.toString(10),
            activeMode: 'CURR',
          });
        }
      },
    }),
    {
      name: '@crunchbox_cb09_store',
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        lcdBacklightMode: state.lcdBacklightMode,
        digitGroupingMode: state.digitGroupingMode,
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
        devBase: state.devBase,
        devWordSize: state.devWordSize,
        devOperandA: state.devOperandA,
        devOperandB: state.devOperandB,
        devOperandABase: state.devOperandABase,
        devOperandBBase: state.devOperandBBase,
        devFloatInput: state.devFloatInput,
        devTextInput: state.devTextInput,
        devIsSigned: state.devIsSigned,
        devSubDeck: state.devSubDeck,
      }),
    }
  )
);
