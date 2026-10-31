import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  ThemeMode,
  LcdBacklightMode,
  getThemeTokens,
  getLcdColors,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface AluFlagsState {
  zf: boolean;
  sf: boolean;
  cf: boolean | null;
  of: boolean | null;
}

export interface LcdDisplayProps {
  expression: string;
  value: string;
  liveAnswer?: string | null;
  fractionMode?: 'DEC' | 'FRAC' | 'MIXED';
  fractionDisplay?: string | null;
  primeFactorsDisplay?: string | null;
  onCycleFractionMode?: () => void;
  mode?: string;
  angleMode?: 'deg' | 'rad';
  onToggleAngleMode?: () => void;
  memoryActive?: boolean;
  hexValue?: string;
  binValue?: string;
  octValue?: string;
  themeMode?: ThemeMode;
  backlightMode?: LcdBacklightMode;
  onToggleBacklight?: () => void;
  digitGroupingMode?: 'BD' | 'INTL';
  onToggleDigitGrouping?: () => void;
  rateFreshness?: 'live' | 'cache' | 'bundled';
  aluFlags?: AluFlagsState | null;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export function getDynamicLcdFontSize(charCount: number): number {
  if (charCount <= 9) return 36;
  if (charCount <= 13) return 28;
  if (charCount <= 18) return 22;
  if (charCount <= 26) return 18;
  return 15;
}

export const LcdDisplay: React.FC<LcdDisplayProps> = ({
  expression,
  value,
  liveAnswer,
  fractionMode = 'DEC',
  fractionDisplay,
  primeFactorsDisplay,
  onCycleFractionMode,
  mode = 'CALC',
  angleMode = 'deg',
  onToggleAngleMode,
  memoryActive = false,
  hexValue,
  binValue,
  octValue,
  themeMode = 'field',
  backlightMode = 'sage',
  onToggleBacklight,
  digitGroupingMode = 'INTL',
  onToggleDigitGrouping,
  rateFreshness,
  aluFlags,
  error,
  style,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const tokens = getThemeTokens(themeMode);
  const lcdColors = getLcdColors(tokens, backlightMode);

  const displayValue = error ? error : value || '0';
  const effectiveReadout = primeFactorsDisplay || fractionDisplay || displayValue;
  const fontSize = getDynamicLcdFontSize(effectiveReadout.length);

  const handleAngleToggle = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    onToggleAngleMode?.();
  };

  const handleGroupingToggle = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    onToggleDigitGrouping?.();
  };

  const handleBacklightToggle = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    onToggleBacklight?.();
  };

  const handleFractionToggle = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    onCycleFractionMode?.();
  };

  const backlightLabel =
    backlightMode === 'amber' ? 'AMBR' : backlightMode === 'stealth' ? 'NVG' : 'SAGE';

  return (
    <View
      style={[
        styles.visorBezel,
        {
          backgroundColor: tokens.inkBorder,
          borderRadius: hardwareConstants.borderRadiusLg,
          padding: 4,
        },
        style,
      ]}
    >
      {/* Recessed LCD Screen Body */}
      <View
        style={[
          styles.screenSurface,
          {
            backgroundColor: lcdColors.surface,
            borderColor: tokens.borderVisible,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
          },
        ]}
      >
        {/* Top Annunciator Strip */}
        <View style={styles.topStatusStrip}>
          {/* Left: Mode Badge & Indicators */}
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.modeTag,
                { backgroundColor: tokens.inkBorder },
              ]}
            >
              <Text style={[styles.modeTagText, { color: lcdColors.surface }]}>
                {mode}
              </Text>
            </View>

            {memoryActive ? (
              <View
                style={[
                  styles.memoryBadge,
                  { backgroundColor: tokens.accentOps, borderColor: tokens.borderVisible },
                ]}
              >
                <Text style={styles.memoryBadgeText}>M</Text>
              </View>
            ) : null}

            {/* S<=>D Fraction Pill for CALC and SCI modes */}
            {onCycleFractionMode && (mode === 'CALC' || mode === 'SCI') ? (
              <Pressable
                accessible={true}
                accessibilityLabel={`Fraction format: ${fractionMode}`}
                testID="lcd-sd-toggle"
                onPress={handleFractionToggle}
                style={[
                  styles.microBadge,
                  {
                    backgroundColor:
                      fractionMode !== 'DEC' ? tokens.accentOps : tokens.innerPanel,
                    borderColor: tokens.borderVisible,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.microBadgeText,
                    {
                      color:
                        fractionMode !== 'DEC'
                          ? tokens.keycapOperatorText
                          : tokens.textPrimary,
                      fontWeight: '900',
                    },
                  ]}
                >
                  S⇔D{fractionMode !== 'DEC' ? `:${fractionMode}` : ''}
                </Text>
              </Pressable>
            ) : null}

            {/* Backlight Preset Button */}
            {onToggleBacklight ? (
              <Pressable
                accessible={true}
                accessibilityLabel={`Backlight: ${backlightLabel}`}
                testID="lcd-backlight-toggle"
                onPress={handleBacklightToggle}
                style={[
                  styles.microBadge,
                  {
                    backgroundColor: tokens.innerPanel,
                    borderColor: tokens.borderVisible,
                  },
                ]}
              >
                <Text style={[styles.microBadgeText, { color: tokens.textPrimary }]}>
                  ☼ {backlightLabel}
                </Text>
              </Pressable>
            ) : null}

            {/* Grouping Indicator BD / INTL */}
            {onToggleDigitGrouping ? (
              <Pressable
                accessible={true}
                accessibilityLabel={`Grouping: ${digitGroupingMode}`}
                testID="lcd-grouping-toggle"
                onPress={handleGroupingToggle}
                style={[
                  styles.microBadge,
                  {
                    backgroundColor: tokens.innerPanel,
                    borderColor: tokens.borderVisible,
                  },
                ]}
              >
                <Text style={[styles.microBadgeText, { color: tokens.textPrimary }]}>
                  {digitGroupingMode}
                </Text>
              </Pressable>
            ) : null}

            {/* Rate Freshness */}
            {rateFreshness ? (
              <View
                style={[
                  styles.rateBadge,
                  {
                    backgroundColor:
                      rateFreshness === 'live'
                        ? '#22C55E'
                        : rateFreshness === 'cache'
                        ? '#EAB308'
                        : '#6B7280',
                  },
                ]}
              >
                <Text style={styles.rateBadgeText}>
                  {rateFreshness === 'live' ? 'LIVE' : rateFreshness === 'cache' ? 'CACH' : 'BNDL'}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Right: Interactive DEG/RAD Toggle & Expression Preview */}
          <View style={styles.statusRight}>
            {onToggleAngleMode ? (
              <Pressable
                accessible={true}
                accessibilityLabel={`Angle mode: ${angleMode}`}
                testID="lcd-angle-toggle"
                onPress={handleAngleToggle}
                style={[
                  styles.angleToggleBtn,
                  {
                    backgroundColor: tokens.innerPanel,
                    borderColor: tokens.borderVisible,
                  },
                ]}
              >
                <Text style={[styles.angleToggleText, { color: tokens.textPrimary }]}>
                  {angleMode.toUpperCase()}
                </Text>
              </Pressable>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.expressionScroll}
              style={styles.expressionScrollView}
            >
              <Text
                style={[
                  styles.expressionText,
                  { color: lcdColors.text },
                ]}
                numberOfLines={1}
              >
                {expression ? `${expression}_` : ' '}
              </Text>
            </ScrollView>
          </View>
        </View>

        {/* Center: Primary Large Readout with Horizontal Scroll Protection */}
        <View style={styles.mainReadoutWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.readoutScrollContent}
          >
            <Text
              style={[
                styles.mainReadoutText,
                {
                  color: error ? tokens.dangerRed : lcdColors.text,
                  fontSize,
                },
              ]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {effectiveReadout}
            </Text>
          </ScrollView>
        </View>

        {/* 0ms Speculative Live Auto-Compute Line */}
        {liveAnswer && !error ? (
          <View style={styles.liveAnswerRow}>
            <Text style={[styles.liveAnswerText, { color: lcdColors.text }]}>
              ans ≈ {liveAnswer}
            </Text>
          </View>
        ) : null}

        {/* ALU Flags Bar (If DEV Mode) OR Programmer Base Strip */}
        {aluFlags ? (
          <View
            style={[
              styles.aluFlagsBar,
              {
                borderTopColor: tokens.borderVisible,
                borderTopWidth: 1,
              },
            ]}
          >
            <View style={styles.aluFlagItem}>
              <Text style={[styles.aluFlagLabel, { color: lcdColors.text }]}>ZF:</Text>
              <Text style={[styles.aluFlagValue, { color: aluFlags.zf ? '#22C55E' : lcdColors.text }]}>
                {aluFlags.zf ? '1' : '0'}
              </Text>
            </View>
            <View style={styles.aluFlagItem}>
              <Text style={[styles.aluFlagLabel, { color: lcdColors.text }]}>SF:</Text>
              <Text style={[styles.aluFlagValue, { color: aluFlags.sf ? '#EF4444' : lcdColors.text }]}>
                {aluFlags.sf ? '1' : '0'}
              </Text>
            </View>
            <View style={styles.aluFlagItem}>
              <Text style={[styles.aluFlagLabel, { color: lcdColors.text }]}>CF:</Text>
              <Text style={[styles.aluFlagValue, { color: lcdColors.text }]}>
                {aluFlags.cf === null ? '—' : aluFlags.cf ? '1' : '0'}
              </Text>
            </View>
            <View style={styles.aluFlagItem}>
              <Text style={[styles.aluFlagLabel, { color: lcdColors.text }]}>OF:</Text>
              <Text style={[styles.aluFlagValue, { color: aluFlags.of ? '#EF4444' : lcdColors.text }]}>
                {aluFlags.of === null ? '—' : aluFlags.of ? '1' : '0'}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.baseBar,
              {
                borderTopColor: tokens.borderVisible,
                borderTopWidth: 1,
              },
            ]}
          >
            <Text
              style={[styles.baseText, { color: lcdColors.text }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              <Text style={styles.baseLabel}>HEX: </Text>
              {hexValue || '0x0'}
            </Text>
            <Text
              style={[styles.baseText, { color: lcdColors.text }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              <Text style={styles.baseLabel}>BIN: </Text>
              {binValue || '0'}
            </Text>
            <Text
              style={[styles.baseText, { color: lcdColors.text }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              <Text style={styles.baseLabel}>OCT: </Text>
              {octValue || '0'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  visorBezel: {
    width: '100%',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
  },
  screenSurface: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  topStatusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  modeTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  modeTagText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  memoryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  memoryBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1B241E',
  },
  microBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 1,
  },
  microBadgeText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  rateBadge: {
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 2.5,
  },
  rateBadgeText: {
    fontSize: 7.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#070A08',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    maxWidth: '55%',
    justifyContent: 'flex-end',
  },
  angleToggleBtn: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 1.2,
  },
  angleToggleText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expressionScrollView: {
    maxWidth: 130,
  },
  expressionScroll: {
    alignItems: 'center',
  },
  expressionText: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  mainReadoutWrapper: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 1,
  },
  readoutScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mainReadoutText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
  liveAnswerRow: {
    alignItems: 'flex-end',
    paddingVertical: 1,
  },
  liveAnswerText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    opacity: 0.75,
    letterSpacing: 0.5,
  },
  baseBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
    paddingHorizontal: 2,
    opacity: 0.9,
  },
  baseText: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.4,
  },
  baseLabel: {
    fontWeight: '800',
    opacity: 0.7,
  },
  aluFlagsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 3,
  },
  aluFlagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aluFlagLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    opacity: 0.7,
  },
  aluFlagValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
});
