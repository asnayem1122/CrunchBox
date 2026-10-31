import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface LcdDisplayProps {
  expression: string;
  value: string;
  mode?: string;
  angleMode?: 'deg' | 'rad';
  onToggleAngleMode?: () => void;
  memoryActive?: boolean;
  hexValue?: string;
  binValue?: string;
  octValue?: string;
  themeMode?: ThemeMode;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export function getDynamicLcdFontSize(charCount: number): number {
  if (charCount <= 9) return 38;
  if (charCount <= 13) return 30;
  if (charCount <= 18) return 23;
  return 18;
}

export const LcdDisplay: React.FC<LcdDisplayProps> = ({
  expression,
  value,
  mode = 'CALC',
  angleMode = 'deg',
  onToggleAngleMode,
  memoryActive = false,
  hexValue,
  binValue,
  octValue,
  themeMode = 'field',
  error,
  style,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const tokens = getThemeTokens(themeMode);

  const displayValue = error ? error : value || '0';
  const fontSize = getDynamicLcdFontSize(displayValue.length);

  const handleAngleToggle = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    onToggleAngleMode?.();
  };

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
            backgroundColor: tokens.recessedLcd,
            borderColor: tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
          },
        ]}
      >
        {/* Top Status Strip */}
        <View style={styles.topStatusStrip}>
          {/* Left: Mode Badge & Memory Indicator */}
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.modeTag,
                { backgroundColor: tokens.inkBorder },
              ]}
            >
              <Text style={[styles.modeTagText, { color: tokens.recessedLcd }]}>
                {mode}
              </Text>
            </View>

            {memoryActive ? (
              <View
                style={[
                  styles.memoryBadge,
                  { backgroundColor: tokens.accentOps, borderColor: tokens.inkBorder },
                ]}
              >
                <Text style={styles.memoryBadgeText}>M</Text>
              </View>
            ) : null}
          </View>

          {/* Right: Interactive DEG/RAD Toggle & Expression Preview */}
          <View style={styles.statusRight}>
            {onToggleAngleMode ? (
              <Pressable
                onPress={handleAngleToggle}
                style={[
                  styles.angleToggleBtn,
                  {
                    backgroundColor: tokens.innerPanel,
                    borderColor: tokens.inkBorder,
                  },
                ]}
              >
                <Text style={[styles.angleToggleText, { color: tokens.inkBorder }]}>
                  {angleMode.toUpperCase()}
                </Text>
              </Pressable>
            ) : (
              <View
                style={[
                  styles.angleTag,
                  { borderColor: tokens.inkBorder },
                ]}
              >
                <Text style={[styles.angleTagText, { color: tokens.recessedLcdText }]}>
                  {angleMode.toUpperCase()}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.expressionText,
                { color: tokens.recessedLcdText },
              ]}
              numberOfLines={1}
            >
              {expression || ' '}
            </Text>
          </View>
        </View>

        {/* Center: Primary Large Readout */}
        <View style={styles.mainReadoutWrapper}>
          <Text
            style={[
              styles.mainReadoutText,
              {
                color: error ? tokens.dangerRed : tokens.recessedLcdText,
                fontSize,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayValue}
          </Text>
        </View>

        {/* Bottom Auxiliary Programmer Base Strip */}
        <View
          style={[
            styles.baseBar,
            {
              borderTopColor: tokens.inkBorder,
              borderTopWidth: 1,
            },
          ]}
        >
          <Text
            style={[styles.baseText, { color: tokens.recessedLcdText }]}
            numberOfLines={1}
          >
            <Text style={styles.baseLabel}>HEX: </Text>
            {hexValue || '0x0'}
          </Text>
          <Text
            style={[styles.baseText, { color: tokens.recessedLcdText }]}
            numberOfLines={1}
          >
            <Text style={styles.baseLabel}>BIN: </Text>
            {binValue || '0'}
          </Text>
          <Text
            style={[styles.baseText, { color: tokens.recessedLcdText }]}
            numberOfLines={1}
          >
            <Text style={styles.baseLabel}>OCT: </Text>
            {octValue || '0'}
          </Text>
        </View>
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  topStatusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  modeTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },
  memoryBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1.2,
  },
  memoryBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#1B241E',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  angleToggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  angleToggleText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  angleTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  angleTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  expressionText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    opacity: 0.75,
    maxWidth: 180,
    textAlign: 'right',
  },
  mainReadoutWrapper: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  mainReadoutText: {
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    textAlign: 'right',
    width: '100%',
  },
  baseBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    marginTop: 2,
  },
  baseText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    opacity: 0.8,
  },
  baseLabel: {
    fontWeight: '900',
    opacity: 1,
  },
});
