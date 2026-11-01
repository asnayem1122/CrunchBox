import React, { useMemo, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, ArrowRight, Check, ArrowLeftRight, CornerDownLeft, RefreshCw, Bookmark } from 'lucide-react-native';
import {
  useAppStore,
} from '../../store/useAppStore';
import {
  DevBase,
  DevWordSize,
  BitwiseOp,
  formatBigIntBase,
  parseToBigInt,
  computeAluOperation,
  formatCharRepresentation,
  getBit,
  toggleBit,
  getWordMask,
} from './devEngine';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface DirectBinaryCalcViewProps {
  themeMode?: ThemeMode;
}

const BASES: DevBase[] = ['BIN', 'DEC', 'HEX', 'OCT', 'ASCII'];

const ASCII_PRESETS: Array<{ label: string; code: number }> = [
  { label: "'A'", code: 65 },
  { label: "'B'", code: 66 },
  { label: "'C'", code: 67 },
  { label: "'a'", code: 97 },
  { label: "'b'", code: 98 },
  { label: "'0'", code: 48 },
  { label: "'1'", code: 49 },
  { label: "'9'", code: 57 },
  { label: "'!'", code: 33 },
  { label: "'@'", code: 64 },
  { label: "'#'", code: 35 },
  { label: "'$'", code: 36 },
  { label: "'%'", code: 37 },
  { label: "'*'", code: 42 },
  { label: "'='", code: 61 },
  { label: "'?'", code: 63 },
  { label: "'~'", code: 126 },
  { label: 'SPC', code: 32 },
  { label: '\\n', code: 10 },
  { label: '\\0', code: 0 },
];

// Memoized Bit Cell to ensure 60fps performance during rapid bit flipping
interface BitCellProps {
  bit: number;
  index: number;
  isInteractive: boolean;
  onToggle?: (index: number) => void;
  accentColor: string;
  inactiveBg: string;
  textColor: string;
  borderColor: string;
}

const BitCell = memo(({
  bit,
  index,
  isInteractive,
  onToggle,
  accentColor,
  inactiveBg,
  textColor,
  borderColor,
}: BitCellProps) => {
  const content = (
    <View
      style={[
        styles.bitCellBox,
        {
          backgroundColor: bit === 1 ? accentColor : inactiveBg,
          borderColor,
        },
      ]}
    >
      <Text style={[styles.bitCellText, { color: textColor }]}>{bit}</Text>
    </View>
  );

  if (!isInteractive || !onToggle) {
    return content;
  }

  return (
    <Pressable
      accessible={true}
      accessibilityLabel={`Toggle bit ${index}, currently ${bit}`}
      onPress={() => onToggle(index)}
      style={styles.bitCellPressable}
    >
      {content}
    </Pressable>
  );
});

export const DirectBinaryCalcView: React.FC<DirectBinaryCalcViewProps> = ({ themeMode = 'field' }) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  // Atomic state selectors
  const devWordSize = useAppStore((s) => s.devWordSize);
  const devOperandA = useAppStore((s) => s.devOperandA);
  const devOperandB = useAppStore((s) => s.devOperandB);
  const devOperandABase = useAppStore((s) => s.devOperandABase);
  const devOperandBBase = useAppStore((s) => s.devOperandBBase);
  const devActiveRegister = useAppStore((s) => s.devActiveRegister);
  const devAluOp = useAppStore((s) => s.devAluOp);
  const devIsSigned = useAppStore((s) => s.devIsSigned);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);

  // Store actions
  const setDevOperandABase = useAppStore((s) => s.setDevOperandABase);
  const setDevOperandBBase = useAppStore((s) => s.setDevOperandBBase);
  const setDevActiveRegister = useAppStore((s) => s.setDevActiveRegister);
  const setDevAluOp = useAppStore((s) => s.setDevAluOp);
  const toggleDevBit = useAppStore((s) => s.toggleDevBit);
  const swapDevOperands = useAppStore((s) => s.swapDevOperands);
  const loadDevResultToA = useAppStore((s) => s.loadDevResultToA);
  const inputDevKey = useAppStore((s) => s.inputDevKey);
  const deleteDevLast = useAppStore((s) => s.deleteDevLast);
  const clearDev = useAppStore((s) => s.clearDev);
  const negateDevTwosComp = useAppStore((s) => s.negateDevTwosComp);
  const sendDevToCalc = useAppStore((s) => s.sendDevToCalc);
  const addPaperTapeEntry = useAppStore((s) => s.addPaperTapeEntry);

  // Mask & BigInt representations
  const mask = useMemo(() => getWordMask(devWordSize), [devWordSize]);
  const bigA = useMemo(() => parseToBigInt(devOperandA, 'DEC') & mask, [devOperandA, mask]);
  const bigB = useMemo(() => parseToBigInt(devOperandB, 'DEC') & mask, [devOperandB, mask]);

  // Compute ALU binary result
  const aluResult = useMemo(
    () => computeAluOperation(devOperandA, devOperandB, devAluOp, devWordSize),
    [devOperandA, devOperandB, devAluOp, devWordSize]
  );
  const resultBigInt = useMemo(
    () => parseToBigInt(aluResult.resultStr, 'DEC') & mask,
    [aluResult.resultStr, mask]
  );

  // Active base for keypad
  const activeBase = devActiveRegister === 'A' ? devOperandABase : devOperandBBase;

  // Formatted readouts for Operand A
  const formattedA = useMemo(() => {
    if (devOperandABase === 'ASCII') return formatCharRepresentation(bigA);
    return formatBigIntBase(bigA, devOperandABase, devWordSize, devIsSigned);
  }, [bigA, devOperandABase, devWordSize, devIsSigned]);

  // Formatted readouts for Operand B
  const formattedB = useMemo(() => {
    if (devOperandBBase === 'ASCII') return formatCharRepresentation(bigB);
    return formatBigIntBase(bigB, devOperandBBase, devWordSize, devIsSigned);
  }, [bigB, devOperandBBase, devWordSize, devIsSigned]);

  // Result readouts across all bases
  const resBin = useMemo(() => formatBigIntBase(resultBigInt, 'BIN', devWordSize, false), [resultBigInt, devWordSize]);
  const resDec = useMemo(() => formatBigIntBase(resultBigInt, 'DEC', devWordSize, devIsSigned), [resultBigInt, devWordSize, devIsSigned]);
  const resHex = useMemo(() => formatBigIntBase(resultBigInt, 'HEX', devWordSize, false), [resultBigInt, devWordSize]);
  const resOct = useMemo(() => formatBigIntBase(resultBigInt, 'OCT', devWordSize, false), [resultBigInt, devWordSize]);
  const resAscii = useMemo(() => formatCharRepresentation(resultBigInt), [resultBigInt]);

  const handleCopy = (text: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    try {
      Share.share({ message: text });
    } catch {}
  };

  const handleTapeReceipt = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    const opSymbol = devAluOp;
    const expr = `0b${bigA.toString(2)} ${opSymbol} 0b${bigB.toString(2)}`;
    const res = aluResult.error ? 'ERR: DIV BY 0' : `0b${resultBigInt.toString(2)} (${resDec})`;
    addPaperTapeEntry({
      expression: expr,
      result: res,
      mode: 'DEV',
    });
  };

  const activeChar = useMemo(() => {
    const val = devActiveRegister === 'A' ? bigA : bigB;
    const code = Number(val & 0x7Fn);
    if (code >= 32 && code <= 126) {
      return String.fromCharCode(code);
    }
    return '';
  }, [devActiveRegister, bigA, bigB]);

  const handleSetAsciiCode = (code: number) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    const clamped = BigInt(code & 0x7F).toString(10);
    if (devActiveRegister === 'A') {
      useAppStore.setState({ devOperandA: clamped });
    } else {
      useAppStore.setState({ devOperandB: clamped });
    }
  };

  const handleBitToggleA = (bitIdx: number) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    const nextVal = toggleBit(devOperandA, bitIdx, devWordSize);
    useAppStore.setState({ devOperandA: nextVal, devActiveRegister: 'A' });
  };

  const handleBitToggleB = (bitIdx: number) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    const nextVal = toggleBit(devOperandB, bitIdx, devWordSize);
    useAppStore.setState({ devOperandB: nextVal, devActiveRegister: 'B' });
  };

  const handleKeycapPress = (char: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    inputDevKey(char);
  };

  // Operations categorized
  const LOGIC_OPS: BitwiseOp[] = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR'];
  const ARITH_OPS: BitwiseOp[] = ['ADD', 'SUB', 'MUL', 'DIV', 'MOD'];
  const SHIFT_OPS: BitwiseOp[] = ['SHL', 'SHR', 'SAR', 'ROL', 'ROR'];

  // Keypad enabled check based on active base
  const isDigitEnabled = (char: string): boolean => {
    if (activeBase === 'BIN') return char === '0' || char === '1';
    if (activeBase === 'OCT') return /^[0-7]$/.test(char);
    if (activeBase === 'DEC') return /^[0-9]$/.test(char);
    if (activeBase === 'HEX') return /^[0-9A-F]$/i.test(char);
    if (activeBase === 'ASCII') return true;
    return false;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. DUAL UNIVERSAL OPERAND CARDS */}
      <View style={styles.operandsWrapper}>
        {/* OPERAND A CARD */}
        <Pressable
          accessible={true}
          accessibilityLabel={`Operand A: ${formattedA}. Tap to set as active input.`}
          onPress={() => {
            triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
            setDevActiveRegister('A');
          }}
          style={[
            styles.operandCard,
            {
              backgroundColor: tokens.innerPanel,
              borderColor: devActiveRegister === 'A' ? tokens.actionGreen : tokens.borderVisible,
              borderWidth: devActiveRegister === 'A' ? 2 : 1.5,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardRegBadge}>
              <View
                style={[
                  styles.cardLedPip,
                  { backgroundColor: devActiveRegister === 'A' ? '#22C55E' : '#4B5563' },
                ]}
              />
              <Text style={[styles.cardRegText, { color: tokens.textPrimary }]}>REG A ({devWordSize}b)</Text>
            </View>

            {/* Base Selector Pills for Operand A */}
            <View style={styles.basePillGroup}>
              {BASES.map((b) => {
                const isSelected = devOperandABase === b;
                return (
                  <Pressable
                    key={b}
                    accessible={true}
                    accessibilityLabel={`Set Operand A format to ${b}`}
                    onPress={() => {
                      triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                      setDevOperandABase(b);
                      setDevActiveRegister('A');
                    }}
                    style={[
                      styles.basePill,
                      {
                        backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                        borderColor: tokens.borderVisible,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.basePillText,
                        {
                          color: isSelected ? tokens.keycapOperatorText : tokens.keycapNumberText,
                          fontWeight: isSelected ? '900' : '600',
                        },
                      ]}
                    >
                      {b}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Main Display of Operand A */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.valueScroll}>
            <Text
              style={[
                styles.operandMainValue,
                { color: devActiveRegister === 'A' ? tokens.textPrimary : tokens.textSecondary },
              ]}
              numberOfLines={1}
            >
              {formattedA}
            </Text>
          </ScrollView>

          {/* Secondary preview strip */}
          <View style={styles.subReadoutStrip}>
            <Text style={[styles.subReadoutText, { color: tokens.textMuted }]}>
              {devOperandABase !== 'BIN' ? `BIN: ${formatBigIntBase(bigA, 'BIN', devWordSize)} ` : ''}
              {devOperandABase !== 'DEC' ? `DEC: ${formatBigIntBase(bigA, 'DEC', devWordSize, devIsSigned)} ` : ''}
              {devOperandABase !== 'HEX' ? `HEX: ${formatBigIntBase(bigA, 'HEX', devWordSize)}` : ''}
            </Text>
          </View>
        </Pressable>

        {/* CENTER HARDWARE JUNCTION: Active Operator Badge & Swap Button */}
        <View style={styles.junctionBar}>
          <View style={[styles.operatorBadge, { backgroundColor: tokens.actionGreen, borderColor: tokens.borderVisible }]}>
            <Text style={styles.operatorBadgeText}>{devAluOp}</Text>
          </View>

          <Pressable
            accessible={true}
            accessibilityLabel="Swap Operand A and Operand B"
            onPress={() => {
              triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
              swapDevOperands();
            }}
            style={[styles.swapBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible }]}
          >
            <ArrowLeftRight size={13} color={tokens.keycapNumberText} />
            <Text style={[styles.swapBtnText, { color: tokens.keycapNumberText }]}>SWAP A ⇄ B</Text>
          </Pressable>
        </View>

        {/* OPERAND B CARD */}
        <Pressable
          accessible={true}
          accessibilityLabel={`Operand B: ${formattedB}. Tap to set as active input.`}
          onPress={() => {
            triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
            setDevActiveRegister('B');
          }}
          style={[
            styles.operandCard,
            {
              backgroundColor: tokens.innerPanel,
              borderColor: devActiveRegister === 'B' ? tokens.actionGreen : tokens.borderVisible,
              borderWidth: devActiveRegister === 'B' ? 2 : 1.5,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardRegBadge}>
              <View
                style={[
                  styles.cardLedPip,
                  { backgroundColor: devActiveRegister === 'B' ? '#22C55E' : '#4B5563' },
                ]}
              />
              <Text style={[styles.cardRegText, { color: tokens.textPrimary }]}>REG B ({devWordSize}b)</Text>
            </View>

            {/* Base Selector Pills for Operand B */}
            <View style={styles.basePillGroup}>
              {BASES.map((b) => {
                const isSelected = devOperandBBase === b;
                return (
                  <Pressable
                    key={b}
                    accessible={true}
                    accessibilityLabel={`Set Operand B format to ${b}`}
                    onPress={() => {
                      triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                      setDevOperandBBase(b);
                      setDevActiveRegister('B');
                    }}
                    style={[
                      styles.basePill,
                      {
                        backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                        borderColor: tokens.borderVisible,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.basePillText,
                        {
                          color: isSelected ? tokens.keycapOperatorText : tokens.keycapNumberText,
                          fontWeight: isSelected ? '900' : '600',
                        },
                      ]}
                    >
                      {b}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Main Display of Operand B */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.valueScroll}>
            <Text
              style={[
                styles.operandMainValue,
                { color: devActiveRegister === 'B' ? tokens.textPrimary : tokens.textSecondary },
              ]}
              numberOfLines={1}
            >
              {formattedB}
            </Text>
          </ScrollView>

          {/* Secondary preview strip */}
          <View style={styles.subReadoutStrip}>
            <Text style={[styles.subReadoutText, { color: tokens.textMuted }]}>
              {devOperandBBase !== 'BIN' ? `BIN: ${formatBigIntBase(bigB, 'BIN', devWordSize)} ` : ''}
              {devOperandBBase !== 'DEC' ? `DEC: ${formatBigIntBase(bigB, 'DEC', devWordSize, devIsSigned)} ` : ''}
              {devOperandBBase !== 'HEX' ? `HEX: ${formatBigIntBase(bigB, 'HEX', devWordSize)}` : ''}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* 2. GRAND RESULT LCD PANEL */}
      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: tokens.innerPanel,
            borderColor: aluResult.error ? tokens.dangerRed : tokens.borderVisible,
          },
        ]}
      >
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: aluResult.error ? tokens.dangerRed : tokens.actionGreen }]}>
            {aluResult.error ? 'FAULT: DIVISION BY ZERO' : `RESULT = A ${devAluOp} B`}
          </Text>

          {/* Chaining & Export actions */}
          <View style={styles.resultActions}>
            <Pressable
              accessible={true}
              accessibilityLabel="Feed result into Operand A"
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                loadDevResultToA(aluResult.resultStr);
              }}
              style={[styles.resultActionBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible }]}
            >
              <CornerDownLeft size={11} color={tokens.keycapNumberText} />
              <Text style={[styles.resultActionText, { color: tokens.keycapNumberText }]}>ANS → A</Text>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityLabel="Record to Paper Tape"
              onPress={handleTapeReceipt}
              style={[styles.resultActionBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible }]}
            >
              <Bookmark size={11} color={tokens.keycapNumberText} />
              <Text style={[styles.resultActionText, { color: tokens.keycapNumberText }]}>TAPE</Text>
            </Pressable>
          </View>
        </View>

        {/* Primary Binary Readout */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resultScroll}>
          <Text
            style={[
              styles.resultBinText,
              { color: aluResult.error ? tokens.dangerRed : '#22C55E' },
            ]}
            numberOfLines={1}
          >
            {aluResult.error ? 'ERR: DIV BY 0' : resBin}
          </Text>
        </ScrollView>

        {/* Multi-Format Strip (DEC, HEX, OCT, ASCII) */}
        {!aluResult.error ? (
          <View style={styles.multiFormatStrip}>
            <Pressable onPress={() => handleCopy(resDec)} style={styles.formatChip}>
              <Text style={[styles.formatChipLabel, { color: tokens.textMuted }]}>DEC:</Text>
              <Text style={[styles.formatChipVal, { color: tokens.textPrimary }]}>{resDec}</Text>
            </Pressable>

            <Pressable onPress={() => handleCopy(resHex)} style={styles.formatChip}>
              <Text style={[styles.formatChipLabel, { color: tokens.textMuted }]}>HEX:</Text>
              <Text style={[styles.formatChipVal, { color: tokens.textPrimary }]}>{resHex}</Text>
            </Pressable>

            <Pressable onPress={() => handleCopy(resOct)} style={styles.formatChip}>
              <Text style={[styles.formatChipLabel, { color: tokens.textMuted }]}>OCT:</Text>
              <Text style={[styles.formatChipVal, { color: tokens.textPrimary }]}>{resOct}</Text>
            </Pressable>

            <Pressable onPress={() => handleCopy(resAscii)} style={styles.formatChip}>
              <Text style={[styles.formatChipLabel, { color: tokens.textMuted }]}>CHAR:</Text>
              <Text style={[styles.formatChipVal, { color: tokens.textPrimary }]}>{resAscii}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ALU Flags Bar */}
        <View style={[styles.flagsRow, { borderTopColor: tokens.borderVisible }]}>
          <View style={styles.flagItem}>
            <Text style={[styles.flagLabel, { color: tokens.textSecondary }]}>ZF:</Text>
            <Text style={[styles.flagVal, { color: aluResult.flags.zf ? '#22C55E' : tokens.textMuted }]}>
              {aluResult.flags.zf ? '1' : '0'}
            </Text>
          </View>
          <View style={styles.flagItem}>
            <Text style={[styles.flagLabel, { color: tokens.textSecondary }]}>SF:</Text>
            <Text style={[styles.flagVal, { color: aluResult.flags.sf ? '#EF4444' : tokens.textMuted }]}>
              {aluResult.flags.sf ? '1' : '0'}
            </Text>
          </View>
          <View style={styles.flagItem}>
            <Text style={[styles.flagLabel, { color: tokens.textSecondary }]}>CF:</Text>
            <Text style={[styles.flagVal, { color: aluResult.flags.cf ? '#EAB308' : tokens.textMuted }]}>
              {aluResult.flags.cf === null ? '—' : aluResult.flags.cf ? '1' : '0'}
            </Text>
          </View>
          <View style={styles.flagItem}>
            <Text style={[styles.flagLabel, { color: tokens.textSecondary }]}>OF:</Text>
            <Text style={[styles.flagVal, { color: aluResult.flags.of ? '#EF4444' : tokens.textMuted }]}>
              {aluResult.flags.of === null ? '—' : aluResult.flags.of ? '1' : '0'}
            </Text>
          </View>

          {/* Quick Copy Action */}
          <Pressable
            accessible={true}
            accessibilityLabel="Copy binary result"
            onPress={() => handleCopy(resBin.replace(/\s/g, ''))}
            style={styles.flagCopyBtn}
          >
            <Copy size={11} color={tokens.textPrimary} />
            <Text style={[styles.flagCopyText, { color: tokens.textPrimary }]}>COPY BIN</Text>
          </Pressable>
        </View>
      </View>

      {/* 3. COLUMN-ALIGNED BIT TRUTH TABLE */}
      <View
        style={[
          styles.truthTableCard,
          { backgroundColor: tokens.innerPanel, borderColor: tokens.borderVisible },
        ]}
      >
        <Text style={[styles.truthTableTitle, { color: tokens.textPrimary }]}>
          {t('dev.bit_truth_table', 'BIT ALIGNMENT & LOGIC GRID')} ({devWordSize}b)
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.truthTableScroll}>
          <View style={styles.truthTableGrid}>
            {/* Header: Bit Indices */}
            <View style={styles.truthTableRow}>
              <Text style={[styles.truthRowLabel, { color: tokens.textMuted }]}>BIT:</Text>
              {Array.from({ length: devWordSize }).map((_, i) => {
                const bitIdx = devWordSize - 1 - i;
                const isNibbleBoundary = i > 0 && i % 4 === 0;
                return (
                  <React.Fragment key={`idx-${bitIdx}`}>
                    {isNibbleBoundary ? <View style={styles.nibbleSeparator} /> : null}
                    <View style={styles.bitColHeader}>
                      <Text style={[styles.bitIdxText, { color: tokens.textMuted }]}>{bitIdx}</Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>

            {/* Row A: Operand A Bits (Interactive) */}
            <View style={styles.truthTableRow}>
              <Text style={[styles.truthRowLabel, { color: devActiveRegister === 'A' ? tokens.actionGreen : tokens.textSecondary }]}>
                OP-A:
              </Text>
              {Array.from({ length: devWordSize }).map((_, i) => {
                const bitIdx = devWordSize - 1 - i;
                const bit = getBit(devOperandA, bitIdx, devWordSize);
                const isNibbleBoundary = i > 0 && i % 4 === 0;
                return (
                  <React.Fragment key={`a-${bitIdx}`}>
                    {isNibbleBoundary ? <View style={styles.nibbleSeparator} /> : null}
                    <BitCell
                      bit={bit}
                      index={bitIdx}
                      isInteractive={true}
                      onToggle={handleBitToggleA}
                      accentColor={tokens.accentOps}
                      inactiveBg={tokens.keypadSurface}
                      textColor={bit === 1 ? tokens.keycapOperatorText : tokens.keycapNumberText}
                      borderColor={tokens.borderVisible}
                    />
                  </React.Fragment>
                );
              })}
            </View>

            {/* Operator Row */}
            <View style={styles.truthTableRow}>
              <Text style={[styles.truthRowLabel, { color: tokens.actionGreen, fontWeight: '900' }]}>
                {devAluOp}:
              </Text>
              {Array.from({ length: devWordSize }).map((_, i) => {
                const isNibbleBoundary = i > 0 && i % 4 === 0;
                return (
                  <React.Fragment key={`op-${i}`}>
                    {isNibbleBoundary ? <View style={styles.nibbleSeparator} /> : null}
                    <View style={styles.opSymbolSlot}>
                      <Text style={[styles.opSymbolText, { color: tokens.textMuted }]}>•</Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>

            {/* Row B: Operand B Bits (Interactive) */}
            <View style={styles.truthTableRow}>
              <Text style={[styles.truthRowLabel, { color: devActiveRegister === 'B' ? tokens.actionGreen : tokens.textSecondary }]}>
                OP-B:
              </Text>
              {Array.from({ length: devWordSize }).map((_, i) => {
                const bitIdx = devWordSize - 1 - i;
                const bit = getBit(devOperandB, bitIdx, devWordSize);
                const isNibbleBoundary = i > 0 && i % 4 === 0;
                return (
                  <React.Fragment key={`b-${bitIdx}`}>
                    {isNibbleBoundary ? <View style={styles.nibbleSeparator} /> : null}
                    <BitCell
                      bit={bit}
                      index={bitIdx}
                      isInteractive={true}
                      onToggle={handleBitToggleB}
                      accentColor={tokens.accentOps}
                      inactiveBg={tokens.keypadSurface}
                      textColor={bit === 1 ? tokens.keycapOperatorText : tokens.keycapNumberText}
                      borderColor={tokens.borderVisible}
                    />
                  </React.Fragment>
                );
              })}
            </View>

            {/* Divider */}
            <View style={[styles.truthDivider, { backgroundColor: tokens.borderVisible }]} />

            {/* Result Row */}
            <View style={styles.truthTableRow}>
              <Text style={[styles.truthRowLabel, { color: '#22C55E', fontWeight: '900' }]}>
                RES:
              </Text>
              {Array.from({ length: devWordSize }).map((_, i) => {
                const bitIdx = devWordSize - 1 - i;
                const bit = getBit(aluResult.resultStr, bitIdx, devWordSize);
                const isNibbleBoundary = i > 0 && i % 4 === 0;
                return (
                  <React.Fragment key={`res-${bitIdx}`}>
                    {isNibbleBoundary ? <View style={styles.nibbleSeparator} /> : null}
                    <BitCell
                      bit={bit}
                      index={bitIdx}
                      isInteractive={false}
                      accentColor="#22C55E"
                      inactiveBg={tokens.keypadSurface}
                      textColor={bit === 1 ? '#070A08' : tokens.keycapNumberText}
                      borderColor={tokens.borderVisible}
                    />
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 4. COMPREHENSIVE OPERATIONS MATRIX */}
      <View style={styles.opsMatrixCard}>
        {/* Logic Operations */}
        <View style={styles.opCategoryRow}>
          <Text style={[styles.opCategoryLabel, { color: tokens.textSecondary }]}>LOGIC:</Text>
          <View style={styles.opButtonsRow}>
            {LOGIC_OPS.map((op) => {
              const isSelected = devAluOp === op;
              return (
                <Pressable
                  key={op}
                  accessible={true}
                  accessibilityLabel={`Bitwise ${op} operation`}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                    setDevAluOp(op);
                  }}
                  style={[
                    styles.opBtn,
                    {
                      backgroundColor: isSelected ? tokens.actionGreen : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                    },
                  ]}
                >
                  <Text style={[styles.opBtnText, { color: isSelected ? '#FFFDF7' : tokens.keycapNumberText }]}>
                    {op}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Arithmetic Operations */}
        <View style={styles.opCategoryRow}>
          <Text style={[styles.opCategoryLabel, { color: tokens.textSecondary }]}>ARITH:</Text>
          <View style={styles.opButtonsRow}>
            {ARITH_OPS.map((op) => {
              const isSelected = devAluOp === op;
              return (
                <Pressable
                  key={op}
                  accessible={true}
                  accessibilityLabel={`Arithmetic ${op} operation`}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                    setDevAluOp(op);
                  }}
                  style={[
                    styles.opBtn,
                    {
                      backgroundColor: isSelected ? tokens.actionGreen : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                    },
                  ]}
                >
                  <Text style={[styles.opBtnText, { color: isSelected ? '#FFFDF7' : tokens.keycapNumberText }]}>
                    {op}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Shift & Rotate Operations */}
        <View style={styles.opCategoryRow}>
          <Text style={[styles.opCategoryLabel, { color: tokens.textSecondary }]}>SHIFTS:</Text>
          <View style={styles.opButtonsRow}>
            {SHIFT_OPS.map((op) => {
              const isSelected = devAluOp === op;
              return (
                <Pressable
                  key={op}
                  accessible={true}
                  accessibilityLabel={`Shift ${op} operation`}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                    setDevAluOp(op);
                  }}
                  style={[
                    styles.opBtn,
                    {
                      backgroundColor: isSelected ? tokens.actionGreen : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                    },
                  ]}
                >
                  <Text style={[styles.opBtnText, { color: isSelected ? '#FFFDF7' : tokens.keycapNumberText }]}>
                    {op}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 5. IN-PLACE BASE-ADAPTIVE KEYPAD */}
      <View style={styles.keypadSection}>
        <View style={styles.keypadHeaderRow}>
          <Text style={[styles.keypadTargetLabel, { color: tokens.textPrimary }]}>
            TARGET: <Text style={{ color: tokens.actionGreen, fontWeight: '900' }}>REG {devActiveRegister}</Text> ({activeBase})
          </Text>

          {/* Quick mutation helpers */}
          <View style={styles.quickHelperRow}>
            <Pressable
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                clearDev();
              }}
              style={[styles.quickHelperBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible }]}
            >
              <Text style={[styles.quickHelperText, { color: tokens.keycapNumberText }]}>0x00</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                negateDevTwosComp();
              }}
              style={[styles.quickHelperBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible }]}
            >
              <Text style={[styles.quickHelperText, { color: tokens.keycapNumberText }]}>+/- 2s</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                // Fill all 1s
                const allOnes = mask.toString(10);
                if (devActiveRegister === 'A') {
                  useAppStore.setState({ devOperandA: allOnes });
                } else {
                  useAppStore.setState({ devOperandB: allOnes });
                }
              }}
              style={[styles.quickHelperBtn, { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible }]}
            >
              <Text style={[styles.quickHelperText, { color: tokens.keycapNumberText }]}>0xFF</Text>
            </Pressable>
          </View>
        </View>

        {/* Dedicated ASCII Character Picker & Direct Keyboard Input */}
        {activeBase === 'ASCII' && (
          <View
            style={[
              styles.asciiInputCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
              },
            ]}
          >
            <View style={styles.asciiInputHeader}>
              <Text style={[styles.asciiInputTitle, { color: tokens.textSecondary }]}>
                ASCII CHAR INPUT (0..127):
              </Text>
              <Text style={[styles.asciiCodeReadout, { color: tokens.actionGreen }]}>
                {activeChar ? `'${activeChar}' (CODE: ${activeChar.charCodeAt(0)})` : 'CODE: 0 (NUL)'}
              </Text>
            </View>

            <View style={styles.asciiDirectInputRow}>
              <TextInput
                accessible={true}
                accessibilityLabel="Direct ASCII Character Input"
                style={[
                  styles.asciiTextInput,
                  {
                    color: tokens.textPrimary,
                    backgroundColor: tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                  },
                ]}
                maxLength={1}
                autoCapitalize="none"
                placeholder="Type char..."
                placeholderTextColor={tokens.textMuted}
                value={activeChar}
                onChangeText={(text) => {
                  if (text.length > 0) {
                    handleSetAsciiCode(text.charCodeAt(0));
                  } else {
                    handleSetAsciiCode(0);
                  }
                }}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.asciiPresetsScroll}
              >
                {ASCII_PRESETS.map((p) => {
                  const currentVal = devActiveRegister === 'A' ? bigA : bigB;
                  const isCur = currentVal === BigInt(p.code);
                  return (
                    <Pressable
                      key={p.label}
                      accessible={true}
                      accessibilityLabel={`Set ASCII to ${p.label}`}
                      onPress={() => handleSetAsciiCode(p.code)}
                      style={[
                        styles.asciiPresetChip,
                        {
                          backgroundColor: isCur ? tokens.accentOps : tokens.keypadSurface,
                          borderColor: tokens.borderVisible,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.asciiPresetText,
                          { color: isCur ? tokens.keycapOperatorText : tokens.keycapNumberText },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Tactile Keypad Matrix */}
        <View style={styles.keypadMatrix}>
          {/* Hex Row: A..D */}
          <View style={styles.keypadRow}>
            {['A', 'B', 'C', 'D'].map((k) => (
              <KeycapCell
                key={k}
                label={k}
                enabled={isDigitEnabled(k)}
                onPress={() => handleKeycapPress(k)}
                tokens={tokens}
              />
            ))}
          </View>

          {/* Hex Row: E, F, 7, 8 */}
          <View style={styles.keypadRow}>
            {['E', 'F', '7', '8'].map((k) => (
              <KeycapCell
                key={k}
                label={k}
                enabled={isDigitEnabled(k)}
                onPress={() => handleKeycapPress(k)}
                tokens={tokens}
              />
            ))}
          </View>

          {/* Row: 9, 4, 5, 6 */}
          <View style={styles.keypadRow}>
            {['9', '4', '5', '6'].map((k) => (
              <KeycapCell
                key={k}
                label={k}
                enabled={isDigitEnabled(k)}
                onPress={() => handleKeycapPress(k)}
                tokens={tokens}
              />
            ))}
          </View>

          {/* Row: 1, 2, 3, DEL */}
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((k) => (
              <KeycapCell
                key={k}
                label={k}
                enabled={isDigitEnabled(k)}
                onPress={() => handleKeycapPress(k)}
                tokens={tokens}
              />
            ))}
            <KeycapCell
              label="DEL"
              enabled={true}
              variant="danger"
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                deleteDevLast();
              }}
              tokens={tokens}
            />
          </View>

          {/* Bottom Row: 0, AC, SEND TO CALC */}
          <View style={styles.keypadRow}>
            <KeycapCell
              label="0"
              flex={2}
              enabled={isDigitEnabled('0')}
              onPress={() => handleKeycapPress('0')}
              tokens={tokens}
            />
            <KeycapCell
              label="AC"
              variant="danger"
              enabled={true}
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                clearDev();
              }}
              tokens={tokens}
            />
            <KeycapCell
              label="➔ CALC"
              variant="action"
              enabled={true}
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                sendDevToCalc();
              }}
              tokens={tokens}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Compact Memoized Keycap Cell for 60fps keypad response
interface KeycapCellProps {
  label: string;
  enabled: boolean;
  flex?: number;
  variant?: 'number' | 'danger' | 'action';
  onPress: () => void;
  tokens: any;
}

const KeycapCell = memo(({ label, enabled, flex = 1, variant = 'number', onPress, tokens }: KeycapCellProps) => {
  let bg = tokens.keypadSurface;
  let text = tokens.keycapNumberText;

  if (variant === 'danger') {
    bg = tokens.dangerRed;
    text = tokens.keycapDangerText;
  } else if (variant === 'action') {
    bg = tokens.actionGreen;
    text = tokens.keycapActionText;
  }

  return (
    <Pressable
      accessible={true}
      accessibilityLabel={`Key ${label}`}
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.keycapBox,
        {
          flex,
          backgroundColor: bg,
          borderColor: tokens.borderVisible,
          opacity: enabled ? 1 : 0.28,
          transform: [{ translateY: pressed && enabled ? 2 : 0 }],
        },
      ]}
    >
      <Text style={[styles.keycapText, { color: text }]}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 2,
  },
  operandsWrapper: {
    gap: 6,
    marginBottom: 6,
  },
  operandCard: {
    borderRadius: hardwareConstants.borderRadiusMd,
    padding: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardRegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardLedPip: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cardRegText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  basePillGroup: {
    flexDirection: 'row',
    gap: 3,
  },
  basePill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
  },
  basePillText: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  valueScroll: {
    maxHeight: 36,
    marginVertical: 2,
  },
  operandMainValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subReadoutStrip: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 2,
  },
  subReadoutText: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  junctionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginVertical: 1,
  },
  operatorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  operatorBadgeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FFFDF7',
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.2,
  },
  swapBtnText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  resultCard: {
    borderRadius: hardwareConstants.borderRadiusMd,
    borderWidth: 2,
    padding: 8,
    marginBottom: 6,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 4,
  },
  resultActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 3,
    borderWidth: 1,
  },
  resultActionText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  resultScroll: {
    marginVertical: 4,
  },
  resultBinText: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  multiFormatStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  formatChipLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  formatChipVal: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 5,
    marginTop: 2,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  flagLabel: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  flagVal: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  flagCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  flagCopyText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  truthTableCard: {
    borderRadius: hardwareConstants.borderRadiusMd,
    borderWidth: 1.5,
    padding: 6,
    marginBottom: 6,
  },
  truthTableTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  truthTableScroll: {
    width: '100%',
  },
  truthTableGrid: {
    gap: 2,
  },
  truthTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  truthRowLabel: {
    width: 44,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  bitColHeader: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bitIdxText: {
    fontSize: 8,
    fontFamily: 'monospace',
  },
  bitCellPressable: {
    padding: 1,
  },
  bitCellBox: {
    width: 30,
    height: 26,
    borderWidth: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bitCellText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  nibbleSeparator: {
    width: 8,
  },
  opSymbolSlot: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opSymbolText: {
    fontSize: 8,
    fontFamily: 'monospace',
  },
  truthDivider: {
    height: 1,
    marginVertical: 2,
    marginLeft: 44,
  },
  opsMatrixCard: {
    gap: 5,
    marginBottom: 6,
  },
  opCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  opCategoryLabel: {
    width: 46,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  opButtonsRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3.5,
  },
  opBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.2,
  },
  opBtnText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  keypadSection: {
    gap: 4,
    paddingBottom: 16,
  },
  keypadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  asciiInputCard: {
    padding: 6,
    borderRadius: hardwareConstants.borderRadiusSm,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  asciiInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  asciiInputTitle: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  asciiCodeReadout: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  asciiDirectInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  asciiTextInput: {
    width: 50,
    height: 32,
    borderWidth: 1.5,
    borderRadius: 4,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
  },
  asciiPresetsScroll: {
    flex: 1,
  },
  asciiPresetChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    borderWidth: 1,
    marginRight: 4,
  },
  asciiPresetText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  keypadTargetLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  quickHelperRow: {
    flexDirection: 'row',
    gap: 4,
  },
  quickHelperBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 3,
    borderWidth: 1,
  },
  quickHelperText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  keypadMatrix: {
    gap: 4,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 4,
  },
  keycapBox: {
    height: 38,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keycapText: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
});
