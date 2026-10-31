import {
  evaluateExpression,
  toHexBinOct,
  computeFactorial,
  formatCalcNumber,
} from '../../src/features/calculator/calcEngine';

describe('Calculator Engine - Mandatory Precision & Features', () => {
  describe('Operator Precedence & Basic Arithmetic', () => {
    it('respects multiplication over addition (2 + 3 * 4 = 14)', () => {
      const { result } = evaluateExpression('2 + 3 * 4');
      expect(result).toBe(14);
    });

    it('respects parentheses override ((2 + 3) * 4 = 20)', () => {
      const { result } = evaluateExpression('(2 + 3) * 4');
      expect(result).toBe(20);
    });

    it('corrects floating-point drift (0.1 + 0.2 = 0.3)', () => {
      const { result } = evaluateExpression('0.1 + 0.2');
      expect(result).toBe(0.3);
    });

    it('handles unicode operators (× and ÷ and −)', () => {
      const { result } = evaluateExpression('15 ÷ 3 × 2 − 4');
      expect(result).toBe(6);
    });
  });

  describe('Implicit Multiplication', () => {
    it('supports constant implicit multiplication (2π)', () => {
      const { result } = evaluateExpression('2π', 'rad');
      expect(result).toBeCloseTo(2 * Math.PI, 10);
    });

    it('supports number before parenthesis (5(2+3) = 25)', () => {
      const { result } = evaluateExpression('5(2+3)');
      expect(result).toBe(25);
    });

    it('supports adjacent parentheses ((2)(3) = 6)', () => {
      const { result } = evaluateExpression('(2)(3)');
      expect(result).toBe(6);
    });

    it('supports number before scientific function (2sin(90) = 2)', () => {
      const { result } = evaluateExpression('2sin(90)', 'deg');
      expect(result).toBe(2);
    });
  });

  describe('Unary Negation', () => {
    it('handles unary minus at start of expression (-5 + 3 = -2)', () => {
      const { result } = evaluateExpression('-5 + 3');
      expect(result).toBe(-2);
    });

    it('handles unary minus inside parentheses (4 * (-2) = -8)', () => {
      const { result } = evaluateExpression('4 * (-2)');
      expect(result).toBe(-8);
    });

    it('handles consecutive unary negation (-5 * -3 = 15)', () => {
      const { result } = evaluateExpression('-5 * -3');
      expect(result).toBe(15);
    });

    it('handles negated parenthetical expression (-(3 + 2) = -5)', () => {
      const { result } = evaluateExpression('-(3 + 2)');
      expect(result).toBe(-5);
    });
  });

  describe('Trigonometric Precision (DEG and RAD)', () => {
    it('computes sin(90°) = 1 in DEG mode', () => {
      const { result } = evaluateExpression('sin(90)', 'deg');
      expect(result).toBe(1);
    });

    it('computes sin(180°) = 0 with zero-drift snap in DEG mode', () => {
      const { result } = evaluateExpression('sin(180)', 'deg');
      expect(result).toBe(0);
    });

    it('computes cos(90°) = 0 with zero-drift snap in DEG mode', () => {
      const { result } = evaluateExpression('cos(90)', 'deg');
      expect(result).toBe(0);
    });

    it('computes cos(0°) = 1 and cos(180°) = -1 in DEG mode', () => {
      expect(evaluateExpression('cos(0)', 'deg').result).toBe(1);
      expect(evaluateExpression('cos(180)', 'deg').result).toBe(-1);
    });

    it('returns ERROR for undefined tan(90°) in DEG mode', () => {
      const res = evaluateExpression('tan(90)', 'deg');
      expect(res.error).toBe('ERROR');
    });

    it('computes tan(45°) = 1 in DEG mode', () => {
      const { result } = evaluateExpression('tan(45)', 'deg');
      expect(result).toBe(1);
    });

    it('evaluates trig in RAD mode (sin(pi / 2) = 1)', () => {
      const { result } = evaluateExpression('sin(pi / 2)', 'rad');
      expect(result).toBe(1);
    });
  });

  describe('Factorials and Postfix Operators', () => {
    it('computes 0! = 1', () => {
      const { result } = evaluateExpression('0!');
      expect(result).toBe(1);
    });

    it('computes 1! = 1 and 5! = 120', () => {
      expect(evaluateExpression('1!').result).toBe(1);
      expect(evaluateExpression('5!').result).toBe(120);
    });

    it('rejects negative, non-integer, or overflow factorials', () => {
      expect(computeFactorial(-5)).toBeNull();
      expect(computeFactorial(3.5)).toBeNull();
      expect(computeFactorial(171)).toBeNull();
    });

    it('evaluates postfix percentage (50% * 200 = 100)', () => {
      const { result } = evaluateExpression('50% * 200');
      expect(result).toBe(100);
    });
  });

  describe('Error Handling and Safety', () => {
    it('returns ERROR on division by zero (10 / 0)', () => {
      const res = evaluateExpression('10 / 0');
      expect(res.error).toBe('ERROR');
    });

    it('returns ERROR on negative square root (sqrt(-4))', () => {
      const res = evaluateExpression('sqrt(-4)');
      expect(res.error).toBe('ERROR');
    });

    it('handles empty expression by returning 0', () => {
      const { result } = evaluateExpression('');
      expect(result).toBe(0);
    });
  });

  describe('toHexBinOct Auxiliary Representations', () => {
    it('correctly converts positive integer 255', () => {
      const { hex, bin, oct } = toHexBinOct(255);
      expect(hex).toBe('0xFF');
      expect(bin).toBe('11111111');
      expect(oct).toBe('0o377');
    });

    it('correctly converts negative integer -10', () => {
      const { hex, bin, oct } = toHexBinOct(-10);
      expect(hex).toBe('-0xA');
      expect(bin).toBe('-1010');
      expect(oct).toBe('-0o12');
    });

    it('correctly converts zero', () => {
      const { hex, bin, oct } = toHexBinOct(0);
      expect(hex).toBe('0x0');
      expect(bin).toBe('0');
      expect(oct).toBe('0o0');
    });

    it('returns placeholder dashes for NaN or non-finite values', () => {
      const { hex, bin, oct } = toHexBinOct(NaN);
      expect(hex).toBe('---');
      expect(bin).toBe('---');
      expect(oct).toBe('---');
    });
  });

  describe('formatCalcNumber helper', () => {
    it('formats regular numbers cleanly', () => {
      expect(formatCalcNumber(42)).toBe('42');
      expect(formatCalcNumber(3.14159265)).toBe('3.14159265');
    });

    it('formats NaN or Infinity as ERROR', () => {
      expect(formatCalcNumber(NaN)).toBe('ERROR');
      expect(formatCalcNumber(Infinity)).toBe('ERROR');
    });
  });
});
