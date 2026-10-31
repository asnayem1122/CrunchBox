import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import { CurrencyCard } from './CurrencyCard';
import { PopularChips } from './PopularChips';
import { RateBadge } from './RateBadge';
import { SwapButton } from '../../components/ui/SwapButton';
import { useAppStore } from '../../store/useAppStore';
import { convertCurrency, formatRateSubtitle } from '../../services/exchange-rate/rateService';
import { formatCurrencyAmount } from '../../utils/formatCurrency';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface CurrencyViewProps {
  themeMode?: ThemeMode;
}

export const CurrencyView: React.FC<CurrencyViewProps> = ({ themeMode = 'field' }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const {
    fromCurrency,
    toCurrency,
    currencyAmount,
    setCurrencyAmount,
    swapCurrencies,
    setCurrencies,
    exchangeRates,
    ratesEffectiveDate,
    ratesStale,
    favoriteCurrencyPairs,
    toggleFavoritePair,
    language,
  } = useAppStore();

  // Calculate live converted amount
  const { convertedAmount, rateSubtitle } = useMemo(() => {
    const numericInput = parseFloat(currencyAmount.replace(/,/g, '')) || 0;
    const rawResult = convertCurrency(
      numericInput,
      fromCurrency,
      toCurrency,
      exchangeRates
    );
    const formatted = formatCurrencyAmount(rawResult, toCurrency);
    const subtitle = formatRateSubtitle(fromCurrency, toCurrency, exchangeRates);
    return { convertedAmount: formatted, rateSubtitle: subtitle };
  }, [currencyAmount, fromCurrency, toCurrency, exchangeRates]);

  const isFavorite = useMemo(() => {
    return favoriteCurrencyPairs.some(
      (p) => p.from === fromCurrency && p.to === toCurrency
    );
  }, [favoriteCurrencyPairs, fromCurrency, toCurrency]);

  const handleStarPress = () => {
    triggerTactileFeedback();
    toggleFavoritePair(fromCurrency, toCurrency);
  };

  const handleSelectSide = (side: 'from' | 'to') => {
    router.push({
      pathname: '/currency-picker',
      params: { side },
    });
  };

  const handleRecallPair = (from: string, to: string) => {
    triggerTactileFeedback();
    setCurrencies(from, to);
  };

  return (
    <View style={styles.container}>
      {/* 1. "YOU SEND" Card */}
      <CurrencyCard
        label={t('currency.you_send', 'YOU SEND')}
        currencyCode={fromCurrency}
        amount={currencyAmount}
        onChangeAmount={setCurrencyAmount}
        onPressSelect={() => handleSelectSide('from')}
        isEditable
        themeMode={themeMode}
        language={language}
      />

      {/* 2. Middle Row: Animated SwapButton + Star Button + Subtitle */}
      <View style={styles.middleActionRow}>
        <View style={styles.rateSubtitleBox}>
          <Text
            style={[styles.rateSubtitleText, { color: tokens.textSecondary }]}
            numberOfLines={1}
          >
            {rateSubtitle}
          </Text>
        </View>

        <View style={styles.actionButtonsCluster}>
          <Pressable
            onPress={handleStarPress}
            style={[
              styles.starBtn,
              {
                backgroundColor: isFavorite ? tokens.accentOps : tokens.keypadSurface,
                borderColor: tokens.inkBorder,
                borderWidth: 2,
                borderRadius: hardwareConstants.borderRadiusSm,
                borderBottomWidth: 3.5,
              },
            ]}
          >
            <Star
              size={18}
              color={tokens.inkBorder}
              fill={isFavorite ? tokens.inkBorder : 'none'}
              strokeWidth={2.4}
            />
          </Pressable>

          <SwapButton
            onPress={swapCurrencies}
            themeMode={themeMode}
            size={42}
          />
        </View>
      </View>

      {/* 3. "YOU RECEIVE" Card */}
      <CurrencyCard
        label={t('currency.you_receive', 'YOU RECEIVE')}
        currencyCode={toCurrency}
        amount={convertedAmount}
        onPressSelect={() => handleSelectSide('to')}
        isEditable={false}
        themeMode={themeMode}
        language={language}
      />

      {/* 4. RateBadge with Stale Cache Flag */}
      <RateBadge
        effectiveDate={ratesEffectiveDate}
        isStale={ratesStale}
        themeMode={themeMode}
      />

      {/* 5. Quick Popular Chips */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
          {t('currency.popular_chips', 'QUICK CURRENCIES')}
        </Text>
      </View>
      <PopularChips
        activeCurrency={toCurrency}
        onSelect={(code) => setCurrencies(fromCurrency, code)}
        themeMode={themeMode}
      />

      {/* 6. Saved Currency Pairs */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
          {t('currency.saved_pairs', 'SAVED CURRENCY PAIRS')}
        </Text>
      </View>
      {favoriteCurrencyPairs.length === 0 ? (
        <Text style={[styles.emptySavedText, { color: tokens.textMuted }]}>
          {t('currency.no_saved_pairs', 'Star any currency pair to save for quick 1-tap recall')}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedPairsScroll}
        >
          {favoriteCurrencyPairs.map((pair) => {
            const isCurrent =
              pair.from === fromCurrency && pair.to === toCurrency;
            return (
              <Pressable
                key={`${pair.from}_${pair.to}`}
                onPress={() => handleRecallPair(pair.from, pair.to)}
                style={[
                  styles.savedPairChip,
                  {
                    backgroundColor: isCurrent ? tokens.accentOps : tokens.innerPanel,
                    borderColor: tokens.inkBorder,
                    borderWidth: 1.8,
                    borderRadius: hardwareConstants.borderRadiusSm,
                    borderBottomWidth: isCurrent ? 1.8 : 3.2,
                    transform: [{ translateY: isCurrent ? 1.4 : 0 }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.savedPairText,
                    {
                      color: tokens.inkBorder,
                      fontWeight: isCurrent ? '900' : '700',
                    },
                  ]}
                >
                  {pair.from} ➔ {pair.to}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 6,
  },
  middleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  rateSubtitleBox: {
    flex: 1,
    marginRight: 8,
  },
  rateSubtitleText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  actionButtonsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptySavedText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontStyle: 'italic',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  savedPairsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  savedPairChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  savedPairText: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
