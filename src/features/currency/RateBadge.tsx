import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';

export interface RateBadgeProps {
  effectiveDate: string;
  isStale?: boolean;
  themeMode?: ThemeMode;
}

export const RateBadge: React.FC<RateBadgeProps> = ({
  effectiveDate,
  isStale = false,
  themeMode = 'field',
}) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  return (
    <View style={styles.container}>
      <Text style={[styles.referenceText, { color: tokens.textSecondary }]}>
        {t('currency.reference_rate', {
          date: effectiveDate || '2026-10-30',
          defaultValue: `Reference exchange rate · Updated ${effectiveDate || '2026-10-30'}`,
        })}
      </Text>

      {isStale ? (
        <View
          style={[
            styles.staleBadge,
            {
              backgroundColor: tokens.accentOps,
              borderColor: tokens.borderVisible || tokens.inkBorder,
              borderWidth: hardwareConstants.borderWidth,
            },
          ]}
        >
          <Text style={[styles.staleText, { color: tokens.keycapOperatorText }]}>
            {t('currency.stale_badge', 'OFFLINE CACHE')}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginVertical: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  referenceText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    flex: 1,
  },
  staleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  staleText: {
    fontSize: 8.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
