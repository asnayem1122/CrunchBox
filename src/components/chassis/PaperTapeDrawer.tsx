import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Trash2, X, Star, Share2 } from 'lucide-react-native';
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
    recallTapeEntry,
    togglePinTapeEntry,
    soundEnabled,
    hapticsEnabled,
  } = useAppStore();

  if (!isOpen) return null;

  const handleTear = () => {
    playTearTapeSound(soundEnabled);
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'heavy');
    tearTape();
  };

  const handleRecall = (id: string) => {
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    recallTapeEntry(id);
    onClose();
  };

  const handleTogglePin = (id: string, e: any) => {
    e.stopPropagation?.();
    triggerTactileFeedback(soundEnabled, hapticsEnabled, 'light');
    togglePinTapeEntry(id);
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
      // Fallback silently if share dismissed
    }
  };

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
            borderColor: tokens.inkBorder,
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
              {t('tape.tap_hint', 'Tap line to recall value into active calculator')}
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
                  borderColor: tokens.inkBorder,
                },
              ]}
            >
              <Share2 size={16} color={tokens.inkBorder} strokeWidth={2.4} />
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityLabel="Close Drawer"
              onPress={onClose}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tokens.keypadSurface,
                  borderColor: tokens.inkBorder,
                },
              ]}
            >
              <X size={18} color={tokens.inkBorder} strokeWidth={2.6} />
            </Pressable>
          </View>
        </View>

        {/* Paper Tape Items List */}
        <ScrollView style={styles.tapeScroll} contentContainerStyle={styles.tapeContent}>
          {paperTape.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: tokens.textMuted }]}>
                {t('tape.empty', 'No calculation receipts recorded yet.')}
              </Text>
            </View>
          ) : (
            paperTape.map((entry: PaperTapeEntry, idx: number) => {
              const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <Pressable
                  key={entry.id}
                  accessible={true}
                  accessibilityLabel={`Receipt #${paperTape.length - idx}: ${entry.expression} = ${entry.result}`}
                  onPress={() => handleRecall(entry.id)}
                  style={[
                    styles.receiptItem,
                    {
                      borderBottomColor: 'rgba(27, 36, 30, 0.15)',
                      backgroundColor: entry.isPinned ? 'rgba(234, 179, 8, 0.12)' : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.receiptTopLine}>
                    <View style={styles.receiptMeta}>
                      <Text style={styles.receiptIndex}>#{paperTape.length - idx}</Text>
                      <Text style={styles.receiptModeTag}>{entry.mode}</Text>
                      <Text style={styles.receiptTime}>{timeStr}</Text>
                    </View>

                    <Pressable
                      accessible={true}
                      accessibilityLabel={entry.isPinned ? 'Unpin entry' : 'Pin entry'}
                      onPress={(e) => handleTogglePin(entry.id, e)}
                      style={styles.pinBtn}
                    >
                      <Star
                        size={15}
                        color={entry.isPinned ? '#CA8A04' : tokens.textMuted}
                        fill={entry.isPinned ? '#CA8A04' : 'none'}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.receiptCalc}>
                    <Text style={[styles.receiptExpr, { color: tokens.textSecondary }]}>
                      {entry.expression} =
                    </Text>
                    <Text style={[styles.receiptResult, { color: tokens.textPrimary }]}>
                      {entry.result}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}

          {/* Stenciled Industrial Verification Stamp at Bottom of Tape */}
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
                borderColor: tokens.inkBorder,
                borderWidth: 2,
                opacity: paperTape.length === 0 ? 0.45 : 1,
              },
            ]}
          >
            <Trash2 size={16} color="#FFFDF7" strokeWidth={2.5} />
            <Text style={styles.tearBtnText}>
              {t('tape.tear_button', 'TEAR TAPE')}
            </Text>
          </Pressable>

          <Pressable
            accessible={true}
            accessibilityLabel="Close Drawer"
            onPress={onClose}
            style={[
              styles.doneBtn,
              {
                backgroundColor: tokens.accentOps,
                borderColor: tokens.inkBorder,
                borderWidth: 2,
              },
            ]}
          >
            <Text style={[styles.doneBtnText, { color: tokens.inkBorder }]}>
              {t('common.close', 'CLOSE')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'flex-end',
    padding: 12,
  },
  drawerSheet: {
    maxHeight: '80%',
    width: '100%',
    maxWidth: 440,
    marginHorizontal: 'auto',
    overflow: 'hidden',
  },
  perforatedTop: {
    width: '100%',
    height: 12,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(27, 36, 30, 0.2)',
  },
  drawerTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  drawerSubtitle: {
    fontSize: 10,
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
  tapeScroll: {
    maxHeight: 380,
    paddingHorizontal: 16,
  },
  tapeContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
  receiptItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  receiptTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptIndex: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#D93829',
  },
  receiptModeTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: 'rgba(27, 36, 30, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  receiptTime: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#7D8A80',
  },
  pinBtn: {
    padding: 3,
  },
  receiptCalc: {
    alignItems: 'flex-end',
  },
  receiptExpr: {
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  receiptResult: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '900',
    marginTop: 1,
  },
  stampWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
    opacity: 0.85,
  },
  footerRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(27, 36, 30, 0.2)',
  },
  tearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tearBtnText: {
    color: '#FFFDF7',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  doneBtnText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
