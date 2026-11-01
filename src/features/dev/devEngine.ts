export type DevBase = 'HEX' | 'DEC' | 'OCT' | 'BIN' | 'ASCII';
export type DevWordSize = 8 | 16 | 32 | 64;

export type BitwiseOp =
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'XNOR'
  | 'SHL'
  | 'SHR'
  | 'SAR'
  | 'ROR'
  | 'ROL'
  | 'ENDIAN_SWAP'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'MOD';

export interface AluFlags {
  zf: boolean;
  sf: boolean;
  cf: boolean | null;
  of: boolean | null;
}

export interface AluResult {
  resultStr: string;
  flags: AluFlags;
  error?: 'DIV_BY_ZERO' | null;
}

export interface Ieee754FloatAnalysis {
  sign: string;
  exponent: string;
  mantissa: string;
  hex: string;
  biasExp: number;
  rawUint32: number;
}

export interface Utf8ByteInfo {
  char: string;
  codePoint: number;
  hexBytes: string[];
  binBytes: string[];
}

/**
 * Returns the bitmask for the given word size.
 * e.g., 8 -> 0xFFn, 16 -> 0xFFFFn, 32 -> 0xFFFFFFFFn, 64 -> 0xFFFFFFFFFFFFFFFFn
 */
export function getWordMask(wordSize: DevWordSize): bigint {
  if (wordSize === 64) {
    return 0xFFFFFFFFFFFFFFFFn;
  }
  return (1n << BigInt(wordSize)) - 1n;
}

/**
 * Parses a string in base 2, 8, 10, or 16 into a BigInt safely.
 */
export function parseToBigInt(valStr: string, base: DevBase = 'DEC'): bigint {
  if (!valStr || valStr.trim() === '' || valStr === '-') return 0n;
  const clean = valStr.replace(/[\s,_]/g, '');

  try {
    if (base === 'HEX') {
      const hex = clean.startsWith('0x') || clean.startsWith('0X') ? clean : `0x${clean}`;
      return BigInt(hex);
    }
    if (base === 'BIN') {
      const bin = clean.startsWith('0b') || clean.startsWith('0B') ? clean : `0b${clean}`;
      return BigInt(bin);
    }
    if (base === 'OCT') {
      const oct = clean.startsWith('0o') || clean.startsWith('0O') ? clean : `0o${clean}`;
      return BigInt(oct);
    }
    return BigInt(clean);
  } catch {
    return 0n;
  }
}

/**
 * Checks if a typed character is valid for the selected numeric base.
 */
export function isValidDigitForBase(char: string, base: DevBase): boolean {
  if (char === '') return false;
  if (base === 'ASCII') {
    const code = char.charCodeAt(0);
    return code >= 0 && code <= 127;
  }
  const upper = char.toUpperCase();
  if (base === 'BIN') return upper === '0' || upper === '1';
  if (base === 'OCT') return /^[0-7]$/.test(upper);
  if (base === 'DEC') return /^[0-9]$/.test(upper);
  if (base === 'HEX') return /^[0-9A-F]$/.test(upper);
  return false;
}

/**
 * Formats a BigInt into the requested base with appropriate grouping.
 * - BIN: 4-bit nibbles with spaces (e.g., '1010 1111')
 * - HEX: byte pairs with spaces (e.g., 'DE AD BE EF')
 * - DEC / OCT: plain or grouped representation
 */
export function formatBigIntBase(
  val: bigint,
  base: DevBase,
  wordSize: DevWordSize,
  isSigned: boolean = false
): string {
  const mask = getWordMask(wordSize);
  const maskedVal = val & mask;

  if (base === 'ASCII') {
    return formatCharRepresentation(maskedVal);
  }

  if (base === 'BIN') {
    let binStr = maskedVal.toString(2).padStart(wordSize, '0');
    // Group in 4-bit nibbles
    const nibbles: string[] = [];
    for (let i = 0; i < binStr.length; i += 4) {
      nibbles.push(binStr.slice(i, i + 4));
    }
    return nibbles.join(' ');
  }

  if (base === 'HEX') {
    const hexChars = wordSize / 4;
    let hexStr = maskedVal.toString(16).toUpperCase().padStart(hexChars, '0');
    // Group in 2-char bytes
    const bytes: string[] = [];
    for (let i = 0; i < hexStr.length; i += 2) {
      bytes.push(hexStr.slice(i, i + 2));
    }
    return '0x ' + bytes.join(' ');
  }

  if (base === 'OCT') {
    return '0o' + maskedVal.toString(8);
  }

  // Decimal (Signed vs Unsigned)
  if (isSigned) {
    const msb = 1n << BigInt(wordSize - 1);
    if ((maskedVal & msb) !== 0n) {
      // Negative in 2's complement
      const signedVal = maskedVal - (1n << BigInt(wordSize));
      return signedVal.toString(10);
    }
  }
  return maskedVal.toString(10);
}

/**
 * Formats an integer string with Indian/Bangladeshi (BD) vs International (INTL) grouping.
 * Pure string manipulation without converting BigInt to Number.
 */
export function formatDigitGrouping(numStr: string, mode: 'BD' | 'INTL'): string {
  if (!numStr) return '0';
  const isNeg = numStr.startsWith('-');
  const clean = isNeg ? numStr.slice(1) : numStr;

  const parts = clean.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';

  if (mode === 'INTL') {
    const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (isNeg ? '-' : '') + grouped + decimalPart;
  }

  // BD Grouping: rightmost 3 digits, then groups of 2
  if (integerPart.length <= 3) {
    return (isNeg ? '-' : '') + integerPart + decimalPart;
  }
  const last3 = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  const groupedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (isNeg ? '-' : '') + groupedOther + ',' + last3 + decimalPart;
}

/**
 * Executes bitwise and arithmetic ALU operations with strict hardware flag semantics.
 * Mandatory Rule 3:
 * - Logic ops & Endian swap: cf = null, of = null (renders as '—').
 * - ADD: unsigned carry, signed overflow.
 * - SUB: x86 borrow (cf = unsignedA < unsignedB), signed overflow.
 */
export function computeAluOperation(
  operandAStr: string,
  operandBStr: string,
  op: BitwiseOp,
  wordSize: DevWordSize
): AluResult {
  const mask = getWordMask(wordSize);
  const a = parseToBigInt(operandAStr, 'DEC') & mask;
  const b = parseToBigInt(operandBStr, 'DEC') & mask;

  let rawResult: bigint = 0n;
  let cf: boolean | null = null;
  let of: boolean | null = null;

  const msbWeight = 1n << BigInt(wordSize - 1);

  switch (op) {
    case 'AND':
      rawResult = a & b;
      break;
    case 'OR':
      rawResult = a | b;
      break;
    case 'XOR':
      rawResult = a ^ b;
      break;
    case 'NOT':
      rawResult = ~a & mask;
      break;
    case 'NAND':
      rawResult = ~(a & b) & mask;
      break;
    case 'NOR':
      rawResult = ~(a | b) & mask;
      break;
    case 'XNOR':
      rawResult = ~(a ^ b) & mask;
      break;
    case 'SHL': {
      const shift = Number(b % BigInt(wordSize));
      rawResult = (a << BigInt(shift)) & mask;
      if (shift > 0) {
        cf = Boolean((a >> BigInt(wordSize - shift)) & 1n);
      } else {
        cf = false;
      }
      break;
    }
    case 'SHR': {
      const shift = Number(b % BigInt(wordSize));
      rawResult = (a >> BigInt(shift)) & mask;
      if (shift > 0) {
        cf = Boolean((a >> BigInt(shift - 1)) & 1n);
      } else {
        cf = false;
      }
      break;
    }
    case 'ROL': {
      const shift = BigInt(Number(b % BigInt(wordSize)));
      rawResult = ((a << shift) | (a >> (BigInt(wordSize) - shift))) & mask;
      break;
    }
    case 'ROR': {
      const shift = BigInt(Number(b % BigInt(wordSize)));
      rawResult = ((a >> shift) | (a << (BigInt(wordSize) - shift))) & mask;
      break;
    }
    case 'ENDIAN_SWAP': {
      // Byte reverse within word size
      let swapped = 0n;
      const numBytes = wordSize / 8;
      for (let i = 0; i < numBytes; i++) {
        const byte = (a >> BigInt(i * 8)) & 0xFFn;
        swapped |= byte << BigInt((numBytes - 1 - i) * 8);
      }
      rawResult = swapped & mask;
      break;
    }
    case 'ADD': {
      const sum = a + b;
      rawResult = sum & mask;
      cf = sum > mask; // Unsigned carry
      const signA = (a & msbWeight) !== 0n;
      const signB = (b & msbWeight) !== 0n;
      const signRes = (rawResult & msbWeight) !== 0n;
      of = signA === signB && signRes !== signA; // Signed overflow
      break;
    }
    case 'SUB': {
      // x86 Borrow semantics
      cf = a < b;
      const diff = a - b;
      rawResult = diff & mask;
      const signA = (a & msbWeight) !== 0n;
      const signB = (b & msbWeight) !== 0n;
      const signRes = (rawResult & msbWeight) !== 0n;
      of = signA !== signB && signRes !== signA; // Signed overflow
      break;
    }
    case 'MUL': {
      const prod = a * b;
      rawResult = prod & mask;
      cf = prod > mask;
      const signA = (a & msbWeight) !== 0n;
      const signB = (b & msbWeight) !== 0n;
      const signedA = signA ? a - (1n << BigInt(wordSize)) : a;
      const signedB = signB ? b - (1n << BigInt(wordSize)) : b;
      const signedProd = signedA * signedB;
      const minSigned = -(1n << BigInt(wordSize - 1));
      const maxSigned = (1n << BigInt(wordSize - 1)) - 1n;
      of = signedProd < minSigned || signedProd > maxSigned;
      break;
    }
    case 'DIV': {
      if (b === 0n) {
        return {
          resultStr: '0',
          flags: { zf: false, sf: false, cf: null, of: null },
          error: 'DIV_BY_ZERO',
        };
      }
      rawResult = (a / b) & mask;
      cf = null;
      of = null;
      break;
    }
    case 'MOD': {
      if (b === 0n) {
        return {
          resultStr: '0',
          flags: { zf: false, sf: false, cf: null, of: null },
          error: 'DIV_BY_ZERO',
        };
      }
      rawResult = (a % b) & mask;
      cf = null;
      of = null;
      break;
    }
    case 'SAR': {
      const shift = Number(b % BigInt(wordSize));
      const isNegative = (a & msbWeight) !== 0n;
      if (shift === 0) {
        rawResult = a;
        cf = false;
      } else {
        cf = Boolean((a >> BigInt(shift - 1)) & 1n);
        let shifted = a >> BigInt(shift);
        if (isNegative) {
          const signFill = (mask >> BigInt(wordSize - shift)) << BigInt(wordSize - shift);
          shifted |= signFill;
        }
        rawResult = shifted & mask;
      }
      break;
    }
  }

  const finalResult = rawResult & mask;
  const zf = finalResult === 0n;
  const sf = (finalResult & msbWeight) !== 0n;

  return {
    resultStr: finalResult.toString(10),
    flags: { zf, sf, cf, of },
    error: null,
  };
}

/**
 * Negates a value in 2's complement for the selected word size.
 */
export function twosComplementNegate(valStr: string, wordSize: DevWordSize): string {
  const mask = getWordMask(wordSize);
  const val = parseToBigInt(valStr, 'DEC') & mask;
  const neg = (~val + 1n) & mask;
  return neg.toString(10);
}

/**
 * Flips a bit at bitIndex (0-indexed from right/LSB) within the selected word size.
 */
export function toggleBit(valStr: string, bitIndex: number, wordSize: DevWordSize): string {
  if (bitIndex < 0 || bitIndex >= wordSize) return valStr;
  const mask = getWordMask(wordSize);
  const val = parseToBigInt(valStr, 'DEC') & mask;
  const flipped = val ^ (1n << BigInt(bitIndex));
  return (flipped & mask).toString(10);
}

/**
 * Returns bit value (0 or 1) at bitIndex.
 */
export function getBit(valStr: string, bitIndex: number, wordSize: DevWordSize): 0 | 1 {
  if (bitIndex < 0 || bitIndex >= wordSize) return 0;
  const mask = getWordMask(wordSize);
  const val = parseToBigInt(valStr, 'DEC') & mask;
  return ((val >> BigInt(bitIndex)) & 1n) === 1n ? 1 : 0;
}

/**
 * Hardware IEEE-754 32-bit single-precision float inspector.
 * Mandatory Rule 4: Uses ArrayBuffer(4) + DataView for byte-exact hardware floating point analysis.
 */
export function inspectIeee754(floatVal: number): Ieee754FloatAnalysis {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, floatVal, false); // big-endian
  const rawUint32 = view.getUint32(0, false);

  const bin32 = rawUint32.toString(2).padStart(32, '0');
  const sign = bin32[0];
  const exponent = bin32.slice(1, 9);
  const mantissa = bin32.slice(9, 32);
  const biasExp = parseInt(exponent, 2) - 127;
  const hex = '0x' + rawUint32.toString(16).toUpperCase().padStart(8, '0');

  return {
    sign,
    exponent,
    mantissa,
    hex,
    biasExp,
    rawUint32,
  };
}

/**
 * Pure TypeScript UTF-8 encoder (no TextEncoder dependency for Android Hermes safety).
 * Multi-byte encoding supports ASCII, Latin, Cyrillic, and Bengali ('বাংলা').
 */
export function stringToUtf8Bytes(str: string): Utf8ByteInfo[] {
  const result: Utf8ByteInfo[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.codePointAt(i) || 0;

    // Handle surrogate pairs for high code points
    if (code > 0xffff) {
      i++;
    }

    const bytes: number[] = [];
    if (code <= 0x7f) {
      bytes.push(code);
    } else if (code <= 0x7ff) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18));
      bytes.push(0x80 | ((code >> 12) & 0x3f));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }

    result.push({
      char,
      codePoint: code,
      hexBytes: bytes.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')),
      binBytes: bytes.map((b) => b.toString(2).padStart(8, '0')),
    });
  }

  return result;
}

/**
 * Pure TypeScript UTF-8 decoder.
 */
export function utf8BytesToString(bytes: number[]): string {
  let str = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if ((b1 & 0x80) === 0) {
      str += String.fromCodePoint(b1);
    } else if ((b1 & 0xe0) === 0xc0) {
      const b2 = bytes[i++] & 0x3f;
      str += String.fromCodePoint(((b1 & 0x1f) << 6) | b2);
    } else if ((b1 & 0xf0) === 0xe0) {
      const b2 = bytes[i++] & 0x3f;
      const b3 = bytes[i++] & 0x3f;
      str += String.fromCodePoint(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
    } else if ((b1 & 0xf8) === 0xf0) {
      const b2 = bytes[i++] & 0x3f;
      const b3 = bytes[i++] & 0x3f;
      const b4 = bytes[i++] & 0x3f;
      str += String.fromCodePoint(((b1 & 0x07) << 18) | (b2 << 12) | (b3 << 6) | b4);
    }
  }
  return str;
}

/**
 * Discrete Math & CS Quick Arithmetic.
 */
export function modBigInt(a: bigint, b: bigint): bigint {
  if (b === 0n) return 0n;
  const res = a % b;
  return res < 0n ? res + (b < 0n ? -b : b) : res;
}

export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcmBigInt(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  const g = gcdBigInt(a, b);
  const mult = a * b;
  const absMult = mult < 0n ? -mult : mult;
  return absMult / g;
}

export function isPrimeBigInt(n: bigint): { isPrime: boolean; smallestFactor?: bigint } {
  if (n <= 1n) return { isPrime: false };
  if (n <= 3n) return { isPrime: true };
  if (n % 2n === 0n) return { isPrime: false, smallestFactor: 2n };
  if (n % 3n === 0n) return { isPrime: false, smallestFactor: 3n };

  let i = 5n;
  while (i * i <= n) {
    if (n % i === 0n) return { isPrime: false, smallestFactor: i };
    if (n % (i + 2n) === 0n) return { isPrime: false, smallestFactor: i + 2n };
    i += 6n;
  }
  return { isPrime: true };
}

export function isPowerOfTwoBigInt(n: bigint): boolean {
  if (n <= 0n) return false;
  return (n & (n - 1n)) === 0n;
}

export function powerOfTwoBigInt(exp: number): bigint {
  if (exp < 0 || exp > 64) return 0n;
  return 1n << BigInt(exp);
}

/**
 * Returns a printable ASCII / Unicode character representation for a byte/word value.
 */
export function formatCharRepresentation(val: bigint): string {
  if (val > 127n || val < 0n) return '';
  const code = Number(val);
  if (code >= 32 && code <= 126) {
    return "'" + String.fromCharCode(code) + "'";
  }
  if (code === 0) return '\\0 (NUL)';
  if (code === 9) return '\\t (TAB)';
  if (code === 10) return '\\n (LF)';
  if (code === 13) return '\\r (CR)';
  if (code === 27) return 'ESC';
  return '0x' + code.toString(16).toUpperCase().padStart(2, '0');
}
