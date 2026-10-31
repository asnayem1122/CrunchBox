import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ArrowDownUp } from 'lucide-react-native';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface SwapButtonProps {
  onPress: () => void;
  size?: number;
  themeMode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export const SwapButton: React.FC<SwapButtonProps> = ({
  onPress,
  size = 46,
  themeMode = 'field',
  style,
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const tokens = getThemeTokens(themeMode);

  const handlePressIn = () => {
    setIsPressed(true);
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    currentRotation.current += 180;
    Animated.spring(rotateAnim, {
      toValue: currentRotation.current,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();

    onPress();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const shadowHeight = 3.5;
  const buttonHeight = size - shadowHeight;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Static 3D Shadow Base */}
      <View
        style={[
          styles.shadowBase,
          {
            width: size,
            height: buttonHeight,
            borderRadius: size / 2,
            backgroundColor: tokens.inkShadow,
            bottom: 0,
          },
        ]}
      />

      {/* Depressing Circular Button Face */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.buttonFace,
          {
            width: size,
            height: buttonHeight,
            borderRadius: size / 2,
            backgroundColor: tokens.accentOps,
            borderColor: tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            transform: [{ translateY: isPressed ? 2.5 : 0 }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <ArrowDownUp size={size * 0.44} color={tokens.inkBorder} strokeWidth={2.8} />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shadowBase: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  buttonFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
