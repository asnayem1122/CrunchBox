import { useAppStore } from '../../src/store/useAppStore';

describe('useAppStore - Global State & Mandatory Bridges', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      activeMode: 'CALC',
      themeMode: 'field',
      calcExpression: '',
      calcResult: '0',
      calcMemory: 0,
      angleMode: 'deg',
      calcError: null,
      paperTape: [],
      fromCurrency: 'USD',
      toCurrency: 'BDT',
      currencyAmount: '100',
      unitCategory: 'AREA',
      fromUnit: 'bigha',
      toUnit: 'katha',
      unitAmount: '1',
    });
  });

  describe('Calculator Keypad & Memory Actions', () => {
    it('inputs keys into calcExpression', () => {
      useAppStore.getState().inputCalcKey('1');
      useAppStore.getState().inputCalcKey('5');
      useAppStore.getState().inputCalcKey('+');
      useAppStore.getState().inputCalcKey('5');
      expect(useAppStore.getState().calcExpression).toBe('15+5');
    });

    it('deletes last character with deleteCalcLast', () => {
      useAppStore.getState().inputCalcKey('123');
      useAppStore.getState().deleteCalcLast();
      expect(useAppStore.getState().calcExpression).toBe('12');
    });

    it('clears calculator with clearCalc', () => {
      useAppStore.getState().inputCalcKey('123');
      useAppStore.getState().clearCalc();
      expect(useAppStore.getState().calcExpression).toBe('');
      expect(useAppStore.getState().calcResult).toBe('0');
      expect(useAppStore.getState().calcError).toBeNull();
    });

    it('evaluates expression and records to paperTape', () => {
      useAppStore.getState().inputCalcKey('25*4');
      useAppStore.getState().evaluateCalc();

      expect(useAppStore.getState().calcResult).toBe('100');
      expect(useAppStore.getState().calcExpression).toBe('');
      expect(useAppStore.getState().paperTape.length).toBe(1);
      expect(useAppStore.getState().paperTape[0].expression).toBe('25*4');
      expect(useAppStore.getState().paperTape[0].result).toBe('100');
    });

    it('toggles angle mode between deg and rad', () => {
      expect(useAppStore.getState().angleMode).toBe('deg');
      useAppStore.getState().toggleAngleMode();
      expect(useAppStore.getState().angleMode).toBe('rad');
      useAppStore.getState().toggleAngleMode();
      expect(useAppStore.getState().angleMode).toBe('deg');
    });

    it('manages memory registers (add, subtract, recall, clear)', () => {
      useAppStore.getState().inputCalcKey('50');
      useAppStore.getState().evaluateCalc();
      useAppStore.getState().memoryAdd();
      expect(useAppStore.getState().calcMemory).toBe(50);

      useAppStore.getState().inputCalcKey('20');
      useAppStore.getState().evaluateCalc();
      useAppStore.getState().memorySubtract();
      expect(useAppStore.getState().calcMemory).toBe(30);

      useAppStore.getState().clearCalc();
      useAppStore.getState().memoryRecall();
      expect(useAppStore.getState().calcExpression).toBe('30');

      useAppStore.getState().memoryClear();
      expect(useAppStore.getState().calcMemory).toBe(0);
    });
  });

  describe('Calc-to-Currency Bridge (sendCalcToCurrency)', () => {
    it('evaluates active expression and bridges result into currency amount', () => {
      useAppStore.getState().inputCalcKey('150*2');
      useAppStore.getState().sendCalcToCurrency();

      expect(useAppStore.getState().currencyAmount).toBe('300');
      expect(useAppStore.getState().activeMode).toBe('CURR');
    });

    it('bridges existing calcResult when no pending expression exists', () => {
      useAppStore.setState({ calcResult: '1420.50', calcExpression: '' });
      useAppStore.getState().sendCalcToCurrency();

      expect(useAppStore.getState().currencyAmount).toBe('1420.5');
      expect(useAppStore.getState().activeMode).toBe('CURR');
    });

    it('converts negative results to absolute positive currency amounts', () => {
      useAppStore.setState({ calcResult: '-500', calcExpression: '' });
      useAppStore.getState().sendCalcToCurrency();

      expect(useAppStore.getState().currencyAmount).toBe('500');
    });
  });

  describe('Currency Converter Actions', () => {
    it('sets currencies and swaps currencies', () => {
      useAppStore.getState().setCurrencies('EUR', 'USD');
      expect(useAppStore.getState().fromCurrency).toBe('EUR');
      expect(useAppStore.getState().toCurrency).toBe('USD');

      useAppStore.getState().swapCurrencies();
      expect(useAppStore.getState().fromCurrency).toBe('USD');
      expect(useAppStore.getState().toCurrency).toBe('EUR');
    });

    it('toggles favorite currency pairs', () => {
      const initialCount = useAppStore.getState().favoriteCurrencyPairs.length;
      useAppStore.getState().toggleFavoritePair('JPY', 'BDT');
      expect(useAppStore.getState().favoriteCurrencyPairs.some((p) => p.from === 'JPY' && p.to === 'BDT')).toBe(true);

      useAppStore.getState().toggleFavoritePair('JPY', 'BDT');
      expect(useAppStore.getState().favoriteCurrencyPairs.some((p) => p.from === 'JPY' && p.to === 'BDT')).toBe(false);
      expect(useAppStore.getState().favoriteCurrencyPairs.length).toBe(initialCount);
    });
  });

  describe('Paper Tape Actions', () => {
    it('caps paper tape at 50 entries', () => {
      for (let i = 0; i < 55; i++) {
        useAppStore.getState().addPaperTapeEntry({
          expression: `${i}+1`,
          result: `${i + 1}`,
          mode: 'CALC',
        });
      }
      expect(useAppStore.getState().paperTape.length).toBe(50);
    });

    it('tears paper tape history with tearTape', () => {
      useAppStore.getState().addPaperTapeEntry({ expression: '1+1', result: '2', mode: 'CALC' });
      expect(useAppStore.getState().paperTape.length).toBe(1);

      useAppStore.getState().tearTape();
      expect(useAppStore.getState().paperTape.length).toBe(0);
    });

    it('recalls an entry into the calculator buffer', () => {
      useAppStore.getState().addPaperTapeEntry({ expression: '100*5', result: '500', mode: 'CALC' });
      const entryId = useAppStore.getState().paperTape[0].id;

      useAppStore.getState().clearCalc();
      useAppStore.getState().recallTapeEntry(entryId);

      expect(useAppStore.getState().calcResult).toBe('500');
      expect(useAppStore.getState().activeMode).toBe('CALC');
    });
  });

  describe('Unit Converter Actions', () => {
    it('sets unit category, units, and swaps units', () => {
      useAppStore.getState().setUnitCategory('LENGTH');
      expect(useAppStore.getState().unitCategory).toBe('LENGTH');

      useAppStore.getState().setUnits('km', 'm');
      expect(useAppStore.getState().fromUnit).toBe('km');
      expect(useAppStore.getState().toUnit).toBe('m');

      useAppStore.getState().swapUnits();
      expect(useAppStore.getState().fromUnit).toBe('m');
      expect(useAppStore.getState().toUnit).toBe('km');
    });
  });
});
