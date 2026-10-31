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
import { DevView } from '../features/dev/DevView';
import { useAppStore } from '../store/useAppStore';
import { toHexBinOct } from '../features/calculator/calcEngine';
import {
  computeAluOperation,
  formatBigIntBase,
  parseToBigInt,
  formatDigitGrouping,
} from '../features/dev/devEngine';
import {
  getThemeTokens,
} from '../utils/themeTokens';
import { useHardwareLayout } from '../utils/useHardwareLayout';
import { triggerTactileFeedback } from '../utils/soundEffects';

export default function MainChassisScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isTapeOpen, setIsTapeOpen] = useState(false);
  const layout = useHardwareLayout();

  const {
    activeMode,
    setMode,
    themeMode,
    toggleTheme,
    lcdBacklightMode,
    toggleLcdBacklight,
    digitGroupingMode,
    toggleDigitGroupingMode,
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
    ratesSource,
    ratesStale,
    // DEV State for LCD feed
    devBase,
    devWordSize,
    devOperandA,
    devOperandB,
    devActiveRegister,
    devAluOp,
    devIsSigned,
  } = useAppStore();

  const tokens = getThemeTokens(themeMode);

  // Background non-blocking rates refresh on mount
  useEffect(() => {
    refreshExchangeRates().catch(() => {});
  }, [refreshExchangeRates]);

  // Compute live HEX/BIN/OCT base conversion for integer result (CALC / SCI)
  const calcBaseValues = useMemo(() => {
    const numeric = parseFloat(calcResult.replace(/,/g, ''));
    if (!Number.isNaN(numeric)) {
      return toHexBinOct(numeric);
    }
    return { hex: '0x0', bin: '0', oct: '0' };
  }, [calcResult]);

  // Compute live DEV ALU flags and base values
  const devAluResult = useMemo(
    () => computeAluOperation(devOperandA, devOperandB, devAluOp, devWordSize),
    [devOperandA, devOperandB, devAluOp, devWordSize]
  );

  const devActiveValBig = useMemo(() => {
    const activeStr = devActiveRegister === 'A' ? devOperandA : devOperandB;
    return parseToBigInt(activeStr, 'DEC');
  }, [devActiveRegister, devOperandA, devOperandB]);

  const devLcdDisplayValue = useMemo(() => {
    if (activeMode !== 'DEV') return calcExpression || calcResult;
    const formatted = formatBigIntBase(devActiveValBig, devBase, devWordSize, devIsSigned);
    return devBase === 'DEC' ? formatDigitGrouping(formatted, digitGroupingMode) : formatted;
  }, [activeMode, calcExpression, calcResult, devActiveValBig, devBase, devWordSize, devIsSigned, digitGroupingMode]);

  const devBaseValues = useMemo(() => {
    return {
      hex: formatBigIntBase(devActiveValBig, 'HEX', devWordSize, false),
      bin: formatBigIntBase(devActiveValBig, 'BIN', devWordSize, false),
      oct: formatBigIntBase(devActiveValBig, 'OCT', devWordSize, false),
    };
  }, [devActiveValBig, devWordSize]);

  const handleOpenSettings = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    router.push('/settings');
  };

  const handleToggleTape = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    setIsTapeOpen((prev) => !prev);
  };

  const handleToggleSound = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    toggleSound();
  };

  const handleToggleTheme = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    toggleTheme();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.appBackground }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: layout.safeTopInset, paddingHorizontal: layout.chassisPadding },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Hardware Quick Toolbar */}
        <View style={styles.topToolbar}>
          {/* Paper Tape Drawer Toggle with Count Badge */}
          <Pressable
            accessible={true}
            accessibilityLabel={`Paper Tape Drawer, ${paperTape.length} items`}
            testID="toolbar-tape-button"
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
              accessible={true}
              accessibilityLabel={`Sound: ${soundEnabled ? 'Enabled' : 'Disabled'}`}
              testID="toolbar-sound-button"
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
              accessible={true}
              accessibilityLabel={`Theme: ${themeMode}`}
              testID="toolbar-theme-button"
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
              accessible={true}
              accessibilityLabel="Hardware Settings"
              testID="toolbar-settings-button"
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
          {/* Recessed Visor LCD Display with Micro-Annunciators & Backlight Switch */}
          <LcdDisplay
            expression={activeMode === 'DEV' ? `REG ${devActiveRegister} [${devBase}]` : calcExpression}
            value={devLcdDisplayValue}
            mode={activeMode}
            angleMode={angleMode}
            onToggleAngleMode={toggleAngleMode}
            memoryActive={calcMemory !== 0}
            hexValue={activeMode === 'DEV' ? devBaseValues.hex : calcBaseValues.hex}
            binValue={activeMode === 'DEV' ? devBaseValues.bin : calcBaseValues.bin}
            octValue={activeMode === 'DEV' ? devBaseValues.oct : calcBaseValues.oct}
            themeMode={themeMode}
            backlightMode={lcdBacklightMode}
            onToggleBacklight={toggleLcdBacklight}
            digitGroupingMode={digitGroupingMode}
            onToggleDigitGrouping={toggleDigitGroupingMode}
            rateFreshness={activeMode === 'CURR' ? (ratesStale ? 'bundled' : ratesSource) : undefined}
            aluFlags={activeMode === 'DEV' ? devAluResult.flags : null}
            error={calcError}
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
          />

          {/* 6-Way Tactile Hardware Matrix Mode Switcher Deck */}
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

          {activeMode === 'DEV' ? (
            <DevView themeMode={themeMode} />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  topToolbar: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  toolBtnText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1B241E',
  },
  toolBtnCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
