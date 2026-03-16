import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { uploadImage, startGeneration, getJobStatus } from '../lib/api';

const STEPS: Array<{ label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { label: 'Uploading your photo', icon: 'cloud-upload-outline' },
  { label: 'Analyzing your face', icon: 'scan-outline' },
  { label: 'Creating 6 stickers', icon: 'star-outline' },
  { label: 'Finalizing artwork',  icon: 'color-palette-outline' },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styleId, imageUri } = useLocalSearchParams<{ styleId: string; imageUri: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Pulse the center icon continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Animate first step in
    Animated.timing(stepAnims[0], { toValue: 1, duration: 350, useNativeDriver: true }).start();

    runPipeline();
  }, []);

  function animateStep(step: number) {
    setCurrentStep(step);
    Animated.timing(stepAnims[step], { toValue: 1, duration: 350, useNativeDriver: true }).start();
    Animated.timing(progressAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  async function runPipeline() {
    const decodedUri = decodeURIComponent(imageUri ?? '');
    if (!decodedUri) {
      setErrorMsg(t('processing.errorNoImage'));
      return;
    }

    try {
      // Step 0: Upload
      animateStep(0);
      const jobId = await uploadImage(decodedUri, style.id);

      // Step 1: Start generation (fire-and-forget)
      animateStep(1);
      startGeneration(jobId);

      // Step 2: Poll until done
      animateStep(2);
      const stickers = await pollUntilDone(jobId);

      // Step 3: Finalize
      animateStep(3);
      await new Promise(r => setTimeout(r, 600)); // brief beat for UX

      router.replace(`/result?jobId=${jobId}&styleId=${style.id}`);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
    }
  }

  async function pollUntilDone(jobId: string, maxAttempts = 90): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await getJobStatus(jobId);

      if (status.status === 'completed' && status.stickers.length > 0) {
        return;
      }
      if (status.status === 'failed') {
        throw new Error(t('processing.errorFailed'));
      }

      // Update progress animation: progress is sticker count (0–6)
      if (status.progress > 0) {
        Animated.timing(progressAnim, {
          toValue: 0.25 + (Math.min(status.progress, 6) / 6) * 0.75, // 25%–100%
          duration: 400,
          useNativeDriver: false,
        }).start();
      }

      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error(t('processing.errorTimeout'));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Center pulse icon */}
        <Animated.View style={[
          styles.iconCircle,
          { backgroundColor: style.accent + '20', transform: [{ scale: pulseAnim }] }
        ]}>
          <Image source={{ uri: style.sampleImage }} style={styles.iconImage} resizeMode="cover" />
        </Animated.View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{t('processing.errorTitle')}</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Text style={styles.errorAction}>{t('processing.errorAction')}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>{t('processing.title')}</Text>
            <Text style={styles.subtitle}>{t('processing.subtitle')}</Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: style.accent,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            {/* Steps */}
            <View style={styles.steps}>
              {STEPS.map((step, i) => {
                const isDone = i < currentStep;
                const isActive = i === currentStep;
                return (
                  <Animated.View
                    key={i}
                    style={[styles.step, { opacity: stepAnims[i] }]}
                  >
                    <View style={[
                      styles.stepDot,
                      isDone && { backgroundColor: COLORS.success },
                      isActive && { backgroundColor: style.accent },
                    ]}>
                      <Text style={styles.stepDotText}>
                        {isDone ? '✓' : isActive ? '•' : ''}
                      </Text>
                    </View>
                    <View style={styles.stepLabelRow}>
                      <Ionicons
                        name={step.icon}
                        size={14}
                        color={isDone ? COLORS.success : isActive ? COLORS.text : COLORS.textMuted}
                      />
                      <Text style={[
                        styles.stepLabel,
                        isDone && styles.stepDone,
                        isActive && { color: COLORS.text },
                      ]}>
                        {'  '}{t(`processing.step${i}`)}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screen,
    gap: SPACING.lg,
  },

  iconCircle: {
    width: 100, height: 100,
    borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconImage: { width: 68, height: 68, borderRadius: RADIUS.lg },

  title: {
    fontSize: 22, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.3, textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center', marginTop: -SPACING.sm,
  },

  progressTrack: {
    width: '100%', height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: RADIUS.full,
  },

  steps: { width: '100%', gap: SPACING.sm },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotText: { fontSize: 12, color: COLORS.text, fontFamily: FONTS.bold },
  stepLabelRow: { flexDirection: 'row', alignItems: 'center' },
  stepLabel: {
    fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.textMuted,
  },
  stepDone: { color: COLORS.success },

  errorBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  errorTitle: { fontSize: 20, fontFamily: FONTS.extraBold, color: COLORS.error },
  errorText: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  errorAction: {
    fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary,
    marginTop: SPACING.sm,
  },
});
