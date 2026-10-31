import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Search, X, Check } from 'lucide-react-native';
import {
  CURRENCY_LIST,
  CurrencyInfo,
  POPULAR_CURRENCY_CODES,
  CURRENCY_CATALOGUE,
} from '../features/currency/currencyCatalogue';
import { useAppStore } from '../store/useAppStore';
import {
  getThemeTokens,
  hardwareConstants,
} from '../utils/themeTokens';
import { triggerTactileFeedback } from '../utils/soundEffects';

export default function CurrencyPickerModal() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ side?: 'from' | 'to' }>();
  const side = params.side === 'to' ? 'to' : 'from';

  const {
    fromCurrency,
    toCurrency,
    setCurrencies,
    themeMode,
    language,
  } = useAppStore();

  const tokens = getThemeTokens(themeMode);
  const activeCode = side === 'to' ? toCurrency : fromCurrency;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter 165+ currencies in real time
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CURRENCY_LIST;

    return CURRENCY_LIST.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameBn.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (code: string) => {
    triggerTactileFeedback();
    if (side === 'to') {
      setCurrencies(fromCurrency, code);
    } else {
      setCurrencies(code, toCurrency);
    }
    router.back();
  };

  const renderItem = ({ item }: { item: CurrencyInfo }) => {
    const isSelected = item.code === activeCode;
    const displayName = language === 'bn' ? item.nameBn : item.nameEn;

    return (
      <Pressable
        onPress={() => handleSelect(item.code)}
        style={[
          styles.currencyRow,
          {
            backgroundColor: isSelected ? tokens.accentOps : tokens.innerPanel,
            borderBottomColor: tokens.inkBorder,
            borderBottomWidth: 1.2,
          },
        ]}
      >
        <Text style={styles.flagSymbol}>{item.flag}</Text>

        <View style={styles.currencyMeta}>
          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: tokens.inkBorder }]}>
              {item.code}
            </Text>
            <Text style={[styles.symbolPill, { color: tokens.textSecondary }]}>
              ({item.symbol})
            </Text>
          </View>
          <Text
            style={[styles.nameText, { color: tokens.textSecondary }]}
            numberOfLines={1}
          >
            {displayName} • {item.country}
          </Text>
        </View>

        {isSelected ? (
          <View style={styles.checkIcon}>
            <Check size={18} color={tokens.inkBorder} strokeWidth={3} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.appBackground }]}
    >
      <View style={styles.container}>
        {/* Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: tokens.chassisSurface,
              borderColor: tokens.inkBorder,
              borderWidth: hardwareConstants.borderWidth,
            },
          ]}
        >
          <Text style={styles.headerTitle}>
            {t('currency.select_currency', 'SELECT CURRENCY')} // {side.toUpperCase()}
          </Text>

          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color="#FFFDF7" strokeWidth={2.8} />
          </Pressable>
        </View>

        {/* Search Bar Input */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: tokens.innerPanel,
              borderColor: tokens.inkBorder,
              borderWidth: hardwareConstants.borderWidth,
            },
          ]}
        >
          <Search size={18} color={tokens.textSecondary} strokeWidth={2.5} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t(
              'currency.search_placeholder',
              'Search 165+ currencies (code, name, country)...'
            )}
            placeholderTextColor={tokens.textMuted}
            style={[styles.searchInput, { color: tokens.textPrimary }]}
            autoFocus
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={16} color={tokens.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Popular Quick Chips Bar */}
        <View style={styles.chipsContainer}>
          {POPULAR_CURRENCY_CODES.slice(0, 7).map((code) => {
            const item = CURRENCY_CATALOGUE[code];
            const isSelected = code === activeCode;
            return (
              <Pressable
                key={code}
                onPress={() => handleSelect(code)}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                    borderColor: tokens.inkBorder,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={styles.quickChipText}>
                  {item?.flag} {code}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Virtualized Currency List */}
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          initialNumToRender={20}
          maxToRenderPerBatch={25}
          windowSize={10}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            {
              borderColor: tokens.inkBorder,
              borderWidth: hardwareConstants.borderWidth,
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 12,
    maxWidth: 480,
    width: '100%',
    marginHorizontal: 'auto',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FFFDF7',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '600',
    padding: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  quickChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  quickChipText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  listContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  flagSymbol: {
    fontSize: 24,
    marginRight: 10,
  },
  currencyMeta: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  symbolPill: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 11,
    marginTop: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
});
