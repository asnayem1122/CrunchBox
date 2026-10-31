import {
  fieldLightTokens,
  tacticalDarkTokens,
  getThemeTokens,
} from '../../src/utils/themeTokens';

function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Theme Tokens WCAG 2.1 AA Contrast Ratio Verification', () => {
  describe('Tactical Dark Tokens (High Contrast Audit)', () => {
    it('ensures textPrimary against appBackground exceeds 7:1 (AAA level)', () => {
      const ratio = getContrastRatio(
        tacticalDarkTokens.textPrimary,
        tacticalDarkTokens.appBackground
      );
      expect(ratio).toBeGreaterThan(7.0);
    });

    it('ensures keycapNumberText against keypadSurface exceeds 4.5:1 (AA level)', () => {
      const ratio = getContrastRatio(
        tacticalDarkTokens.keycapNumberText,
        tacticalDarkTokens.keypadSurface
      );
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('ensures keycapOperatorText against accentOps exceeds 4.5:1', () => {
      const ratio = getContrastRatio(
        tacticalDarkTokens.keycapOperatorText,
        tacticalDarkTokens.accentOps
      );
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('ensures textPrimary against innerPanel exceeds 4.5:1', () => {
      const ratio = getContrastRatio(
        tacticalDarkTokens.textPrimary,
        tacticalDarkTokens.innerPanel
      );
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('provides distinct visible border tokens for dark mode', () => {
      expect(tacticalDarkTokens.borderVisible).toBeDefined();
      expect(tacticalDarkTokens.borderVisible).not.toBe(tacticalDarkTokens.inkBorder);
    });
  });

  describe('Field Light Tokens Contrast Verification', () => {
    it('ensures textPrimary against appBackground exceeds 4.5:1', () => {
      const ratio = getContrastRatio(
        fieldLightTokens.textPrimary,
        fieldLightTokens.appBackground
      );
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('ensures keycapNumberText against keypadSurface exceeds 4.5:1', () => {
      const ratio = getContrastRatio(
        fieldLightTokens.keycapNumberText,
        fieldLightTokens.keypadSurface
      );
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('ensures keycapOperatorText against accentOps exceeds 4.5:1', () => {
      const ratio = getContrastRatio(
        fieldLightTokens.keycapOperatorText,
        fieldLightTokens.accentOps
      );
      expect(ratio).toBeGreaterThan(4.5);
    });
  });

  describe('getThemeTokens helper', () => {
    it('returns correct tokens object for each mode', () => {
      expect(getThemeTokens('field')).toBe(fieldLightTokens);
      expect(getThemeTokens('tactical')).toBe(tacticalDarkTokens);
    });
  });
});
