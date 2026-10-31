import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Share,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  X,
  Star,
  Share2,
  Search,
  PlusCircle,
  Edit3,
  Copy,
} from 'lucide-react-native';
import { CrunchBoxLogo } from './CrunchBoxLogo';
import { useAppStore, PaperTapeEntry } from '../../store/useAppStore';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';
import { playTearTapeSound, triggerTactileFeedback } from '../../utils/soundEffects';

export interface PaperTapeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
}

export const PaperTapeDrawer: React.FC<PaperTapeDrawerProps> = ({
  isOpen,
  onClose,
  themeMode = 'field',
}) => {
  const { t } = useTranslation();
  const tokens = getThemeTokens(themeMode);

  const {
    paperTape,
    tearTape,
    togglePinTapeEntry,
    deleteTapeEntry,
    loadTapeToCalc,
    soundEnabled,
    hapticsEnabled,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('ALL');

  const filteredTape = useMemo(() => {
    let list = paperTape;
    if (filterMode !== 'ALL') {
      list = list.filter((item) => item.mode === filterMode);
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (item) =>
        item.expression.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q)
    );
  }, [paperTape, filterMode, searchQuery]);

  if (!isOpen) return null;

  const handleTear = () => {
    playTearTapeSound(soundEnabled);
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'heavy');
    tearTape();
  };

  const handleUseAns = (entry: PaperTapeEntry) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    loadTapeToCalc(entry, true);
    onClose();
  };

  const handleEditExpr = (entry: PaperTapeEntry) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    loadTapeToCalc(entry, false);
    onClose();
  };

  const handleCopyResult = async (entry: PaperTapeEntry) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    try {
      await Share.share({
        message: `${entry.expression} = ${entry.result}`,
      });
    } catch {
      // Fallback
    }
  };

  const handleTogglePin = (id: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    togglePinTapeEntry(id);
  };

  const handleDeleteItem = (id: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    deleteTapeEntry(id);
  };

  const handleShareReceipt = async () => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'medium');
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const border = '+====================================+';
    const divider = '+------------------------------------+';
    const lines = [
      border,
      '|    CRUNCHBOX // CB-09 FIELD LOG    |',
      `| Date: ${dateStr} UTC       |`,
      border,
    ];

    if (paperTape.length === 0) {
      lines.push('| (No calculations recorded)         |');
    } else {
      paperTape.forEach((entry, idx) => {
        const pinMark = entry.isPinned ? '[*]' : '   ';
        lines.push(`| #${String(paperTape.length - idx).padStart(2, '0')} ${pinMark} ${entry.mode.padEnd(5)} |`);
        lines.push(`|   ${entry.expression}`);
        lines.push(`| = ${entry.result}`);
        if (idx < paperTape.length - 1) lines.push(divider);
      });
    }

    lines.push(border);
    lines.push('| HARDWARE AUTH: VERIFIED CHECKSUM   |');
    lines.push(border);

    const asciiReceipt = lines.join('\n');
    try {
      await Share.share({
        message: asciiReceipt,
        title: 'CrunchBox CB-09 Field Receipt',
      });
    } catch {
      // Fallback
    }
  };

  const MODE_FILTERS = ['ALL', 'CALC', 'SCI', 'DEV', 'CURR', 'UNIT', 'TOOLS'];

  return (
    <View
      style={[
        styles.drawerOverlay,
        { backgroundColor: 'rgba(27, 36, 30, 0.75)' },
      ]}
    >
      <View
        style={[
          styles.drawerSheet,
          {
            backgroundColor: tokens.innerPanel,
            borderColor: tokens.borderVisible,
            borderWidth: hardwareConstants.borderWidthHeavy,
            borderRadius: hardwareConstants.borderRadiusLg,
          },
        ]}
      >
        {/* SVG Sawtooth Perforated Top Edge */}
        <View style={styles.perforatedTop}>
          <Svg width="100%" height="12" viewBox="0 0 360 12" preserveAspectRatio="none">
            <Path
              d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 L350,12 L360,0 Z"
              fill={tokens.chassisSurface}
            />
          </Svg>
        </View>

        {/* Header Bar */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.drawerTitle, { color: tokens.textPrimary }]}>
              {t('tape.title', 'PAPER TAPE RECEIPT')}
            </Text>
            <Text style={[styles.drawerSubtitle, { color: tokens.textMuted }]}>
              {t('tape.tap_hint', 'Fast history with quick-reuse actions')}
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            <Pressable
              accessible={true}
              accessibilityLabel="Share ASCII Receipt"
              onPress={handleShareReceipt}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tokens.keypadSurface,
                  borderColor: tokens.borderVisible,
                },
              ]}
            >
              <Share2 size={16} color={tokens.keycapNumberText} strokeWidth={2.4} />
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityLabel="Close Drawer"
              onPress={onClose}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tokens.keypadSurface,
                  borderColor: tokens.borderVisible,
                },
              ]}
            >
              <X size={18} color={tokens.keycapNumberText} strokeWidth={2.6} />
            </Pressable>
          </View>
        </View>

        {/* Search Input Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: tokens.keypadSurface,
              borderColor: tokens.borderVisible,
              borderWidth: 1.5,
            },
          ]}
        >
          <Search size={15} color={tokens.textSecondary} strokeWidth={2.4} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('tape.search_placeholder', 'Search tape expressions & results...')}
            placeholderTextColor={tokens.textMuted}
            style={[styles.searchInput, { color: tokens.textPrimary }]}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <X size={14} color={tokens.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Mode Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterBar}
        >
          {MODE_FILTERS.map((mode) => {
            const isSelected = mode === filterMode;
            return (
              <Pressable
                key={mode}
                onPress={() => {
                  triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
                  setFilterMode(mode);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? tokens.accentOps : tokens.keypadSurface,
                    borderColor: tokens.borderVisible,
                    borderWidth: 1.2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected
                        ? tokens.keycapOperatorText
                        : tokens.keycapNumberText,
                      fontWeight: isSelected ? '900' : '700',
                    },
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Paper Tape Items List */}
        <ScrollView style={styles.tapeScroll} contentContainerStyle={styles.tapeContent}>
          {filteredTape.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: tokens.textMuted }]}>
                {t('tape.empty', 'No calculation receipts recorded yet.')}
              </Text>
            </View>
          ) : (
            filteredTape.map((entry: PaperTapeEntry, idx: number) => {
              const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <View
                  key={entry.id}
                  style={[
                    styles.receiptItem,
                    {
                      borderBottomColor: tokens.borderVisible,
                      backgroundColor: entry.isPinned ? 'rgba(234, 179, 8, 0.12)' : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.receiptTopLine}>
                    <View style={styles.receiptMeta}>
                      <Text style={styles.receiptIndex}>#{filteredTape.length - idx}</Text>
                      <Text style={styles.receiptModeTag}>{entry.mode}</Text>
                      <Text style={styles.receiptTime}>{timeStr}</Text>
                    </View>

                    <View style={styles.cardHeaderActions}>
                      <Pressable
                        accessible={true}
                        accessibilityLabel={entry.isPinned ? 'Unpin entry' : 'Pin entry'}
                        onPress={() => handleTogglePin(entry.id)}
                        style={styles.pinBtn}
                      >
                        <Star
                          size={15}
                          color={entry.isPinned ? '#CA8A04' : tokens.textMuted}
                          fill={entry.isPinned ? '#CA8A04' : 'none'}
                          strokeWidth={2}
                        />
                      </Pressable>

                      <Pressable
                        accessible={true}
                        accessibilityLabel="Delete entry"
                        onPress={() => handleDeleteItem(entry.id)}
                        style={styles.pinBtn}
                      >
                        <Trash2 size={13} color={tokens.textMuted} strokeWidth={2} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.receiptCalc}>
                    <Text style={[styles.receiptExpr, { color: tokens.textSecondary }]}>
                      {entry.expression} =
                    </Text>
                    <Text style={[styles.receiptResult, { color: tokens.textPrimary }]}>
                      {entry.result}
                    </Text>
                  </View>

                  {/* 4 Quick Action Buttons */}
                  <View style={styles.quickActionsRow}>
                    <Pressable
                      accessible={true}
                      accessibilityLabel="Use Answer"
                      onPress={() => handleUseAns(entry)}
                      style={[
                        styles.quickActionBtn,
                        {
                          backgroundColor: tokens.actionGreen,
                          borderColor: tokens.borderVisible,
                        },
                      ]}
                    >
                      <PlusCircle size={10} color="#FFFDF7" strokeWidth={2.5} />
                      <Text style={styles.quickActionText}>+ Use Ans</Text>
                    </Pressable>

                    <Pressable
                      accessible={true}
                      accessibilityLabel="Edit Expression"
                      onPress={() => handleEditExpr(entry)}
                      style={[
                        styles.quickActionBtn,
                        {
                          backgroundColor: tokens.keypadSurface,
                          borderColor: tokens.borderVisible,
                        },
                      ]}
                    >
                      <Edit3 size={10} color={tokens.keycapNumberText} strokeWidth={2.4} />
                      <Text style={[styles.quickActionText, { color: tokens.keycapNumberText }]}>
                        ✏ Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      accessible={true}
                      accessibilityLabel="Copy Result"
                      onPress={() => handleCopyResult(entry)}
                      style={[
                        styles.quickActionBtn,
                        {
                          backgroundColor: tokens.keypadSurface,
                          borderColor: tokens.borderVisible,
                        },
                      ]}
                    >
                      <Copy size={10} color={tokens.keycapNumberText} strokeWidth={2.4} />
                      <Text style={[styles.quickActionText, { color: tokens.keycapNumberText }]}>
                        📋 Copy
                      </Text>
                    </Pressable>

                    <Pressable
                      accessible={true}
                      accessibilityLabel={entry.isPinned ? 'Pinned' : 'Pin'}
                      onPress={() => handleTogglePin(entry.id)}
                      style={[
                        styles.quickActionBtn,
                        {
                          backgroundColor: entry.isPinned ? tokens.accentOps : tokens.keypadSurface,
                          borderColor: tokens.borderVisible,
                        },
                      ]}
                    >
                      <Star
                        size={10}
                        color={entry.isPinned ? tokens.keycapOperatorText : tokens.keycapNumberText}
                        fill={entry.isPinned ? tokens.keycapOperatorText : 'none'}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.quickActionText,
                          {
                            color: entry.isPinned
                              ? tokens.keycapOperatorText
                              : tokens.keycapNumberText,
                          },
                        ]}
                      >
                        {entry.isPinned ? 'Pinned' : 'Pin'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}

          {/* Stenciled Industrial Verification Stamp */}
          <View style={styles.stampWrapper}>
            <CrunchBoxLogo variant="stamp" size={82} />
          </View>
        </ScrollView>

        {/* Bottom Actions Bar */}
        <View style={styles.footerRow}>
          <Pressable
            accessible={true}
            accessibilityLabel="Tear Tape"
            onPress={handleTear}
            disabled={paperTape.length === 0}
            style={[
              styles.tearBtn,
              {
                backgroundColor: tokens.dangerRed,
                borderColor: tokens.borderVisible,
                borderWidth: 2,
                opacity: paperTape.length === 0 ? 0.45 : 1,
              },
            ]}
          >
            <Trash2 size={15} color="#FFFDF7" strokeWidth={2.6} />
            <Text style={styles.tearBtnText}>
              {t('tape.tear', 'TEAR UNPINNED TAPE')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  drawerSheet: {
    maxHeight: '85%',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingBottom: 16,
    overflow: 'hidden',
  },
  perforatedTop: {
    width: '100%',
    height: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(27, 36, 30, 0.15)',
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  drawerSubtitle: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'monospace',
    padding: 0,
  },
  filterBar: {
    maxHeight: 32,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  filterScroll: {
    gap: 5,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
  },
  tapeScroll: {
    maxHeight: 360,
    paddingHorizontal: 16,
  },
  tapeContent: {
    paddingVertical: 6,
    gap: 6,
  },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
  receiptItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderBottomWidth: 1,
  },
  receiptTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  receiptIndex: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#EAB308',
  },
  receiptModeTag: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(27, 36, 30, 0.1)',
    borderRadius: 3,
  },
  receiptTime: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#8A998E',
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinBtn: {
    padding: 2,
  },
  receiptCalc: {
    marginTop: 4,
  },
  receiptExpr: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  receiptResult: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#FFFDF7',
  },
  stampWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
    opacity: 0.8,
  },
  footerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    borderRadius: 6,
  },
  tearBtnText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FFFDF7',
    letterSpacing: 0.5,
  },
});
