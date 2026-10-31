export type AngleMode = 'deg' | 'rad';

export interface EvalResult {
  result: number;
  error?: string;
}

export interface HexBinOct {
  hex: string;
  bin: string;
  oct: string;
}

export interface FractionResult {
  numerator: number;
  denominator: number;
  whole: number;
  remainder: number;
  displayFrac: string;
  displayMixed: string;
  isExact: boolean;
}

export interface ScientificConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
}

export const SCIENTIFIC_CONSTANTS: Record<string, ScientificConstant> = {
  c: { symbol: 'c', name: 'Speed of Light', value: 299792458, unit: 'm/s' },
  g: { symbol: 'g', name: 'Std Gravity', value: 9.80665, unit: 'm/s²' },
  h: { symbol: 'h', name: 'Planck Const', value: 6.62607015e-34, unit: 'J·s' },
  na: { symbol: 'NA', name: 'Avogadro', value: 6.02214076e23, unit: 'mol⁻¹' },
  pi: { symbol: 'π', name: 'Pi', value: Math.PI, unit: '' },
  e: { symbol: 'e', name: 'Euler', value: Math.E, unit: '' },
};

interface Token {
  type: 'number' | 'constant' | 'function' | 'operator' | 'unary' | 'postfix';
  value: string;
}

/**
 * Tokenizes the mathematical expression string, handling:
 * 1. Normalized unicode operators (×, ÷, −, π)
 * 2. Unary negation (u-) vs binary subtraction (-)
 * 3. Implicit multiplication (2π -> 2 * π, 5(2+3) -> 5 * (2+3), (2)(3) -> (2)*(3))
 * 4. Postfix percentage (%) and factorial (!)
 * 5. Infix combinatorics (nCr -> C, nPr -> P)
 * 6. Scientific constants (c, g, h, na, pi, e)
 */
export function tokenizeExpression(expr: string): Token[] {
  const normalized = expr
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt');

  const rawTokens: Token[] = [];
  let i = 0;

  const isDigitOrDot = (c: string) => (c >= '0' && c <= '9') || c === '.';
  const isAlpha = (c: string) =>
    (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

  while (i < normalized.length) {
    const c = normalized[i];

    if (isDigitOrDot(c)) {
      let num = '';
      while (i < normalized.length && isDigitOrDot(normalized[i])) {
        num += normalized[i];
        i++;
      }
      rawTokens.push({ type: 'number', value: num });
      continue;
    }

    if (isAlpha(c)) {
      let ident = '';
      while (i < normalized.length && isAlpha(normalized[i])) {
        ident += normalized[i].toLowerCase();
        i++;
      }

      if (ident === 'ncr') {
        rawTokens.push({ type: 'operator', value: 'C' });
      } else if (ident === 'npr') {
        rawTokens.push({ type: 'operator', value: 'P' });
      } else if (ident === 'c' || ident === 'p') {
        const prev = rawTokens.length > 0 ? rawTokens[rawTokens.length - 1] : null;
        const prevCanBeOperand =
          prev &&
          (prev.type === 'number' ||
            prev.type === 'constant' ||
            prev.type === 'postfix' ||
            (prev.type === 'operator' && prev.value === ')'));

        if (prevCanBeOperand) {
          rawTokens.push({ type: 'operator', value: ident.toUpperCase() });
        } else if (ident === 'c') {
          rawTokens.push({ type: 'constant', value: 'c' });
        } else {
          rawTokens.push({ type: 'function', value: ident });
        }
      } else if (ident in SCIENTIFIC_CONSTANTS) {
        rawTokens.push({ type: 'constant', value: ident });
      } else {
        rawTokens.push({ type: 'function', value: ident });
      }
      continue;
    }

    if ('+-*/^()!%'.includes(c)) {
      if (c === '!' || c === '%') {
        rawTokens.push({ type: 'postfix', value: c });
      } else {
        rawTokens.push({ type: 'operator', value: c });
      }
      i++;
      continue;
    }

    // Skip any unknown character
    i++;
  }

  // Insert unary markers and implicit multiplication
  const tokens: Token[] = [];
  for (let j = 0; j < rawTokens.length; j++) {
    const curr = rawTokens[j];
    const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;

    // Unary minus: at start or after operator (except ')' or postfix)
    if (curr.type === 'operator' && curr.value === '-') {
      if (
        !prev ||
        (prev.type === 'operator' && prev.value !== ')') ||
        prev.type === 'unary'
      ) {
        tokens.push({ type: 'unary', value: 'u-' });
        continue;
      }
    }

    // Unary plus
    if (curr.type === 'operator' && curr.value === '+') {
      if (
        !prev ||
        (prev.type === 'operator' && prev.value !== ')') ||
        prev.type === 'unary'
      ) {
        tokens.push({ type: 'unary', value: 'u+' });
        continue;
      }
    }

    // Implicit multiplication check
    if (prev) {
      const prevCanMultiply =
        prev.type === 'number' ||
        prev.type === 'constant' ||
        prev.type === 'postfix' ||
        (prev.type === 'operator' && prev.value === ')');

      const currCanMultiply =
        curr.type === 'constant' ||
        curr.type === 'function' ||
        (curr.type === 'operator' && curr.value === '(') ||
        (curr.type === 'number' &&
          (prev.type === 'postfix' ||
            (prev.type === 'operator' && prev.value === ')')));

      if (prevCanMultiply && currCanMultiply) {
        tokens.push({ type: 'operator', value: '*' });
      }
    }

    tokens.push(curr);
  }

  return tokens;
}

/**
 * Converts infix tokens into Reverse Polish Notation (RPN) using Dijkstra's Shunting-Yard algorithm.
 */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  const precedence: Record<string, number> = {
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    'C': 4,
    'P': 4,
    '^': 5,
    'u-': 6,
    'u+': 6,
  };

  const isRightAssociative = (op: string) =>
    op === '^' || op === 'u-' || op === 'u+';

  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'constant') {
      output.push(token);
    } else if (token.type === 'function') {
      opStack.push(token);
    } else if (token.type === 'postfix') {
      output.push(token);
    } else if (token.type === 'unary') {
      opStack.push(token);
    } else if (token.type === 'operator' && token.value !== '(' && token.value !== ')') {
      const op = token.value;
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.value === '(') break;
        const topPrec = precedence[top.value] || 0;
        const opPrec = precedence[op] || 0;
        if (
          topPrec > opPrec ||
          (topPrec === opPrec && !isRightAssociative(op))
        ) {
          output.push(opStack.pop()!);
        } else {
          break;
        }
      }
      opStack.push(token);
    } else if (token.value === '(') {
      opStack.push(token);
    } else if (token.value === ')') {
      while (opStack.length > 0 && opStack[opStack.length - 1].value !== '(') {
        output.push(opStack.pop()!);
      }
      if (opStack.length > 0 && opStack[opStack.length - 1].value === '(') {
        opStack.pop();
      }
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'function') {
        output.push(opStack.pop()!);
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.value !== '(' && top.value !== ')') {
      output.push(top);
    }
  }

  return output;
}

/**
 * Calculates n! with strict domain bounds (non-negative integer <= 170).
 */
export function computeFactorial(n: number): number | null {
  if (n < 0 || !Number.isInteger(n) || n > 170) {
    return null;
  }
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

/**
 * Multiplicative loop formula for combinations nCr (prevents factorial overflow for n > 170).
 */
export function computeCombinations(n: number, r: number): number | null {
  if (
    !Number.isInteger(n) ||
    !Number.isInteger(r) ||
    r < 0 ||
    r > n ||
    n < 0
  ) {
    return null;
  }
  if (r === 0 || r === n) return 1;
  if (r > n / 2) r = n - r;

  let res = 1;
  for (let i = 1; i <= r; i++) {
    res = (res * (n - i + 1)) / i;
    if (!Number.isFinite(res)) return null;
  }
  return Math.round(res);
}

/**
 * Multiplicative loop formula for permutations nPr.
 */
export function computePermutations(n: number, r: number): number | null {
  if (
    !Number.isInteger(n) ||
    !Number.isInteger(r) ||
    r < 0 ||
    r > n ||
    n < 0
  ) {
    return null;
  }
  if (r === 0) return 1;

  let res = 1;
  for (let i = 0; i < r; i++) {
    res *= (n - i);
    if (!Number.isFinite(res)) return null;
  }
  return Math.round(res);
}

/**
 * Continued fractions expansion algorithm to convert decimal to rational fraction.
 * Capped by maxDenominator <= 100000.
 */
export function decimalToFraction(val: number, maxDenominator = 100000): FractionResult | null {
  if (Number.isNaN(val) || !Number.isFinite(val)) return null;
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);

  if (Math.abs(absVal - Math.round(absVal)) < 1e-10) {
    const intVal = Math.round(absVal);
    return {
      numerator: sign * intVal,
      denominator: 1,
      whole: sign * intVal,
      remainder: 0,
      displayFrac: `${sign * intVal}`,
      displayMixed: `${sign * intVal}`,
      isExact: true,
    };
  }

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = absVal;

  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    if (k1 > maxDenominator) break;
    b = 1 / (b - a);
  } while (Math.abs(absVal - h1 / k1) > absVal * 1e-9 && Number.isFinite(b));

  if (k1 > maxDenominator || k1 === 0) {
    return null;
  }

  const num = sign * h1;
  const den = k1;
  const whole = Math.trunc(num / den);
  const remainder = Math.abs(num % den);

  const displayFrac = `${num}/${den}`;
  const displayMixed =
    whole !== 0 && remainder !== 0 ? `${whole} ${remainder}/${den}` : displayFrac;

  return {
    numerator: num,
    denominator: den,
    whole,
    remainder,
    displayFrac,
    displayMixed,
    isExact: Math.abs(val - num / den) < 1e-7,
  };
}

/**
 * Prime factorization suite (FACT key in fx-991EX).
 * Guards non-integers, values <= 1, and values > 10^12.
 */
export function primeFactorize(val: number): string | null {
  if (
    Number.isNaN(val) ||
    !Number.isFinite(val) ||
    !Number.isInteger(val) ||
    val <= 1 ||
    val > 1000000000000
  ) {
    return null;
  }

  let n = val;
  const factors: Map<number, number> = new Map();

  // Factor out 2
  while (n % 2 === 0) {
    factors.set(2, (factors.get(2) || 0) + 1);
    n = n / 2;
  }

  // Factor out 3
  while (n % 3 === 0) {
    factors.set(3, (factors.get(3) || 0) + 1);
    n = n / 3;
  }

  // Wheel factorization (6k +/- 1)
  let d = 5;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.set(d, (factors.get(d) || 0) + 1);
      n = n / d;
    }
    const nextD = d + 2;
    while (n % nextD === 0) {
      factors.set(nextD, (factors.get(nextD) || 0) + 1);
      n = n / nextD;
    }
    d += 6;
  }

  if (n > 1) {
    factors.set(n, (factors.get(n) || 0) + 1);
  }

  const parts: string[] = [];
  for (const [base, exp] of factors.entries()) {
    if (exp === 1) {
      parts.push(`${base}`);
    } else {
      parts.push(`${base}^${exp}`);
    }
  }

  return parts.join(' × ');
}

/**
 * Evaluates RPN tokens according to strict scientific and precision rules.
 */
function evaluateRPN(rpn: Token[], angleMode: AngleMode): EvalResult {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'constant') {
      const c = SCIENTIFIC_CONSTANTS[token.value];
      if (c) stack.push(c.value);
      else if (token.value === 'pi') stack.push(Math.PI);
      else if (token.value === 'e') stack.push(Math.E);
    } else if (token.type === 'unary') {
      if (stack.length < 1) return { result: NaN, error: 'ERROR' };
      const val = stack.pop()!;
      stack.push(token.value === 'u-' ? -val : val);
    } else if (token.type === 'postfix') {
      if (stack.length < 1) return { result: NaN, error: 'ERROR' };
      const val = stack.pop()!;
      if (token.value === '!') {
        const fact = computeFactorial(val);
        if (fact === null) return { result: NaN, error: 'ERROR' };
        stack.push(fact);
      } else if (token.value === '%') {
        stack.push(val / 100);
      }
    } else if (token.type === 'operator') {
      if (stack.length < 2) return { result: NaN, error: 'ERROR' };
      const b = stack.pop()!;
      const a = stack.pop()!;
      let res: number;
      switch (token.value) {
        case '+':
          res = a + b;
          break;
        case '-':
          res = a - b;
          break;
        case '*':
          res = a * b;
          break;
        case '/':
          if (Math.abs(b) < 1e-15) return { result: NaN, error: 'ERROR' };
          res = a / b;
          break;
        case '^':
          res = Math.pow(a, b);
          break;
        case 'C': {
          const cRes = computeCombinations(a, b);
          if (cRes === null) return { result: NaN, error: 'ERROR' };
          res = cRes;
          break;
        }
        case 'P': {
          const pRes = computePermutations(a, b);
          if (pRes === null) return { result: NaN, error: 'ERROR' };
          res = pRes;
          break;
        }
        default:
          return { result: NaN, error: 'ERROR' };
      }
      stack.push(res);
    } else if (token.type === 'function') {
      if (stack.length < 1) return { result: NaN, error: 'ERROR' };
      const val = stack.pop()!;
      let res: number;
      const fn = token.value;

      switch (fn) {
        case 'sin': {
          if (angleMode === 'deg') {
            const mod180 = Math.abs(val) % 180;
            if (mod180 < 1e-12 || Math.abs(mod180 - 180) < 1e-12) res = 0;
            else if ((val - 90) % 360 === 0) res = 1;
            else if ((val - 270) % 360 === 0 || (val + 90) % 360 === 0) res = -1;
            else res = Math.sin((val * Math.PI) / 180);
          } else {
            res = Math.sin(val);
            if (Math.abs(res) < 1e-12) res = 0;
          }
          break;
        }
        case 'cos': {
          if (angleMode === 'deg') {
            const shift = Math.abs(val - 90) % 180;
            if (shift < 1e-12 || Math.abs(shift - 180) < 1e-12) res = 0;
            else if (val % 360 === 0) res = 1;
            else if (Math.abs(val % 360) === 180) res = -1;
            else res = Math.cos((val * Math.PI) / 180);
          } else {
            res = Math.cos(val);
            if (Math.abs(res) < 1e-12) res = 0;
          }
          break;
        }
        case 'tan': {
          if (angleMode === 'deg') {
            const cosVal = Math.cos((val * Math.PI) / 180);
            if (Math.abs(cosVal) < 1e-12) return { result: NaN, error: 'ERROR' };
            const mod180 = Math.abs(val) % 180;
            if (mod180 < 1e-12 || Math.abs(mod180 - 180) < 1e-12) res = 0;
            else res = Math.tan((val * Math.PI) / 180);
          } else {
            const cosVal = Math.cos(val);
            if (Math.abs(cosVal) < 1e-12) return { result: NaN, error: 'ERROR' };
            res = Math.tan(val);
            if (Math.abs(res) < 1e-12) res = 0;
          }
          break;
        }
        case 'asin': {
          if (val < -1 || val > 1) return { result: NaN, error: 'ERROR' };
          const rad = Math.asin(val);
          res = angleMode === 'deg' ? (rad * 180) / Math.PI : rad;
          break;
        }
        case 'acos': {
          if (val < -1 || val > 1) return { result: NaN, error: 'ERROR' };
          const rad = Math.acos(val);
          res = angleMode === 'deg' ? (rad * 180) / Math.PI : rad;
          break;
        }
        case 'atan': {
          const rad = Math.atan(val);
          res = angleMode === 'deg' ? (rad * 180) / Math.PI : rad;
          break;
        }
        case 'log': {
          if (val <= 0) return { result: NaN, error: 'ERROR' };
          res = Math.log10(val);
          break;
        }
        case 'ln': {
          if (val <= 0) return { result: NaN, error: 'ERROR' };
          res = Math.log(val);
          break;
        }
        case 'sqrt': {
          if (val < 0) return { result: NaN, error: 'ERROR' };
          res = Math.sqrt(val);
          break;
        }
        case 'cbrt': {
          res = Math.cbrt(val);
          break;
        }
        case 'abs': {
          res = Math.abs(val);
          break;
        }
        default:
          return { result: NaN, error: 'ERROR' };
      }
      stack.push(res);
    }
  }

  if (stack.length !== 1) return { result: NaN, error: 'ERROR' };
  const raw = stack[0];
  if (Number.isNaN(raw) || !Number.isFinite(raw)) {
    return { result: NaN, error: 'ERROR' };
  }

  // Floating point drift correction (e.g. 0.1 + 0.2 -> 0.3)
  const cleaned = parseFloat(raw.toPrecision(12));
  return { result: cleaned };
}

/**
 * Primary public evaluation function for the calculator engine.
 */
export function evaluateExpression(
  expr: string,
  angleMode: AngleMode = 'deg'
): EvalResult {
  const cleanExpr = expr.trim();
  if (!cleanExpr) {
    return { result: 0 };
  }

  try {
    const tokens = tokenizeExpression(cleanExpr);
    if (tokens.length === 0) return { result: 0 };
    const rpn = toRPN(tokens);
    return evaluateRPN(rpn, angleMode);
  } catch {
    return { result: NaN, error: 'ERROR' };
  }
}

/**
 * Computes hexadecimal, binary, and octal integer representations for LCD auxiliary bar.
 */
export function toHexBinOct(val: number): HexBinOct {
  if (
    Number.isNaN(val) ||
    !Number.isFinite(val) ||
    Math.abs(val) > Number.MAX_SAFE_INTEGER
  ) {
    return { hex: '---', bin: '---', oct: '---' };
  }

  const intVal = Math.trunc(val);
  const isNeg = intVal < 0;
  const absVal = Math.abs(intVal);

  const hex = (isNeg ? '-0x' : '0x') + absVal.toString(16).toUpperCase();
  const bin = (isNeg ? '-' : '') + absVal.toString(2);
  const oct = (isNeg ? '-0o' : '0o') + absVal.toString(8);

  return { hex, bin, oct };
}

/**
 * Formats a calculator number nicely for display.
 */
export function formatCalcNumber(val: number): string {
  if (Number.isNaN(val) || !Number.isFinite(val)) {
    return 'ERROR';
  }
  if (Math.abs(val) > 1e15 || (Math.abs(val) < 1e-7 && val !== 0)) {
    return val.toExponential(6).replace(/\.?0+e/, 'e');
  }
  const str = val.toString();
  if (str.includes('.')) {
    const [intPart, decPart] = str.split('.');
    return `${intPart}.${decPart.slice(0, 8)}`;
  }
  return str;
}
