import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { X, RefreshCw, Volume2, Smartphone, BookOpen, Activity } from 'lucide-react-native';
import { CrunchBoxLogo } from '../components/chassis/CrunchBoxLogo';
import { useAppStore } from '../store/useAppStore';
import {
  getThemeTokens,
  hardwareConstants,
} from '../utils/themeTokens';
import { triggerTactileFeedback } from '../utils/soundEffects';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    themeMode,
    toggleTheme,
    language,
    setLanguage,
    soundEnabled,
    toggleSound,
    hapticsEnabled,
    toggleHaptics,
    ratesEffectiveDate,
    ratesFetchedAt,
    exchangeRates,
    refreshExchangeRates,
    setGuidebookOpen,
    setDiagnosticsOpen,
  } = useAppStore();

  const tokens = getThemeTokens(themeMode);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    triggerTactileFeedback();
    setIsRefreshing(true);
    await refreshExchangeRates();
    setIsRefreshing(false);
  };

  const handleLanguageChange = (lang: 'en' | 'bn') => {
    triggerTactileFeedback();
    setLanguage(lang);
  };

  const formattedSyncTime = ratesFetchedAt
    ? new Date(ratesFetchedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Bundled Baseline';

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
              borderColor: tokens.borderVisible,
              borderWidth: hardwareConstants.borderWidth,
            },
          ]}
        >
          <Text style={styles.headerTitle}>
            {t('settings.title', 'HARDWARE SETTINGS')}
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={styles.closeBtn}
            hitSlop={8}
            accessibilityLabel="Close settings"
          >
            <X size={20} color="#FFFDF7" strokeWidth={2.8} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Brand Hero Hardware Card */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: tokens.chassisSurface,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidthHeavy,
              },
            ]}
          >
            <CrunchBoxLogo variant="icon" size={96} />
            <Text style={styles.heroTitle}>CRUNCHBOX</Text>
            <Text style={styles.heroSerial}>
              {t('settings.chassis_id', 'CHASSIS SPEC: CB-09 FIELD UNIT')}
            </Text>
            <Text style={[styles.heroTagline, { color: tokens.recessedLcd }]}>
              {language === 'bn'
                ? 'হিসাব ও কারেন্সির রাফ-অ্যান্ড-টাফ গিয়ার'
                : 'Heavy-Duty Math & Money Gear'}
            </Text>
          </View>

          {/* Theme Settings Deck */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
              {t('settings.theme_title', 'APPEARANCE MODE')}
            </Text>
            <View style={styles.btnGroupRow}>
              <Pressable
                onPress={() => {
                  if (themeMode !== 'field') toggleTheme();
                }}
                style={[
                  styles.toggleSegment,
                  {
                    backgroundColor:
                      themeMode === 'field'
                        ? tokens.accentOps
                        : tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                    borderWidth: 1.8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        themeMode === 'field'
                          ? tokens.keycapOperatorText
                          : tokens.keycapNumberText,
                      fontWeight: themeMode === 'field' ? '900' : '600',
                    },
                  ]}
                >
                  {t('settings.theme_field', 'Field Light')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (themeMode !== 'tactical') toggleTheme();
                }}
                style={[
                  styles.toggleSegment,
                  {
                    backgroundColor:
                      themeMode === 'tactical'
                        ? tokens.accentOps
                        : tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                    borderWidth: 1.8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        themeMode === 'tactical'
                          ? tokens.keycapOperatorText
                          : tokens.keycapNumberText,
                      fontWeight: themeMode === 'tactical' ? '900' : '600',
                    },
                  ]}
                >
                  {t('settings.theme_tactical', 'Tactical Dark')}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Language Selector Deck */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
              {t('settings.language_title', 'SYSTEM LANGUAGE')}
            </Text>
            <View style={styles.btnGroupRow}>
              <Pressable
                onPress={() => handleLanguageChange('en')}
                style={[
                  styles.toggleSegment,
                  {
                    backgroundColor:
                      language === 'en'
                        ? tokens.accentOps
                        : tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                    borderWidth: 1.8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        language === 'en'
                          ? tokens.keycapOperatorText
                          : tokens.keycapNumberText,
                      fontWeight: language === 'en' ? '900' : '600',
                    },
                  ]}
                >
                  English
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleLanguageChange('bn')}
                style={[
                  styles.toggleSegment,
                  {
                    backgroundColor:
                      language === 'bn'
                        ? tokens.accentOps
                        : tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                    borderWidth: 1.8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        language === 'bn'
                          ? tokens.keycapOperatorText
                          : tokens.keycapNumberText,
                      fontWeight: language === 'bn' ? '900' : '600',
                    },
                  ]}
                >
                  বাংলা (Bengali)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Tactile & Audio Switches */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
              {t('settings.tactile_feedback', 'TACTILE & AUDIO GEAR')}
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelGroup}>
                <Volume2 size={16} color={tokens.textPrimary} />
                <Text style={[styles.switchLabel, { color: tokens.textPrimary }]}>
                  {t('settings.sound_label', 'Mechanical Switch Audio')}
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: tokens.accentOps }}
                thumbColor={tokens.keypadSurface}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelGroup}>
                <Smartphone size={16} color={tokens.textPrimary} />
                <Text style={[styles.switchLabel, { color: tokens.textPrimary }]}>
                  {t('settings.haptics_label', 'Haptic Switch Pulse')}
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: '#767577', true: tokens.accentOps }}
                thumbColor={tokens.keypadSurface}
              />
            </View>
          </View>

          {/* Offline Rates Cache Deck */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
              {t('settings.cache_title', 'OFFLINE RATES CACHE')}
            </Text>

            <Text style={[styles.cacheDetail, { color: tokens.textPrimary }]}>
              {t('settings.rates_count', {
                count: Object.keys(exchangeRates).length,
                defaultValue: `Cached Currencies: ${Object.keys(exchangeRates).length}`,
              })}
            </Text>
            <Text style={[styles.cacheDetail, { color: tokens.textMuted }]}>
              {t('settings.last_updated', {
                date: `${ratesEffectiveDate} (${formattedSyncTime})`,
                defaultValue: `Last Synced: ${ratesEffectiveDate} (${formattedSyncTime})`,
              })}
            </Text>

            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              style={[
                styles.refreshBtn,
                {
                  backgroundColor: tokens.accentOps,
                  borderColor: tokens.borderVisible,
                  borderWidth: 2,
                  opacity: isRefreshing ? 0.6 : 1,
                },
              ]}
            >
              <RefreshCw size={15} color={tokens.keycapOperatorText} strokeWidth={2.8} />
              <Text style={[styles.refreshBtnText, { color: tokens.keycapOperatorText }]}>
                {isRefreshing
                  ? t('settings.refreshing', 'CONNECTING TO CDN...')
                  : t('settings.refresh_button', 'FORCE REFRESH RATES')}
              </Text>
            </Pressable>

            <Text style={[styles.disclaimerText, { color: tokens.textMuted }]}>
              {t(
                'settings.disclaimer',
                'All exchange rates are reference rates only. CrunchBox runs 100% locally with zero cloud trackers.'
              )}
            </Text>
          </View>
          {/* Hardware Manual & Diagnostics Deck */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: tokens.textSecondary }]}>
              {t('settings.manual_title', 'DOCUMENTATION & SELF-TEST')}
            </Text>

            <Pressable
              onPress={() => {
                triggerTactileFeedback();
                router.back();
                setTimeout(() => setGuidebookOpen(true), 150);
              }}
              style={[
                styles.refreshBtn,
                {
                  backgroundColor: tokens.keypadSurface,
                  borderColor: tokens.borderVisible,
                  borderWidth: 1.8,
                },
              ]}
            >
              <BookOpen size={15} color={tokens.accentOps} strokeWidth={2.4} />
              <Text style={[styles.refreshBtnText, { color: tokens.textPrimary }]}>
                {t('settings.open_manual', 'OPEN HARDWARE MANUAL (📖 GUIDE)')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerTactileFeedback();
                router.back();
                setTimeout(() => setDiagnosticsOpen(true), 150);
              }}
              style={[
                styles.refreshBtn,
                {
                  backgroundColor: tokens.keypadSurface,
                  borderColor: tokens.borderVisible,
                  borderWidth: 1.8,
                },
              ]}
            >
              <Activity size={15} color={tokens.actionGreen} strokeWidth={2.4} />
              <Text style={[styles.refreshBtnText, { color: tokens.textPrimary }]}>
                {t('settings.run_diagnostics', 'RUN 15-POINT SELF-TEST (QA)')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 24,
    gap: 10,
  },
  heroCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'sans-serif',
    color: '#FFFDF7',
    letterSpacing: 2.5,
    marginTop: 8,
  },
  heroSerial: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#EAB308',
    marginTop: 2,
  },
  heroTagline: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  btnGroupRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleSegment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  switchLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  switchLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  cacheDetail: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  refreshBtnText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
