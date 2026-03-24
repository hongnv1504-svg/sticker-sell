import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import BackButton from '../components/BackButton';

export default function UploadScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  function animateTap() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }

  async function pickFromCamera() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('upload.cameraTitle'), t('upload.cameraMsg'));
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (e: any) {
      // Camera not available (e.g. iOS Simulator) — fall back to photo library
      Alert.alert(
        t('upload.cameraUnavailableTitle'),
        t('upload.cameraUnavailableMsg'),
        [{ text: t('upload.chooseFromLibrary'), onPress: pickFromLibrary }, { text: t('common.cancel'), style: 'cancel' }],
      );
    }
  }

  async function pickFromLibrary() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('upload.photosTitle'), t('upload.photosMsg'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleNext() {
    if (!image) return;
    animateTap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Show AI processing consent dialog (Apple guideline 5.1.1)
    Alert.alert(
      t('upload.consentTitle'),
      t('upload.consentMsg'),
      [
        { text: t('upload.consentDecline'), style: 'cancel' },
        {
          text: t('upload.consentAgree'),
          onPress: () => {
            router.push(`/processing?styleId=${style.id}&imageUri=${encodeURIComponent(image)}`);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: SPACING.screen }}>
        <BackButton />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('upload.title')}</Text>
          <Text style={styles.subtitle}>{t('upload.subtitle')}</Text>
        </View>

        {/* Photo area */}
        <Animated.View style={[styles.photoArea, { transform: [{ scale: scaleAnim }] }]}>
          {image ? (
            <TouchableOpacity onPress={pickFromCamera} activeOpacity={0.9}>
              <Image source={{ uri: image }} style={styles.photoPreview} />
              <View style={styles.changeOverlay}>
                <Text style={styles.changeText}>{t('upload.tapToChange')}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.photoPlaceholder}
              onPress={pickFromCamera}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('upload.takePhoto')}
            >
              <LinearGradient
                colors={[COLORS.surface, COLORS.card]}
                style={styles.placeholderInner}
              >
                <Ionicons name="camera" size={52} color={COLORS.textMuted} />
                <Text style={styles.cameraHint}>{t('upload.takePhoto')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Or pick from library */}
        {!image && (
          <TouchableOpacity style={styles.libraryBtn} onPress={pickFromLibrary}>
            <Ionicons name="images-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.libraryText}>{t('upload.chooseLibrary')}</Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipsLabel}>{t('upload.tipsLabel')}</Text>
          {([
            ['happy-outline',        t('upload.tip1')],
            ['sunny-outline',        t('upload.tip2')],
            ['ban-outline',          t('upload.tip3')],
            ['scan-outline',         t('upload.tip4')],
          ] as const).map(([icon, text], i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name={icon} size={16} color={style.accent} style={styles.tipIcon} />
              <Text style={styles.tipText}>{text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        {image && !uploading && (
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={pickFromLibrary}
          >
            <Text style={[styles.retakeText, { color: style.accent }]}>{t('upload.chooseDifferent')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleNext}
          disabled={!image || uploading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={image ? style.gradient : [COLORS.surface, COLORS.surface]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={[styles.ctaText, !image && styles.ctaTextDisabled]}>
                {image ? t('upload.ctaReady') : t('upload.ctaEmpty')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const PHOTO_SIZE = 260;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.screen,
  },

  header: { alignItems: 'center', marginBottom: SPACING.lg },
  title: {
    fontSize: 26, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    marginTop: 4,
  },

  photoArea: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: PHOTO_SIZE, height: PHOTO_SIZE,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  cameraHint: {
    fontSize: 15, fontFamily: FONTS.semiBold, color: COLORS.textMuted,
  },
  photoPreview: {
    width: PHOTO_SIZE, height: PHOTO_SIZE,
    borderRadius: RADIUS.xl,
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.overlay,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  changeText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.text },

  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  libraryText: {
    fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.textSecondary,
  },

  tips: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  tipsLabel: {
    fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textMuted,
    letterSpacing: 1.5, marginBottom: 2,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  tipIcon: { width: 22 },
  tipText: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, flex: 1 },

  ctaContainer: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.xs,
    backgroundColor: COLORS.bg,
    gap: SPACING.sm,
  },
  retakeBtn: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  retakeText: {
    fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.primary,
  },
  ctaButton: {
    height: 56, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.text },
  ctaTextDisabled: { color: COLORS.textMuted },
});
