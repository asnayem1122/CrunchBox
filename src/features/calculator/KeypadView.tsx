import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TactileButton } from '../../components/ui/TactileButton';
import { useAppStore } from '../../store/useAppStore';
import { ThemeMode, getThemeTokens } from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface KeypadViewProps {
  themeMode?: ThemeMode;
}

const CONSTANTS_LIST = [
  { symbol: 'π', val: 'π', label: 'Pi' },
  { symbol: 'e', val: 'e', label: 'Euler' },
  { symbol: 'c', val: 'c', label: 'Light' },
  { symbol: 'g', val: 'g', label: 'Gravity' },
  { symbol: 'h', val: 'h', label: 'Planck' },
  { symbol: 'NA', val: 'na', label: 'Avogadro' },
];

export const KeypadView: React.FC<KeypadViewProps> = ({ themeMode = 'field' }) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const {
    activeMode,
    angleMode,
    fractionMode,
    inputCalcKey,
    evaluateCalc,
    clearCalc,
    deleteCalcLast,
    cycleFractionMode,
    primeFactorizeCalc,
    toggleAngleMode,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
    sendCalcToCurrency,
    calcResult,
    soundEnabled,
    hapticsEnabled,
  } = useAppStore();

  const isScientific = activeMode === 'SCI';

  return (
    <View style={styles.container}>
      {/* 1. Top Action & Memory Bar with S<=>D & SEND -> CURR */}
      <View style={styles.topActionBar}>
        <TactileButton
          label="MC"
          variant="secondary"
          flex={1}
          height={38}
          themeMode={themeMode}
          onPress={memoryClear}
          textStyle={styles.memoryBtnText}
        />
        <TactileButton
          label="MR"
          variant="secondary"
          flex={1}
          height={38}
          themeMode={themeMode}
          onPress={memoryRecall}
          textStyle={styles.memoryBtnText}
        />
        <TactileButton
          label="M+"
          variant="secondary"
          flex={1}
          height={38}
          themeMode={themeMode}
          onPress={memoryAdd}
          textStyle={styles.memoryBtnText}
        />
        <TactileButton
          label="M−"
          variant="secondary"
          flex={1}
          height={38}
          themeMode={themeMode}
          onPress={memorySubtract}
          textStyle={styles.memoryBtnText}
        />
        <TactileButton
          label={fractionMode !== 'DEC' ? `S⇔D:${fractionMode}` : 'S⇔D'}
          variant="secondary"
          flex={1.3}
          height={38}
          themeMode={themeMode}
          onPress={cycleFractionMode}
          textStyle={styles.sdBtnText}
        />
        <TactileButton
          label={t('calc.send_to_curr', 'SEND -> CURR')}
          variant="operator"
          flex={1.7}
          height={38}
          themeMode={themeMode}
          onPress={sendCalcToCurrency}
          textStyle={styles.sendBtnText}
        />
      </View>

      {/* 2. Scientific Deck with Casio fx-991EX ClassWiz Suite (rendered in SCI mode) */}
      {isScientific ? (
        <View style={styles.sciDeck}>
          {/* Scientific Constants Chip Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.constChipScroll}
            style={[
              styles.constChipBar,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
              },
            ]}
          >
            <Text style={[styles.constBarLabel, { color: tokens.textSecondary }]}>
              CONST:
            </Text>
            {CONSTANTS_LIST.map((item) => (
              <Pressable
                key={item.symbol}
                accessible={true}
                accessibilityLabel={`Constant ${item.label}`}
                testID={`calc-const-${item.val}`}
                onPress={() => {
                  triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                  inputCalcKey(item.val);
                }}
                style={[
                  styles.constChip,
                  {
                    backgroundColor: tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                  },
                ]}
              >
                <Text style={[styles.constChipText, { color: tokens.keycapNumberText }]}>
                  {item.symbol}
                  <Text style={[styles.constChipSub, { color: tokens.textSecondary }]}>
                    {' '}{item.label}
                  </Text>
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Sci Row 1: Trig + Combinatorics */}
          <View style={styles.gridRow}>
            <TactileButton label="sin" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('sin(')} textStyle={styles.sciBtnText} />
            <TactileButton label="cos" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('cos(')} textStyle={styles.sciBtnText} />
            <TactileButton label="tan" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('tan(')} textStyle={styles.sciBtnText} />
            <TactileButton label="nCr" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey(' nCr ')} textStyle={styles.sciBtnText} />
            <TactileButton label="nPr" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey(' nPr ')} textStyle={styles.sciBtnText} />
          </View>

          {/* Sci Row 2: Powers, Roots, Logs */}
          <View style={styles.gridRow}>
            <TactileButton label="ln" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('ln(')} textStyle={styles.sciBtnText} />
            <TactileButton label="log" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('log(')} textStyle={styles.sciBtnText} />
            <TactileButton label="x²" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('^2')} textStyle={styles.sciBtnText} />
            <TactileButton label="xʸ" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('^')} textStyle={styles.sciBtnText} />
            <TactileButton label="√" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('√(')} textStyle={styles.sciBtnText} />
          </View>

          {/* Sci Row 3: FACT (Prime Factorize), cbrt, factorial, parens */}
          <View style={styles.gridRow}>
            <TactileButton label="FACT" variant="operator" flex={1} height={42} themeMode={themeMode} onPress={primeFactorizeCalc} textStyle={styles.factBtnText} />
            <TactileButton label="∛" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('cbrt(')} textStyle={styles.sciBtnText} />
            <TactileButton label="n!" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('!')} textStyle={styles.sciBtnText} />
            <TactileButton label="(" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey('(')} textStyle={styles.sciBtnText} />
            <TactileButton label=")" variant="secondary" flex={1} height={42} themeMode={themeMode} onPress={() => inputCalcKey(')')} textStyle={styles.sciBtnText} />
          </View>
        </View>
      ) : null}

      {/* 3. Standard 4x5 Heavy-Duty Keypad */}
      <View style={styles.standardKeypad}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <TactileButton label="AC" variant="danger" flex={1} height={50} themeMode={themeMode} onPress={clearCalc} textStyle={styles.actionBtnText} />
          <TactileButton label="DEL" variant="danger" flex={1} height={50} themeMode={themeMode} onPress={deleteCalcLast} textStyle={styles.actionBtnText} />
          <TactileButton label="%" variant="secondary" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('%')} />
          <TactileButton label="÷" variant="operator" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('÷')} />
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <TactileButton label="7" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('7')} />
          <TactileButton label="8" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('8')} />
          <TactileButton label="9" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('9')} />
          <TactileButton label="×" variant="operator" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('×')} />
        </View>

        {/* Row 3 */}
        <View style={styles.gridRow}>
          <TactileButton label="4" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('4')} />
          <TactileButton label="5" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('5')} />
          <TactileButton label="6" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('6')} />
          <TactileButton label="−" variant="operator" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('−')} />
        </View>

        {/* Row 4 */}
        <View style={styles.gridRow}>
          <TactileButton label="1" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('1')} />
          <TactileButton label="2" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('2')} />
          <TactileButton label="3" variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('3')} />
          <TactileButton label="+" variant="operator" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('+')} />
        </View>

        {/* Row 5 */}
        <View style={styles.gridRow}>
          <TactileButton label="0" variant="number" flex={2} height={50} themeMode={themeMode} onPress={() => inputCalcKey('0')} />
          <TactileButton label="." variant="number" flex={1} height={50} themeMode={themeMode} onPress={() => inputCalcKey('.')} />
          <TactileButton label="=" variant="action" flex={1} height={50} themeMode={themeMode} onPress={evaluateCalc} textStyle={styles.equalsBtnText} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 6,
  },
  topActionBar: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 7,
  },
  memoryBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sdBtnText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  sendBtnText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sciDeck: {
    gap: 5,
    marginBottom: 7,
  },
  constChipBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    marginBottom: 2,
  },
  constChipScroll: {
    alignItems: 'center',
    gap: 5,
  },
  constBarLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
    marginRight: 4,
    alignSelf: 'center',
  },
  constChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.2,
  },
  constChipText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  constChipSub: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  standardKeypad: {
    gap: 7,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 7,
    width: '100%',
  },
  sciBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  factBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '900',
  },
  equalsBtnText: {
    fontSize: 24,
    fontWeight: '900',
  },
});
