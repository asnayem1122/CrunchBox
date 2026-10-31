import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { CURRENCY_CATALOGUE } from './currencyCatalogue';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface CurrencyCardProps {
  label: string;
  currencyCode: string;
  amount: string;
  onChangeAmount?: (val: string) => void;
  onPressSelect: () => void;
  isEditable?: boolean;
  themeMode?: ThemeMode;
  language?: 'en' | 'bn';
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  label,
  currencyCode,
  amount,
  onChangeAmount,
  onPressSelect,
  isEditable = false,
  themeMode = 'field',
  language = 'en',
}) => {
  const tokens = getThemeTokens(themeMode);
  const info = CURRENCY_CATALOGUE[currencyCode.toUpperCase()] || {
    code: currencyCode,
    symbol: '$',
    flag: '🌐',
    nameEn: currencyCode,
    nameBn: currencyCode,
    country: '',
    decimals: 2,
  };

  const displayName = language === 'bn' ? info.nameBn : info.nameEn;

  const handleSelectPress = () => {
    triggerTactileFeedback();
    onPressSelect();
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: tokens.innerPanel,
          borderColor: tokens.inkBorder,
          borderWidth: hardwareConstants.borderWidth,
          borderRadius: hardwareConstants.borderRadiusMd,
          shadowColor: tokens.inkShadow,
        },
      ]}
    >
      {/* Top Header Line: Card Role Label & Full Currency Name */}
      <View style={styles.headerRow}>
        <Text style={[styles.roleLabel, { color: tokens.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[styles.currencyName, { color: tokens.textMuted }]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
      </View>

      {/* Main Row: Currency Selector Pill + Amount Readout/Input */}
      <View style={styles.bodyRow}>
        {/* Currency Selector Pill */}
        <Pressable
          onPress={handleSelectPress}
          style={[
            styles.selectorBtn,
            {
              backgroundColor: tokens.keypadSurface,
              borderColor: tokens.inkBorder,
              borderWidth: 2,
              borderRadius: hardwareConstants.borderRadiusSm,
              borderBottomWidth: 3.5,
            },
          ]}
        >
          <Text style={styles.flagIcon}>{info.flag}</Text>
          <Text style={[styles.currencyCodeText, { color: tokens.inkBorder }]}>
            {info.code}
          </Text>
          <ChevronDown size={14} color={tokens.inkBorder} strokeWidth={2.8} />
        </Pressable>

        {/* Amount Input or Readout */}
        <View style={styles.amountWrapper}>
          <Text style={[styles.currencySymbol, { color: tokens.textSecondary }]}>
            {info.symbol}
          </Text>
          {isEditable ? (
            <TextInput
              value={amount}
              onChangeText={onChangeAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={tokens.textMuted}
              style={[
                styles.amountInput,
                { color: tokens.textPrimary },
              ]}
              selectTextOnFocus
            />
          ) : (
            <Text
              style={[
                styles.amountText,
                { color: tokens.textPrimary },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {amount || '0.00'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 12,
    marginVertical: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  currencyName: {
    fontSize: 10,
    fontWeight: '600',
    maxWidth: 190,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  flagIcon: {
    fontSize: 18,
  },
  currencyCodeText: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  amountWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
    minWidth: 100,
    padding: 0,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
});
