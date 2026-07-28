import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { BottomNav } from '../components/common/BottomNav';
import {
  ChevronLeft,
  User,
  Lock,
  Bell,
  ShieldAlert,
  LogOut,
  Info,
  ChevronRight,
  Stethoscope,
  Building2,
  Globe
} from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../provider/AuthProvider';
import { useProfile } from '../api/profile';
import { DEFAULT_PROFILE_PHOTO } from '../constants/constants';
import { useTranslation } from 'react-i18next';
import '../services/i18n';

const SettingsItem = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
  <TouchableOpacity
    style={styles.item}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.itemLeft}>
      <View style={styles.itemIcon}>
        <Icon size={20} color={colors.primary} />
      </View>
      <Typography variant="bodyLarge">{label}</Typography>
    </View>
    <View style={styles.itemRight}>
      {value && <Typography color={colors.textMuted}>{value}</Typography>}
      {isSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      )}
      {onPress && !isSwitch && <ChevronRight size={20} color={colors.slateMuted} />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const { data: profile } = useProfile(session?.user?.id);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to securely log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.slate} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={28} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" bold>{t('common.settings')}</Typography>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Image
                source={profile?.profile_photo_url ? { uri: profile.profile_photo_url } : DEFAULT_PROFILE_PHOTO}
                style={styles.avatarImg}
              />
            </View>
            <View style={styles.profileInfo}>
              <Typography variant="h3" bold>{profile?.full_name || 'Practitioner'}</Typography>
              <Typography variant="label" color={colors.textMuted}>
                {profile?.role === 'enterprise_admin' ? 'ENTERPRISE ADMIN' : (profile?.license_id || 'ID: 88293-X')}
              </Typography>
              <View style={styles.verifiedBadge}>
                <Typography variant="label" color={colors.primary} bold>VERIFIED</Typography>
              </View>
            </View>
          </View>
        </Card>

        {/* Enterprise Access */}
        {profile?.role === 'enterprise_admin' && (
          <Card variant="elevated" style={{ ...styles.profileCard, backgroundColor: colors.primaryDark }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
              onPress={() => navigation.navigate('EnterpriseAdmin')}
            >
              <Building2 color={colors.white} size={24} />
              <View>
                <Typography variant="bodyLarge" bold color={colors.white}>Enterprise Panel</Typography>
                <Typography variant="label" color={colors.primaryLight}>Manage Clinic Chains</Typography>
              </View>
              <View style={{ flex: 1 }} />
              <ChevronRight color={colors.white} size={20} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Language Selector */}
        <Typography variant="label" color={colors.textMuted} bold style={styles.sectionLabel}>
          LANGUAGE
        </Typography>
        <Card variant="outline" style={styles.sectionCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md }}>
             {languages.map(lang => (
               <TouchableOpacity
                 key={lang.code}
                 style={[styles.langBtn, i18n.language === lang.code && styles.langBtnActive]}
                 onPress={() => i18n.changeLanguage(lang.code)}
               >
                 <Typography
                   color={i18n.language === lang.code ? colors.white : colors.primary}
                   bold={i18n.language === lang.code}
                 >
                   {lang.name}
                 </Typography>
               </TouchableOpacity>
             ))}
          </ScrollView>
        </Card>

        {/* Section: Clinical */}
        <Typography variant="label" color={colors.textMuted} bold style={styles.sectionLabel}>
          CLINICAL
        </Typography>
        <Card variant="outline" style={styles.sectionCard}>
          <SettingsItem
            icon={Stethoscope}
            label="Methodology"
            value="Demirjian"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={Bell}
            label="Analysis Alerts"
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
        </Card>

        {/* Section: Security */}
        <Typography variant="label" color={colors.textMuted} bold style={styles.sectionLabel}>
          SECURITY
        </Typography>
        <Card variant="outline" style={styles.sectionCard}>
          <SettingsItem
            icon={Lock}
            label="Change Password"
            onPress={() => navigation.navigate('ChangePasswordScreen')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={ShieldAlert}
            label="Delete Account"
            onPress={() => navigation.navigate('DeleteAccountScreen')}
          />
        </Card>

        {/* Section: About */}
        <Typography variant="label" color={colors.textMuted} bold style={styles.sectionLabel}>
          ABOUT
        </Typography>
        <Card variant="outline" style={styles.sectionCard}>
          <SettingsItem icon={Info} label="App Version" value="2.0.0 (Enterprise)" />
        </Card>

        <Button
          title="Secure Logout"
          variant="secondary"
          onPress={handleLogout}
          icon={<LogOut size={20} color={colors.primary} />}
          style={styles.logoutBtn}
        />

        <Typography variant="label" color={colors.slateMuted} align="center" style={styles.footer}>
          © 2026 DentAge · Enterprise Clinical Edition
        </Typography>
      </ScrollView>

      <BottomNav activeTab="Settings" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bgSurface,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    marginBottom: spacing.xxl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryExtraLight,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  verifiedBadge: {
    backgroundColor: colors.primaryExtraLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  sectionLabel: {
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  sectionCard: {
    padding: 0,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemIcon: {
    padding: spacing.sm,
    backgroundColor: colors.primaryExtraLight,
    borderRadius: radius.md,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  langBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    backgroundColor: colors.bgScreen,
    borderWidth: 1,
    borderColor: colors.primaryExtraLight,
  },
  langBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  logoutBtn: {
    marginTop: spacing.xl,
  },
  footer: {
    marginTop: spacing.xxxl,
  },
});
