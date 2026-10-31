import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export type HardwareMode = 'CALC' | 'SCI' | 'CURR' | 'UNIT' | 'TOOLS';

export interface ModeSelectorProps {
  activeMode: HardwareMode;
  onChangeMode: (mode: HardwareMode) => void;
  themeMode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

const MODES: Array<{ id: HardwareMode; label: string; iconSymbol: string }> = [
  { id: 'CALC', label: 'CALC', iconSymbol: '±' },
  { id: 'SCI', label: 'SCI', iconSymbol: 'ƒx' },
  { id: 'CURR', label: 'CURR', iconSymbol: '৳/$' },
  { id: 'UNIT', label: 'UNIT', iconSymbol: '⇄' },
  { id: 'TOOLS', label: 'TOOLS', iconSymbol: '⚙' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onChangeMode,
  themeMode = 'field',
  style,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const tokens = getThemeTokens(themeMode);

  const handleSelect = (mode: HardwareMode) => {
    if (mode === activeMode) return;
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    onChangeMode(mode);
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
      {MODES.map((item) => {
        const isActive = item.id === activeMode;
        return (
          <Pressable
            key={item.id}
            onPress={() => handleSelect(item.id)}
            style={[
              styles.tabButton,
              {
                backgroundColor: isActive ? tokens.accentOps : tokens.keypadSurface,
                borderColor: tokens.inkBorder,
                borderWidth: 1.8,
                borderRadius: hardwareConstants.borderRadiusSm,
                // Active looks pressed in, inactive has 3D pop
                borderBottomWidth: isActive ? 1.8 : 3.5,
                transform: [{ translateY: isActive ? 1.5 : 0 }],
              },
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: tokens.inkBorder,
                  fontWeight: isActive ? '900' : '700',
                },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    width: '100%',
    marginVertical: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
