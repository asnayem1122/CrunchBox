import {
  parseToBigInt,
  formatBigIntBase,
  isValidDigitForBase,
  formatDigitGrouping,
  computeAluOperation,
  twosComplementNegate,
  toggleBit,
  getBit,
  inspectIeee754,
  stringToUtf8Bytes,
  utf8BytesToString,
  gcdBigInt,
  lcmBigInt,
  isPrimeBigInt,
  isPowerOfTwoBigInt,
  powerOfTwoBigInt,
} from '../../src/features/dev/devEngine';

describe('DEV Engine: 64-bit Multi-Base & Bitwise Architecture', () => {
  it('parses and formats 64-bit BigInt max unsigned without precision loss', () => {
    const max64Str = '18446744073709551615'; // 2^64 - 1
    const val = parseToBigInt(max64Str, 'DEC');
    expect(val).toBe(0xFFFFFFFFFFFFFFFFn);

    const hex = formatBigIntBase(val, 'HEX', 64, false);
    expect(hex).toBe('0x FF FF FF FF FF FF FF FF');

    const bin = formatBigIntBase(val, 'BIN', 64, false);
    expect(bin.replace(/\s/g, '').length).toBe(64);
    expect(bin.startsWith('1111 1111')).toBe(true);

    const dec = formatBigIntBase(val, 'DEC', 64, false);
    expect(dec).toBe(max64Str);
  });

  it('validates per-base digits correctly', () => {
    expect(isValidDigitForBase('1', 'BIN')).toBe(true);
    expect(isValidDigitForBase('2', 'BIN')).toBe(false);
    expect(isValidDigitForBase('7', 'OCT')).toBe(true);
    expect(isValidDigitForBase('8', 'OCT')).toBe(false);
    expect(isValidDigitForBase('9', 'DEC')).toBe(true);
    expect(isValidDigitForBase('A', 'DEC')).toBe(false);
    expect(isValidDigitForBase('F', 'HEX')).toBe(true);
    expect(isValidDigitForBase('G', 'HEX')).toBe(false);
  });

  it('formats BD and INTL digit grouping accurately without BigInt conversion loss', () => {
    const num = '100000000'; // 10 crore
    expect(formatDigitGrouping(num, 'INTL')).toBe('100,000,000');
    expect(formatDigitGrouping(num, 'BD')).toBe('10,00,00,000');

    expect(formatDigitGrouping('1234', 'BD')).toBe('1,234');
    expect(formatDigitGrouping('1234567', 'BD')).toBe('12,34,567');
  });

  it('computes 8-bit Two\'s Complement of -1 to 255 with SF=1', () => {
    // 8-bit 1 negated -> 255 (0xFF, 11111111)
    const neg1 = twosComplementNegate('1', 8);
    expect(neg1).toBe('255');
    const bin = formatBigIntBase(BigInt(neg1), 'BIN', 8);
    expect(bin).toBe('1111 1111');
    const signedDec = formatBigIntBase(BigInt(neg1), 'DEC', 8, true);
    expect(signedDec).toBe('-1');
  });

  it('triggers OF=1 (Signed Overflow) on 8-bit 127 + 1', () => {
    const res = computeAluOperation('127', '1', 'ADD', 8);
    expect(res.resultStr).toBe('128');
    expect(res.flags.of).toBe(true); // Signed overflow from +127 to -128
    expect(res.flags.sf).toBe(true); // MSB is 1
    expect(res.flags.cf).toBe(false); // No unsigned carry out of 8-bit (128 < 256)
    expect(res.flags.zf).toBe(false);
  });

  it('sets cf=null and of=null for bitwise logic operations (Mandatory Rule 3)', () => {
    const res = computeAluOperation('255', '15', 'AND', 8);
    expect(res.resultStr).toBe('15');
    expect(res.flags.cf).toBeNull();
    expect(res.flags.of).toBeNull();
    expect(res.flags.zf).toBe(false);
    expect(res.flags.sf).toBe(false);

    const xorRes = computeAluOperation('10', '10', 'XOR', 8);
    expect(xorRes.resultStr).toBe('0');
    expect(xorRes.flags.zf).toBe(true);
    expect(xorRes.flags.cf).toBeNull();
    expect(xorRes.flags.of).toBeNull();
  });

  it('sets x86 borrow for SUB operation (cf = a < b)', () => {
    const resBorrow = computeAluOperation('5', '10', 'SUB', 8);
    expect(resBorrow.flags.cf).toBe(true); // 5 < 10 -> borrow occurred
    const resNoBorrow = computeAluOperation('10', '5', 'SUB', 8);
    expect(resNoBorrow.flags.cf).toBe(false);
    expect(resNoBorrow.resultStr).toBe('5');
  });

  it('performs Endianness Swap (LE ⇄ BE) across word sizes', () => {
    // 16-bit 0x1234 -> 0x3412
    const res16 = computeAluOperation('0x1234', '0', 'ENDIAN_SWAP', 16);
    expect(BigInt(res16.resultStr)).toBe(0x3412n);

    // 32-bit 0x12345678 -> 0x78563412
    const res32 = computeAluOperation('0x12345678', '0', 'ENDIAN_SWAP', 32);
    expect(BigInt(res32.resultStr)).toBe(0x78563412n);
  });

  it('inspects IEEE-754 32-bit float exactly: -12.375 -> 0xC1460000', () => {
    const analysis = inspectIeee754(-12.375);
    expect(analysis.sign).toBe('1');
    expect(analysis.exponent).toBe('10000010'); // 130
    expect(analysis.biasExp).toBe(3); // 130 - 127
    expect(analysis.mantissa).toBe('10001100000000000000000');
    expect(analysis.hex).toBe('0xC1460000');
  });

  it('encodes and decodes UTF-8 multi-byte strings including Bengali without TextDecoder', () => {
    const sample = 'বাংলা';
    const encoded = stringToUtf8Bytes(sample);
    expect(encoded.length).toBe(5); // 5 characters

    const flatBytes: number[] = [];
    encoded.forEach((item) => {
      item.hexBytes.forEach((h) => flatBytes.push(parseInt(h, 16)));
    });

    const decoded = utf8BytesToString(flatBytes);
    expect(decoded).toBe(sample);
  });

  it('toggles and reads bits accurately in interactive bit grid', () => {
    let val = '0';
    // Toggle bit 0 (LSB)
    val = toggleBit(val, 0, 8);
    expect(val).toBe('1');
    expect(getBit(val, 0, 8)).toBe(1);

    // Toggle bit 7 (MSB of 8-bit)
    val = toggleBit(val, 7, 8);
    expect(val).toBe('129'); // 128 + 1
    expect(getBit(val, 7, 8)).toBe(1);
    expect(getBit(val, 6, 8)).toBe(0);

    // Toggle bit 0 back
    val = toggleBit(val, 0, 8);
    expect(val).toBe('128');
  });

  it('evaluates discrete math algorithms', () => {
    expect(gcdBigInt(48n, 18n)).toBe(6n);
    expect(lcmBigInt(12n, 15n)).toBe(60n);
    expect(isPrimeBigInt(97n).isPrime).toBe(true);
    expect(isPrimeBigInt(100n).isPrime).toBe(false);
    expect(isPrimeBigInt(100n).smallestFactor).toBe(2n);
    expect(isPowerOfTwoBigInt(1024n)).toBe(true);
    expect(isPowerOfTwoBigInt(1023n)).toBe(false);
    expect(powerOfTwoBigInt(10)).toBe(1024n);
  });
});
