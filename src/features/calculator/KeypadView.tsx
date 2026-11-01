import React, { memo } from 'react';
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

const KeypadViewComponent: React.FC<KeypadViewProps> = ({ themeMode = 'field' }) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  // Atomic selectors - KeypadView does NOT subscribe to expression or result,
  // preventing all 35 buttons from re-rendering during keystrokes!
  const activeMode = useAppStore((s) => s.activeMode);
  const fractionMode = useAppStore((s) => s.fractionMode);
  const inputCalcKey = useAppStore((s) => s.inputCalcKey);
  const evaluateCalc = useAppStore((s) => s.evaluateCalc);
  const clearCalc = useAppStore((s) => s.clearCalc);
  const deleteCalcLast = useAppStore((s) => s.deleteCalcLast);
  const cycleFractionMode = useAppStore((s) => s.cycleFractionMode);
  const primeFactorizeCalc = useAppStore((s) => s.primeFactorizeCalc);
  const memoryAdd = useAppStore((s) => s.memoryAdd);
  const memorySubtract = useAppStore((s) => s.memorySubtract);
  const memoryRecall = useAppStore((s) => s.memoryRecall);
  const memoryClear = useAppStore((s) => s.memoryClear);
  const sendCalcToCurrency = useAppStore((s) => s.sendCalcToCurrency);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);

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
          label="S⇔D"
          subtitle={fractionMode !== 'DEC' ? fractionMode : undefined}
          variant="action"
          flex={1.3}
          height={38}
          themeMode={themeMode}
          onPress={cycleFractionMode}
          textStyle={styles.actionBtnText}
          testID="btn-sd-toggle"
        />
        <TactileButton
          label="SEND -> CURR"
          variant="action"
          flex={1.7}
          height={38}
          themeMode={themeMode}
          onPress={sendCalcToCurrency}
          textStyle={styles.sendBtnText}
          testID="btn-send-curr"
        />
      </View>

      {/* 2. Scientific Tier Keys (fx-991EX ClassWiz Extended Keys) */}
      {isScientific ? (
        <View style={styles.sciDeck}>
          {/* Row 1: Combinatorics, Factorization, Powers */}
          <View style={styles.keyRow}>
            <TactileButton
              label="nCr"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('nCr')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="nPr"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('nPr')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="FACT"
              variant="action"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={primeFactorizeCalc}
              textStyle={styles.sciBtnText}
              testID="btn-sci-fact"
            />
            <TactileButton
              label="x!"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('!')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="1/x"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('^(-1)')}
              textStyle={styles.sciBtnText}
            />
          </View>

          {/* Row 2: Trig Functions & Logarithms */}
          <View style={styles.keyRow}>
            <TactileButton
              label="sin"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('sin(')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="cos"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('cos(')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="tan"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('tan(')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="ln"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('ln(')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="log"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('log(')}
              textStyle={styles.sciBtnText}
            />
          </View>

          {/* Row 3: Roots, Powers, Parentheses */}
          <View style={styles.keyRow}>
            <TactileButton
              label="√"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('sqrt(')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="x²"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('^2')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="xʸ"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('^')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label="("
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey('(')}
              textStyle={styles.sciBtnText}
            />
            <TactileButton
              label=")"
              variant="secondary"
              flex={1}
              height={42}
              themeMode={themeMode}
              onPress={() => inputCalcKey(')')}
              textStyle={styles.sciBtnText}
            />
          </View>

          {/* Row 4: Constants Chips Bar (Casio fx-991EX physical constants) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.constantsBar}>
            {CONSTANTS_LIST.map((c) => (
              <Pressable
                key={c.symbol}
                accessible={true}
                accessibilityLabel={`Constant ${c.label} (${c.symbol})`}
                testID={`const-${c.symbol}`}
                onPress={() => {
                  triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                  inputCalcKey(c.val);
                }}
                style={[
                  styles.constChip,
                  {
                    backgroundColor: tokens.innerPanel,
                    borderColor: tokens.borderVisible,
                  },
                ]}
              >
                <Text style={[styles.constChipSymbol, { color: tokens.textPrimary }]}>{c.symbol}</Text>
                <Text style={[styles.constChipLabel, { color: tokens.textSecondary }]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* 3. Primary Keypad Matrix (Standard Field Calculator) */}
      <View style={styles.primaryGrid}>
        {/* Row 1 */}
        <View style={styles.keyRow}>
          <TactileButton
            label="AC"
            variant="danger"
            flex={1}
            themeMode={themeMode}
            onPress={clearCalc}
            testID="btn-ac"
          />
          <TactileButton
            label="DEL"
            variant="danger"
            flex={1}
            themeMode={themeMode}
            onPress={deleteCalcLast}
            testID="btn-del"
          />
          <TactileButton
            label="%"
            variant="operator"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('%')}
            testID="btn-pct"
          />
          <TactileButton
            label="÷"
            variant="operator"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('÷')}
            testID="btn-div"
          />
        </View>

        {/* Row 2 */}
        <View style={styles.keyRow}>
          <TactileButton
            label="7"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('7')}
            testID="btn-7"
          />
          <TactileButton
            label="8"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('8')}
            testID="btn-8"
          />
          <TactileButton
            label="9"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('9')}
            testID="btn-9"
          />
          <TactileButton
            label="×"
            variant="operator"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('×')}
            testID="btn-mul"
          />
        </View>

        {/* Row 3 */}
        <View style={styles.keyRow}>
          <TactileButton
            label="4"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('4')}
            testID="btn-4"
          />
          <TactileButton
            label="5"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('5')}
            testID="btn-5"
          />
          <TactileButton
            label="6"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('6')}
            testID="btn-6"
          />
          <TactileButton
            label="−"
            variant="operator"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('−')}
            testID="btn-sub"
          />
        </View>

        {/* Row 4 */}
        <View style={styles.keyRow}>
          <TactileButton
            label="1"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('1')}
            testID="btn-1"
          />
          <TactileButton
            label="2"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('2')}
            testID="btn-2"
          />
          <TactileButton
            label="3"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('3')}
            testID="btn-3"
          />
          <TactileButton
            label="+"
            variant="operator"
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('+')}
            testID="btn-add"
          />
        </View>

        {/* Row 5 */}
        <View style={styles.keyRow}>
          <TactileButton
            label="0"
            flex={2}
            themeMode={themeMode}
            onPress={() => inputCalcKey('0')}
            testID="btn-0"
          />
          <TactileButton
            label="."
            flex={1}
            themeMode={themeMode}
            onPress={() => inputCalcKey('.')}
            testID="btn-dot"
          />
          <TactileButton
            label="="
            variant="operator"
            flex={1}
            themeMode={themeMode}
            onPress={evaluateCalc}
            testID="btn-equals"
          />
        </View>
      </View>
    </View>
  );
};

export const KeypadView = memo(KeypadViewComponent, (prev, next) => {
  return prev.themeMode === next.themeMode;
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 4,
  },
  topActionBar: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },
  memoryBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sendBtnText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sciDeck: {
    gap: 4,
    marginBottom: 6,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  sciBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  constantsBar: {
    flexDirection: 'row',
    paddingVertical: 2,
    marginBottom: 2,
  },
  constChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.2,
    marginRight: 6,
  },
  constChipSymbol: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  constChipLabel: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    opacity: 0.8,
  },
  primaryGrid: {
    gap: 2,
  },
});
