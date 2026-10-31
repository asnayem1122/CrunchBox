import { useWindowDimensions, PixelRatio, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

// Module-level high-water mark so Android status bar inset never drops to 0 on modal exit
let lockedAndroidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) : 20;

export interface HardwareLayoutMetrics {
  width: number;
  height: number;
  fontScale: number;
  maxFontSizeMultiplier: number;
  isCompact: boolean;
  isTablet: boolean;
  keycapHeight: number;
  keycapGap: number;
  chassisPadding: number;
  lcdMinHeight: number;
  insets: EdgeInsets;
  safeTopInset: number;
  safeBottomInset: number;
  bengaliFontFix: {
    includeFontPadding: boolean;
    maxFontSizeMultiplier: number;
  };
}

/**
 * Centralized responsive hardware ergonomics hook.
 * Dynamically computes keycap dimensions, grid gutters, and LCD scaling
 * across different Android/iOS aspect ratios and font scales (1.0x to 1.5x).
 */
export function useHardwareLayout(): HardwareLayoutMetrics {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rawFontScale = PixelRatio.getFontScale();
  const fontScale = Math.min(Math.max(rawFontScale, 0.85), 1.5);

  const isCompact = width < 375;
  const isTablet = width >= 600;

  // Track high-water mark on Android so screen transitions never shrink safeTop
  if (Platform.OS === 'android' && insets.top > lockedAndroidTopInset) {
    lockedAndroidTopInset = insets.top;
  }

  // Compute keycap vertical height so standard 5-row keypads fit comfortably without overflow
  const availableVerticalForKeys = height - insets.top - insets.bottom - 280; // approximate upper deck allowance
  const computedKeycapHeight = Math.min(Math.max(Math.floor(availableVerticalForKeys / 6), 46), 66);
  const keycapGap = isCompact ? 6 : 8;
  const chassisPadding = isCompact ? 10 : 14;
  const lcdMinHeight = isCompact ? 110 : 130;

  const safeTopInset = Platform.OS === 'android'
    ? Math.max(insets.top, lockedAndroidTopInset, StatusBar.currentHeight ?? 28, 28)
    : Math.max(insets.top, 20);
  const safeBottomInset = Math.max(insets.bottom, 12);

  return {
    width,
    height,
    fontScale,
    maxFontSizeMultiplier: 1.2, // Prevents text overflow on hardware buttons while respecting accessibility
    isCompact,
    isTablet,
    keycapHeight: computedKeycapHeight,
    keycapGap,
    chassisPadding,
    lcdMinHeight,
    insets,
    safeTopInset,
    safeBottomInset,
    bengaliFontFix: {
      includeFontPadding: false,
      maxFontSizeMultiplier: 1.2,
    },
  };
}
