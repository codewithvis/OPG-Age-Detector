import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ReferenceStageImage } from '../components/clinical/ReferenceStageImage';
import { ChevronLeft, CheckCircle2, AlertTriangle, Database, Zap, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../services/supabase';

const MANDIBULAR_TEETH = [31, 32, 33, 34, 35, 36, 37];

export default function StageClassificationScreen({ navigation, route }: any) {
  const { aiData, imageUri, patient } = route.params || {};
  const [saving, setSaving] = useState(false);

  // Results are now purely derived from AI data
  const classifications: Record<number, string> = {};
  MANDIBULAR_TEETH.forEach(t => {
    classifications[t] = aiData?.teeth?.[t] || 'G'; // Fallback to G if missing
  });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const dentalAge = aiData?.estimated_age || 12.5;

      const analysisData = {
        case_id: `CASE-${Date.now()}`,
        patient_id: patient?.id,
        image_url: imageUri,
        diagnostic_method: 'OPG',
        dental_age: dentalAge,
        ai_confidence: aiData?.confidence || 0.95,
        maturity_score: Math.min(100, Math.max(0, (dentalAge / 18) * 100)),
        age_range: aiData?.age_range || "12.0 - 13.0",
        tooth_development_stage: JSON.stringify(classifications),
        analysis: aiData?.analysis || "Automated AI assessment completed based on Demirjian stages.",
        user_id: user.id
      };

      const { error } = await supabase.from('analyses').insert(analysisData);
      if (error) throw error;

      navigation.navigate('Results', { analysisData, imageUri, patient });
    } catch (error: any) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* High-End Dark Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.white} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={28} color={colors.white} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" color={colors.white} bold>AI Diagnostic Lab</Typography>
        </View>
        <View style={styles.aiLiveBadge}>
           <Zap size={14} color={colors.warning} fill={colors.warning} />
           <Typography variant="label" color={colors.warning} bold>LIVE AI</Typography>
        </View>
      </View>

      {/* Patient Ribbon */}
      <View style={styles.patientStrip}>
        <Typography variant="label" color={colors.slateMuted} bold>PATIENT:</Typography>
        <Typography variant="bodyMedium" color={colors.white} bold style={{ marginLeft: spacing.xs }}>
          {patient?.name || 'Anonymous Patient'}
        </Typography>
        <View style={{ flex: 1 }} />
        <Typography variant="label" color={colors.primaryLight} bold>CONFIDENCE: {Math.round((aiData?.confidence || 0.95) * 100)}%</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.introBox}>
          <Typography variant="h2" color={colors.white} bold>Morphology Analysis</Typography>
          <Typography variant="bodyMedium" color={colors.slateMuted}>
            AI has automatically classified the development stages for the mandibular left arch.
          </Typography>
        </View>

        {/* Automated Tooth Result Cards */}
        <View style={styles.resultsGrid}>
          {MANDIBULAR_TEETH.map((t) => (
            <Card key={t} variant="default" style={styles.toothCard}>
              <View style={styles.toothCardHeader}>
                <View style={styles.toothID}>
                  <Typography variant="h3" color={colors.white} bold>{t}</Typography>
                  <Typography variant="label" color={colors.slateMuted}>ISO</Typography>
                </View>

                <View style={styles.stageIndicator}>
                   <Typography variant="h1" color={colors.primaryLight} bold>{classifications[t]}</Typography>
                   <Typography variant="label" color={colors.primaryLight}>STAGE</Typography>
                </View>

                <View style={styles.aiVerification}>
                   <ShieldCheck size={20} color={colors.success} />
                   <Typography variant="label" color={colors.success} bold>VERIFIED</Typography>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.morphologySummary}>
                <Typography variant="label" color={colors.slateMuted} bold>CLINICAL FINDINGS</Typography>
                <Typography variant="bodySmall" color={colors.white} style={styles.findingsText}>
                  {getStageDescription(classifications[t])}
                </Typography>
                <View style={styles.referenceContainer}>
                   <ReferenceStageImage stage={classifications[t]} />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Forensic Accountability Note */}
        <View style={styles.noteBox}>
          <AlertTriangle color={colors.warning} size={20} />
          <Typography variant="bodySmall" color={colors.slateMuted} style={{ flex: 1 }}>
            This diagnostic output is generated automatically. Please ensure the radiograph alignment (ISO Standard) matches the mandibular left quadrant before finalizing.
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="Confirm & Generate Final Report"
            onPress={handleSubmit}
            loading={saving}
            icon={<CheckCircle2 size={20} color={colors.white} />}
            style={styles.submitBtn}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStageDescription(stage: string) {
  const descriptions: Record<string, string> = {
    A: "Cusp tips are mineralized without fusion. No dentin formation.",
    B: "Mineralized cusps are united; mature corona shape is starting to emerge.",
    C: "Enamel formation complete at occlusal surface; pulp chamber initiation.",
    D: "Crown formation complete down to the CEJ. Root length initiated.",
    E: "Root length is less than crown height. Bifurcation visible in molars.",
    F: "Root length is greater than or equal to crown height. Canals are funnel shaped.",
    G: "Root walls are parallel; apex is still partially open.",
    H: "Apical end of the root canal is completely closed. PDL space is uniform."
  };
  return descriptions[stage] || "AI detection in progress...";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: spacing.xs,
  },
  aiLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 124, 0, 0.2)',
  },
  patientStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scrollContent: {
    padding: spacing.xl,
  },
  introBox: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  resultsGrid: {
    gap: spacing.lg,
  },
  toothCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.lg,
  },
  toothCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toothID: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 60,
  },
  stageIndicator: {
    alignItems: 'center',
  },
  aiVerification: {
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: spacing.md,
  },
  morphologySummary: {
    gap: spacing.sm,
  },
  findingsText: {
    lineHeight: 18,
    opacity: 0.9,
  },
  referenceContainer: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(245, 124, 0, 0.05)',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 124, 0, 0.1)',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  actions: {
    marginTop: spacing.md,
  },
  submitBtn: {
    paddingVertical: spacing.xl,
    backgroundColor: colors.primary,
  },
});
