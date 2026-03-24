import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { colors, radius, shadows } from '../theme';

const PROFILE_IMG = 'https://www.figma.com/api/mcp/asset/c0ea0520-82ae-49f1-b629-baa5bff5e830';
const SHARE_ICON = 'https://www.figma.com/api/mcp/asset/61719cfc-29ee-4e38-a422-1c5d6a967389';

function CircularProgress({ percentage, label, value }) {
  const radius_val = 50;
  const circumference = 2 * Math.PI * radius_val;
  const filled = (percentage / 100) * circumference;

  return (
    <View style={cpStyles.container}>
      <View style={cpStyles.circleWrapper}>
        {/* Background ring */}
        <View style={cpStyles.ringBg} />
        {/* Value text */}
        <View style={cpStyles.valueContainer}>
          <Text style={cpStyles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const cpStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  circleWrapper: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 10,
    borderColor: colors.primaryExtraLight,
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  value: { fontSize: 24, fontWeight: '700', color: colors.white },
});

export default function ResultsDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgScreen} />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.profileBorder}>
            <Image source={{ uri: PROFILE_IMG }} style={styles.profilePic} />
          </View>
          <Text style={styles.topTitle}>Dental Age Report</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <Image source={{ uri: SHARE_ICON }} style={styles.shareIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Bento Grid Hero ── */}

        {/* Maturity Score Card */}
        <View style={styles.maturityCard}>
          <Text style={styles.maturityLabel}>Skeletal Maturity Score</Text>
          <View style={styles.maturityCircle}>
            <CircularProgress percentage={75} value="E" />
          </View>
          <Text style={styles.maturitySub}>Demirjian Stage · Moderate Maturity</Text>
        </View>

        {/* Age Comparison Card */}
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonTop}>
            <View style={styles.comparisonLeft}>
              <Text style={styles.comparisonTitle}>Age{'\n'}Analysis</Text>
              <Text style={styles.comparisonSub}>
                Benjamin{'\n'}Thorne
              </Text>
            </View>
            <View style={styles.deltaCard}>
              <Text style={styles.deltaIcon}>↑</Text>
              <Text style={styles.deltaValue}>+1.2y</Text>
              <Text style={styles.deltaLabel}>Delta</Text>
            </View>
          </View>

          {/* Progress Bars */}
          <View style={styles.ageRows}>
            {/* Estimated Dental Age */}
            <View style={styles.ageRow}>
              <View style={styles.ageRowHeader}>
                <View style={styles.ageRowLeft}>
                  <Text style={styles.dotIndigo}>●</Text>
                  <Text style={styles.ageRowLabel}>Estimated Dental Age</Text>
                </View>
                <Text style={styles.ageRowValue}>13.6 yrs</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: '87%', backgroundColor: colors.indigo }]} />
              </View>
            </View>

            {/* Chronological Age */}
            <View style={styles.ageRow}>
              <View style={styles.ageRowHeader}>
                <View style={styles.ageRowLeft}>
                  <Text style={styles.dotGray}>●</Text>
                  <Text style={styles.ageRowLabel}>Chronological Age</Text>
                </View>
                <Text style={styles.ageRowValue}>12.4 yrs</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: '77%', backgroundColor: colors.textMuted }]} />
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.indigo }]} />
              <Text style={styles.legendLabel}>Dental Age</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
              <Text style={styles.legendLabel}>Chronological Age</Text>
            </View>
          </View>
        </View>

        {/* ── Secondary Insights ── */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>🧠</Text>
            <Text style={styles.insightTitle}>Clinical Interpretation</Text>
          </View>
          <Text style={styles.insightBody}>
            The patient exhibits an advanced dental development relative to their 
            chronological age (+1.2 years). This acceleration is consistent with 
            normal physiological variation in early adolescence. No immediate 
            orthodontic intervention is suggested based on maturity alone.
          </Text>
        </View>

        {/* Dental Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>🦷</Text>
            <Text style={styles.insightTitle}>Dental Information</Text>
          </View>
          <View style={styles.infoList}>
            {[
              { label: 'Assessment Tooth', value: 'Tooth 36', highlight: true },
              { label: 'Radiograph Type', value: 'OPG Panoramic' },
              { label: 'Classification Method', value: 'Demirjian' },
            ].map((item) => (
              <View key={item.label} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <View style={[styles.infoValueContainer, item.highlight && styles.infoValueHighlight]}>
                  <Text style={[styles.infoValue, item.highlight && styles.infoValueHighlightText]}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚠</Text>
          <Text style={styles.disclaimerText}>
            This report is generated as a clinical support tool and should not 
            replace the professional judgment of a qualified dental practitioner. 
            Age estimation from dental development carries inherent biological 
            variation of ±1.2 years.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {['Dashboard', 'Assessments', 'Settings'].map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={styles.navTab}
            onPress={() => {
              if (tab === 'Dashboard') navigation?.navigate('Home');
              if (tab === 'Settings') navigation?.navigate('Settings');
            }}
          >
            <Text style={[styles.navLabel, i === 1 && styles.navLabelActive]}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgScreen },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16 },

  // Top Bar
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    padding: 2,
    overflow: 'hidden',
  },
  profilePic: { width: '100%', height: '100%', borderRadius: 18 },
  topTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  shareBtn: { padding: 8, borderRadius: 20, backgroundColor: colors.bgCard, ...shadows.card },
  shareIcon: { width: 20, height: 20, resizeMode: 'contain' },

  // Maturity Score
  maturityCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.hero,
  },
  maturityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  maturityCircle: { marginBottom: 16 },
  maturitySub: { fontSize: 14, fontWeight: '400', color: 'rgba(255,255,255,0.7)', marginTop: 8 },

  // Comparison Card
  comparisonCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 32,
    marginBottom: 16,
    ...shadows.card,
    gap: 24,
  },
  comparisonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  comparisonLeft: { gap: 8 },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  comparisonSub: { fontSize: 15, fontWeight: '400', color: colors.textSecondary, lineHeight: 20 },
  deltaCard: {
    backgroundColor: colors.primaryExtraLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    width: 100,
  },
  deltaIcon: { fontSize: 12, color: colors.primary },
  deltaValue: { fontSize: 22, fontWeight: '700', color: colors.primary, letterSpacing: -0.5 },
  deltaLabel: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },

  ageRows: { gap: 12 },
  ageRow: { gap: 8 },
  ageRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ageRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotIndigo: { fontSize: 12, color: colors.indigo },
  dotGray: { fontSize: 12, color: colors.textMuted },
  ageRowLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  ageRowValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  progressBg: {
    height: 12,
    backgroundColor: colors.bgMuted,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 6 },

  legend: { flexDirection: 'row', gap: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: colors.textSecondary },

  // Insight Card
  insightCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 25,
    marginBottom: 16,
    gap: 12,
    ...shadows.card,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightIcon: { fontSize: 18 },
  insightTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  insightBody: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 25,
    marginBottom: 16,
    gap: 12,
    ...shadows.card,
  },
  infoList: { gap: 12 },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  infoValueContainer: {
    backgroundColor: colors.bgMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  infoValueHighlight: { backgroundColor: colors.primaryExtraLight },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  infoValueHighlightText: { color: colors.primary },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 20,
    marginBottom: 16,
  },
  disclaimerIcon: { fontSize: 16, color: '#d97706' },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#92400e',
    lineHeight: 18,
  },

  // Bottom Nav
  bottomNav: {
    height: 64,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { fontSize: 10, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.3 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
});
