export type ThemeMode = 'field' | 'tactical';
export type LcdBacklightMode = 'sage' | 'amber' | 'stealth';

export interface ColorTokens {
  appBackground: string;
  chassisSurface: string;
  innerPanel: string;
  keypadSurface: string;
  accentOps: string;
  dangerRed: string;
  actionGreen: string;
  recessedLcd: string;
  recessedLcdText: string;
  inkBorder: string;
  inkShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardShadow: string;
  ledActive: string;
  ledInactive: string;
  rivetFill: string;
  // v1.1.0 Semantic Contrast Tokens
  keycapNumberText: string;
  keycapSecondaryText: string;
  keycapOperatorText: string;
  keycapActionText: string;
  keycapDangerText: string;
  inputBackground: string;
  inputText: string;
  borderVisible: string;
}

export const fieldLightTokens: ColorTokens = {
  appBackground: '#D8D0C0',     // Warm Putty
  chassisSurface: '#2D5A3C',    // Forest Green
  innerPanel: '#F5F0E1',        // Vintage Cream
  keypadSurface: '#FFFDF7',     // Crisp White
  accentOps: '#EAB308',         // Mustard Gold
  dangerRed: '#D93829',         // Brick Crimson
  actionGreen: '#1E4D2B',       // Deep Turf Green
  recessedLcd: '#C5D6A7',       // Phosphor Sage
  recessedLcdText: '#1B241E',   // Dark Green/Charcoal Ink
  inkBorder: '#1B241E',         // Charcoal Ink
  inkShadow: '#1B241E',         // Charcoal Ink
  textPrimary: '#1B241E',
  textSecondary: '#3F4E44',
  textMuted: '#7D8A80',
  cardShadow: '#1B241E',
  ledActive: '#22C55E',         // Glowing Green
  ledInactive: '#4B5563',
  rivetFill: '#F5F0E1',
  keycapNumberText: '#1B241E',
  keycapSecondaryText: '#1B241E',
  keycapOperatorText: '#1B241E',
  keycapActionText: '#FFFDF7',
  keycapDangerText: '#FFFDF7',
  inputBackground: '#FFFDF7',
  inputText: '#1B241E',
  borderVisible: '#1B241E',
};

export const tacticalDarkTokens: ColorTokens = {
  appBackground: '#0D120F',     // Deep Bunker
  chassisSurface: '#18261D',    // Tactical Pine
  innerPanel: '#1F2D24',        // Dark Slate Green
  keypadSurface: '#28382E',     // Charcoal Moss
  accentOps: '#CA8A04',         // Amber Gold
  dangerRed: '#B91C1C',         // Deep Crimson
  actionGreen: '#2E7D32',       // Field Emerald
  recessedLcd: '#132217',       // Night Vision LCD
  recessedLcdText: '#4ADE80',   // Illuminated Night Phosphor Green
  inkBorder: '#070A08',         // Pitch Ink
  inkShadow: '#070A08',         // Pitch Ink
  textPrimary: '#F5F6FA',       // Crisp High-Contrast Off-White
  textSecondary: '#B8C0CC',     // Bright Cool Gray
  textMuted: '#8892A0',         // Readable Secondary Muted
  cardShadow: '#070A08',
  ledActive: '#4ADE80',         // Night Vision Green
  ledInactive: '#1E2B22',
  rivetFill: '#3A4A3E',
  keycapNumberText: '#F5F6FA',
  keycapSecondaryText: '#E5E7EB',
  keycapOperatorText: '#0D120F', // Dark on Gold/Amber keycap
  keycapActionText: '#F5F6FA',   // Crisp White on Green keycap
  keycapDangerText: '#FFFDF7',   // Crisp White on Red keycap
  inputBackground: '#121A15',
  inputText: '#F5F6FA',
  borderVisible: '#3A4D40',     // Subtle visible border so cards/buttons don't get lost
};

export const themeTokens = {
  field: fieldLightTokens,
  tactical: tacticalDarkTokens,
};

export const hardwareConstants = {
  borderWidth: 2.5,
  borderWidthHeavy: 3.5,
  borderRadiusSm: 6,
  borderRadiusMd: 10,
  borderRadiusLg: 16,
  buttonShadowDepth: 4.5,
  buttonPressedDepth: 1.5,
  buttonPressedTranslateY: 3,
};

export function getThemeTokens(mode: ThemeMode = 'field'): ColorTokens {
  return mode === 'tactical' ? tacticalDarkTokens : fieldLightTokens;
}

export function getLcdColors(tokens: ColorTokens, backlightMode: LcdBacklightMode = 'sage'): {
  surface: string;
  text: string;
  border: string;
} {
  if (backlightMode === 'amber') {
    return {
      surface: '#EAB308',
      text: '#1F1500',
      border: tokens.inkBorder,
    };
  }
  if (backlightMode === 'stealth') {
    return {
      surface: '#132217',
      text: '#4ADE80',
      border: tokens.inkBorder,
    };
  }
  // Default 'sage'
  return {
    surface: tokens.recessedLcd,
    text: tokens.recessedLcdText,
    border: tokens.inkBorder,
  };
}
