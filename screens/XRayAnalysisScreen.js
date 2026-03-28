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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows, fonts } from '../theme';
import { supabase } from '../services/supabase';
import { useAssessment } from '../provider/AssessmentProvider';
import { scale } from '../utils/responsive';
import {
  FONT_SIZES,
  CONTAINER_PADDING,
  HEADER_HEIGHT,
  BOTTOM_NAV_HEIGHT,
  spacing,
  padding,
  gaps,
  borderRadius,
} from '../constants/layout';

const DETECTED_TEETH = [
  { id: '36', label: 'Lower Left First Molar (36)', color: colors.primary },
  { id: '35', label: 'Lower Left Second Premolar (35)', color: colors.indigo },
  { id: '34', label: 'Lower Left First Premolar (34)', color: '#06b6d4' },
  { id: '37', label: 'Lower Left Second Molar (37)', color: '#8b5cf6' },
  { id: '38', label: 'Lower Left Third Molar (38)', color: '#ec4899' },
  { id: '33', label: 'Lower Left Canine (33)', color: '#f59e0b' },
  { id: '32', label: 'Lower Left Lateral Incisor (32)', color: '#10b981' },
];

const TOOTH_OVERLAYS = [
  { id: '36', left: '42%', top: '58%' },
  { id: '35', left: '45%', top: '60%' },
  { id: '34', left: '49%', top: '62%' },
  { id: '37', left: '53%', top: '62%' },
  { id: '38', left: '57%', top: '58%' },
  { id: '45', left: '64%', top: '52%' },
  { id: '46', left: '72%', top: '52%' },
];

export default function XRayAnalysisScreen({ navigation, route }) {
  const assessment = useAssessment();
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [selectedTooth, setSelectedTooth] = useState('36');
  const [uploading, setUploading] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);

  useEffect(() => {
    // If image passed via route, use it
    if (route.params?.imageUri) {
      setCurrentImageUri(route.params.imageUri);
      assessment.setOgpImage(route.params.imageUri);
    }
  }, [route.params?.imageUri]);

  const handleProceed = async () => {
    // CRITICAL VALIDATION: Ensure OPG image is selected
    if (!currentImageUri) {
      Alert.alert(
        'OPG Image Required',
        'You must upload an OPG image before proceeding to stage classification.',
        [{ text: 'OK' }]
      );
      return;
    }

    // CRITICAL VALIDATION: Ensure gender is selected
    if (!assessment.isGenderSelected()) {
      Alert.alert(
        'Gender Required',
        'Please select patient gender before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    setUploading(true);
    try {
      // Upload image to Supabase storage
      if (currentImageUri && !currentImageUri.startsWith('http')) {
        const fileExt = currentImageUri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;

        const response = await fetch(currentImageUri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
          .from('radiographs')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
          });

        if (!error) {
          const { data: publicData } = supabase.storage
            .from('radiographs')
            .getPublicUrl(fileName);
          
          await supabase.from('radiographs').insert({
            patient_id: assessment.state.patientId || 'anonymous',
            image_url: publicData.publicUrl,
            uploaded_at: new Date().toISOString(),
          });
        }
      }

      // Store image in assessment context
      assessment.setOgpImage(currentImageUri);
      
      // Navigate to stage classification with guardians already in place
      navigation?.navigate('StageClassification', {
        imageUri: currentImageUri,
        gender: assessment.state.gender,
      });
    } catch (err) {
      console.warn('Upload failed:', err);
      Alert.alert('Upload Error', 'Failed to upload the OPG image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgScreen} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Radiograph Analysis</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Image source={{ uri: SHARE_ICON }} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
       {/* ── Analysis Header & Toggle ── */}
       <View style={styles.analysisHeader}>
         <View style={styles.analysisTitle}>
           <Text style={styles.analysisTitleText}>Dental Analysis</Text>
           <Text style={styles.analysisSub}>AI-powered tooth development assessment</Text>
         </View>
         <View style={styles.toggleContainer}>
           <Text style={styles.toggleLabel}>Show AI Detection</Text>
           <TouchableOpacity
             style={[styles.toggle, overlayEnabled && styles.toggleActive]}
             onPress={() => setOverlayEnabled(!overlayEnabled)}
           >
             <View style={styles.toggleTrack}>
               <View style={[
                 styles.toggleThumb,
                 overlayEnabled && styles.toggleThumbActive,
               ]} />
             </View>
           </TouchableOpacity>
         </View>
       </View>

        {/* ── Radiograph Viewport ── */}
        <View style={styles.viewport}>
          <Image source={{ uri: currentImageUri }} style={styles.xrayImg} />

          {/* AI Overlay Layer */}
          {overlayEnabled && (
            <View style={styles.overlayLayer}>
              {/* Detection bounding box */}
              <View style={styles.detectionBox}>
                <View style={styles.detectionLabel}>
                  <Text style={styles.detectionLabelText}>Target Region</Text>
                </View>
              </View>

              {/* Tooth labels */}
              {TOOTH_OVERLAYS.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.toothMarker,
                    { left: t.left, top: t.top },
                    selectedTooth === t.id && styles.toothMarkerActive,
                  ]}
                  onPress={() => setSelectedTooth(t.id)}
                >
                  <Text style={[styles.toothMarkerText, selectedTooth === t.id && styles.toothMarkerTextActive]}>
                    {t.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Viewport Controls */}
          <View style={styles.viewportControls}>
            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlIcon}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlIcon}>⟲</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bento Info Grid ── */}

        {/* Confidence Score */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Detection Confidence</Text>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidencePct}>97.8</Text>
            <Text style={styles.confidenceUnit}>%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '97.8%' }]} />
          </View>
        </View>

        {/* Detected Items */}
        <View style={styles.infoCard}>
          <View style={styles.detectedHeader}>
            <Text style={styles.infoCardTitle}>Detected Teeth</Text>
            <View style={styles.detectedBadge}>
              <Text style={styles.detectedBadgeText}>7 found · Click to select</Text>
            </View>
          </View>
          <View style={styles.toothTagsGrid}>
            {DETECTED_TEETH.map((tooth) => (
              <TouchableOpacity
                key={tooth.id}
                style={[
                  styles.toothTag,
                  selectedTooth === tooth.id && { backgroundColor: tooth.color, borderColor: tooth.color },
                ]}
                onPress={() => setSelectedTooth(tooth.id)}
              >
                <View
                  style={[
                    styles.toothTagDot,
                    { backgroundColor: selectedTooth === tooth.id ? colors.white : tooth.color },
                  ]}
                />
                <Text
                  style={[
                    styles.toothTagText,
                    selectedTooth === tooth.id && { color: colors.white },
                  ]}
                >
                  {tooth.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Gender Selection ── */}
        <View style={styles.infoCard}>
          <View style={styles.detectedHeader}>
            <Text style={styles.infoCardTitle}>Patient Gender</Text>
            <View style={styles.detectedBadge}>
              <Text style={styles.detectedBadgeText}>Required</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: gaps.md, marginTop: spacing.sm }}>
            <TouchableOpacity 
              style={[styles.toothTag, assessment.state.gender === 'Male' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => assessment.setGender('Male')}
            >
              <Text style={[styles.toothTagText, assessment.state.gender === 'Male' && { color: colors.white }]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toothTag, assessment.state.gender === 'Female' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => assessment.setGender('Female')}
            >
              <Text style={[styles.toothTagText, assessment.state.gender === 'Female' && { color: colors.white }]}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Action Button ── */}
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.proceedBtn}
            activeOpacity={0.88}
            onPress={handleProceed}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.proceedBtnText}>Proceed to Stage Classification</Text>
                <Text style={styles.proceedBtnArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>
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
  scrollContent: { paddingHorizontal: CONTAINER_PADDING, paddingTop: spacing.lg, paddingBottom: spacing.xxl },

  // Top Bar
  topBar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.bgCard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: gaps.md },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: FONT_SIZES.base, color: colors.textPrimary },
  topTitle: { fontSize: FONT_SIZES.xl, fontFamily: fonts.bold, color: colors.textPrimary, letterSpacing: -0.4 },
  actionBtn: { padding: spacing.sm, borderRadius: spacing.xl },
  actionIcon: { width: spacing.xxl, height: spacing.xxl, resizeMode: 'contain' },

  // Analysis Header
  analysisHeader: { marginBottom: gaps.md },
  analysisTitle: { gap: gaps.xs, marginBottom: gaps.md },
  analysisTitleText: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  analysisSub: { fontSize: FONT_SIZES.sm, fontFamily: fonts.regular, color: colors.textSecondary },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: gaps.sm,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  toggleLabel: { fontSize: FONT_SIZES.sm, fontFamily: fonts.medium, color: colors.textSecondary, flex: 1 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bgInput,
    padding: 4,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleTrack: {
    width: 36,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  toggleThumbActive: { transform: [{ translateX: 10 }] },

  // Viewport
  viewport: {
    height: scale(220),
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: gaps.lg,
    position: 'relative',
    backgroundColor: colors.bgMuted,
  },
  xrayImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlayLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  detectionBox: {
    position: 'absolute',
    left: '40%',
    top: '40%',
    width: '35%',
    height: '36%',
    borderWidth: 1.5,
    borderColor: 'rgba(13,148,136,0.3)', // Teal with opacity
    borderRadius: 8,
  },
  detectionLabel: {
    position: 'absolute',
    top: -12,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detectionLabelText: { fontSize: FONT_SIZES.xs, fontFamily: fonts.medium, color: colors.white },
  toothMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  toothMarkerActive: {
    backgroundColor: colors.primary,
    borderColor: colors.white,
  },
  toothMarkerText: { fontSize: FONT_SIZES.xs, fontFamily: fonts.bold, color: colors.white },
  toothMarkerTextActive: { fontFamily: fonts.bold, color: colors.white },

  viewportControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: { fontSize: FONT_SIZES.base, fontWeight: '700', color: colors.white },

  // Info Cards
  infoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: gaps.md,
    ...shadows.card,
    gap: gaps.md,
  },
   infoCardTitle: {
  fontSize: FONT_SIZES.sm,
  fontFamily: fonts.semiBold,
  color: colors.textSecondary,
  letterSpacing: 0.3,
},
  confidenceRow: { flexDirection: 'row', alignItems: 'baseline', gap: gaps.xs },
   confidencePct: { fontSize: FONT_SIZES.huge, fontFamily: fonts.bold, color: colors.textPrimary, letterSpacing: -1 },
   confidenceUnit: { fontSize: FONT_SIZES.xl, fontFamily: fonts.bold, color: colors.textMuted },
   progressBg: {
    height: 8,
    backgroundColor: colors.bgMuted,
    borderRadius: 4,
    overflow: 'hidden',
   },
   progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
   },

   detectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   },
   detectedBadge: {
    backgroundColor: colors.primaryExtraLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
   },
    detectedBadgeText: { fontSize: FONT_SIZES.xs, fontFamily: fonts.semiBold, color: colors.primary },
   toothTagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: gaps.sm },
   toothTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.bgMuted,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
   },
   toothTagDot: { width: 6, height: 6, borderRadius: 3 },
   toothTagText: { fontSize: FONT_SIZES.sm, fontFamily: fonts.regular, color: colors.textSecondary },

   // Action
   actionArea: { marginBottom: gaps.lg },
   proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    gap: gaps.sm,
    ...shadows.button,
   },
   proceedBtnText: { fontSize: FONT_SIZES.base, fontFamily: fonts.bold, color: colors.white },
   proceedBtnArrow: { fontSize: FONT_SIZES.xl, color: colors.white },

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
});
