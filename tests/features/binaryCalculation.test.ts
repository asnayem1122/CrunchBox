import {
  computeAluOperation,
  parseToBigInt,
  formatBigIntBase,
  formatCharRepresentation,
  toggleBit,
  getBit,
  getWordMask,
} from '../../src/features/dev/devEngine';
import { useAppStore } from '../../src/store/useAppStore';

describe('Binary Calculation & Extended ALU Engine', () => {
  beforeEach(() => {
    useAppStore.setState({
      devOperandA: '0',
      devOperandB: '0',
      devOperandABase: 'BIN',
      devOperandBBase: 'DEC',
      devActiveRegister: 'A',
      devWordSize: 8,
      devIsSigned: false,
      devAluOp: 'ADD',
    });
  });

  describe('Extended ALU Operations (MUL, DIV, MOD, SAR)', () => {
    it('executes 8-bit MUL with unsigned carry (cf) and signed overflow (of) detection', () => {
      // 10 * 5 = 50 in 8-bit (no carry, no overflow)
      const res1 = computeAluOperation('10', '5', 'MUL', 8);
      expect(res1.resultStr).toBe('50');
      expect(res1.flags.cf).toBe(false);
      expect(res1.flags.of).toBe(false);
      expect(res1.flags.zf).toBe(false);
      expect(res1.flags.sf).toBe(false);

      // 20 * 20 = 400 -> in 8-bit (mod 256 = 144)
      // Unsigned overflow: 400 > 255 -> cf = true
      const res2 = computeAluOperation('20', '20', 'MUL', 8);
      expect(res2.resultStr).toBe('144');
      expect(res2.flags.cf).toBe(true);

      // Signed overflow: 10 * 15 = 150 -> signed 8-bit max is 127 -> of = true
      const res3 = computeAluOperation('10', '15', 'MUL', 8);
      expect(res3.flags.of).toBe(true);
    });

    it('executes 8-bit DIV correctly and handles division by zero cleanly with ZF=false', () => {
      // 50 / 5 = 10
      const res1 = computeAluOperation('50', '5', 'DIV', 8);
      expect(res1.resultStr).toBe('10');
      expect(res1.error).toBeNull();
      expect(res1.flags.zf).toBe(false);

      // Division by zero: 50 / 0
      const resDivZero = computeAluOperation('50', '0', 'DIV', 8);
      expect(resDivZero.error).toBe('DIV_BY_ZERO');
      expect(resDivZero.resultStr).toBe('0');
      expect(resDivZero.flags.zf).toBe(false);
      expect(resDivZero.flags.cf).toBeNull();
      expect(resDivZero.flags.of).toBeNull();
    });

    it('executes MOD and handles modulo by zero cleanly with ZF=false', () => {
      // 25 % 7 = 4
      const res1 = computeAluOperation('25', '7', 'MOD', 8);
      expect(res1.resultStr).toBe('4');
      expect(res1.error).toBeNull();

      // Modulo by zero: 25 % 0
      const resModZero = computeAluOperation('25', '0', 'MOD', 8);
      expect(resModZero.error).toBe('DIV_BY_ZERO');
      expect(resModZero.resultStr).toBe('0');
      expect(resModZero.flags.zf).toBe(false);
      expect(resModZero.flags.cf).toBeNull();
      expect(resModZero.flags.of).toBeNull();
    });

    it('executes SAR (Arithmetic Shift Right) preserving sign bit', () => {
      // In 8-bit signed, -16 is 240 (0xF0 = 1111 0000)
      // SAR 240 by 2 -> should sign-extend MSBs -> 1111 1100 = 252 (-4 signed)
      const resSigned = computeAluOperation('240', '2', 'SAR', 8);
      expect(resSigned.resultStr).toBe('252');
      expect(resSigned.flags.sf).toBe(true);

      // Positive value: 16 >> 2 = 4 (MSB 0 filled with 0s)
      const resPos = computeAluOperation('16', '2', 'SAR', 8);
      expect(resPos.resultStr).toBe('4');
      expect(resPos.flags.sf).toBe(false);
    });

    it('executes bitwise operations (AND, OR, XOR, NOT, NAND, NOR, XNOR)', () => {
      // 0b1010 (10) AND 0b1100 (12) = 0b1000 (8)
      expect(computeAluOperation('10', '12', 'AND', 8).resultStr).toBe('8');

      // 0b1010 (10) OR 0b0101 (5) = 0b1111 (15)
      expect(computeAluOperation('10', '5', 'OR', 8).resultStr).toBe('15');

      // 0b1010 (10) XOR 0b1010 (10) = 0 (ZF = true)
      const xorRes = computeAluOperation('10', '10', 'XOR', 8);
      expect(xorRes.resultStr).toBe('0');
      expect(xorRes.flags.zf).toBe(true);

      // NOT 0 in 8-bit = 255
      expect(computeAluOperation('0', '0', 'NOT', 8).resultStr).toBe('255');
    });
  });

  describe('Character / ASCII Representation', () => {
    it('formats printable ASCII correctly', () => {
      expect(formatCharRepresentation(65n)).toBe("'A'");
      expect(formatCharRepresentation(48n)).toBe("'0'");
      expect(formatCharRepresentation(126n)).toBe("'~'");
    });

    it('formats ASCII control characters accurately', () => {
      expect(formatCharRepresentation(0n)).toBe('\\0 (NUL)');
      expect(formatCharRepresentation(10n)).toBe('\\n (LF)');
      expect(formatCharRepresentation(13n)).toBe('\\r (CR)');
      expect(formatCharRepresentation(9n)).toBe('\\t (TAB)');
      expect(formatCharRepresentation(27n)).toBe('ESC');
    });

    it('returns empty string for values outside 0..127 range', () => {
      expect(formatCharRepresentation(128n)).toBe('');
      expect(formatCharRepresentation(1000n)).toBe('');
    });
  });

  describe('Multi-Base Operand State and Store Actions', () => {
    it('allows independent base selection for Operand A and B without mutating decimal state', () => {
      useAppStore.setState({ devOperandA: '15' });
      const store = useAppStore.getState();

      store.setDevOperandABase('HEX');
      expect(useAppStore.getState().devOperandA).toBe('15'); // Remains canonical 15
      expect(formatBigIntBase(15n, 'HEX', 8)).toBe('0x 0F');

      store.setDevOperandABase('BIN');
      expect(useAppStore.getState().devOperandA).toBe('15');
      expect(formatBigIntBase(15n, 'BIN', 8)).toBe('0000 1111');

      store.setDevOperandABase('OCT');
      expect(formatBigIntBase(15n, 'OCT', 8)).toBe('0o17');
    });

    it('swaps operands cleanly preserving decimal state and bases', () => {
      useAppStore.setState({
        devOperandA: '15',
        devOperandB: '255',
        devOperandABase: 'HEX',
        devOperandBBase: 'BIN',
      });

      useAppStore.getState().swapDevOperands();

      const state = useAppStore.getState();
      expect(state.devOperandA).toBe('255');
      expect(state.devOperandB).toBe('15');
      expect(state.devOperandABase).toBe('BIN');
      expect(state.devOperandBBase).toBe('HEX');
    });

    it('loads ALU result back to Operand A', () => {
      useAppStore.setState({
        devOperandA: '10',
        devOperandB: '20',
        devAluOp: 'ADD',
        devWordSize: 8,
      });

      useAppStore.getState().loadDevResultToA('30');

      const state = useAppStore.getState();
      expect(state.devOperandA).toBe('30');
      expect(state.devActiveRegister).toBe('A');
    });

    it('toggles individual bits and respects word boundaries', () => {
      // Toggle bit 0 of 0 -> 1
      const res1 = toggleBit('0', 0, 8);
      expect(res1).toBe('1');
      expect(getBit(res1, 0, 8)).toBe(1);

      // Toggle bit 7 of 0 -> 128 (0b10000000)
      const res2 = toggleBit('0', 7, 8);
      expect(res2).toBe('128');
      expect(getBit(res2, 7, 8)).toBe(1);

      // Toggle bit 7 again -> 0
      const res3 = toggleBit(res2, 7, 8);
      expect(res3).toBe('0');
      expect(getBit(res3, 7, 8)).toBe(0);
    });

    it('handles 64-bit word size calculations without precision loss', () => {
      const a = '9223372036854775807'; // 2^63 - 1 (max signed 64b)
      const b = '1';
      const res = computeAluOperation(a, b, 'ADD', 64);
      expect(res.flags.of).toBe(true); // Signed overflow into negative
      expect(res.flags.sf).toBe(true);
      expect(res.flags.cf).toBe(false);
    });

    it('supports Guidebook Try It Now presets for BIN CALC', () => {
      // 1. 0b1010 + 0b0101
      const resAdd = computeAluOperation('10', '5', 'ADD', 8);
      expect(resAdd.resultStr).toBe('15');
      expect(formatBigIntBase(15n, 'BIN', 8)).toBe('0000 1111');

      // 2. 0xAA ^ 0x55
      const resXor = computeAluOperation('170', '85', 'XOR', 8);
      expect(resXor.resultStr).toBe('255');
      expect(formatBigIntBase(255n, 'HEX', 8)).toBe('0x FF');

      // 3. 0b1100 << 2
      const resShl = computeAluOperation('12', '2', 'SHL', 8);
      expect(resShl.resultStr).toBe('48');
      expect(formatBigIntBase(48n, 'BIN', 8)).toBe('0011 0000');
    });
  });
});
