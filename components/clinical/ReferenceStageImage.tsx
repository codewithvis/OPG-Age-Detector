import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Circle, Rect } from 'react-native-svg';
import { colors, radius, spacing } from '../../theme';
import { Typography } from '../common/Typography';

interface ReferenceStageImageProps {
  stage: string;
}

export const ReferenceStageImage: React.FC<ReferenceStageImageProps> = ({ stage }) => {
  // Mock diagrams for Demirjian stages A-H
  // In a real app, these would be high-res PNG/SVG assets
  return (
    <View style={styles.container}>
      <View style={styles.diagramBox}>
        <Svg width="120" height="120" viewBox="0 0 100 100">
          <G transform="translate(20, 10)">
            {/* Base Tooth Shape */}
            <Path
              d="M30 10C20 10 10 20 10 40C10 60 20 85 30 85C40 85 50 60 50 40C50 20 40 10 30 10Z"
              fill={colors.slateLight}
              opacity={0.3}
            />

            {/* Stage-specific mineralization visualization */}
            {stage >= 'A' && <Circle cx="30" cy="20" r="5" fill={colors.primaryLight} />}
            {stage >= 'C' && <Rect x="20" y="25" width="20" height="10" rx="2" fill={colors.primaryLight} />}
            {stage >= 'E' && <Path d="M25 40 Q30 80 35 40" stroke={colors.primary} strokeWidth="4" fill="none" />}
            {stage === 'H' && <Circle cx="30" cy="80" r="3" fill={colors.success} />}
          </G>
        </Svg>
      </View>
      <Typography variant="label" bold color={colors.primaryLight} align="center">
        VISUAL STANDARD: STAGE {stage}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  diagramBox: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
