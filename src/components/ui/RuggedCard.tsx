import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  ThemeMode,
  getThemeTokens,
  hardwareConstants,
} from '../../utils/themeTokens';

export interface RuggedCardProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  themeMode?: ThemeMode;
  variant?: 'paper' | 'chassis' | 'lcd';
  style?: StyleProp<ViewStyle>;
  rivets?: boolean;
}

export const RuggedCard: React.FC<RuggedCardProps> = ({
  children,
  title,
  badge,
  themeMode = 'field',
  variant = 'paper',
  style,
  rivets = false,
}) => {
  const tokens = getThemeTokens(themeMode);

  let bg = tokens.innerPanel;
  if (variant === 'chassis') bg = tokens.chassisSurface;
  if (variant === 'lcd') bg = tokens.recessedLcd;

  return (
    <View style={[styles.outerWrapper, style]}>
      {/* 3D Drop Shadow */}
      <View
        style={[
          styles.cardShadow,
          {
            backgroundColor: tokens.inkShadow,
            borderRadius: hardwareConstants.borderRadiusLg,
          },
        ]}
      />

      {/* Main Card Surface */}
      <View
        style={[
          styles.cardFace,
          {
            backgroundColor: bg,
            borderColor: tokens.inkBorder,
            borderWidth: hardwareConstants.borderWidth,
            borderRadius: hardwareConstants.borderRadiusLg,
          },
        ]}
      >
        {/* Optional Rivets at 4 corners */}
        {rivets ? (
          <>
            <View style={[styles.rivet, styles.rivetTL, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]} />
            <View style={[styles.rivet, styles.rivetTR, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]} />
            <View style={[styles.rivet, styles.rivetBL, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]} />
            <View style={[styles.rivet, styles.rivetBR, { borderColor: tokens.inkBorder, backgroundColor: tokens.rivetFill }]} />
          </>
        ) : null}

        {/* Card Header if title or badge exists */}
        {title || badge ? (
          <View style={styles.headerRow}>
            {title ? (
              <Text
                style={[
                  styles.titleText,
                  { color: variant === 'chassis' ? '#FFFDF7' : tokens.textPrimary },
                ]}
              >
                {title}
              </Text>
            ) : null}
            {badge ? (
              <View
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: tokens.accentOps,
                    borderColor: tokens.inkBorder,
                  },
                ]}
              >
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    marginVertical: 6,
  },
  cardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
  },
  cardFace: {
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1.8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#1B241E',
  },
  rivet: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    zIndex: 10,
  },
  rivetTL: { top: 6, left: 6 },
  rivetTR: { top: 6, right: 6 },
  rivetBL: { bottom: 6, left: 6 },
  rivetBR: { bottom: 6, right: 6 },
});
