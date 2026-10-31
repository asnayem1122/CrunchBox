import {
  decimalToFraction,
  primeFactorize,
  computeCombinations,
  computePermutations,
  evaluateExpression,
  SCIENTIFIC_CONSTANTS,
} from '../../src/features/calculator/calcEngine';
import { sanitizeIncompleteExpression } from '../../src/features/calculator/useLiveCalc';

describe('Casio fx-991EX ClassWiz Engine Suite', () => {
  describe('decimalToFraction (S<=>D fraction conversion)', () => {
    it('converts exact decimal fractions to rational representations', () => {
      const f1 = decimalToFraction(0.75);
      expect(f1).not.toBeNull();
      expect(f1?.displayFrac).toBe('3/4');

      const f2 = decimalToFraction(0.5);
      expect(f2?.displayFrac).toBe('1/2');

      const f3 = decimalToFraction(0.125);
      expect(f3?.displayFrac).toBe('1/8');

      const f4 = decimalToFraction(1.75);
      expect(f4?.displayFrac).toBe('7/4');
      expect(f4?.displayMixed).toBe('1 3/4');
    });

    it('handles negative fractions and integers', () => {
      const fNeg = decimalToFraction(-0.25);
      expect(fNeg?.displayFrac).toBe('-1/4');

      const fInt = decimalToFraction(42);
      expect(fInt?.displayFrac).toBe('42');
      expect(fInt?.denominator).toBe(1);
    });

    it('caps denominator at maxDenominator (<= 100000)', () => {
      const fPi = decimalToFraction(Math.PI, 100000);
      expect(fPi).not.toBeNull();
      expect(fPi!.denominator).toBeLessThanOrEqual(100000);
    });

    it('returns null for NaN and Infinity', () => {
      expect(decimalToFraction(NaN)).toBeNull();
      expect(decimalToFraction(Infinity)).toBeNull();
    });
  });

  describe('primeFactorize (FACT key)', () => {
    it('decomposes composite numbers into prime factor powers', () => {
      expect(primeFactorize(12)).toBe('2^2 × 3');
      expect(primeFactorize(24)).toBe('2^3 × 3');
      expect(primeFactorize(60)).toBe('2^2 × 3 × 5');
      expect(primeFactorize(100)).toBe('2^2 × 5^2');
      expect(primeFactorize(13)).toBe('13');
    });

    it('guards non-integers, values <= 1, and values > 10^12', () => {
      expect(primeFactorize(1)).toBeNull();
      expect(primeFactorize(0)).toBeNull();
      expect(primeFactorize(-12)).toBeNull();
      expect(primeFactorize(12.5)).toBeNull();
      expect(primeFactorize(1000000000001)).toBeNull(); // > 10^12
    });
  });

  describe('Combinatorics: nCr & nPr (Multiplicative formula)', () => {
    it('computes combinations nCr correctly without overflow for n > 170', () => {
      expect(computeCombinations(5, 2)).toBe(10);
      expect(computeCombinations(10, 3)).toBe(120);
      expect(computeCombinations(52, 5)).toBe(2598960);
      expect(computeCombinations(10, 0)).toBe(1);
      expect(computeCombinations(10, 10)).toBe(1);

      // n > 170 would overflow if raw factorial were used
      const bigC = computeCombinations(200, 2);
      expect(bigC).toBe((200 * 199) / 2); // 19900
    });

    it('computes permutations nPr correctly', () => {
      expect(computePermutations(5, 2)).toBe(20);
      expect(computePermutations(6, 3)).toBe(120);
      expect(computePermutations(10, 1)).toBe(10);
      expect(computePermutations(10, 0)).toBe(1);

      const bigP = computePermutations(200, 2);
      expect(bigP).toBe(200 * 199); // 39800
    });

    it('strictly guards invalid inputs (r > n, r < 0, non-integers)', () => {
      expect(computeCombinations(5, 6)).toBeNull();
      expect(computeCombinations(5, -1)).toBeNull();
      expect(computeCombinations(5.5, 2)).toBeNull();
      expect(computePermutations(5, 6)).toBeNull();
      expect(computePermutations(5, -1)).toBeNull();
    });
  });

  describe('Full Expression Evaluation with ClassWiz Tokens', () => {
    it('evaluates expressions containing nCr and nPr', () => {
      const eval1 = evaluateExpression('5 nCr 2');
      expect(eval1.error).toBeUndefined();
      expect(eval1.result).toBe(10);

      const eval2 = evaluateExpression('6 nPr 2 + 10');
      expect(eval2.error).toBeUndefined();
      expect(eval2.result).toBe(40);
    });

    it('evaluates scientific constants correctly', () => {
      const cEval = evaluateExpression('c');
      expect(cEval.result).toBe(299792458);

      const gEval = evaluateExpression('g * 2');
      expect(gEval.result).toBeCloseTo(9.80665 * 2, 4);

      const piEval = evaluateExpression('2 * pi');
      expect(piEval.result).toBeCloseTo(2 * Math.PI, 6);
    });
  });

  describe('useLiveCalc / sanitizeIncompleteExpression', () => {
    it('gracefully handles trailing open function prefixes by returning null', () => {
      expect(sanitizeIncompleteExpression('sin(')).toBeNull();
      expect(sanitizeIncompleteExpression('5 + sin(')).toBeNull();
      expect(sanitizeIncompleteExpression('cos(')).toBeNull();
      expect(sanitizeIncompleteExpression('log(')).toBeNull();
      expect(sanitizeIncompleteExpression('sqrt(')).toBeNull();
    });

    it('strips trailing operators and balances parentheses', () => {
      expect(sanitizeIncompleteExpression('12 + ')).toBe('12');
      expect(sanitizeIncompleteExpression('12 * (3 + 4')).toBe('12 * (3 + 4)');
      expect(sanitizeIncompleteExpression('5 + (')).toBeNull();
      expect(sanitizeIncompleteExpression('')).toBeNull();
    });
  });
});
