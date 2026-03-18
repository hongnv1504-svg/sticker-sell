import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Image, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { uploadImage, startGeneration, getJobStatus } from '../lib/api';
import { getAppUserID } from '../lib/revenuecat';

const STEP_ICONS: Array<React.ComponentProps<typeof Ionicons>['name']> = [
  'cloud-upload-outline',    // Uploading photo
  'scan-outline',            // Analyzing face
  'color-palette-outline',   // Applying style
  'sparkles-outline',        // Generating expressions
  'checkmark-done-outline',  // Finalizing stickers
];
const STEP_COUNT = STEP_ICONS.length;

export default function ProcessingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styleId, imageUri } = useLocalSearchParams<{ styleId: string; imageUri: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(Array.from({ length: STEP_COUNT }, () => new Animated.Value(0))).current;
  const doneScale = useRef(new Animated.Value(0)).current;
  const doneOpacity = useRef(new Animated.Value(0)).current;

  // Track pipeline start time + completion time for staggering steps
  const pipelineStart = useRef(Date.now());
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Pulse the center icon continuously
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Show first step immediately
    Animated.timing(stepAnims[0], { toValue: 1, duration: 350, useNativeDriver: true }).start();

    runPipeline();

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  /** Ease-out progress: fast to 70%, slow for last 30% */
  function animateProgress(target: number, duration: number) {
    Animated.timing(progressAnim, {
      toValue: target,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }

  function completeStep(step: number) {
    setCurrentStep(step);
    // Reveal step row
    Animated.timing(stepAnims[Math.min(step, STEP_COUNT - 1)], {
      toValue: 1, duration: 350, useNativeDriver: true,
    }).start();
  }

  /**
   * Stagger intermediate step checkmarks (steps 1-3) evenly
   * across elapsed time while API is working.
   * Steps 0 and 4 are driven by actual pipeline events.
   */
  function startStepStagger() {
    // We'll advance steps 1→2→3 at even intervals
    // Estimate ~25s total, so advance every ~5s after step 0
    let nextStep = 1;
    stepTimerRef.current = setInterval(() => {
      if (nextStep > 3) {
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        return;
      }
      completeStep(nextStep);
      // Ease-out progress: fast early, slow later
      const fraction = (nextStep + 1) / STEP_COUNT;
      const eased = fraction <= 0.6 ? fraction : 0.6 + (fraction - 0.6) * 0.5;
      animateProgress(eased, 800);
      nextStep++;
    }, 5000);
  }

  async function runPipeline() {
    const decodedUri = decodeURIComponent(imageUri ?? '');
    if (!decodedUri) {
      setErrorMsg(t('processing.errorNoImage'));
      return;
    }

    pipelineStart.current = Date.now();

    try {
      // Step 0: Upload
      completeStep(0);
      animateProgress(0.15, 600);
      const userId = await getAppUserID();
      const jobId = await uploadImage(decodedUri, style.id, userId);

      // Step 1: Start generation
      completeStep(1);
      animateProgress(0.3, 500);
      await startGeneration(jobId);

      // Start staggering steps 2-3 while polling
      startStepStagger();

      // Poll until done
      await pollUntilDone(jobId);

      // Clear stagger timer
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);

      // Step 4: Finalize — mark all steps complete
      for (let i = 0; i < STEP_COUNT; i++) {
        completeStep(i);
        stepAnims[i].setValue(1);
      }
      completeStep(STEP_COUNT); // all done
      animateProgress(1, 400);

      // Show "Done! 🎉" with scale animation
      await new Promise(r => setTimeout(r, 300));
      setDone(true);
      Animated.parallel([
        Animated.spring(doneScale, {
          toValue: 1, tension: 150, friction: 8, useNativeDriver: true,
        }),
        Animated.timing(doneOpacity, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
      ]).start();

      // Hold 0.5s then navigate
      await new Promise(r => setTimeout(r, 500));
      router.replace(`/result?jobId=${jobId}&styleId=${style.id}`);
    } catch (err: any) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (err.message === 'NO_CREDITS') {
        // No credits — redirect to pricing to buy more
        router.replace(`/pricing?styleId=${style.id}`);
        return;
      }
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

      // Progress from API: map sticker count to 30%-90% range (ease-out zone)
      if (status.progress > 0) {
        const apiProgress = Math.min(status.progress, 6) / 6; // 0..1
        const mapped = 0.3 + apiProgress * 0.6; // 30%–90%
        animateProgress(mapped, 400);
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
            {done ? (
              <Animated.Text style={[
                styles.doneText,
                { transform: [{ scale: doneScale }], opacity: doneOpacity },
              ]}>
                {t('processing.done')}
              </Animated.Text>
            ) : (
              <>
                <Text style={styles.title}>{t('processing.title')}</Text>
                <Text style={styles.subtitle}>{t('processing.subtitle')}</Text>
              </>
            )}

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
              {STEP_ICONS.map((icon, i) => {
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
                        name={icon}
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
  doneText: {
    fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.success,
    textAlign: 'center',
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
