import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Text as SvgText,
  G,
  Line,
} from 'react-native-svg';

export interface CrunchBoxLogoProps {
  variant?: 'icon' | 'horizontal' | 'stamp';
  size?: number;
  lcdText?: string;
}

export const CrunchBoxLogo: React.FC<CrunchBoxLogoProps> = ({
  variant = 'icon',
  size = 120,
  lcdText = 'CB•09',
}) => {
  if (variant === 'stamp') {
    // Industrial monochrome stencil receipt stamp
    const stampWidth = size * 2.6;
    const stampHeight = size * 0.7;
    return (
      <View style={[styles.container, { width: stampWidth, height: stampHeight }]}>
        <Svg
          width={stampWidth}
          height={stampHeight}
          viewBox="0 0 260 70"
          fill="none"
        >
          {/* Dashed Industrial Stencil Border */}
          <Rect
            x="3"
            y="3"
            width="254"
            height="64"
            rx="6"
            stroke="#1B241E"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeOpacity="0.65"
          />
          {/* Inner solid border */}
          <Rect
            x="8"
            y="8"
            width="244"
            height="54"
            rx="4"
            stroke="#1B241E"
            strokeWidth="1.5"
            strokeOpacity="0.65"
          />
          {/* Hardware Rivet Dots */}
          <Circle cx="15" cy="15" r="2.5" fill="#1B241E" fillOpacity="0.65" />
          <Circle cx="245" cy="15" r="2.5" fill="#1B241E" fillOpacity="0.65" />
          <Circle cx="15" cy="55" r="2.5" fill="#1B241E" fillOpacity="0.65" />
          <Circle cx="245" cy="55" r="2.5" fill="#1B241E" fillOpacity="0.65" />

          {/* Stencil Text */}
          <SvgText
            x="130"
            y="29"
            textAnchor="middle"
            fill="#1B241E"
            fillOpacity="0.75"
            fontSize="12"
            fontWeight="900"
            letterSpacing="2.5"
            fontFamily="monospace"
          >
            VERIFIED BY CRUNCHBOX
          </SvgText>

          <Line
            x1="30"
            y1="37"
            x2="230"
            y2="37"
            stroke="#1B241E"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />

          <SvgText
            x="130"
            y="52"
            textAnchor="middle"
            fill="#1B241E"
            fillOpacity="0.65"
            fontSize="9.5"
            fontWeight="bold"
            letterSpacing="2"
            fontFamily="monospace"
          >
            FIELD UNIT CB-09 // AUTH-OK
          </SvgText>
        </Svg>
      </View>
    );
  }

  if (variant === 'horizontal') {
    // Chassis Header Nameplate: scaled 36x36 icon + brass/vintage cream metal plate
    const horizontalWidth = size * 2.8;
    const horizontalHeight = size * 0.55;
    return (
      <View style={[styles.container, { width: horizontalWidth, height: horizontalHeight }]}>
        <Svg
          width={horizontalWidth}
          height={horizontalHeight}
          viewBox="0 0 280 55"
          fill="none"
        >
          {/* Shadow Behind Nameplate */}
          <Rect
            x="48"
            y="9"
            width="228"
            height="42"
            rx="8"
            fill="#1B241E"
          />

          {/* Metal Nameplate Body (Vintage Cream) */}
          <Rect
            x="45"
            y="5"
            width="228"
            height="42"
            rx="8"
            fill="#F5F0E1"
            stroke="#1B241E"
            strokeWidth="3"
          />

          {/* Mustard Accent Stripe */}
          <Rect
            x="50"
            y="10"
            width="6"
            height="32"
            rx="2"
            fill="#EAB308"
            stroke="#1B241E"
            strokeWidth="1.5"
          />

          {/* Nameplate Rivets */}
          <Circle cx="64" cy="14" r="2.5" fill="#2D5A3C" stroke="#1B241E" strokeWidth="1.2" />
          <Circle cx="264" cy="14" r="2.5" fill="#2D5A3C" stroke="#1B241E" strokeWidth="1.2" />
          <Circle cx="64" cy="38" r="2.5" fill="#2D5A3C" stroke="#1B241E" strokeWidth="1.2" />
          <Circle cx="264" cy="38" r="2.5" fill="#2D5A3C" stroke="#1B241E" strokeWidth="1.2" />

          {/* CRUNCHBOX Heavy Text */}
          <SvgText
            x="76"
            y="28"
            fill="#1B241E"
            fontSize="18"
            fontWeight="900"
            letterSpacing="2.5"
            fontFamily="sans-serif"
          >
            CRUNCHBOX
          </SvgText>

          {/* Serial Badge Tag */}
          <Rect
            x="200"
            y="14"
            width="58"
            height="22"
            rx="4"
            fill="#EAB308"
            stroke="#1B241E"
            strokeWidth="2"
          />
          <SvgText
            x="229"
            y="29"
            textAnchor="middle"
            fill="#1B241E"
            fontSize="10"
            fontWeight="900"
            letterSpacing="1.2"
            fontFamily="monospace"
          >
            CB-09
          </SvgText>

          {/* Mini 36x36 Core Icon on the Left */}
          <G transform="translate(4, 5) scale(0.36)">
            {/* 3D Drop Shadow */}
            <Rect x="8" y="12" width="104" height="100" rx="22" fill="#1B241E" />
            {/* Rugged Casing */}
            <Rect
              x="6"
              y="6"
              width="104"
              height="100"
              rx="22"
              fill="#2D5A3C"
              stroke="#1B241E"
              strokeWidth="5"
            />
            {/* Corner Rivets */}
            <Circle cx="18" cy="18" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
            <Circle cx="98" cy="18" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
            <Circle cx="18" cy="94" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
            <Circle cx="98" cy="94" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />

            {/* Recessed LCD Visor */}
            <Rect
              x="18"
              y="18"
              width="80"
              height="28"
              rx="7"
              fill="#C5D6A7"
              stroke="#1B241E"
              strokeWidth="4"
            />
            <Circle cx="26" cy="32" r="2.8" fill="#22C55E" stroke="#1B241E" strokeWidth="1.2" />
            <SvgText
              x="62"
              y="38"
              textAnchor="middle"
              fill="#1B241E"
              fontSize="14"
              fontWeight="900"
              fontFamily="monospace"
            >
              CB•09
            </SvgText>

            {/* Mini 4 Keycaps */}
            <Rect x="20" y="52" width="34" height="20" rx="5" fill="#FFFDF7" stroke="#1B241E" strokeWidth="3" />
            <Rect x="62" y="52" width="34" height="20" rx="5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="3" />
            <Rect x="20" y="78" width="34" height="20" rx="5" fill="#D93829" stroke="#1B241E" strokeWidth="3" />
            <Rect x="62" y="78" width="34" height="20" rx="5" fill="#EAB308" stroke="#1B241E" strokeWidth="3" />
          </G>
        </Svg>
      </View>
    );
  }

  // variant === 'icon' (120x120 Core Emblem)
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        {/* 1. 3D Hard Bottom Drop Shadow Base */}
        <Rect
          x="10"
          y="14"
          width="104"
          height="100"
          rx="22"
          fill="#1B241E"
        />

        {/* 2. Outer Rugged Field-Gear Casing */}
        <Rect
          x="8"
          y="8"
          width="104"
          height="100"
          rx="22"
          fill="#2D5A3C"
          stroke="#1B241E"
          strokeWidth="5"
        />

        {/* 3. Four Corner Steel/Brass Rivets with Cross Slots */}
        {/* Top-Left Rivet */}
        <Circle cx="20" cy="20" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
        <Line x1="18" y1="20" x2="22" y2="20" stroke="#1B241E" strokeWidth="1.5" />
        <Line x1="20" y1="18" x2="20" y2="22" stroke="#1B241E" strokeWidth="1.5" />

        {/* Top-Right Rivet */}
        <Circle cx="100" cy="20" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
        <Line x1="98" y1="20" x2="102" y2="20" stroke="#1B241E" strokeWidth="1.5" />
        <Line x1="100" y1="18" x2="100" y2="22" stroke="#1B241E" strokeWidth="1.5" />

        {/* Bottom-Left Rivet */}
        <Circle cx="20" cy="96" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
        <Line x1="18" y1="96" x2="22" y2="96" stroke="#1B241E" strokeWidth="1.5" />
        <Line x1="20" y1="94" x2="20" y2="98" stroke="#1B241E" strokeWidth="1.5" />

        {/* Bottom-Right Rivet */}
        <Circle cx="100" cy="96" r="4.5" fill="#F5F0E1" stroke="#1B241E" strokeWidth="2.5" />
        <Line x1="98" y1="96" x2="102" y2="96" stroke="#1B241E" strokeWidth="1.5" />
        <Line x1="100" y1="94" x2="100" y2="98" stroke="#1B241E" strokeWidth="1.5" />

        {/* 4. Top Recessed LCD Visor Screen */}
        <Rect
          x="20"
          y="20"
          width="80"
          height="28"
          rx="7"
          fill="#C5D6A7"
          stroke="#1B241E"
          strokeWidth="4"
        />

        {/* Visor Inner Glass Reflection Accent */}
        <Path
          d="M 23 23 L 42 23 L 34 44 L 23 44 Z"
          fill="#FFFFFF"
          fillOpacity="0.25"
        />

        {/* Status Power LED (Glowing Green) */}
        <Circle cx="29" cy="34" r="3.2" fill="#22C55E" stroke="#1B241E" strokeWidth="1.5" />
        <Circle cx="28" cy="33" r="1.2" fill="#FFFFFF" />

        {/* LCD Monospace Text */}
        <SvgText
          x="65"
          y="39"
          textAnchor="middle"
          fill="#1B241E"
          fontSize="13.5"
          fontWeight="900"
          letterSpacing="1"
          fontFamily="monospace"
        >
          {lcdText}
        </SvgText>

        {/* 5. Bottom 2x2 Tactile Keycap Grid (3D Mechanical Push Buttons) */}

        {/* Key 1: Top-Left (Crisp White #FFFDF7) - Symbol '+' */}
        {/* Hard Bottom Shadow */}
        <Rect x="20" y="55" width="36" height="21" rx="6" fill="#1B241E" />
        {/* Keycap Surface */}
        <Rect
          x="20"
          y="52"
          width="36"
          height="21"
          rx="6"
          fill="#FFFDF7"
          stroke="#1B241E"
          strokeWidth="3.5"
        />
        {/* Plus Symbol */}
        <Path
          d="M 38 57 L 38 67 M 33 62 L 43 62"
          stroke="#1B241E"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Key 2: Top-Right (Vintage Cream #F5F0E1) - Symbol '৳' / '$' */}
        {/* Hard Bottom Shadow */}
        <Rect x="64" y="55" width="36" height="21" rx="6" fill="#1B241E" />
        {/* Keycap Surface */}
        <Rect
          x="64"
          y="52"
          width="36"
          height="21"
          rx="6"
          fill="#F5F0E1"
          stroke="#1B241E"
          strokeWidth="3.5"
        />
        {/* Currency Symbol '৳' */}
        <SvgText
          x="82"
          y="68"
          textAnchor="middle"
          fill="#1B241E"
          fontSize="16"
          fontWeight="900"
        >
          ৳
        </SvgText>

        {/* Key 3: Bottom-Left (Brick Red #D93829) - Symbol '×' */}
        {/* Hard Bottom Shadow */}
        <Rect x="20" y="81" width="36" height="21" rx="6" fill="#1B241E" />
        {/* Keycap Surface */}
        <Rect
          x="20"
          y="78"
          width="36"
          height="21"
          rx="6"
          fill="#D93829"
          stroke="#1B241E"
          strokeWidth="3.5"
        />
        {/* Multiply '×' Symbol in Crisp White */}
        <Path
          d="M 34 84 L 42 92 M 42 84 L 34 92"
          stroke="#FFFDF7"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Key 4: Bottom-Right (Mustard Yellow #EAB308) - Symbol '=' */}
        {/* Hard Bottom Shadow */}
        <Rect x="64" y="81" width="36" height="21" rx="6" fill="#1B241E" />
        {/* Keycap Surface */}
        <Rect
          x="64"
          y="78"
          width="36"
          height="21"
          rx="6"
          fill="#EAB308"
          stroke="#1B241E"
          strokeWidth="3.5"
        />
        {/* Equals '=' Symbol */}
        <Path
          d="M 74 86 L 90 86 M 74 91 L 90 91"
          stroke="#1B241E"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
