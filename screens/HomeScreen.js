import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator, Alert,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows, fonts } from '../theme';
import { useState } from 'react';

import { openImagePicker } from '../services/expo/imagePicker';
import { sendLocalNotification } from '../services/expo/notifications';
import { useAuth } from '../provider/AuthProvider';
import { useProfile } from '../api/profile';
import { DEFAULT_PROFILE_PHOTO } from '../constants/constants';
import { scale, moderateScale } from '../utils/responsive';
import { 
  FONT_SIZES, 
  CONTAINER_PADDING, 
  HEADER_HEIGHT, 
  ICON_SIZES, 
  BOTTOM_NAV_HEIGHT, 
  FAB_BOTTOM_MARGIN,
  spacing,
  padding,
  gaps,
  borderRadius,
  layouts,
  BUTTON_HEIGHT,
} from '../constants/layout';

const ASSETS = {
  profilePic: require('../assets/images/default_profile_photo.jpg'),
  settingsIcon: require('../assets/icons/settings-icon.png'),
  heroDecor: require('../assets/images/hero-decor.png'),
  uploadIcon: require('../assets/icons/upload-icon.png'),
  analyzeArrow: require('../assets/icons/analyze-arrow.png'),
  patientIcon: require('../assets/icons/patient-icon.png'),
  fabIcon: require('../assets/icons/fab-icon.png'),
  xrayImg: require('../assets/images/opg-sample.jpg'),
  reportIcon: require('../assets/icons/report-icon.png'),
  dashIcon: require('../assets/icons/dashboard-icon.png'),
  assessIcon: require('../assets/icons/assessment-icon.png'),
  settingsNavIcon: require('../assets/icons/settings-nav-icon.png'),
};

const initialPatientData = [
  { id: 1, name: 'Benjamin\nThorne', caseNum: 'Case #8821-DA', chronoAge: '12.4y', dentalAge: '13.1y' },
  { id: 2, name: 'Elara\nVance', caseNum: 'Case #8819-DA', chronoAge: '8.2y', dentalAge: '8.5y' },
  { id: 3, name: 'Julian\nMars', caseNum: 'Case #8815-DA', chronoAge: '10.6y', dentalAge: '10.4y' },
];

const initialActivityData = [
  { id: 'activity-1', name: 'Pan-Radiograph A12', time: 'Last analyzed 12m ago', status: 'PROCESSED' },
];

function PatientCard({ patient, onPress, onDelete }) {
  return (
    <View style={styles.patientCardContainer}>
      <TouchableOpacity style={styles.patientCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.patientLeft}>
          <View style={styles.patientAvatar}>
            <Image source={{ uri: ASSETS.patientIcon }} style={styles.patientAvatarIcon} />
          </View>
          <View>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientCase}>{patient.caseNum}</Text>
          </View>
        </View>
        <View style={styles.patientRight}>
          <View style={styles.ageColumn}>
            <Text style={styles.ageLabel}>CHRONOLOGICAL</Text>
            <Text style={styles.ageValue}>{patient.chronoAge}</Text>
          </View>
          <View style={styles.ageColumn}>
            <Text style={[styles.ageLabel, { color: colors.indigo }]}>DENTAL{'\n'}AGE</Text>
            <Text style={[styles.ageValue, { color: colors.indigoDark }]}>{patient.dentalAge}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState(initialPatientData);
  const [activities, setActivities] = useState(initialActivityData);

  const {session, loading: sessionLoading} = useAuth();
  const {data: profile, error : profileError, loading: profileLoading} = useProfile(session?.user?.id);

  if (profileLoading || sessionLoading){
    return <ActivityIndicator size="large" />;
  }

  // Handle refresh gesture
  const handleRefresh = useCallback(() => {
    // In a real app, this would trigger a data refresh
    // For now, we'll just show a temporary indicator
    console.log('Refreshing dashboard...');
  }, []);

  const handleDeletePatient = (patientId) => {
    setPatients(patients.filter(p => p.id !== patientId));
  };

  const handleDeleteActivity = () => {
    setActivities([]);
  };

  const handleUploadAndAnalyze = async () => {
    try {
      const uri = await openImagePicker();
      if (uri) {
        // Trigger a background notification to simulate the analysis start
        sendLocalNotification("Upload Successful", "The radiograph is queued for Demirjian analysis.");
        navigation?.navigate('XRayAnalysis', { imageUri: uri });
      }
    } catch (error) {
      console.warn('Error picking image:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgScreen} />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.profileBorder}>
            <Image source={ profile?.profile_photo_url ? { uri: profile.profile_photo_url } 
        : DEFAULT_PROFILE_PHOTO } style={styles.profilePic} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || 'Welcome'}</Text>
            <Text style={styles.profileSubtitle}>{profile?.email_id || 'clinician@sanctuary.com'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Image source={{ uri: ASSETS.settingsIcon }} style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeGreeting}>Good morning,</Text>
              <Text style={styles.welcomeName}>{profile?.full_name || 'Dr. Smith'}</Text>
              <Text style={styles.welcomeSubtitle}>
                Ready for today's assessments?
              </Text>
            </View>
            <View style={styles.welcomeIcon}>
              <Image source={require('../assets/images/tooth-icon.png')} style={styles.welcomeImg} />
            </View>
          </View>

          {/* Quick Action Cards */}
          <View style={styles.actionCards}>
            {/* New Assessment Card */}
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('XRayAnalysis')}
            >
              <View style={styles.actionIcon}>
                <Image source={require('../assets/icons/upload-icon.png')} style={styles.actionImg} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>New Assessment</Text>
                <Text style={styles.actionSubtitle}>
                  Start a fresh dental age analysis
                </Text>
              </View>
              <View style={styles.actionArrow}>
                <Text style={styles.actionArrowText}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Recent Assessments Card */}
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => { /* Navigate to assessments list */ }}
            >
              <View style={styles.actionIcon}>
                <Image source={require('../assets/icons/history-icon.png')} style={styles.actionImg} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Recent Assessments</Text>
                <Text style={styles.actionSubtitle}>
                  View your latest analyses
                </Text>
              </View>
              <View style={styles.actionArrow}>
                <Text style={styles.actionArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Assessments ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Assessments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllBtn}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.assessmentsList}>
            {patients.length > 0 ? (
              patients.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  onPress={() => navigation?.navigate('StageClassification')}
                  onDelete={() => handleDeletePatient(p.id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Image source={require('../assets/icons/empty-state.png')} style={styles.emptyStateImg} />
                <Text style={styles.emptyStateText}>No assessments yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start your first analysis to see patient history here
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Recent Activity ── */}
        {activities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={handleDeleteActivity}>
                <Text style={styles.viewAllBtn}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityCard}>
              {/* X-Ray thumbnail */}
              <View style={styles.xrayWrapper}>
                <Image source={{ uri: ASSETS.xrayImg }} style={styles.xrayImg} />
                <View style={styles.xrayInfo}>
                  <View>
                    <Text style={styles.xrayName}>{activities[0].name}</Text>
                    <Text style={styles.xrayTime}>{activities[0].time}</Text>
                  </View>
                  <View style={styles.processedBadge}>
                    <Text style={styles.processedText}>{activities[0].status}</Text>
                  </View>
                </View>
              </View>
              {/* Report line */}
              <View style={styles.reportRow}>
                <Image source={{ uri: ASSETS.reportIcon }} style={styles.reportIcon} />
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>Report Generated</Text>
                  <Text style={styles.reportSub}>Sarah Jenkins · 2h ago</Text>
                </View>
                <TouchableOpacity onPress={handleDeleteActivity} style={styles.deleteActivityIconBtn}>
                  <Text style={styles.deleteActivityIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Bottom padding for FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.88}
        onPress={() => navigation?.navigate('XRayAnalysis')}
      >
        <Image source={{ uri: ASSETS.fabIcon }} style={styles.fabIcon} />
        <Text style={styles.fabText}>Start New Assessment</Text>
      </TouchableOpacity>

      {/* ── Bottom Nav Bar ── */}
      <View style={styles.bottomNav}>
        {[
          { id: 'dashboard', label: 'DASHBOARD', icon: ASSETS.dashIcon },
          { id: 'assessments', label: 'ASSESSMENTS', icon: ASSETS.assessIcon },
          { id: 'settings', label: 'SETTINGS', icon: ASSETS.settingsNavIcon },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navTab, activeTab === tab.id && styles.navTabActive]}
            onPress={() => {
              setActiveTab(tab.id);
              if (tab.id === 'settings') navigation?.navigate('Settings');
            }}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: tab.icon }}
              style={[styles.navIcon, activeTab === tab.id && styles.navIconActive]}
            />
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgScreen },

  // Top Bar
  topBar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: gaps.md },
  profileBorder: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: colors.primaryLight,
    padding: spacing.xs,
    overflow: 'hidden',
  },
  profilePic: { width: '100%', height: '100%', borderRadius: scale(18) },
  profileInfo: { flex: 1, marginLeft: spacing.md },
  profileName: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  profileSubtitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  settingsBtn: { padding: spacing.sm, borderRadius: spacing.xxl },
  settingsIcon: { width: ICON_SIZES.md, height: ICON_SIZES.md, resizeMode: 'contain' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: CONTAINER_PADDING, paddingTop: spacing.lg, paddingBottom: spacing.xxl },

  // Hero Section
  heroSection: { gap: gaps.lg, marginBottom: spacing.xxl },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.hero,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    marginLeft: spacing.lg,
  },
  welcomeImg: {
    width: '100%',
    height: '100%',
  },
  welcomeGreeting: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.9,
  },
  welcomeName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },

  // Quick Action Cards
  actionCards: {
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryExtraLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionImg: {
    width: '100%',
    height: '100%',
    tintColor: colors.primary,
  },
  actionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  actionArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArrowText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },

  // Assessments List
  assessmentsList: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgMuted,
    borderRadius: borderRadius.lg,
  },
  emptyStateImg: {
    width: 60,
    height: 60,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Patient Cards
  patientList: { gap: gaps.md },
  patientCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.card,
  },
  patientLeft: { flexDirection: 'row', alignItems: 'center', gap: gaps.lg },
  patientAvatar: {
    width: scale(36),
    height: scale(48),
    backgroundColor: colors.primaryExtraLight,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarIcon: { width: 16, height: 16, resizeMode: 'contain' },
  patientName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  patientCase: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: colors.textSecondary, marginTop: spacing.xs },
  patientRight: { flexDirection: 'row', gap: spacing.xxxl },
  ageColumn: { alignItems: 'flex-end', gap: spacing.xs },
  ageLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'right',
    lineHeight: 14,
  },
  ageValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },

  // Activity Card
  activityCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.card,
    padding: padding.section,
    gap: gaps.xl,
    ...shadows.card,
  },
  xrayWrapper: { gap: gaps.md },
  xrayImg: {
    width: '100%',
    height: scale(180),
    borderRadius: borderRadius.lg,
    resizeMode: 'cover',
  },
  xrayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xrayName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  xrayTime: { fontSize: 11, fontWeight: '400', color: colors.textSecondary, marginTop: 2 },
  processedBadge: {
    backgroundColor: colors.greenBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  processedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.green,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: gaps.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,197,211,0.1)',
  },
  reportIcon: { width: 26, height: 26, resizeMode: 'contain' },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  reportSub: { fontSize: FONT_SIZES.xs, fontWeight: '400', color: colors.textSecondary, marginTop: spacing.xs },

  // FAB
  fab: {
    position: 'absolute',
    bottom: FAB_BOTTOM_MARGIN,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: gaps.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.avatar,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...shadows.fab,
  },
  fabIcon: { width: ICON_SIZES.sm, height: ICON_SIZES.sm, resizeMode: 'contain', tintColor: colors.white },
  fabText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: colors.white, letterSpacing: -0.4 },

  // Bottom Nav
  bottomNav: {
    height: BOTTOM_NAV_HEIGHT,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: FONT_SIZES.xs, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.3 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },

  // Delete Functionality
  patientCardContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteBtnText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.white,
    textAlign: 'center',
  },
  deleteActivityBtn: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.red,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  deleteActivityIconBtn: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  deleteActivityIcon: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.red,
  },
});