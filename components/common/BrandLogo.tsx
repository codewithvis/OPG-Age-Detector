import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import { colors } from '../../theme';

interface BrandLogoProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 48,
  color = colors.primary,
  style
}) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Stylized Tooth / Shield Hybrid */}
        <Path
          d="M50 10C35 10 25 15 20 30C15 45 20 85 50 90C80 85 85 45 80 30C75 15 65 10 50 10Z"
          fill={color}
          fillOpacity={0.15}
        />
        <Path
          d="M50 15C38 15 28 20 24 32C20 44 24 78 50 82C76 78 80 44 76 32C72 20 62 15 50 15Z"
          stroke={color}
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Signal / Analysis Waves */}
        <G transform="translate(35, 35)">
          <Rect
            x="0"
            y="10"
            width="6"
            height="20"
            rx="3"
            fill={color}
          />
          <Rect
            x="12"
            y="0"
            width="6"
            height="30"
            rx="3"
            fill={color}
          />
          <Rect
            x="24"
            y="5"
            width="6"
            height="25"
            rx="3"
            fill={color}
          />
        </G>

        {/* Medical Cross Detail */}
        <Circle cx="50" cy="85" r="4" fill={colors.primaryLight} />
      </Svg>
    </View>
  );
};
