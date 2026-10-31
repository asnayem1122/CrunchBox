import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy, ArrowRight, Check, Hash, Cpu, Binary, FileText, Compass } from 'lucide-react-native';
import {
  useAppStore,
  DevSubDeck,
} from '../../store/useAppStore';
import {
  DevBase,
  DevWordSize,
  BitwiseOp,
  formatBigIntBase,
  parseToBigInt,
  computeAluOperation,
  inspectIeee754,
  stringToUtf8Bytes,
  gcdBigInt,
  lcmBigInt,
  isPrimeBigInt,
  isPowerOfTwoBigInt,
  powerOfTwoBigInt,
  getBit,
  getWordMask,
} from './devEngine';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface DevViewProps {
  themeMode?: ThemeMode;
}

export const DevView: React.FC<DevViewProps> = ({ themeMode = 'field' }) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const {
    devBase,
    setDevBase,
    devWordSize,
    setDevWordSize,
    devOperandA,
    setDevOperandA,
    devOperandB,
    setDevOperandB,
    devActiveRegister,
    setDevActiveRegister,
    devSubDeck,
    setDevSubDeck,
    devFloatInput,
    setDevFloatInput,
    devTextInput,
    setDevTextInput,
    devIsSigned,
    toggleDevSigned,
    devAluOp,
    setDevAluOp,
    inputDevKey,
    deleteDevLast,
    clearDev,
    toggleDevBit,
    negateDevTwosComp,
    sendDevToCalc,
    sendDevToCurrency,
    soundEnabled,
    hapticsEnabled,
  } = useAppStore();

  const activeOperandStr = devActiveRegister === 'A' ? devOperandA : devOperandB;
  const activeBigInt = useMemo(() => parseToBigInt(activeOperandStr, 'DEC'), [activeOperandStr]);

  // Formatted representations of the active operand across all 4 bases
  const hexFormatted = useMemo(
    () => formatBigIntBase(activeBigInt, 'HEX', devWordSize, false),
    [activeBigInt, devWordSize]
  );
  const decFormatted = useMemo(
    () => formatBigIntBase(activeBigInt, 'DEC', devWordSize, devIsSigned),
    [activeBigInt, devWordSize, devIsSigned]
  );
  const octFormatted = useMemo(
    () => formatBigIntBase(activeBigInt, 'OCT', devWordSize, false),
    [activeBigInt, devWordSize]
  );
  const binFormatted = useMemo(
    () => formatBigIntBase(activeBigInt, 'BIN', devWordSize, false),
    [activeBigInt, devWordSize]
  );

  // ALU Computation
  const aluResult = useMemo(
    () => computeAluOperation(devOperandA, devOperandB, devAluOp, devWordSize),
    [devOperandA, devOperandB, devAluOp, devWordSize]
  );

  // IEEE-754 Single-Precision Float Analysis
  const floatNum = parseFloat(devFloatInput) || 0;
  const ieeeAnalysis = useMemo(() => inspectIeee754(floatNum), [floatNum]);

  // UTF-8 Analysis
  const utf8Info = useMemo(() => stringToUtf8Bytes(devTextInput), [devTextInput]);

  // Discrete Math values
  const discreteResults = useMemo(() => {
    const a = parseToBigInt(devOperandA, 'DEC');
    const b = parseToBigInt(devOperandB, 'DEC');
    const gcdVal = gcdBigInt(a, b);
    const lcmVal = lcmBigInt(a, b);
    const primeCheck = isPrimeBigInt(a);
    const isP2 = isPowerOfTwoBigInt(a);
    return { gcdVal, lcmVal, primeCheck, isP2 };
  }, [devOperandA, devOperandB]);

  const handleCopy = async (text: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    try {
      await Share.share({ message: text });
    } catch {
      // Fallback
    }
  };

  const handleKeyPress = (char: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    inputDevKey(char);
  };

  const handleClear = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'heavy');
    clearDev();
  };

  const handleDelete = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    deleteDevLast();
  };

  const handleNegate = () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    negateDevTwosComp();
  };

  // Sub-deck Selector Tabs
  const SUB_DECKS: Array<{ id: DevSubDeck; label: string; icon: any }> = [
    { id: 'BASES', label: t('dev.subdeck_bases', 'BASES'), icon: Hash },
    { id: 'ALU', label: t('dev.subdeck_alu', 'ALU & BITS'), icon: Cpu },
    { id: 'FLOAT', label: t('dev.subdeck_float', 'IEEE-754'), icon: Binary },
    { id: 'TEXT', label: t('dev.subdeck_text', 'TEXT CODEC'), icon: FileText },
    { id: 'DISCRETE', label: t('dev.subdeck_discrete', 'DISCRETE'), icon: Compass },
  ];

  const WORD_SIZES: DevWordSize[] = [8, 16, 32, 64];
  const BASES: DevBase[] = ['HEX', 'DEC', 'OCT', 'BIN'];

  return (
    <View style={styles.container}>
      {/* Upper Hardware Sub-Deck Selector */}
      <View
        style={[
          styles.subDeckBar,
          {
            backgroundColor: tokens.innerPanel,
            borderColor: tokens.borderVisible,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusMd,
          },
        ]}
      >
        {SUB_DECKS.map((tab) => {
          const isActive = tab.id === devSubDeck;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.id}
              accessible={true}
              accessibilityLabel={`Subdeck ${tab.label}`}
              testID={`dev-subdeck-${tab.id.toLowerCase()}`}
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                setDevSubDeck(tab.id);
              }}
              style={[
                styles.subDeckTab,
                {
                  backgroundColor: isActive ? tokens.accentOps : tokens.keypadSurface,
                  borderColor: tokens.borderVisible,
                  borderWidth: 1.5,
                  borderRadius: hardwareConstants.borderRadiusSm,
                  borderBottomWidth: isActive ? 1.5 : 3,
                  transform: [{ translateY: isActive ? 1.5 : 0 }],
                },
              ]}
            >
              <Icon size={12} color={isActive ? tokens.keycapOperatorText : tokens.keycapNumberText} strokeWidth={2.5} />
              <Text
                style={[
                  styles.subDeckLabel,
                  {
                    color: isActive ? tokens.keycapOperatorText : tokens.keycapNumberText,
                    fontWeight: isActive ? '900' : '700',
                  },
                ]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Word Size & Word Config Rail */}
      <View style={styles.configRail}>
        {/* Word Size Switcher */}
        <View style={styles.segmentedRow}>
          {WORD_SIZES.map((size) => {
            const isSelected = size === devWordSize;
            return (
              <Pressable
                key={size}
                accessible={true}
                accessibilityLabel={`${size}-bit word size`}
                testID={`dev-wordsize-${size}`}
                onPress={() => {
                  triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                  setDevWordSize(size);
                }}
                style={[
                  styles.segmentBtn,
                  {
                    backgroundColor: isSelected ? tokens.actionGreen : tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                    borderWidth: 1.5,
                    borderRadius: 4,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? '#FFFDF7' : tokens.textPrimary,
                      fontWeight: isSelected ? '900' : '700',
                    },
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  {size}b
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Register & Signed Selector */}
        <View style={styles.registerRow}>
          <Pressable
            accessible={true}
            accessibilityLabel={`Register ${devActiveRegister}`}
            testID="dev-reg-toggle"
            onPress={() => {
              triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
              setDevActiveRegister(devActiveRegister === 'A' ? 'B' : 'A');
            }}
            style={[
              styles.regToggleBtn,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: 1.5,
                borderRadius: 4,
              },
            ]}
          >
            <Text style={[styles.regToggleText, { color: tokens.textPrimary }]} maxFontSizeMultiplier={1.2}>
              REG: <Text style={{ fontWeight: '900', color: '#D93829' }}>{devActiveRegister}</Text>
            </Text>
          </Pressable>

          <Pressable
            accessible={true}
            accessibilityLabel={`Signed mode: ${devIsSigned ? 'Signed' : 'Unsigned'}`}
            testID="dev-signed-toggle"
            onPress={() => {
              triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
              toggleDevSigned();
            }}
            style={[
              styles.regToggleBtn,
              {
                backgroundColor: devIsSigned ? tokens.accentOps : tokens.keypadSurface,
                borderColor: tokens.borderVisible,
                borderWidth: 1.5,
                borderRadius: 4,
              },
            ]}
          >
            <Text style={[styles.regToggleText, { color: devIsSigned ? tokens.keycapOperatorText : tokens.keycapNumberText }]} maxFontSizeMultiplier={1.2}>
              {devIsSigned ? 'SIGNED (2s)' : 'UNSIGNED'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SUB-DECK 1: MULTI-BASE CONVERTER & KEYPAD */}
      {devSubDeck === 'BASES' && (
        <ScrollView style={styles.subDeckScroll} showsVerticalScrollIndicator={false}>
          {/* Stacked Live 4-Base Readouts */}
          <View
            style={[
              styles.basesCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: 2,
                borderRadius: hardwareConstants.borderRadiusMd,
              },
            ]}
          >
            {BASES.map((b) => {
              const isCurrent = b === devBase;
              let val = hexFormatted;
              if (b === 'DEC') val = decFormatted;
              else if (b === 'OCT') val = octFormatted;
              else if (b === 'BIN') val = binFormatted;

              return (
                <Pressable
                  key={b}
                  accessible={true}
                  accessibilityLabel={`Base ${b}: ${val}`}
                  testID={`dev-base-row-${b.toLowerCase()}`}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                    setDevBase(b);
                  }}
                  style={[
                    styles.baseRow,
                    {
                      backgroundColor: isCurrent ? 'rgba(234, 179, 8, 0.18)' : 'transparent',
                      borderBottomColor: 'rgba(27, 36, 30, 0.12)',
                    },
                  ]}
                >
                  <View style={styles.baseTagWrapper}>
                    <View
                      style={[
                        styles.baseBadge,
                        {
                          backgroundColor: isCurrent ? tokens.inkBorder : 'rgba(27, 36, 30, 0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.baseBadgeText,
                          { color: isCurrent ? tokens.recessedLcd : tokens.inkBorder },
                        ]}
                      >
                        {b}
                      </Text>
                    </View>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.baseValueScroll}>
                    <Text
                      style={[
                        styles.baseValueText,
                        { color: isCurrent ? '#000000' : tokens.textPrimary },
                      ]}
                    >
                      {val}
                    </Text>
                  </ScrollView>

                  <Pressable
                    accessible={true}
                    accessibilityLabel={`Copy ${b} value`}
                    onPress={() => handleCopy(val)}
                    style={styles.copyBtn}
                  >
                    <Copy size={13} color={tokens.textMuted} />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>

          {/* Cross-Mode Bridge Buttons */}
          <View style={styles.bridgeRow}>
            <Pressable
              accessible={true}
              accessibilityLabel="Send value to Calculator"
              testID="dev-send-to-calc"
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                sendDevToCalc();
              }}
              style={[
                styles.bridgeBtn,
                { backgroundColor: tokens.keypadSurface, borderColor: tokens.borderVisible },
              ]}
            >
              <Text style={[styles.bridgeBtnText, { color: tokens.keycapNumberText }]}>➔ SEND TO CALC</Text>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityLabel="Send value to Currency"
              testID="dev-send-to-curr"
              onPress={() => {
                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                sendDevToCurrency();
              }}
              style={[
                styles.bridgeBtn,
                { backgroundColor: tokens.accentOps, borderColor: tokens.borderVisible },
              ]}
            >
              <Text style={[styles.bridgeBtnText, { color: tokens.keycapOperatorText }]}>➔ SEND TO CURR</Text>
            </Pressable>
          </View>

          {/* Hexadecimal & Multi-Base Tactile Keypad */}
          <View style={styles.keypadGrid}>
            {/* Row 1: Hex upper digits A..D */}
            <View style={styles.keyRow}>
              {['A', 'B', 'C', 'D'].map((k) => (
                <DevKeycap
                  key={k}
                  label={k}
                  enabled={devBase === 'HEX'}
                  onPress={() => handleKeyPress(k)}
                  variant="action"
                  tokens={tokens}
                />
              ))}
            </View>

            {/* Row 2: Hex digits E, F, AC, DEL */}
            <View style={styles.keyRow}>
              <DevKeycap
                label="E"
                enabled={devBase === 'HEX'}
                onPress={() => handleKeyPress('E')}
                variant="action"
                tokens={tokens}
              />
              <DevKeycap
                label="F"
                enabled={devBase === 'HEX'}
                onPress={() => handleKeyPress('F')}
                variant="action"
                tokens={tokens}
              />
              <DevKeycap
                label="AC"
                enabled={true}
                onPress={handleClear}
                variant="danger"
                tokens={tokens}
              />
              <DevKeycap
                label="DEL"
                enabled={true}
                onPress={handleDelete}
                variant="secondary"
                tokens={tokens}
              />
            </View>

            {/* Row 3: 7, 8, 9, 2's Comp */}
            <View style={styles.keyRow}>
              {['7', '8', '9'].map((k) => (
                <DevKeycap
                  key={k}
                  label={k}
                  enabled={devBase === 'HEX' || devBase === 'DEC' || (devBase === 'OCT' && parseInt(k) < 8)}
                  onPress={() => handleKeyPress(k)}
                  tokens={tokens}
                />
              ))}
              <DevKeycap
                label="2's ±"
                enabled={true}
                onPress={handleNegate}
                variant="secondary"
                tokens={tokens}
              />
            </View>

            {/* Row 4: 4, 5, 6, Word Size Step */}
            <View style={styles.keyRow}>
              {['4', '5', '6'].map((k) => (
                <DevKeycap
                  key={k}
                  label={k}
                  enabled={devBase !== 'BIN'}
                  onPress={() => handleKeyPress(k)}
                  tokens={tokens}
                />
              ))}
              <DevKeycap
                label={`${devWordSize}b`}
                enabled={true}
                onPress={() => {
                  const sizes: DevWordSize[] = [8, 16, 32, 64];
                  const next = sizes[(sizes.indexOf(devWordSize) + 1) % sizes.length];
                  setDevWordSize(next);
                }}
                variant="secondary"
                tokens={tokens}
              />
            </View>

            {/* Row 5: 1, 2, 3, 0 */}
            <View style={styles.keyRow}>
              {['1', '2', '3', '0'].map((k) => (
                <DevKeycap
                  key={k}
                  label={k}
                  enabled={devBase !== 'BIN' || k === '0' || k === '1'}
                  onPress={() => handleKeyPress(k)}
                  tokens={tokens}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* SUB-DECK 2: ALU & INTERACTIVE BIT GRID */}
      {devSubDeck === 'ALU' && (
        <ScrollView style={styles.subDeckScroll} showsVerticalScrollIndicator={false}>
          {/* Dual Operand & Result Stacking */}
          <View
            style={[
              styles.aluRegistersCard,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: 2,
                borderRadius: hardwareConstants.borderRadiusMd,
              },
            ]}
          >
            <View style={styles.aluRegRow}>
              <Text style={[styles.aluRegName, { color: tokens.textSecondary }]}>A ({devWordSize}b):</Text>
              <Text style={[styles.aluRegVal, { color: tokens.textPrimary }]} numberOfLines={1}>
                {formatBigIntBase(parseToBigInt(devOperandA, 'DEC'), 'BIN', devWordSize)}
              </Text>
            </View>
            <View style={styles.aluRegRow}>
              <Text style={[styles.aluRegName, { color: tokens.textSecondary }]}>B ({devWordSize}b):</Text>
              <Text style={[styles.aluRegVal, { color: tokens.textPrimary }]} numberOfLines={1}>
                {formatBigIntBase(parseToBigInt(devOperandB, 'DEC'), 'BIN', devWordSize)}
              </Text>
            </View>
            <View style={[styles.aluRegRow, styles.aluResultHighlight]}>
              <Text style={[styles.aluRegName, { color: tokens.actionGreen, fontWeight: '900' }]}>
                {devAluOp}:
              </Text>
              <Text style={[styles.aluRegVal, { fontWeight: '900' }]} numberOfLines={1}>
                {formatBigIntBase(parseToBigInt(aluResult.resultStr, 'DEC'), 'BIN', devWordSize)}
              </Text>
            </View>
          </View>

          {/* Interactive Bit Grid (Mandatory Rule 6: 8 bits per row for active word size) */}
          <View style={styles.bitGridCard}>
            <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
              {t('dev.bit_grid', 'INTERACTIVE BIT GRID')} (REG: {devActiveRegister})
            </Text>
            <View style={styles.bitRowsWrapper}>
              {Array.from({ length: devWordSize / 8 }).map((_, rowIdx) => {
                const highBit = devWordSize - 1 - rowIdx * 8;
                const lowBit = highBit - 7;

                return (
                  <View key={rowIdx} style={styles.bitRow}>
                    <Text style={[styles.bitRowLabel, { color: tokens.textSecondary }]}>
                      {highBit}..{lowBit}:
                    </Text>

                    <View style={styles.nibblePair}>
                      {/* High Nibble */}
                      <View style={styles.nibbleGroup}>
                        {Array.from({ length: 4 }).map((_, nIdx) => {
                          const bitIdx = highBit - nIdx;
                          const bit = getBit(activeOperandStr, bitIdx, devWordSize);
                          return (
                            <Pressable
                              key={bitIdx}
                              accessible={true}
                              accessibilityLabel={`Bit ${bitIdx}: ${bit}`}
                              testID={`dev-bit-${bitIdx}`}
                              onPress={() => {
                                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                                toggleDevBit(bitIdx);
                              }}
                              style={[
                                styles.bitCell,
                                {
                                  backgroundColor: bit === 1 ? tokens.accentOps : tokens.keypadSurface,
                                  borderColor: tokens.borderVisible,
                                },
                              ]}
                            >
                              <Text style={[styles.bitCellText, { color: bit === 1 ? tokens.keycapOperatorText : tokens.keycapNumberText }]}>{bit}</Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {/* Low Nibble */}
                      <View style={styles.nibbleGroup}>
                        {Array.from({ length: 4 }).map((_, nIdx) => {
                          const bitIdx = highBit - 4 - nIdx;
                          const bit = getBit(activeOperandStr, bitIdx, devWordSize);
                          return (
                            <Pressable
                              key={bitIdx}
                              accessible={true}
                              accessibilityLabel={`Bit ${bitIdx}: ${bit}`}
                              testID={`dev-bit-${bitIdx}`}
                              onPress={() => {
                                triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                                toggleDevBit(bitIdx);
                              }}
                              style={[
                                styles.bitCell,
                                {
                                  backgroundColor: bit === 1 ? tokens.accentOps : tokens.keypadSurface,
                                  borderColor: tokens.borderVisible,
                                },
                              ]}
                            >
                              <Text style={[styles.bitCellText, { color: bit === 1 ? tokens.keycapOperatorText : tokens.keycapNumberText }]}>{bit}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Bitwise Operation Matrix Buttons */}
          <View style={styles.aluOpsMatrix}>
            {(
              [
                'AND',
                'OR',
                'XOR',
                'NOT',
                'NAND',
                'NOR',
                'XNOR',
                'SHL',
                'SHR',
                'ROL',
                'ROR',
                'ENDIAN_SWAP',
                'ADD',
                'SUB',
              ] as BitwiseOp[]
            ).map((op) => {
              const isSelected = devAluOp === op;
              return (
                <Pressable
                  key={op}
                  accessible={true}
                  accessibilityLabel={`Operation ${op}`}
                  testID={`dev-alu-${op.toLowerCase()}`}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
                    setDevAluOp(op);
                  }}
                  style={[
                    styles.aluOpBtn,
                    {
                      backgroundColor: isSelected ? tokens.actionGreen : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                      borderWidth: 1.8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.aluOpBtnText,
                      {
                        color: isSelected ? '#FFFDF7' : tokens.keycapNumberText,
                        fontWeight: isSelected ? '900' : '700',
                      },
                    ]}
                  >
                    {op}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* SUB-DECK 3: IEEE-754 32-BIT FLOAT INSPECTOR */}
      {devSubDeck === 'FLOAT' && (
        <ScrollView style={styles.subDeckScroll} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.cardBox,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: 2,
                borderRadius: hardwareConstants.borderRadiusMd,
              },
            ]}
          >
            <Text style={[styles.cardHeaderTitle, { color: tokens.textSecondary }]}>IEEE-754 SINGLE PRECISION (32-BIT)</Text>

            {/* Quick Test Chips */}
            <View style={styles.chipRow}>
              {['-12.375', '0.0', '1.0', '-1.0', '3.14159', '1024.5'].map((sample) => (
                <Pressable
                  key={sample}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                    setDevFloatInput(sample);
                  }}
                  style={[
                    styles.sampleChip,
                    {
                      backgroundColor: devFloatInput === sample ? tokens.accentOps : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                    },
                  ]}
                >
                  <Text style={[styles.sampleChipText, { color: tokens.textPrimary }]}>{sample}</Text>
                </Pressable>
              ))}
            </View>

            {/* Decomposed Fields */}
            <View style={styles.ieeeFieldRow}>
              {/* Sign bit (1 bit) */}
              <View style={[styles.ieeeBitField, { flex: 1, backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                <Text style={styles.ieeeBitLabel}>SIGN (1b)</Text>
                <Text style={styles.ieeeBitVal}>{ieeeAnalysis.sign}</Text>
                <Text style={styles.ieeeSubtext}>{ieeeAnalysis.sign === '1' ? '(-)' : '(+)'}</Text>
              </View>

              {/* Exponent (8 bits) */}
              <View style={[styles.ieeeBitField, { flex: 3, backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Text style={styles.ieeeBitLabel}>EXP (8b)</Text>
                <Text style={styles.ieeeBitVal}>{ieeeAnalysis.exponent}</Text>
                <Text style={styles.ieeeSubtext}>Bias 127 = {ieeeAnalysis.biasExp}</Text>
              </View>

              {/* Mantissa (23 bits) */}
              <View style={[styles.ieeeBitField, { flex: 6, backgroundColor: '#DCFCE7', borderColor: '#22C55E' }]}>
                <Text style={styles.ieeeBitLabel}>MANTISSA (23b)</Text>
                <Text style={[styles.ieeeBitVal, { fontSize: 10 }]} numberOfLines={1}>
                  {ieeeAnalysis.mantissa}
                </Text>
                <Text style={styles.ieeeSubtext}>Fractional</Text>
              </View>
            </View>

            {/* Hex Encoding Bar */}
            <View style={styles.ieeeHexBar}>
              <Text style={styles.ieeeHexLabel}>HEX REPRESENTATION:</Text>
              <Text style={styles.ieeeHexValue}>{ieeeAnalysis.hex}</Text>
              <Pressable onPress={() => handleCopy(ieeeAnalysis.hex)} style={styles.copyBtn}>
                <Copy size={14} color={tokens.textMuted} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}

      {/* SUB-DECK 4: TEXT / UTF-8 CODEC */}
      {devSubDeck === 'TEXT' && (
        <ScrollView style={styles.subDeckScroll} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.cardBox,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: 2,
                borderRadius: hardwareConstants.borderRadiusMd,
              },
            ]}
          >
            <Text style={[styles.cardHeaderTitle, { color: tokens.textSecondary }]}>ASCII & UTF-8 MULTI-BYTE CODEC</Text>

            <View style={styles.chipRow}>
              {['Crunch', 'A', '100', 'বাংলা', 'CB-09'].map((sample) => (
                <Pressable
                  key={sample}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                    setDevTextInput(sample);
                  }}
                  style={[
                    styles.sampleChip,
                    {
                      backgroundColor: devTextInput === sample ? tokens.accentOps : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                    },
                  ]}
                >
                  <Text style={[styles.sampleChipText, { color: tokens.textPrimary }]}>{sample}</Text>
                </Pressable>
              ))}
            </View>

            {/* Byte Stream Table */}
            <View style={styles.utf8Table}>
              <View style={styles.utf8HeaderRow}>
                <Text style={[styles.utf8Col, { flex: 1.5 }]}>CHAR</Text>
                <Text style={[styles.utf8Col, { flex: 2 }]}>CODEPOINT</Text>
                <Text style={[styles.utf8Col, { flex: 3.5 }]}>HEX BYTES</Text>
              </View>

              {utf8Info.map((info, idx) => (
                <View key={idx} style={styles.utf8DataRow}>
                  <Text style={[styles.utf8CellChar, { flex: 1.5 }]}>{info.char}</Text>
                  <Text style={[styles.utf8Cell, { flex: 2 }]}>U+{info.codePoint.toString(16).toUpperCase()}</Text>
                  <Text style={[styles.utf8Cell, { flex: 3.5, fontWeight: '700' }]}>
                    {info.hexBytes.join(' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* SUB-DECK 5: DISCRETE MATH & CS ARITHMETIC */}
      {devSubDeck === 'DISCRETE' && (
        <ScrollView style={styles.subDeckScroll} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.cardBox,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: 2,
                borderRadius: hardwareConstants.borderRadiusMd,
              },
            ]}
          >
            <Text style={[styles.cardHeaderTitle, { color: tokens.textSecondary }]}>DISCRETE MATH & SYSTEMS CHECKS</Text>

            <View style={styles.discreteItem}>
              <Text style={[styles.discreteLabel, { color: tokens.textSecondary }]}>GCD(A, B):</Text>
              <Text style={[styles.discreteValue, { color: tokens.textPrimary }]}>{discreteResults.gcdVal.toString(10)}</Text>
            </View>

            <View style={styles.discreteItem}>
              <Text style={[styles.discreteLabel, { color: tokens.textSecondary }]}>LCM(A, B):</Text>
              <Text style={[styles.discreteValue, { color: tokens.textPrimary }]}>{discreteResults.lcmVal.toString(10)}</Text>
            </View>

            <View style={styles.discreteItem}>
              <Text style={[styles.discreteLabel, { color: tokens.textSecondary }]}>isPrime(A):</Text>
              <Text
                style={[
                  styles.discreteValue,
                  { color: discreteResults.primeCheck.isPrime ? '#22C55E' : '#EF4444' },
                ]}
              >
                {discreteResults.primeCheck.isPrime
                  ? 'PRIME ✓'
                  : `COMPOSITE (Factor: ${discreteResults.primeCheck.smallestFactor})`}
              </Text>
            </View>

            <View style={styles.discreteItem}>
              <Text style={[styles.discreteLabel, { color: tokens.textSecondary }]}>isPowerOfTwo(A):</Text>
              <Text
                style={[
                  styles.discreteValue,
                  { color: discreteResults.isP2 ? '#22C55E' : tokens.textMuted },
                ]}
              >
                {discreteResults.isP2 ? 'YES (2^n) ✓' : 'NO'}
              </Text>
            </View>

            <View style={styles.discreteItem}>
              <Text style={[styles.discreteLabel, { color: tokens.textSecondary }]}>2^{devWordSize} (Address Space):</Text>
              <Text style={[styles.discreteValue, { fontSize: 11 }]}>
                {powerOfTwoBigInt(devWordSize).toString(10)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

// Sub-component for Keypad Button
interface DevKeycapProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
  variant?: 'number' | 'action' | 'danger' | 'secondary';
  tokens: any;
}

const DevKeycap: React.FC<DevKeycapProps> = ({
  label,
  enabled,
  onPress,
  variant = 'number',
  tokens,
}) => {
  let bg = tokens.keypadSurface;
  let textColor = tokens.textPrimary;

  if (variant === 'action') {
    bg = tokens.actionGreen;
    textColor = '#FFFDF7';
  } else if (variant === 'danger') {
    bg = tokens.dangerRed;
    textColor = '#FFFDF7';
  } else if (variant === 'secondary') {
    bg = tokens.innerPanel;
    textColor = tokens.textPrimary;
  }

  return (
    <Pressable
      accessible={true}
      accessibilityLabel={`Key ${label}`}
      testID={`dev-key-${label.toLowerCase()}`}
      disabled={!enabled}
      onPress={onPress}
      style={[
        styles.keycap,
        {
          backgroundColor: bg,
          borderColor: tokens.borderVisible,
          opacity: enabled ? 1 : 0.3,
        },
      ]}
    >
      <Text style={[styles.keycapText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 2,
  },
  subDeckBar: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
    marginBottom: 6,
  },
  subDeckTab: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  subDeckLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.2,
  },
  configRail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segmentBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  segmentText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  registerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  regToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  regToggleText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  subDeckScroll: {
    maxHeight: 380,
  },
  basesCard: {
    padding: 6,
    marginBottom: 6,
  },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderRadius: 4,
  },
  baseTagWrapper: {
    width: 44,
  },
  baseBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center',
  },
  baseBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  baseValueScroll: {
    flex: 1,
    marginHorizontal: 6,
  },
  baseValueText: {
    fontSize: 12.5,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  copyBtn: {
    padding: 4,
  },
  bridgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  bridgeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
  },
  bridgeBtnText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  keypadGrid: {
    gap: 4,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 4,
  },
  keycap: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderBottomWidth: 3.5,
  },
  keycapText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  aluRegistersCard: {
    padding: 8,
    marginBottom: 6,
    gap: 4,
  },
  aluRegRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  aluResultHighlight: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 36, 30, 0.2)',
    paddingTop: 4,
  },
  aluRegName: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  aluRegVal: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    maxWidth: 240,
  },
  bitGridCard: {
    padding: 8,
    backgroundColor: '#F5F0E1',
    borderWidth: 2,
    borderColor: '#1B241E',
    borderRadius: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bitRowsWrapper: {
    gap: 4,
  },
  bitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bitRowLabel: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    color: '#7D8A80',
    width: 44,
  },
  nibblePair: {
    flexDirection: 'row',
    gap: 6,
  },
  nibbleGroup: {
    flexDirection: 'row',
    gap: 2,
  },
  bitCell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 4,
  },
  bitCellText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  aluOpsMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'space-between',
  },
  aluOpBtn: {
    width: '23.5%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  aluOpBtnText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  cardBox: {
    padding: 10,
    gap: 8,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  sampleChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.2,
  },
  sampleChipText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  ieeeFieldRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ieeeBitField: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  ieeeBitLabel: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#1B241E',
  },
  ieeeBitVal: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    marginVertical: 2,
  },
  ieeeSubtext: {
    fontSize: 8,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  ieeeHexBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#FFFDF7',
    borderWidth: 1.5,
    borderColor: '#1B241E',
    borderRadius: 6,
  },
  ieeeHexLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  ieeeHexValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  utf8Table: {
    borderWidth: 1.5,
    borderColor: '#1B241E',
    borderRadius: 6,
    overflow: 'hidden',
  },
  utf8HeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EAB308',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  utf8Col: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#1B241E',
  },
  utf8DataRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 36, 30, 0.15)',
    backgroundColor: '#FFFDF7',
  },
  utf8CellChar: {
    fontSize: 11,
    fontWeight: '900',
  },
  utf8Cell: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  discreteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 36, 30, 0.12)',
  },
  discreteLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  discreteValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
});
