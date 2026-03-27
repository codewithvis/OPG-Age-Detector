/**
 * RESPONSIVE IMPLEMENTATION TEMPLATE
 * 
 * Use this template to quickly refactor remaining screens (XRayAnalysisScreen, 
 * StageClassificationScreen, ResultsDashboardScreen) to be fully responsive.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { colors, radius, shadows } from '../theme';

// 🔥 STEP 1: Import responsive utilities and constants
import { scale, moderateScale } from '../utils/responsive';
import { 
  FONT_SIZES, 
  CONTAINER_PADDING, 
  HEADER_HEIGHT,
  ICON_SIZES,
  BOTTOM_NAV_HEIGHT,
} from '../constants/layout';

// Example screen component
export default function ExampleScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screen Title</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={{ uri: 'https://...' }} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Card Title</Text>
          <Text style={styles.cardBody}>Card content goes here</Text>
        </View>
      </View>

      <View style={styles.bottomNav}>
        {/* Navigation items */}
      </View>
    </SafeAreaView>
  );
}

// 🔥 STEP 2: Replace all hardcoded values in StyleSheet
const styles = StyleSheet.create({
  // ──────────────────────────────────────────
  // CONTAINERS & LAYOUT
  // ──────────────────────────────────────────
  
  safe: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },

  header: {
    height: HEADER_HEIGHT,  // ✅ Instead of: height: 64
    paddingHorizontal: CONTAINER_PADDING,  // ✅ Instead of: paddingHorizontal: 16
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    paddingHorizontal: CONTAINER_PADDING,  // ✅ Responsive padding
    paddingVertical: moderateScale(16),    // ✅ Responsive margin
  },

  // ──────────────────────────────────────────
  // CARDS & COMPONENTS
  // ──────────────────────────────────────────

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: moderateScale(16),  // ✅ Responsive border radius
    padding: moderateScale(24),       // ✅ Responsive padding
    marginBottom: moderateScale(16),  // ✅ Responsive gaps
    ...shadows.card,
  },

  cardImage: {
    width: '100%',              // ✅ Percentage-based width
    height: scale(200),         // ✅ Height scales with screen
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(16),
  },

  // ──────────────────────────────────────────
  // TYPOGRAPHY
  // ──────────────────────────────────────────

  headerTitle: {
    fontSize: FONT_SIZES.xxl,     // ✅ Responsive font size
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  cardTitle: {
    fontSize: FONT_SIZES.lg,       // ✅ Instead of: fontSize: 18
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: moderateScale(8),
  },

  cardBody: {
    fontSize: FONT_SIZES.base,     // ✅ Instead of: fontSize: 16
    color: colors.textSecondary,
    lineHeight: FONT_SIZES.base * 1.5,  // ✅ Responsive line height
  },

  // ──────────────────────────────────────────
  // ICONS & IMAGES
  // ──────────────────────────────────────────

  icon: {
    width: ICON_SIZES.md,     // ✅ Instead of: width: 24
    height: ICON_SIZES.md,    // ✅ Instead of: height: 24
    resizeMode: 'contain',
  },

  largeIcon: {
    width: ICON_SIZES.lg,     // ✅ Instead of: width: 32
    height: ICON_SIZES.lg,
    resizeMode: 'contain',
  },

  // ──────────────────────────────────────────
  // BOTTOM NAVIGATION
  // ──────────────────────────────────────────

  bottomNav: {
    height: BOTTOM_NAV_HEIGHT,  // ✅ Responsive nav height
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * ═══════════════════════════════════════════════════════════════
 * QUICK REFACTORING CHECKLIST
 * ═══════════════════════════════════════════════════════════════
 */

/*
✅ IMPORTS
  □ import { scale, moderateScale } from '../utils/responsive'
  □ import { FONT_SIZES, CONTAINER_PADDING, ... } from '../constants/layout'

✅ FIXED DIMENSIONS (Replace all hardcoded pixel values)
  □ Padding/Margins:     Use moderateScale() or CONTAINER_PADDING
  □ Font sizes:          Use FONT_SIZES const or getResponsiveFontSize()
  □ Icon sizes:          Use ICON_SIZES const or scale()
  □ Border radius:       Use moderateScale(value)
  □ Component heights:   Use scale() or predefined constants
  □ Component widths:    Use percentages (90%, 100%) or flex

✅ LAYOUT OPTIMIZATION
  □ Use flex: 1 for flexible containers
  □ Use width: '90%' instead of fixed pixels
  □ Ensure proper flexDirection for orientation
  □ Use flexGrow/flexShrink for equal distribution

✅ TYPOGRAPHY
  □ All fontSize: Use FONT_SIZES constants
  □ lineHeight: Set to fontSize * 1.5 (or appropriate ratio)
  □ letterSpacing: Keep relative to font size
  □ Avoid hardcoded line heights

✅ SPACING (Gaps, Margins, Padding)
  □ Use moderateScale() for consistent scaling
  □ Use CONTAINER_PADDING for outer margins
  □ Use consistent gap values between elements
  □ Test spacing on different screen sizes

✅ NAVIGATION
  □ Use HEADER_HEIGHT for top bar
  □ Use BOTTOM_NAV_HEIGHT for bottom nav
  □ Ensure consistent heights across all screens

✅ IMAGES & ICONS
  □ Use percentage width for full-bleed images
  □ Use scale() for fixed-size icons
  □ Test images on tablets (may need aspect ratio constraints)

✅ SAFE AREAS
  □ Wrap screens with SafeAreaView
  □ Account for notches and system UI

✅ TESTING
  □ Test on small phones (320px wide)
  □ Test on standard phones (390px)
  □ Test on large phones (500px+)
  □ Test on tablets (800px+)
  □ Test in both portrait and landscape
  □ Verify text readability
  □ Ensure touch targets are ≥44pt
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * COMMON PATTERNS
 * ═══════════════════════════════════════════════════════════════
 */

// Pattern 1: Responsive Card
const responsiveCard = {
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    marginHorizontal: CONTAINER_PADDING,
    marginVertical: moderateScale(12),
    ...shadows.card,
  },
};

// Pattern 2: Responsive Button
const responsiveButton = {
  button: {
    height: scale(56),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
};

// Pattern 3: Responsive Grid
const responsiveGrid = {
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CONTAINER_PADDING,
    gap: moderateScale(12),
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
  },
};

// Pattern 4: Responsive List Item
const responsiveListItem = {
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: moderateScale(16),
  },
  listItemIcon: {
    width: ICON_SIZES.md,
    height: ICON_SIZES.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
    marginTop: moderateScale(4),
  },
};

/**
 * ═══════════════════════════════════════════════════════════════
 * ANTI-PATTERNS (Don't do this!)
 * ═══════════════════════════════════════════════════════════════
 */

const antiPatterns = {
  // ❌ DON'T: Hardcoded dimensions
  BAD_1: {
    width: 300,
    height: 200,
    paddingHorizontal: 16,
  },

  // ✅ DO: Responsive dimensions
  GOOD_1: {
    width: '90%',
    height: scale(200),
    paddingHorizontal: CONTAINER_PADDING,
  },

  // ❌ DON'T: Fixed font sizes
  BAD_2: {
    fontSize: 18,
    lineHeight: 24,
  },

  // ✅ DO: Responsive typography
  GOOD_2: {
    fontSize: FONT_SIZES.lg,
    lineHeight: FONT_SIZES.lg * 1.33,
  },

  // ❌ DON'T: Device-specific hacks
  BAD_3: {
    marginTop: Platform.OS === 'android' ? 20 : 10,
  },

  // ✅ DO: Unified scaling
  GOOD_3: {
    marginTop: moderateScale(16),
  },
};

export { antiPatterns, responsiveCard, responsiveButton, responsiveGrid };
