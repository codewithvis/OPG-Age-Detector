/**
 * Responsive Design Utilities for DentAge
 * Provides scaling functions for adaptive UI across all device sizes
 */

import { Dimensions, useWindowDimensions } from 'react-native';

const baseWidth = 390; // Design base width (standard mobile phone)
const baseHeight = 844; // Design base height

/**
 * Scale a value based on device width
 * @param size - The size to scale
 * @returns Scaled value
 */
export const scale = (size: number): number => {
  const { width } = Dimensions.get('window');
  return (width / baseWidth) * size;
};

/**
 * Scale a value based on device height
 * @param size - The size to scale
 * @returns Vertically scaled value
 */
export const verticalScale = (size: number): number => {
  const { height } = Dimensions.get('window');
  return (height / baseHeight) * size;
};

/**
 * Moderate scaling (uses smaller multiplier for padding/margin)
 * Prevents excessive growth on large screens
 * @param size - The size to scale
 * @param factor - Scaling factor (default 0.5)
 * @returns Moderately scaled value
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Get device breakpoint category
 * @returns 'small' | 'medium' | 'large' | 'tablet'
 */
export const useBreakpoint = (): 'small' | 'medium' | 'large' | 'tablet' => {
  const { width } = useWindowDimensions();

  if (width < 380) {
    return 'small';
  } else if (width < 600) {
    return 'medium';
  } else if (width < 768) {
    return 'large';
  } else {
    return 'tablet';
  }
};

/**
 * Get responsive spacing based on device size
 */
export const getResponsiveSpacing = () => {
  const breakpoint = useBreakpoint();

  const baseSpacing = {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
  };

  return baseSpacing;
};

/**
 * Get responsive padding for containers
 */
export const getResponsivePadding = (): number => {
  const { width } = Dimensions.get('window');

  if (width < 380) {
    return moderateScale(12);
  } else if (width < 768) {
    return moderateScale(16);
  } else {
    return moderateScale(24);
  }
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  return moderateScale(baseSize, 0.4);
};

/**
 * Get max width for tablet/large screens
 */
export const getMaxContainerWidth = (): number => {
  const { width } = Dimensions.get('window');
  const breakpoint = useBreakpoint();

  if (breakpoint === 'tablet') {
    return Math.min(width * 0.9, 800);
  }
  return width;
};

/**
 * Get number of columns for grid layouts
 */
export const getColumnCount = (preferredWidth: number): number => {
  const { width } = Dimensions.get('window');
  const availableWidth = width - moderateScale(32);
  return Math.max(1, Math.floor(availableWidth / preferredWidth));
};

/**
 * Hook for responsive dimensions
 */
export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();
  const breakpoint = useBreakpoint();

  return {
    width,
    height,
    breakpoint,
    isTablet: breakpoint === 'tablet',
    isLarge: breakpoint === 'large' || breakpoint === 'tablet',
    isSmall: breakpoint === 'small',
    isPortrait: height > width,
    isLandscape: width > height,
  };
};
