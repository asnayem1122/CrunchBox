import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export type HardwareMode = 'CALC' | 'SCI' | 'DEV' | 'CURR' | 'UNIT' | 'TOOLS';

export interface ModeSelectorProps {
  activeMode: HardwareMode;
  onChangeMode: (mode: HardwareMode) => void;
  themeMode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

interface ModeDef {
  id: HardwareMode;
  labelKey: string;
  defaultLabel: string;
  iconSymbol: string;
}

const MODES_ROW1: ModeDef[] = [
  { id: 'CALC', labelKey: 'modes.calc', defaultLabel: 'CALC', iconSymbol: '±' },
  { id: 'SCI', labelKey: 'modes.sci', defaultLabel: 'SCI', iconSymbol: 'ƒx' },
  { id: 'DEV', labelKey: 'modes.dev', defaultLabel: 'DEV', iconSymbol: '>_' },
];

const MODES_ROW2: ModeDef[] = [
  { id: 'CURR', labelKey: 'modes.curr', defaultLabel: 'CURR', iconSymbol: '৳/$' },
  { id: 'UNIT', labelKey: 'modes.unit', defaultLabel: 'UNIT', iconSymbol: '⇄' },
  { id: 'TOOLS', labelKey: 'modes.tools', defaultLabel: 'TOOLS', iconSymbol: '⚙' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onChangeMode,
  themeMode = 'field',
  style,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const handleSelect = (mode: HardwareMode) => {
    if (mode === activeMode) return;
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    onChangeMode(mode);
  };

  const renderTab = (item: ModeDef) => {
    const isActive = item.id === activeMode;
    const label = t(item.labelKey, item.defaultLabel);

    return (
      <Pressable
        key={item.id}
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel={`${label} mode`}
        accessibilityState={{ selected: isActive }}
        testID={`mode-tab-${item.id.toLowerCase()}`}
        onPress={() => handleSelect(item.id)}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? tokens.accentOps : tokens.keypadSurface,
            borderColor: tokens.inkBorder,
            borderWidth: 2,
            borderRadius: hardwareConstants.borderRadiusSm,
            borderBottomWidth: isActive ? 2 : 4,
            transform: [{ translateY: isActive ? 2 : 0 }],
          },
        ]}
      >
        <View style={styles.tabContentRow}>
          {/* Status LED Pip */}
          <View
            style={[
              styles.ledPip,
              {
                backgroundColor: isActive ? tokens.ledActive : tokens.ledInactive,
                borderColor: tokens.inkBorder,
              },
            ]}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: tokens.inkBorder,
                fontWeight: isActive ? '900' : '700',
              },
            ]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
          >
            {item.iconSymbol} {label}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.deckContainer,
        {
          backgroundColor: tokens.innerPanel,
          borderColor: tokens.inkBorder,
          borderWidth: hardwareConstants.borderWidth,
          borderRadius: hardwareConstants.borderRadiusMd,
        },
        style,
      ]}
    >
      <View style={styles.matrixRow}>
        {MODES_ROW1.map(renderTab)}
      </View>
      <View style={styles.matrixRow}>
        {MODES_ROW2.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    padding: 5,
    gap: 5,
    width: '100%',
    marginVertical: 6,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 5,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ledPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
