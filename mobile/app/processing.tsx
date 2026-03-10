import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { uploadImage, startGeneration, getJobStatus } from '../lib/api';

const STEPS = [
  { label: 'Uploading your photo', icon: '📤' },
  { label: 'Analyzing your face', icon: '🔍' },
  { label: 'Creating 6 stickers', icon: '✨' },
  { label: 'Finalizing artwork', icon: '🎨' },
];

export default function ProcessingScreen() {
  const router = useRouter();
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
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
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
      setErrorMsg('No image selected. Please go back and choose a photo.');
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
        throw new Error('Sticker generation failed. Please try again.');
      }

      // Update progress animation based on server-reported progress
      if (status.progress > 0) {
        Animated.timing(progressAnim, {
          toValue: 0.25 + (status.progress / 100) * 0.75, // 25%–100%
          duration: 400,
          useNativeDriver: false,
        }).start();
      }

      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Generation timed out. Please try again.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Center pulse icon */}
        <Animated.View style={[
          styles.iconCircle,
          { backgroundColor: style.color + '20', transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={styles.iconEmoji}>{style.emoji}</Text>
        </Animated.View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Text style={styles.errorAction}>← Go back and try again</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Creating your stickers…</Text>
            <Text style={styles.subtitle}>This usually takes 20–30 seconds</Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: style.color,
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
                      isActive && { backgroundColor: style.color },
                    ]}>
                      <Text style={styles.stepDotText}>
                        {isDone ? '✓' : isActive ? '•' : ''}
                      </Text>
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      isDone && styles.stepDone,
                      isActive && { color: COLORS.text },
                    ]}>
                      {step.icon}  {step.label}
                    </Text>
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
  iconEmoji: { fontSize: 52 },

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
  stepDotText: { fontSize: 12, color: '#fff', fontFamily: FONTS.bold },
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
