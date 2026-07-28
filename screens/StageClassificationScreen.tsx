import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ReferenceStageImage } from '../components/clinical/ReferenceStageImage';
import { ChevronLeft, Info, CheckCircle2, AlertTriangle, Database, ChevronRight, Eye } from 'lucide-react-native';
import { supabase } from '../services/supabase';

const screenWidth = Dimensions.get('window').width;
const MANDIBULAR_TEETH = [31, 32, 33, 34, 35, 36, 37];
const DEMIRJIAN_STAGES: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H')[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function StageClassificationScreen({ navigation, route }: any) {
  const { aiData, imageUri, patient } = route.params || {};
  const [selectedTooth, setSelectedTooth] = useState(31);
  const [saving, setSaving] = useState(false);
  const [showReference, setShowReference] = useState(true);

  // Initialize classifications from AI data or default to 'G'
  const [classifications, setClassifications] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    MANDIBULAR_TEETH.forEach(t => {
      initial[t] = aiData?.teeth?.[t] || 'G';
    });
    return initial;
  });

  const handleStageSelect = (stage: string) => {
    setClassifications(prev => ({ ...prev, [selectedTooth]: stage }));
  };

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
        analysis: aiData?.analysis || "Clinical assessment completed.",
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

      {/* Dark Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.white} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={28} color={colors.white} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" color={colors.white} bold>Diagnostic Lab</Typography>
        </View>
        <TouchableOpacity onPress={() => setShowReference(!showReference)}>
          <Eye color={showReference ? colors.primaryLight : colors.slateMuted} size={24} />
        </TouchableOpacity>
      </View>

      {/* Patient Indicator */}
      <View style={styles.patientStrip}>
        <View style={styles.activeDot} />
        <Typography variant="label" color={colors.slateMuted} bold style={{ marginRight: spacing.sm }}>ACTIVE CASE:</Typography>
        <Typography variant="bodyMedium" color={colors.white} bold>{patient?.name || 'Anonymous'}</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Tooth Navigator */}
        <View style={styles.navSection}>
           <Typography variant="label" color={colors.primaryLight} bold style={styles.sectionLabel}>
             MANDIBULAR LEFT ARCH (31-37)
           </Typography>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toothScroller}>
             {MANDIBULAR_TEETH.map(t => (
               <TouchableOpacity
                 key={t}
                 style={[styles.toothItem, selectedTooth === t && styles.toothItemActive]}
                 onPress={() => setSelectedTooth(t)}
               >
                 <Typography variant="h3" color={selectedTooth === t ? colors.white : colors.slateMuted} bold>{t}</Typography>
                 <View style={[styles.stageBadge, selectedTooth === t && { backgroundColor: colors.white }]}>
                   <Typography variant="label" color={selectedTooth === t ? colors.primaryDark : colors.slateMuted} bold>
                     {classifications[t]}
                   </Typography>
                 </View>
               </TouchableOpacity>
             ))}
           </ScrollView>
        </View>

        <View style={styles.labLayout}>
          {/* Reference Panel */}
          {showReference && (
            <View style={styles.referencePanel}>
               <ReferenceStageImage stage={classifications[selectedTooth]} />
            </View>
          )}

          {/* Classification Workspace */}
          <Card variant="default" style={styles.workspaceCard}>
            <View style={styles.workspaceHeader}>
              <Typography variant="h3" color={colors.white} bold>Tooth {selectedTooth} Morphology</Typography>
              <View style={styles.aiBadge}>
                <CheckCircle2 color={colors.success} size={14} />
                <Typography variant="label" color={colors.success} bold>AI SUGGESTED</Typography>
              </View>
            </View>

            <View style={styles.stageGrid}>
              {DEMIRJIAN_STAGES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.stageBtn, classifications[selectedTooth] === s && styles.stageBtnActive]}
                  onPress={() => handleStageSelect(s)}
                >
                  <Typography variant="h2" color={classifications[selectedTooth] === s ? colors.white : colors.primaryLight} bold>{s}</Typography>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.morphologyBox}>
               <Typography variant="label" color={colors.primaryLight} bold>MORPHOLOGY NOTES</Typography>
               <Typography variant="bodyMedium" color={colors.slateMuted} style={styles.stageDescription}>
                 {getStageDescription(classifications[selectedTooth])}
               </Typography>
               <Typography variant="bodySmall" color={colors.slateMuted} style={{ marginTop: spacing.sm, fontStyle: 'italic' }}>
                 {getMorphologyFindings(classifications[selectedTooth])}
               </Typography>
            </View>
          </Card>
        </View>

        {/* Disclaimer */}
        <View style={styles.noteBox}>
          <AlertTriangle color={colors.warning} size={20} />
          <Typography variant="bodySmall" color={colors.slateMuted} style={{ flex: 1 }}>
            Forensic standards require visual verification of root apex closure (Stage H) and bifurcation (Stage E/F).
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="Finalize Diagnostic Report"
            onPress={handleSubmit}
            loading={saving}
            icon={<Database size={20} color={colors.white} />}
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
    A: "Cusp tips are mineralized without fusion.",
    B: "Mineralized cusps are united; mature corona is visible.",
    C: "Enamel formation complete at the occlusal surface; dentin initiation.",
    D: "Crown formation complete down to the CEJ.",
    E: "Root length is less than the crown height.",
    F: "Root length is greater than or equal to crown height.",
    G: "Root walls are parallel; apex is still partially open.",
    H: "Apical end of the root canal is completely closed."
  };
  return descriptions[stage] || "";
}

function getMorphologyFindings(stage: string) {
  const findings: Record<string, string> = {
    A: "Finding: No fusion of mineralized points.",
    B: "Finding: Beginning of crown shape definition.",
    C: "Finding: Internal pulp chamber visible.",
    D: "Finding: Pulp chamber floor appearing curved.",
    E: "Finding: Root initiation below the pulp chamber.",
    F: "Finding: Root canals showing 'funnel' shape.",
    G: "Finding: Root walls parallel, apex converging.",
    H: "Finding: Periodontal ligament space uniform."
  };
  return findings[stage] || "";
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
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: spacing.xs,
  },
  patientStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  navSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.md,
    letterSpacing: 1.5,
  },
  toothScroller: {
    flexGrow: 0,
  },
  toothItem: {
    width: 65,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toothItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  stageBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  labLayout: {
    gap: spacing.lg,
  },
  referencePanel: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  workspaceCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  stageBtn: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  stageBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: spacing.xl,
  },
  morphologyBox: {
    gap: spacing.xs,
  },
  stageDescription: {
    lineHeight: 22,
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
  },
});
