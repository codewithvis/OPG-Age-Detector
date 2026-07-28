import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { BottomNav } from '../components/common/BottomNav';
import {
  ChevronLeft,
  Share2,
  FileDown,
  User,
  CheckCircle2
} from 'lucide-react-native';
import { generateClinicalReport } from '../services/reporting';
import { useStore } from '../store/useStore';

const { width } = Dimensions.get('window');

export default function ResultsDashboardScreen({ route, navigation }: any) {
  const { analysisData, imageUri } = route.params || {};
  const { user } = useStore();
  const [exporting, setExporting] = useState(false);

  // Mock data if no data passed
  const analysis = analysisData || {
    patientName: "Benjamin Thorne",
    caseId: "8821-DA",
    dental_age: 13.1,
    chronologicalAge: 12.4,
    maturityScore: 92.4,
    confidence: 0.98,
    ageRange: "12.8 - 13.5",
    date: "July 25, 2026",
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generateClinicalReport({
        patientName: analysis.patientName || 'Unknown Patient',
        caseId: analysis.case_id || analysis.caseId,
        date: new Date().toLocaleDateString(),
        dob: analysis.dob || 'N/A',
        chronoAge: analysis.chronologicalAge || '12.4',
        dentalAge: analysis.dental_age,
        maturityScore: Math.round(analysis.maturity_score || analysis.maturityScore),
        ageRange: analysis.age_range || analysis.ageRange,
        toothStages: JSON.parse(analysis.tooth_development_stage || '{}'),
        imageUri: imageUri || analysis.image_url || '',
        practitionerName: user?.full_name || 'Practitioner',
        licenseId: user?.license_id || 'N/A',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to generate clinical PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <ChevronLeft color={colors.slate} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={28} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" bold>Clinical Report</Typography>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Share2 size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Patient Summary Header */}
        <View style={styles.patientHeader}>
          <View style={styles.avatar}>
            <User color={colors.primary} size={32} />
          </View>
          <View>
            <Typography variant="h2" bold>{analysis.patientName || 'Unknown Patient'}</Typography>
            <Typography variant="label" color={colors.textMuted}>CASE #{analysis.case_id || analysis.caseId} • {analysis.date || 'Today'}</Typography>
          </View>
        </View>

        {/* Main Result Card */}
        <Card variant="elevated" style={styles.resultMainCard}>
          <View style={styles.resultScoreContainer}>
            <View style={styles.scoreCircle}>
              <Typography variant="h1" color={colors.primary} style={styles.scoreText}>{analysis.dental_age}</Typography>
              <Typography variant="label" color={colors.primaryLight} bold>YEARS</Typography>
            </View>
            <View style={styles.resultLabels}>
              <Typography variant="h3" bold>Estimated Dental Age</Typography>
              <View style={styles.confidenceBadge}>
                <CheckCircle2 size={14} color={colors.success} />
                <Typography variant="label" color={colors.success} bold>
                  {Math.round(analysis.ai_confidence * 100 || analysis.confidence * 100)}% CONFIDENCE
                </Typography>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Typography variant="label" color={colors.textMuted}>CHRONO. AGE</Typography>
              <Typography variant="h3" bold>{analysis.chronologicalAge || '12.4'}y</Typography>
            </View>
            <View style={styles.metricItem}>
              <Typography variant="label" color={colors.textMuted}>MATURITY</Typography>
              <Typography variant="h3" bold color={colors.primary}>{Math.round(analysis.maturity_score || analysis.maturityScore)}%</Typography>
            </View>
            <View style={styles.metricItem}>
              <Typography variant="label" color={colors.textMuted}>AGE RANGE</Typography>
              <Typography variant="h3" bold>{analysis.age_range || analysis.ageRange}</Typography>
            </View>
          </View>
        </Card>

        {/* Development Comparison */}
        <View style={styles.section}>
          <Typography variant="h3" bold style={styles.sectionTitle}>Mandibular Development (ISO)</Typography>
          <Card variant="outline" style={styles.toothSummaryCard}>
            <View style={styles.toothGrid}>
              {Object.entries(JSON.parse(analysis.tooth_development_stage || '{}')).map(([tooth, stage]: any) => (
                <View key={tooth} style={styles.toothSummaryItem}>
                  <Typography variant="label" color={colors.textMuted}>{tooth}</Typography>
                  <Typography variant="h3" color={colors.primary} bold>{stage}</Typography>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Chrono vs Dental Comparison */}
        <View style={styles.section}>
          <Typography variant="h3" bold style={styles.sectionTitle}>Development Comparison</Typography>
          <Card variant="outline" style={styles.comparisonCard}>
            <View style={styles.timelineRow}>
              <View style={styles.timelinePoint}>
                <Typography variant="label" color={colors.textMuted}>CHRONO</Typography>
                <View style={[styles.dot, { backgroundColor: colors.slateLight }]} />
                <Typography variant="bodyLarge" bold>{analysis.chronologicalAge || '12.4'}</Typography>
              </View>
              <View style={styles.timelineLine}>
                 <View style={styles.timelineDiff}>
                   <Typography variant="label" color={colors.error} bold>+0.7y</Typography>
                 </View>
              </View>
              <View style={styles.timelinePoint}>
                <Typography variant="label" color={colors.primary}>DENTAL</Typography>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Typography variant="bodyLarge" bold color={colors.primary}>{analysis.dental_age}</Typography>
              </View>
            </View>
            <Typography variant="bodyMedium" color={colors.textSecondary} style={styles.clinicalNote}>
              Dental development is accelerated compared to chronological age. Suggests slightly advanced skeletal maturity.
            </Typography>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.footerActions}>
          <Button
            title="Export Professional PDF"
            onPress={handleExportPDF}
            loading={exporting}
            icon={<FileDown size={20} color={colors.textOnPrimary} />}
            style={styles.exportBtn}
          />
          <Button
            title="Done"
            variant="outline"
            onPress={() => navigation.navigate('Home')}
            style={styles.doneBtn}
          />
        </View>
      </ScrollView>

      <BottomNav activeTab="Home" navigation={navigation} />
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
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: spacing.sm,
    backgroundColor: colors.primaryExtraLight,
    borderRadius: radius.md,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultMainCard: {
    padding: spacing.xl,
  },
  resultScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 36,
    lineHeight: 40,
  },
  resultLabels: {
    flex: 1,
    gap: spacing.xs,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  comparisonCard: {
    padding: spacing.xl,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  timelinePoint: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDiff: {
    position: 'absolute',
    top: -24,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  clinicalNote: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  toothSummaryCard: {
    padding: spacing.md,
  },
  toothGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  toothSummaryItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 40,
  },
  footerActions: {
    marginTop: spacing.xxxl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  exportBtn: {
    paddingVertical: spacing.xl,
  },
  doneBtn: {
    paddingVertical: spacing.xl,
  },
});
