import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, shadows, radius } from '../../theme';
import { Typography } from './Typography';
import { LayoutDashboard, Scan, Settings } from 'lucide-react-native';

interface BottomNavProps {
  activeTab: 'Home' | 'Scan' | 'Settings';
  navigation: any;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, navigation }) => {
  const insets = useSafeAreaInsets();
  const tabs = [
    { name: 'Home', icon: LayoutDashboard, label: 'Dashboard' },
    { name: 'Scan', icon: Scan, label: 'Scanner' },
    { name: 'Settings', icon: Settings, label: 'Preferences' },
  ];

  const handlePress = (tabName: string) => {
    if (tabName === activeTab) return;

    if (tabName === 'Home') navigation.navigate('Home');
    else if (tabName === 'Scan') navigation.navigate('XRayAnalysis');
    else if (tabName === 'Settings') navigation.navigate('Settings');
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <Icon
                size={22}
                color={isActive ? colors.primary : colors.slateMuted}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </View>
            <Typography
              variant="label"
              color={isActive ? colors.primary : colors.slateMuted}
              bold={isActive}
            >
              {tab.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    justifyContent: 'space-around',
    ...shadows.lg,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  iconContainer: {
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  iconContainerActive: {
    backgroundColor: colors.primaryExtraLight,
  },
});
