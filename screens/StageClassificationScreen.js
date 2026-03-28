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
import { calculateTotalMaturityScore, maturityScoreToDentalAge } from '../constants/demirjianTable';

const XRAY_IMG = require('../assets/images/opg-sample.jpg');
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
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleConfirmCalculation = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmAndCalculate = () => {
    setShowConfirmation(false);
    handleCalculate();
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
        // Calculate maturity score using Demirjian tables
        const maturityScore = calculateTotalMaturityScore(
          assessment.state.toothStages,
          assessment.state.gender
        );
        
        // Convert maturity score to dental age
        const dentalAge = maturityScoreToDentalAge(
          maturityScore,
          assessment.state.gender
        );

        // Validate results
        if (maturityScore === null || dentalAge === null) {
          throw new Error('Invalid calculation result');
        }

        assessment.setAnalysisResult(
          maturityScore,
          dentalAge,
          assessment.state.patientId || 'anonymous'
        );
        assessment.markStepComplete('stages');

        // Navigate to results
        navigation?.navigate('Results', {
          analysisData: {
            patient_id: assessment.state.patientId || 'anonymous',
            stages: assessment.state.toothStages,
            maturity_score: maturityScore,
            dental_age: dentalAge,
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
           <View style={styles.toothHeader}>
             <View style={styles.toothInfo}>
               <Text style={styles.toothNumber}>Tooth {currentTooth}</Text>
               <Text style={styles.toothName}>
                 {TOOTH_INFO[currentTooth]?.name}
               </Text>
             </View>
             <View style={styles.toothPosition}>
               <Text style={styles.toothPositionText}>
                 {TOOTH_INFO[currentTooth]?.position}
               </Text>
             </View>
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
             <Text style={styles.stageTitle}>Select Development Stage</Text>
             <View style={styles.stageGrid}>
               {STAGES.map((stage) => (
                 <TouchableOpacity
                   key={stage}
                   style={[
                     styles.stageButton,
                     currentStage === stage && styles.stageButtonActive,
                   ]}
                   onPress={() => handleStageSelect(stage)}
                 >
                   <Text style={styles.stageButtonText}>
                     {stage}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>

             {/* Stage Description */}
             {currentStage && (
               <View style={styles.descriptionBox}>
                 <Text style={styles.descriptionLabel}>Development Stage</Text>
                 <Text style={styles.descriptionText}>
                   {STAGE_DESCRIPTIONS[currentStage]}
                 </Text>
               </View>
             )}

             {!currentStage && (
               <View style={styles.descriptionBox}>
                 <Text style={styles.descriptionLabel}>⚠️ Stage Not Selected</Text>
                 <Text style={styles.descriptionText}>
                   Please select a developmental stage for this tooth to proceed
                 </Text>
               </View>
             )}
           </View>
         </View>

         {/* Tooth List Mini View */}
         <View style={styles.toothListContainer}>
           <Text style={styles.toothListTitle}>Teeth Progress</Text>
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
               >
                 <View style={styles.toothListItemContent}>
                   <Text style={styles.toothListItemNumber}>{tooth}</Text>
                   {assessment.state.toothStages[tooth] && (
                     <Text style={styles.toothListItemStage}>
                       {assessment.state.toothStages[tooth]}
                     </Text>
                   )}
                 </View>
               </TouchableOpacity>
             ))}
           </View>
         </View>

         {/* Navigation Buttons */}
         <View style={styles.buttonContainer}>
           <TouchableOpacity
             style={[
               styles.navButton,
               currentToothIndex === 0 && styles.navButtonDisabled,
             ]}
             onPress={handlePrevious}
             disabled={currentToothIndex === 0}
           >
             <Text style={styles.navButtonText}>Previous</Text>
           </TouchableOpacity>

           <TouchableOpacity
             style={[
               styles.navButton,
               currentToothIndex === TEETH.length - 1 && styles.navButtonDisabled,
             ]}
             onPress={handleNext}
             disabled={currentToothIndex === TEETH.length - 1 || !currentStage}
           >
             <Text style={styles.navButtonText}>
               {currentToothIndex === TEETH.length - 1 ? 'Complete' : 'Next'}
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
           onPress={handleConfirmCalculation}
           disabled={!allStagesSelected || saving}
           activeOpacity={0.9}
         >
           {!saving ? (
             <>
               {allStagesSelected ? (
                 <View style={styles.calculateButtonContent}>
                   <Text style={styles.calculateButtonText}>Calculate Dental Age</Text>
                   <Text style={styles.calculateButtonSubtext}>
                     Based on {TEETH.length} teeth assessments
                   </Text>
                 </View>
               ) : (
                 <View style={styles.calculateButtonContent}>
                   <Text style={styles.calculateButtonText}>Complete All Stages</Text>
                   <Text style={styles.calculateButtonSubtext}>
                     {assessment.state.toothStages
                       ? Object.values(assessment.state.toothStages).filter(s => s !== null).length
                       : 0}/{TEETH.length} stages completed
                   </Text>
                 </View>
               )}
             </>
           ) : (
             <View style={styles.calculateButtonContent}>
               <ActivityIndicator size={20} color={colors.white} />
               <Text style={styles.calculateButtonText}>Calculating...</Text>
             </View>
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

         {/* Confirmation Modal */}
         <Modal
           visible={showConfirmation}
           transparent={true}
           animationType="fade"
         >
           <View style={styles.confirmationOverlay}>
             <View style={styles.confirmationBox}>
               <Text style={styles.confirmationTitle}>Confirm Calculation</Text>
               <Text style={styles.confirmationMessage}>
                 Are you sure you want to calculate the dental age based on the selected stages?
               </Text>
               <View style={styles.confirmationButtons}>
                 <TouchableOpacity
                   style={styles.confirmationCancel}
                   onPress={handleCancelConfirmation}
                 >
                   <Text style={styles.confirmationButtonText}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={styles.confirmationConfirm}
                   onPress={handleConfirmAndCalculate}
                 >
                   <Text style={styles.confirmationButtonText}>Confirm</Text>
                 </TouchableOpacity>
               </View>
             </View>
           </View>
         </Modal>

         <View style={{ height: 24 }} />
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
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtn: {
    paddingRight: spacing.lg,
  },
  backIcon: {
    fontSize: 24,
    color: colors.white,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  headerSub: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.9,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  progressContainer: {
    marginBottom: spacing.xl,
    backgroundColor: colors.bgMuted,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  toothCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toothHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toothInfo: {
    flex: 1,
  },
  toothNumber: {
    fontSize: FONT_SIZES.xl,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  toothName: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  toothPosition: {
    marginTop: spacing.xs,
  },
  toothPositionText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  xrayPreview: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.bgMuted,
  },
  xrayImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  xrayOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  xrayText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
  stageContainer: {
    marginTop: spacing.xl,
  },
  stageTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stageButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.bgMuted,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageButtonActive: {
    backgroundColor: colors.primary,
  },
  stageButtonText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  descriptionBox: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  descriptionLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    lineHeight: FONT_SIZES.base * 1.5,
  },
  toothListContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toothListTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  toothList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  toothListItem: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.bgMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toothListItemActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  toothListItemCompleted: {
    backgroundColor: colors.primaryExtraLight,
  },
  toothListItemContent: {
    alignItems: 'center',
  },
  toothListItemNumber: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  toothListItemStage: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
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
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    ...shadows.button,
  },
  calculateButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  calculateButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  calculateButtonSubtext: {
    fontSize: FONT_SIZES.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
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
    fontFamily: fonts.bold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: FONT_SIZES.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  confirmationMessage: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.lg,
  },
  confirmationCancel: {
    flex: 1,
    backgroundColor: colors.bgMuted,
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
  },
  confirmationConfirm: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
  },
  confirmationButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: fonts.semiBold,
    color: colors.white,
  },
});
