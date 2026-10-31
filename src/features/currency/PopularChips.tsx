import React from 'react';
import {
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  POPULAR_CURRENCY_CODES,
  CURRENCY_CATALOGUE,
} from './currencyCatalogue';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface PopularChipsProps {
  activeCurrency: string;
  onSelect: (code: string) => void;
  themeMode?: ThemeMode;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export const PopularChips: React.FC<PopularChipsProps> = ({
  activeCurrency,
  onSelect,
  themeMode = 'field',
  soundEnabled = true,
  hapticsEnabled = true,
}) => {
  const tokens = getThemeTokens(themeMode);

  const handlePress = (code: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    onSelect(code);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {POPULAR_CURRENCY_CODES.map((code) => {
        const item = CURRENCY_CATALOGUE[code];
        const isActive = activeCurrency === code;
        return (
          <Pressable
            key={code}
            onPress={() => handlePress(code)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? tokens.accentOps : tokens.keypadSurface,
                borderColor: tokens.borderVisible || tokens.inkBorder,
                borderWidth: 1.8,
                borderRadius: hardwareConstants.borderRadiusSm,
                borderBottomWidth: isActive ? 1.8 : 3.2,
                transform: [{ translateY: isActive ? 1.4 : 0 }],
              },
            ]}
          >
            <Text style={styles.flagText}>{item?.flag || ''}</Text>
            <Text
              style={[
                styles.codeText,
                {
                  color: isActive ? tokens.keycapOperatorText : tokens.keycapNumberText,
                  fontWeight: isActive ? '900' : '700',
                },
              ]}
            >
              {code}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  flagText: {
    fontSize: 14,
  },
  codeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
