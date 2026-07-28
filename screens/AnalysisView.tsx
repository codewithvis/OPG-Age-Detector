import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';
import { ChevronLeft, Info, CheckCircle2, AlertCircle, Zap } from 'lucide-react-native';
import { analyzeOPG } from '../api/analyze';
import { useAuth } from '../provider/AuthProvider';
import * as FileSystem from 'expo-file-system';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const AnalysisView = ({ route, navigation }: any) => {
  const { imageUri, patient } = route.params || {};
  const { session } = useAuth();
  const [status, setStatus] = useState<'quality_check' | 'uploading' | 'analyzing' | 'completed' | 'failed'>('quality_check');
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [method, setMethod] = useState<'OPG' | 'Panoramic' | 'Periapical'>('OPG');
  const [useEdgeAI, setUseEdgeAI] = useState(true);
  const [progress, setProgress] = useState(0);
  const [aiData, setAiData] = useState<any>(null);

  const scanLineY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    // Laser Glow Animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1500 }),
        withTiming(0.1, { duration: 1500 })
      ),
      -1,
      true
    );

    if (status === 'quality_check') {
       // Simulate clinical image quality validation
       setTimeout(() => {
         setQualityScore(0.92);
         setStatus('analyzing');
       }, 2000);
    }

    if (status === 'analyzing') {
      // Laser Scan Animation
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      const performAnalysis = async () => {
        if (!imageUri || !session?.user?.id) {
          setStatus('failed');
          return;
        }

        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
          });

          const progressInterval = setInterval(() => {
            setProgress((prev) => (prev < 0.9 ? prev + 0.05 : prev));
          }, 500);

          const result = await analyzeOPG(base64, session.user.id, method, useEdgeAI);

          clearInterval(progressInterval);
          setProgress(1);
          setAiData(result);
          setStatus('completed');
        } catch (error) {
          console.error("Analysis failed:", error);
          setStatus('failed');
        }
      };

      performAnalysis();
    }
  }, [imageUri, session, status]);

  const animatedScanLineStyle = useAnimatedStyle(() => ({
    top: scanLineY.value * (height * 0.4),
    opacity: status === 'analyzing' ? 1 : 0,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dark Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.white} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <BrandLogo size={24} color={colors.white} style={{ marginRight: spacing.xs }} />
          <Typography variant="h3" color={colors.white} bold>AI Analysis</Typography>
        </View>
        <TouchableOpacity>
          <Info color={colors.white} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Radiograph Viewport */}
        <View style={styles.viewport}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.xrayImage} />
              {/* Laser Scan Overlay */}
              <Animated.View style={[styles.scanLine, animatedScanLineStyle]} />
              {/* Global Viewport Glow */}
              <Animated.View style={[styles.viewportGlow, animatedGlowStyle]} />
            </>
          ) : (
            <View style={styles.placeholder}>
              <Typography color={colors.slateMuted}>No Image Loaded</Typography>
            </View>
          )}
        </View>

        {/* Progress & Status Card */}
        <View style={styles.bottomSheet}>
          <View style={styles.methodSelector}>
            {['OPG', 'Panoramic', 'Periapical'].map((m: any) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                onPress={() => setMethod(m)}
              >
                <Typography variant="label" color={method === m ? colors.white : colors.slateMuted} bold>{m}</Typography>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.edgeToggle}>
             <Zap size={18} color={useEdgeAI ? colors.warning : colors.slateMuted} fill={useEdgeAI ? colors.warning : 'none'} />
             <Typography variant="bodyMedium" bold={useEdgeAI}>Proprietary Edge AI Engine</Typography>
             <Switch
               value={useEdgeAI}
               onValueChange={setUseEdgeAI}
               trackColor={{ false: colors.border, true: colors.primary }}
             />
          </View>

          <View style={styles.statusHeader}>
            {status === 'completed' ? (
              <CheckCircle2 color={colors.success} size={28} />
            ) : status === 'failed' ? (
              <AlertCircle color={colors.error} size={28} />
            ) : status === 'quality_check' ? (
              <ActivityIndicator color={colors.primaryLight} />
            ) : (
              <ActivityIndicator color={colors.primary} />
            )}
            <Typography variant="h3" color={colors.white} bold>
              {status === 'quality_check' ? 'Clinical Quality Check' :
               status === 'analyzing' ? 'Processing OPG...' :
               status === 'completed' ? 'Analysis Complete' :
               status === 'failed' ? 'Analysis Failed' : 'Initializing...'}
            </Typography>
          </View>

          <Typography variant="bodyMedium" color={colors.slateMuted} align="center">
            {status === 'quality_check'
              ? 'Validating radiograph resolution, contrast, and dental features for AI diagnostic readiness.'
              : status === 'analyzing'
              ? 'Our AI is detecting Demirjian stages for all 7 mandibular teeth. Please wait.'
              : status === 'completed'
              ? 'The analysis is ready for your clinical review and verification.'
              : status === 'failed'
              ? 'We encountered an error during analysis. Please try again with a clearer image.'
              : ''}
          </Typography>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.actions}>
            <Button
              title={status === 'completed' ? "Review Results" :
                     status === 'failed' ? "Try Again" : "Cancel Analysis"}
              onPress={() => {
                if (status === 'completed') {
                  navigation.navigate('StageClassification', { imageUri, aiData, patient });
                } else {
                  navigation.goBack();
                }
              }}
              variant={status === 'completed' ? 'primary' : 'outline'}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  viewport: {
    width: width * 0.9,
    height: height * 0.4,
    alignSelf: 'center',
    backgroundColor: '#000',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  xrayImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: 0.8,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  viewportGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
  bottomSheet: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.bgScreen,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.bgScreen,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  methodBtnActive: {
    backgroundColor: colors.primary,
  },
  edgeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryExtraLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
});
