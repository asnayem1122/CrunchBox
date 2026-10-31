import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Trash2, X } from 'lucide-react-native';
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
  const { paperTape, tearTape, recallTapeEntry } = useAppStore();

  if (!isOpen) return null;

  const handleTear = () => {
    playTearTapeSound();
    tearTape();
  };

  const handleRecall = (id: string) => {
    triggerTactileFeedback();
    recallTapeEntry(id);
    onClose();
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
          <View>
            <Text style={[styles.drawerTitle, { color: tokens.textPrimary }]}>
              {t('tape.title', 'PAPER TAPE RECEIPT')}
            </Text>
            <Text style={[styles.drawerSubtitle, { color: tokens.textMuted }]}>
              {t('tape.tap_hint', 'Tap line to recall value into active calculator')}
            </Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={tokens.inkBorder} strokeWidth={2.8} />
          </Pressable>
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
                  onPress={() => handleRecall(entry.id)}
                  style={[
                    styles.receiptItem,
                    { borderBottomColor: 'rgba(27, 36, 30, 0.15)' },
                  ]}
                >
                  <View style={styles.receiptMeta}>
                    <Text style={styles.receiptIndex}>#{paperTape.length - idx}</Text>
                    <Text style={styles.receiptTime}>{timeStr}</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(27, 36, 30, 0.2)',
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  drawerSubtitle: {
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tapeScroll: {
    maxHeight: 340,
  },
  tapeContent: {
    padding: 12,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
  receiptItem: {
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  receiptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  receiptIndex: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    opacity: 0.6,
  },
  receiptTime: {
    fontSize: 9,
    fontFamily: 'monospace',
    opacity: 0.6,
  },
  receiptCalc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptExpr: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
    flex: 1,
  },
  receiptResult: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  stampWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(27, 36, 30, 0.2)',
  },
  tearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
  },
  tearBtnText: {
    color: '#FFFDF7',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  doneBtnText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
