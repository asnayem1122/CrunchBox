import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from 'lucide-react-native';
import { RuggedChassis } from '../components/chassis/RuggedChassis';
import { LcdDisplay } from '../components/chassis/LcdDisplay';
import { ModeSelector } from '../components/chassis/ModeSelector';
import { PaperTapeDrawer } from '../components/chassis/PaperTapeDrawer';
import { KeypadView } from '../features/calculator/KeypadView';
import { CurrencyView } from '../features/currency/CurrencyView';
import { UnitConverterView } from '../features/units/UnitConverterView';
import { SmartToolsView } from '../features/tools/SmartToolsView';
import { useAppStore } from '../store/useAppStore';
import { toHexBinOct } from '../features/calculator/calcEngine';
import {
  getThemeTokens,
  hardwareConstants,
} from '../utils/themeTokens';
import { triggerTactileFeedback } from '../utils/soundEffects';

export default function MainChassisScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isTapeOpen, setIsTapeOpen] = useState(false);

  const {
    activeMode,
    setMode,
    themeMode,
    toggleTheme,
    soundEnabled,
    toggleSound,
    hapticsEnabled,
    calcExpression,
    calcResult,
    calcMemory,
    angleMode,
    toggleAngleMode,
    calcError,
    paperTape,
    refreshExchangeRates,
  } = useAppStore();

  const tokens = getThemeTokens(themeMode);

  // Background non-blocking rates refresh on mount
  useEffect(() => {
    refreshExchangeRates().catch(() => {});
  }, [refreshExchangeRates]);

  // Compute live HEX/BIN/OCT base conversion for integer result
  const { hex, bin, oct } = useMemo(() => {
    const numeric = parseFloat(calcResult.replace(/,/g, ''));
    if (!Number.isNaN(numeric)) {
      return toHexBinOct(numeric);
    }
    return { hex: '0x0', bin: '0', oct: '0' };
  }, [calcResult]);

  const handleOpenSettings = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    router.push('/settings');
  };

  const handleToggleTape = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    setIsTapeOpen((prev) => !prev);
  };

  const handleToggleSound = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    toggleSound();
  };

  const handleToggleTheme = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled);
    toggleTheme();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.appBackground }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Hardware Quick Toolbar */}
        <View style={styles.topToolbar}>
          {/* Paper Tape Drawer Toggle with Count Badge */}
          <Pressable
            onPress={handleToggleTape}
            style={[
              styles.toolBtn,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.inkBorder,
                borderWidth: 2,
              },
            ]}
          >
            <Receipt size={17} color={tokens.inkBorder} strokeWidth={2.5} />
            <Text style={[styles.toolBtnText, { color: tokens.inkBorder }]}>
              {t('tape.title', 'TAPE')}
            </Text>
            {paperTape.length > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: tokens.accentOps, borderColor: tokens.inkBorder },
                ]}
              >
                <Text style={styles.countBadgeText}>{paperTape.length}</Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.toolBtnCluster}>
            {/* Audio Toggle */}
            <Pressable
              onPress={handleToggleSound}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tokens.innerPanel,
                  borderColor: tokens.inkBorder,
                  borderWidth: 2,
                },
              ]}
            >
              {soundEnabled ? (
                <Volume2 size={16} color={tokens.inkBorder} strokeWidth={2.4} />
              ) : (
                <VolumeX size={16} color={tokens.dangerRed} strokeWidth={2.4} />
              )}
            </Pressable>

            {/* Theme Toggle */}
            <Pressable
              onPress={handleToggleTheme}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tokens.innerPanel,
                  borderColor: tokens.inkBorder,
                  borderWidth: 2,
                },
              ]}
            >
              {themeMode === 'field' ? (
                <Moon size={16} color={tokens.inkBorder} strokeWidth={2.4} />
              ) : (
                <Sun size={16} color={tokens.accentOps} strokeWidth={2.4} />
              )}
            </Pressable>

            {/* Settings Gear Button */}
            <Pressable
              onPress={handleOpenSettings}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tokens.accentOps,
                  borderColor: tokens.inkBorder,
                  borderWidth: 2,
                },
              ]}
            >
              <SettingsIcon size={16} color={tokens.inkBorder} strokeWidth={2.6} />
            </Pressable>
          </View>
        </View>

        {/* Outer Heavy-Duty Hardware Chassis */}
        <RuggedChassis
          themeMode={themeMode}
          statusText={`CB-09 // ${activeMode} MODE`}
        >
          {/* Recessed Phosphor Sage Visor LCD Display */}
          <LcdDisplay
            expression={calcExpression}
            value={calcExpression || calcResult}
            mode={activeMode}
            angleMode={angleMode}
            onToggleAngleMode={toggleAngleMode}
            memoryActive={calcMemory !== 0}
            hexValue={hex}
            binValue={bin}
            octValue={oct}
            themeMode={themeMode}
            error={calcError}
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
          />

          {/* 5-Way Mode Switcher Deck */}
          <ModeSelector
            activeMode={activeMode}
            onChangeMode={setMode}
            themeMode={themeMode}
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
          />

          {/* Active Hardware Deck View */}
          {activeMode === 'CALC' || activeMode === 'SCI' ? (
            <KeypadView themeMode={themeMode} />
          ) : null}

          {activeMode === 'CURR' ? (
            <CurrencyView themeMode={themeMode} />
          ) : null}

          {activeMode === 'UNIT' ? (
            <UnitConverterView themeMode={themeMode} />
          ) : null}

          {activeMode === 'TOOLS' ? (
            <SmartToolsView themeMode={themeMode} />
          ) : null}
        </RuggedChassis>
      </ScrollView>

      {/* Pull-Out Perforated Paper Tape Receipt Drawer */}
      <PaperTapeDrawer
        isOpen={isTapeOpen}
        onClose={() => setIsTapeOpen(false)}
        themeMode={themeMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topToolbar: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: hardwareConstants.borderRadiusSm,
  },
  toolBtnText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1.2,
  },
  countBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#1B241E',
  },
  toolBtnCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 7,
    borderRadius: hardwareConstants.borderRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
