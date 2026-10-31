import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CrunchBoxLogo } from './CrunchBoxLogo';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';

export interface RuggedChassisProps {
  children: React.ReactNode;
  themeMode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
  statusText?: string;
  onPressSettings?: () => void;
  onPressTape?: () => void;
}

export const RuggedChassis: React.FC<RuggedChassisProps> = ({
  children,
  themeMode = 'field',
  style,
  statusText = 'FIELD UNIT CB-09 // ONLINE',
}) => {
  const tokens = getThemeTokens(themeMode);

  return (
    <View style={[styles.outerBoundary, style]}>
      {/* 3D Chassis Heavy Bottom Shadow */}
      <View
        style={[
          styles.chassisShadow,
          {
            backgroundColor: tokens.inkShadow,
            borderRadius: 22,
          },
        ]}
      />

      {/* Main Rugged Chassis Housing */}
      <View
        style={[
          styles.chassisHousing,
          {
            backgroundColor: tokens.chassisSurface,
            borderColor: tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidthHeavy,
            borderRadius: 22,
          },
        ]}
      >
        {/* 4 Corner Brass Hardware Rivets with Cross Slots */}
        <View style={[styles.screw, styles.screwTL, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]}>
          <View style={[styles.screwSlot, { backgroundColor: tokens.inkBorder }]} />
          <View style={[styles.screwSlotCross, { backgroundColor: tokens.inkBorder }]} />
        </View>

        <View style={[styles.screw, styles.screwTR, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]}>
          <View style={[styles.screwSlot, { backgroundColor: tokens.inkBorder }]} />
          <View style={[styles.screwSlotCross, { backgroundColor: tokens.inkBorder }]} />
        </View>

        <View style={[styles.screw, styles.screwBL, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]}>
          <View style={[styles.screwSlot, { backgroundColor: tokens.inkBorder }]} />
          <View style={[styles.screwSlotCross, { backgroundColor: tokens.inkBorder }]} />
        </View>

        <View style={[styles.screw, styles.screwBR, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]}>
          <View style={[styles.screwSlot, { backgroundColor: tokens.inkBorder }]} />
          <View style={[styles.screwSlotCross, { backgroundColor: tokens.inkBorder }]} />
        </View>

        {/* Top Header Bar: Horizontal Nameplate + Power LED */}
        <View style={styles.topHeaderBar}>
          <CrunchBoxLogo variant="horizontal" size={78} />

          <View style={styles.statusLedCluster}>
            <View
              style={[
                styles.powerLed,
                {
                  backgroundColor: tokens.ledActive,
                  borderColor: tokens.inkBorder,
                },
              ]}
            >
              <View style={styles.ledGlint} />
            </View>
            <Text style={[styles.statusTag, { color: tokens.textSecondary }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Inner Content Slot (LCD Display, Mode Selector, Keypad) */}
        <View style={styles.innerWorkArea}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBoundary: {
    width: '100%',
    maxWidth: 440,
    position: 'relative',
    marginHorizontal: 'auto',
  },
  chassisShadow: {
    position: 'absolute',
    top: 6,
    left: 4,
    right: -4,
    bottom: -6,
  },
  chassisHousing: {
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  screw: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  screwSlot: {
    position: 'absolute',
    width: 7,
    height: 1.6,
  },
  screwSlotCross: {
    position: 'absolute',
    width: 1.6,
    height: 7,
  },
  screwTL: { top: 9, left: 9 },
  screwTR: { top: 9, right: 9 },
  screwBL: { bottom: 9, left: 9 },
  screwBR: { bottom: 9, right: 9 },

  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  statusLedCluster: {
    alignItems: 'flex-end',
    gap: 3,
  },
  powerLed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledGlint: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 1,
    left: 1,
  },
  statusTag: {
    fontSize: 7.5,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  innerWorkArea: {
    width: '100%',
  },
});
