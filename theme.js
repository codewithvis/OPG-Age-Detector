export const colors = {
  // Brand - Dental/Medical Blue theme
  primary: '#2563eb',      // Dental blue - professional and trustworthy
  primaryLight: '#3b82f6',
  primaryExtraLight: '#dbeafe',
  primaryAccent: '#1d4ed8',

  // Background
  bgScreen: '#f8fafc',     // Light slate - clean and modern
  bgCard: '#ffffff',
  bgMuted: '#f1f5f9',
  bgInput: '#e2e8f0',

  // Text
  textPrimary: '#0f172a',   // Dark slate - excellent readability
  textSecondary: '#475569', // Slate gray - secondary information
  textMuted: '#94a3b8',     // Light slate - placeholder/disabled text
  textDisabled: '#64748b',
  textPlaceholder: 'rgba(118,118,130,0.6)',

  // Accents - Medical/Dental appropriate
  indigo: '#6366f1',        // For highlights and accents
  indigoDark: '#4f46e5',
  teal: '#0d9488',          // Healthy/green accent for dental health
  tealDark: '#0f766e',
  green: '#10b981',         // Success/positive indicator
  greenBg: '#dcfce7',
  red: '#ef4444',           // Warning/error indicator
  redBg: '#fee2e2',
  yellow: '#f59e0b',        // Caution/warning
  yellowBg: '#fffbeb',
  purple: '#8b5cf6',        // For special features
  purpleBg: '#f5f3ff',

  // Borders
  border: 'rgba(203,213,225,0.2)',   // Slate 200 with opacity
  borderSubtle: 'rgba(203,213,225,0.1)',
  borderStrong: '#cbd5e1',

  // White/overlays
  white: '#ffffff',
  overlayLight: 'rgba(255,255,255,0.05)',
  overlayBlur: 'rgba(248,250,252,0.7)',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#4d55a2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hero: {
    shadowColor: '#4d55a2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  fab: {
    shadowColor: '#4d55a2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: '#4d55a2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
};
