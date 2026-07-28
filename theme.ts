/**
 * DentAge 2.0 - Design System
 * Theme: Clinical Mint & Slate
 */

export const colors = {
  // Brand & Primary (Clinical Teal/Mint)
  primary: '#00796B',
  primaryDark: '#004D40',
  primaryLight: '#4DB6AC',
  primaryExtraLight: '#E0F2F1',

  // Neutral / Slate
  slate: '#263238',
  slateLight: '#455A64',
  slateMuted: '#90A4AE',

  // Feedback
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#D32F2F',
  info: '#0288D1',

  // Backgrounds
  bgScreen: '#F5F7F8',
  bgCard: '#FFFFFF',
  bgSurface: '#FFFFFF',

  // Text
  textPrimary: '#1A1C1E',
  textSecondary: '#42474E',
  textMuted: '#72777F',
  textOnPrimary: '#FFFFFF',

  // Decorative
  border: '#DDE3EA',
  divider: '#E1E2E5',
  glass: 'rgba(255, 255, 255, 0.7)',
  white: '#FFFFFF',
};

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
};
