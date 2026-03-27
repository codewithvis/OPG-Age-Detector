/**
 * Layout Wrapper Components
 * Reusable containers for consistent alignment and spacing across screens
 * Helps prevent layout anti-patterns and ensures UI consistency
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { spacing, padding, gaps, layouts, borderRadius } from '../constants/layout';

// ─────────────────────────────────────────────────
// SCREEN CONTAINER - Main screen wrapper
// ─────────────────────────────────────────────────
interface ScreenContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  safe?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  backgroundColor = colors.bgScreen,
  style,
  safe = true,
}) => (
  <View
    style={[
      styles.screenContainer,
      { backgroundColor },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// SCROLL CONTENT - ScrollView content wrapper
// ─────────────────────────────────────────────────
interface ScrollContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  hasBottomNav?: boolean;
  hasBottomPadding?: boolean;
}

export const ScrollContent: React.FC<ScrollContentProps> = ({
  children,
  style,
  hasBottomNav = false,
  hasBottomPadding = true,
}) => (
  <View
    style={[
      styles.scrollContent,
      hasBottomPadding && { paddingBottom: hasBottomNav ? spacing.huge : spacing.xxl },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// SECTION - Vertical section with consistent spacing
// ─────────────────────────────────────────────────
interface SectionProps {
  children: React.ReactNode;
  gap?: number;
  marginBottom?: number;
  marginTop?: number;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  children,
  gap = gaps.lg,
  marginBottom = margins.section,
  marginTop = 0,
  style,
}) => (
  <View
    style={[
      {
        gap,
        marginBottom,
        marginTop,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// CARD CONTAINER - Styled card with padding
// ─────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  padded?: boolean;
  shadow?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  padded = true,
  shadow = true,
  backgroundColor = colors.bgCard,
  borderRadius: br = borderRadius.card,
  style,
}) => (
  <View
    style={[
      {
        backgroundColor,
        borderRadius: br,
        padding: padded ? padding.card : 0,
        ...( shadow && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        }),
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// ROW - Horizontal layout with centered items
// ─────────────────────────────────────────────────
interface RowProps {
  children: React.ReactNode;
  spacing?: number;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  style?: ViewStyle;
}

export const Row: React.FC<RowProps> = ({
  children,
  spacing: sp = gaps.md,
  justify = 'flex-start',
  align = 'center',
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: align,
        justifyContent: justify,
        gap: sp,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// COLUMN - Vertical layout
// ─────────────────────────────────────────────────
interface ColumnProps {
  children: React.ReactNode;
  spacing?: number;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  style?: ViewStyle;
}

export const Column: React.FC<ColumnProps> = ({
  children,
  spacing: sp = gaps.md,
  align = 'stretch',
  justify = 'flex-start',
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'column',
        alignItems: align,
        justifyContent: justify,
        gap: sp,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// BUTTON CONTAINER - Consistent button spacing
// ─────────────────────────────────────────────────
interface ButtonContainerProps {
  children: React.ReactNode;
  full?: boolean;
  spacing?: number;
  style?: ViewStyle;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({
  children,
  full = true,
  spacing: sp = gaps.md,
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        gap: sp,
        ...(full && { width: '100%' }),
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// FORM GROUP - Input with label spacing
// ─────────────────────────────────────────────────
interface FormGroupProps {
  children: React.ReactNode;
  spacing?: number;
  style?: ViewStyle;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  spacing: sp = gaps.sm,
  style,
}) => (
  <View
    style={[
      {
        gap: sp,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// HEADER - Consistent header spacing
// ─────────────────────────────────────────────────
interface HeaderProps {
  children: React.ReactNode;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between';
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  children,
  justify = 'space-between',
  style,
}) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: justify,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// DIVIDER - Spacing divider between sections
// ─────────────────────────────────────────────────
interface DividerProps {
  vertical?: boolean;
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  color = colors.border,
  thickness = 1,
  spacing: sp = spacing.md,
  style,
}) => (
  <View
    style={[
      vertical
        ? { width: thickness, height: sp, backgroundColor: color }
        : { height: thickness, width: '100%', backgroundColor: color, marginVertical: sp },
      style,
    ]}
  />
);

// ─────────────────────────────────────────────────
// SPACER - Flexible spacing
// ─────────────────────────────────────────────────
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  flex?: boolean;
  vertical?: boolean;
  style?: ViewStyle;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  flex = false,
  vertical = true,
  style,
}) => {
  const spaceValue = spacing[size];
  return (
    <View
      style={[
        flex ? { flex: 1 } : vertical ? { height: spaceValue } : { width: spaceValue },
        style,
      ]}
    />
  );
};

// ─────────────────────────────────────────────────
// CENTERED CONTAINER - For centering content
// ─────────────────────────────────────────────────
interface CenteredProps {
  children: React.ReactNode;
  flex?: boolean;
  style?: ViewStyle;
}

export const Centered: React.FC<CenteredProps> = ({
  children,
  flex = false,
  style,
}) => (
  <View
    style={[
      {
        alignItems: 'center',
        justifyContent: 'center',
        ...(flex && { flex: 1 }),
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// SAFE AREA VIEW WRAPPER
// ─────────────────────────────────────────────────
interface SafeScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  backgroundColor = colors.bgScreen,
  style,
}) => (
  <View
    style={[
      {
        flex: 1,
        backgroundColor,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// PADDING HELPERS
// ─────────────────────────────────────────────────
interface PaddedProps {
  children: React.ReactNode;
  horizontal?: number;
  vertical?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  style?: ViewStyle;
}

export const Padded: React.FC<PaddedProps> = ({
  children,
  horizontal = padding.screenHorizontal,
  vertical = padding.screenVertical,
  top,
  right,
  bottom,
  left,
  style,
}) => (
  <View
    style={[
      {
        paddingHorizontal: horizontal,
        paddingVertical: vertical,
        paddingTop: top,
        paddingRight: right,
        paddingBottom: bottom,
        paddingLeft: left,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─────────────────────────────────────────────────
// EXPORTS AND REUSABLE STYLES
// ─────────────────────────────────────────────────
export { spacing, padding, gaps, layouts, borderRadius };

// Internal styles
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: padding.screenHorizontal,
    paddingTop: padding.screenVertical,
  },
});

// Constant exports for direct use
export const margins = {
  section: spacing.xxl,
  card: spacing.xl,
  component: spacing.md,
  small: spacing.sm,
};
