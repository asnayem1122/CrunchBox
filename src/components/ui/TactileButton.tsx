import React, { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export type TactileButtonVariant =
  | 'number'
  | 'operator'
  | 'danger'
  | 'action'
  | 'secondary';

export interface TactileButtonProps {
  label: string | React.ReactNode;
  subtitle?: string;
  variant?: TactileButtonVariant;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  themeMode?: ThemeMode;
  height?: number;
  width?: number | string;
  flex?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  label,
  subtitle,
  variant = 'number',
  onPress,
  onLongPress,
  disabled = false,
  themeMode = 'field',
  height = 54,
  width,
  flex,
  style,
  textStyle,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const tokens = getThemeTokens(themeMode);

  // Surface and text colors based on variant
  let surfaceColor: string = tokens.keypadSurface;
  let textColor: string = tokens.textPrimary;

  switch (variant) {
    case 'operator':
      surfaceColor = tokens.accentOps;
      textColor = tokens.inkBorder;
      break;
    case 'danger':
      surfaceColor = tokens.dangerRed;
      textColor = '#FFFDF7';
      break;
    case 'action':
      surfaceColor = tokens.actionGreen;
      textColor = '#FFFDF7';
      break;
    case 'secondary':
      surfaceColor = tokens.innerPanel;
      textColor = tokens.textPrimary;
      break;
    case 'number':
    default:
      surfaceColor = tokens.keypadSurface;
      textColor = tokens.textPrimary;
      break;
  }

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
  };

  const handlePressOut = () => {
    if (disabled) return;
    setIsPressed(false);
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const shadowHeight = 4;
  const keycapHeight = height - shadowHeight;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          height,
          width: width as any,
          flex,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {/* 1. Static 3D Shadow Plate - Fixed at bottom, NEVER resizes outer container */}
      <View
        style={[
          styles.shadowBase,
          {
            backgroundColor: tokens.inkShadow,
            borderRadius: hardwareConstants.borderRadiusMd,
            bottom: 0,
            height: height - 2,
          },
        ]}
      />

      {/* 2. Depressing Keycap Face - Translates down 3px inside fixed outer container */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={onLongPress}
        disabled={disabled}
        style={[
          styles.keycapFace,
          {
            backgroundColor: surfaceColor,
            borderColor: tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
            height: keycapHeight,
            transform: [{ translateY: isPressed ? 3 : 0 }],
          },
        ]}
      >
        {typeof label === 'string' ? (
          <Text
            style={[
              styles.labelText,
              { color: textColor },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : (
          label
        )}

        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              { color: variant === 'danger' || variant === 'action' ? '#FFFDF7' : tokens.textMuted },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    justifyContent: 'flex-start',
  },
  shadowBase: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  keycapFace: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 8.5,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 1,
    letterSpacing: 0.5,
  },
});
