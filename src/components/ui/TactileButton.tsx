import React, { useState, memo } from 'react';
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
  testID?: string;
}

const TactileButtonComponent: React.FC<TactileButtonProps> = ({
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
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const tokens = getThemeTokens(themeMode);

  // Surface and text colors based on semantic tokens
  let surfaceColor: string = tokens.keypadSurface;
  let textColor: string = tokens.keycapNumberText;

  switch (variant) {
    case 'operator':
      surfaceColor = tokens.accentOps;
      textColor = tokens.keycapOperatorText;
      break;
    case 'danger':
      surfaceColor = tokens.dangerRed;
      textColor = tokens.keycapDangerText;
      break;
    case 'action':
      surfaceColor = tokens.actionGreen;
      textColor = tokens.keycapActionText;
      break;
    case 'secondary':
      surfaceColor = tokens.innerPanel;
      textColor = tokens.keycapSecondaryText;
      break;
    case 'number':
    default:
      surfaceColor = tokens.keypadSurface;
      textColor = tokens.keycapNumberText;
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

  const shadowHeight = 3.5;
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
      testID={testID}
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

      {/* 2. Depressing Keycap Face - Translates down 2.5px via transform only (zero layout reflow) */}
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
            borderColor: tokens.borderVisible || tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
            height: keycapHeight,
            transform: [{ translateY: isPressed ? 2.5 : 0 }],
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

export const TactileButton = memo(TactileButtonComponent, (prev, next) => {
  return (
    prev.label === next.label &&
    prev.subtitle === next.subtitle &&
    prev.variant === next.variant &&
    prev.disabled === next.disabled &&
    prev.themeMode === next.themeMode &&
    prev.height === next.height &&
    prev.width === next.width &&
    prev.flex === next.flex &&
    prev.soundEnabled === next.soundEnabled &&
    prev.hapticsEnabled === next.hapticsEnabled &&
    prev.style === next.style &&
    prev.textStyle === next.textStyle
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    justifyContent: 'flex-start',
    overflow: 'hidden',
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
