import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface TypographyProps extends TextProps {
  variant?: keyof typeof typography;
  color?: string;
  align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'bodyMedium',
  color = colors.textPrimary,
  align = 'left',
  bold = false,
  style,
  ...props
}) => {
  return (
    <Text
      style={[
        typography[variant],
        { color, textAlign: align },
        bold && { fontWeight: '700' },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
