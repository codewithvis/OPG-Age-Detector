import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../theme';
import { supabase } from '../services/supabase';
import { useAssessment } from '../provider/AssessmentProvider';
import { scale } from '../utils/responsive';
import {
  FONT_SIZES,
  CONTAINER_PADDING,
  spacing,
  padding,
  gaps,
  borderRadius,
} from '../constants/layout';

const XRAY_IMG = 'https://www.figma.com/api/mcp/asset/c494860f-8dca-4cf4-bba5-56f6cc881bac';
const STAGES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const STAGE_DESCRIPTIONS = {
  A: 'No mineralization visible',
  B: 'Initial mineralization only',
  C: 'Crown 1/3 complete',
  D: 'Crown 2/3 complete',
  E: 'Crown complete, root initiation',
  F: 'Root 1/3 formed',
  G: 'Root 2/3 formed',
  H: 'Root complete, apex open',
};

const TOOTH_INFO = {
  '31': { name: 'Lower Left Central Incisor', position: 'Mandibular Left 1' },
  '32': { name: 'Lower Left Lateral Incisor', position: 'Mandibular Left 2' },
  '33': { name: 'Lower Left Canine', position: 'Mandibular Left 3' },
  '34': { name: 'Lower Left First Premolar', position: 'Mandibular Left 4' },
  '35': { name: 'Lower Left Second Premolar', position: 'Mandibular Left 5' },
  '36': { name: 'Lower Left First Molar', position: 'Mandibular Left 6' },
  '37': { name: 'Lower Left Second Molar', position: 'Mandibular Left 7' },
};

const TEETH = ['31', '32', '33', '34', '35', '36', '37'];

export default function StageClassificationScreen({ navigation, route }) {
  const assessment = useAssessment();
  const [currentToothIndex, setCurrentToothIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Guard: Validate that we have required data
  useEffect(() => {
    if (!assessment.isOgpUploaded()) {
      Alert.alert(
        'Assessment Invalid',
        'OPG image is required. Please upload an image first.',
        [{ text: 'Go Back', onPress: () => navigation?.goBack() }]
      );
      return;
    }

    if (!assessment.isGenderSelected()) {
      Alert.alert(
        'Gender Required',
        'Patient gender must be selected before stage classification.',
        [{ text: 'Go Back', onPress: () => navigation?.goBack() }]
      );
      return;
    }
  }, []);

  const currentTooth = TEETH[currentToothIndex];
  const currentStage = assessment.state.toothStages[currentTooth];
  const allStagesSelected = assessment.areAllStagesSelected();

  const handleStageSelect = (stage) => {
    assessment.setToothStage(currentTooth, stage);
  };

  const handleNext = () => {
    if (currentToothIndex < TEETH.length - 1) {
      setCurrentToothIndex(currentToothIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentToothIndex > 0) {
      setCurrentToothIndex(currentToothIndex - 1);
    }
  };

  const handleCalculate = async () => {
    // Final validation
    const validationError = assessment.validateBeforeAnalysis();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setSaving(true);
    assessment.setLoading(true);
    try {
      // Call Supabase Edge Function for calculation
      const { data, error } = await supabase.functions.invoke('calculateDentalAge', {
        body: {
          gender: assessment.state.gender,
          stages: assessment.state.toothStages,
          patient_id: assessment.state.patientId || 'anonymous',
        },
      });

      if (error || !data) {
        throw new Error(error?.message || 'Calculation failed');
      }

      // Validate response structure
      if (!data.dental_age || data.maturity_score === undefined) {
        throw new Error('Invalid response from calculation service');
      }

      assessment.setAnalysisResult(
        data.maturity_score,
        data.dental_age,
        data.patient_id
      );
      assessment.markStepComplete('stages');

      // Navigate to results
      navigation?.navigate('Results', {
        analysisData: {
          patient_id: data.patient_id,
          stages: assessment.state.toothStages,
          maturity_score: data.maturity_score,
          dental_age: data.dental_age,
        },
        imageUri: assessment.state.ogpImageUri,
      });
    } catch (err) {
      console.error('Error calculating dental age:', err);
      assessment.setError(err.message || 'Failed to calculate dental age');
      Alert.alert('Error', err.message || 'Failed to calculate dental age');
    } finally {
      setSaving(false);
      assessment.setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgScreen} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Stage Classification</Text>
          <Text style={styles.headerSub}>
            {currentToothIndex + 1} of {TEETH.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentToothIndex + 1) / TEETH.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentToothIndex + 1} / {TEETH.length}
          </Text>
        </View>

        {/* Current Tooth Info */}
        <View style={styles.toothCard}>
          <View style={styles.toothLabel}>
            <Text style={styles.toothNumber}>Tooth {currentTooth}</Text>
            <Text style={styles.toothName}>
              {TOOTH_INFO[currentTooth]?.name}
            </Text>
          </View>

          {/* X-Ray Preview */}
          <View style={styles.xrayPreview}>
            <Image source={{ uri: XRAY_IMG }} style={styles.xrayImg} />
            <View style={styles.xrayOverlay}>
              <Text style={styles.xrayText}>{currentTooth}</Text>
            </View>
          </View>

          {/* Stage Selection */}
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>Select Demirjian Stage</Text>
            <View style={styles.stageGrid}>
              {STAGES.map((stage) => (
                <TouchableOpacity
                  key={stage}
                  style={[
                    styles.stageButton,
                    currentStage === stage && styles.stageButtonActive,
                  ]}
                  onPress={() => handleStageSelect(stage)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.stageButtonText,
                      currentStage === stage && styles.stageButtonTextActive,
                    ]}
                  >
                    {stage}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stage Description */}
            {currentStage && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>Current Stage</Text>
                <Text style={styles.descriptionText}>
                  {STAGE_DESCRIPTIONS[currentStage]}
                </Text>
              </View>
            )}

            {!currentStage && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>⚠️ Stage Not Selected</Text>
                <Text style={styles.descriptionText}>
                  Please select a Demirjian stage for this tooth to proceed
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tooth List Mini View */}
        <View style={styles.toothListContainer}>
          <Text style={styles.toothListTitle}>All Teeth Status</Text>
          <View style={styles.toothList}>
            {TEETH.map((tooth, idx) => (
              <TouchableOpacity
                key={tooth}
                style={[
                  styles.toothListItem,
                  idx === currentToothIndex && styles.toothListItemActive,
                  assessment.state.toothStages[tooth] && styles.toothListItemCompleted,
                ]}
                onPress={() => setCurrentToothIndex(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.toothListItemText,
                    idx === currentToothIndex && styles.toothListItemTextActive,
                  ]}
                >
                  {tooth}
                </Text>
                {assessment.state.toothStages[tooth] && (
                  <Text style={styles.toothListItemStage}>
                    {assessment.state.toothStages[tooth]}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentToothIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentToothIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentToothIndex === TEETH.length - 1 && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={currentToothIndex === TEETH.length - 1 || !currentStage}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>
              {currentToothIndex === TEETH.length - 1 ? 'Review' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calculate Button - Only enabled when all stages selected */}
        <TouchableOpacity
          style={[
            styles.calculateButton,
            !allStagesSelected && styles.calculateButtonDisabled,
            saving && styles.calculateButtonLoading,
          ]}
          onPress={handleCalculate}
          disabled={!allStagesSelected || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <>
              <ActivityIndicator color={colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.calculateButtonText}>Analyzing OPG...</Text>
            </>
          ) : (
            <>
              <Text style={styles.calculateButtonText}>
                {allStagesSelected ? '✓ Calculate Dental Age' : '⚠️ Complete all stages'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Loading Modal Overlay */}
        <Modal
          visible={saving}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing OPG...</Text>
              <Text style={styles.loadingSubtext}>Processing dental age calculation</Text>
            </View>
          </View>
        </Modal>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padding.screenHorizontal,
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(247,250,253,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingRight: spacing.lg,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: spacing.lg,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  toothCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  toothLabel: {
    marginBottom: spacing.lg,
  },
  toothNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  toothName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  xrayPreview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.input,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  xrayImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  xrayOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  xrayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: colors.white,
  },
  stageContainer: {
    marginTop: spacing.lg,
  },
  stageTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stageButton: {
    width: '23%',
    paddingVertical: spacing.md,
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  stageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stageButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stageButtonTextActive: {
    color: colors.white,
  },
  descriptionBox: {
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  descriptionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  toothListContainer: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  toothListTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  toothList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toothListItem: {
    width: '22%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toothListItemActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  toothListItemCompleted: {
    backgroundColor: colors.primaryExtraLight,
  },
  toothListItemText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toothListItemTextActive: {
    color: colors.primary,
  },
  toothListItemStage: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  calculateButton: {
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    ...shadows.button,
  },
  calculateButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  calculateButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: colors.white,
  },
  calculateButtonLoading: {
    opacity: 0.8,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.container,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
    ...shadows.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.h3,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: FONT_SIZES.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
