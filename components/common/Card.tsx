import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && shadows.md,
        variant === 'outline' && styles.outline,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
