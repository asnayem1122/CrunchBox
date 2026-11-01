import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, Search, BookOpen, ArrowRight, Play } from 'lucide-react-native';
import { GUIDE_SECTIONS, GuideSection, GuideExample } from './guideData';
import { useAppStore } from '../../store/useAppStore';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { triggerTactileFeedback } from '../../utils/soundEffects';

export interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
}

export const GuidebookModal: React.FC<GuidebookModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'field',
}) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const {
    language,
    setMode,
    inputCalcKey,
    clearCalc,
    setDevOperandA,
    setCurrencyAmount,
    soundEnabled,
    hapticsEnabled,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isBn = language === 'bn';

  const filteredSections = useMemo(() => {
    let list = GUIDE_SECTIONS;
    if (activeCategory !== 'ALL') {
      list = list.filter((s) => s.id === activeCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s) => {
      const matchEn =
        s.titleEn.toLowerCase().includes(q) ||
        s.summaryEn.toLowerCase().includes(q) ||
        s.tipsEn.some((tip) => tip.toLowerCase().includes(q));
      const matchBn =
        s.titleBn.toLowerCase().includes(q) ||
        s.summaryBn.toLowerCase().includes(q) ||
        s.tipsBn.some((tip) => tip.toLowerCase().includes(q));
      return matchEn || matchBn;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleTryExample = (example: GuideExample) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');

    if (example.mode === 'CALC' || example.mode === 'SCI') {
      clearCalc();
      if (example.expression) {
        inputCalcKey(example.expression);
      }
      setMode(example.mode);
    } else if (example.mode === 'DEV') {
      const expr = example.expression || '';
      if (expr === '0b1010 + 0b0101') {
        useAppStore.setState({
          devOperandA: '10',
          devOperandB: '5',
          devOperandABase: 'BIN',
          devOperandBBase: 'BIN',
          devAluOp: 'ADD',
          devWordSize: 8,
          devSubDeck: 'BIN_CALC',
          devActiveRegister: 'A',
          activeMode: 'DEV',
        });
      } else if (expr === '0xAA ^ 0x55') {
        useAppStore.setState({
          devOperandA: '170',
          devOperandB: '85',
          devOperandABase: 'HEX',
          devOperandBBase: 'HEX',
          devAluOp: 'XOR',
          devWordSize: 8,
          devSubDeck: 'BIN_CALC',
          devActiveRegister: 'A',
          activeMode: 'DEV',
        });
      } else if (expr === '0b1100 << 2') {
        useAppStore.setState({
          devOperandA: '12',
          devOperandB: '2',
          devOperandABase: 'BIN',
          devOperandBBase: 'DEC',
          devAluOp: 'SHL',
          devWordSize: 8,
          devSubDeck: 'BIN_CALC',
          devActiveRegister: 'A',
          activeMode: 'DEV',
        });
      } else {
        if (example.expression) {
          setDevOperandA(example.expression);
        }
        setMode('DEV');
      }
    } else if (example.mode === 'CURR') {
      setCurrencyAmount('100');
      setMode('CURR');
    } else if (example.mode === 'UNIT') {
      setMode('UNIT');
    } else if (example.mode === 'TOOLS') {
      setMode('TOOLS');
    }

    onClose();
  };

  const CATEGORIES = [
    { id: 'ALL', label: isBn ? 'সকল' : 'ALL' },
    { id: 'GENERAL', label: isBn ? 'সাধারণ' : 'BASICS' },
    { id: 'CALC_SCI', label: isBn ? 'ক্যালক' : 'CALC/SCI' },
    { id: 'DEV', label: isBn ? 'প্রোগ্রামার' : 'DEV/CS' },
    { id: 'CURR', label: isBn ? 'মুদ্রা' : 'CURR' },
    { id: 'UNIT', label: isBn ? 'একক' : 'UNIT' },
    { id: 'TOOLS', label: isBn ? 'টুলস' : 'TOOLS' },
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
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
            <View style={styles.headerTitleGroup}>
              <BookOpen size={18} color="#FFFDF7" strokeWidth={2.6} />
              <Text style={styles.headerTitle}>
                {isBn ? 'ফিল্ড ম্যানুয়াল ও ইউজার গাইড' : 'HARDWARE USER MANUAL'}
              </Text>
            </View>

            <Pressable
              accessible={true}
              accessibilityLabel="Close manual"
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
            >
              <X size={20} color="#FFFDF7" strokeWidth={2.8} />
            </Pressable>
          </View>

          {/* Search Bar Input */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: tokens.innerPanel,
                borderColor: tokens.borderVisible,
                borderWidth: hardwareConstants.borderWidth,
              },
            ]}
          >
            <Search size={16} color={tokens.textSecondary} strokeWidth={2.5} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                isBn
                  ? 'টুলস, ফাংশন বা টিপস সার্চ করুন...'
                  : 'Search guide (ClassWiz, S<=>D, FACT, bits, units)...'
              }
              placeholderTextColor={tokens.textMuted}
              style={[styles.searchInput, { color: tokens.textPrimary }]}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
                <X size={15} color={tokens.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          {/* Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            style={styles.categoryBar}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeCategory;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                    setActiveCategory(cat.id);
                  }}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                      borderColor: tokens.borderVisible,
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      {
                        color: isSelected
                          ? tokens.keycapOperatorText
                          : tokens.keycapNumberText,
                        fontWeight: isSelected ? '900' : '700',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Guide Sections List */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredSections.map((section: GuideSection) => (
              <View
                key={section.id}
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: tokens.innerPanel,
                    borderColor: tokens.borderVisible,
                    borderWidth: hardwareConstants.borderWidth,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.badgePill,
                      { backgroundColor: tokens.accentOps },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: tokens.keycapOperatorText },
                      ]}
                    >
                      {section.badge}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: tokens.textPrimary },
                    ]}
                  >
                    {isBn ? section.titleBn : section.titleEn}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.sectionSummary,
                    { color: tokens.textSecondary },
                  ]}
                >
                  {isBn ? section.summaryBn : section.summaryEn}
                </Text>

                {/* Key Operating Tips */}
                <View style={styles.tipsList}>
                  {(isBn ? section.tipsBn : section.tipsEn).map((tip, idx) => (
                    <View key={idx} style={styles.tipRow}>
                      <Text style={[styles.tipBullet, { color: tokens.accentOps }]}>
                        ■
                      </Text>
                      <Text
                        style={[
                          styles.tipText,
                          { color: tokens.textPrimary },
                        ]}
                      >
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Interactive Examples with Try It Now Buttons */}
                {section.examples.length > 0 ? (
                  <View style={styles.examplesWrapper}>
                    <Text
                      style={[
                        styles.examplesHeader,
                        { color: tokens.textSecondary },
                      ]}
                    >
                      {isBn ? 'ইন্টারেক্টিভ উদাহরণ:' : 'INTERACTIVE EXAMPLES:'}
                    </Text>
                    {section.examples.map((ex, eIdx) => (
                      <View
                        key={eIdx}
                        style={[
                          styles.exampleCard,
                          {
                            backgroundColor: tokens.keypadSurface,
                            borderColor: tokens.borderVisible,
                            borderWidth: 1.2,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.exampleTitle,
                              { color: tokens.textPrimary },
                            ]}
                          >
                            {isBn ? ex.titleBn : ex.titleEn}
                          </Text>
                          <Text
                            style={[
                              styles.exampleDesc,
                              { color: tokens.textMuted },
                            ]}
                          >
                            {isBn ? ex.explanationBn : ex.explanationEn}
                          </Text>
                        </View>

                        <Pressable
                          accessible={true}
                          accessibilityLabel={`Try example: ${ex.titleEn}`}
                          onPress={() => handleTryExample(ex)}
                          style={[
                            styles.tryBtn,
                            {
                              backgroundColor: tokens.actionGreen,
                              borderColor: tokens.borderVisible,
                              borderWidth: 1.5,
                            },
                          ]}
                        >
                          <Play size={11} color="#FFFDF7" fill="#FFFDF7" />
                          <Text style={styles.tryBtnText}>
                            {isBn ? 'চালান' : 'TRY'}
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 12.5,
    fontFamily: 'monospace',
    fontWeight: '600',
    padding: 0,
  },
  categoryBar: {
    maxHeight: 38,
    marginBottom: 8,
  },
  categoryScroll: {
    gap: 6,
    alignItems: 'center',
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  catChipText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    gap: 10,
    paddingBottom: 24,
  },
  sectionCard: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionSummary: {
    fontSize: 11,
    lineHeight: 16,
  },
  tipsList: {
    gap: 5,
    marginTop: 2,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 8,
    marginTop: 3,
  },
  tipText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 15,
  },
  examplesWrapper: {
    marginTop: 6,
    gap: 6,
  },
  examplesHeader: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 6,
    gap: 8,
  },
  exampleTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  exampleDesc: {
    fontSize: 9.5,
    marginTop: 1,
  },
  tryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tryBtnText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FFFDF7',
  },
});
