import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';

export default function UploadScreen() {
  const router = useRouter();
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      Alert.alert('Camera access required', 'Please allow camera access in Settings to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function pickFromLibrary() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photos access required', 'Please allow Photos access in Settings to choose a photo.');
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
    setUploading(true);

    try {
      // Navigate to processing — it handles upload + generation
      router.push(`/processing?styleId=${style.id}&imageUri=${encodeURIComponent(image)}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your selfie</Text>
          <Text style={styles.subtitle}>Use a clear, well-lit photo of your face</Text>
        </View>

        {/* Photo area */}
        <Animated.View style={[styles.photoArea, { transform: [{ scale: scaleAnim }] }]}>
          {image ? (
            <TouchableOpacity onPress={pickFromCamera} activeOpacity={0.9}>
              <Image source={{ uri: image }} style={styles.photoPreview} />
              <View style={styles.changeOverlay}>
                <Text style={styles.changeText}>Tap to change</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.photoPlaceholder}
              onPress={pickFromCamera}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1A1A1F', '#111114']}
                style={styles.placeholderInner}
              >
                <Text style={styles.cameraEmoji}>📸</Text>
                <Text style={styles.cameraHint}>Take a selfie</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Or pick from library */}
        {!image && (
          <TouchableOpacity style={styles.libraryBtn} onPress={pickFromLibrary}>
            <Text style={styles.libraryText}>🖼️  Choose from Photos</Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipsLabel}>TIPS FOR BEST RESULTS</Text>
          {[
            ['😊', 'Face forward, neutral expression'],
            ['💡', 'Good lighting, avoid shadows'],
            ['🚫', 'No sunglasses or hats'],
            ['📐', 'Face fills most of the frame'],
          ].map(([emoji, text], i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{emoji}</Text>
              <Text style={styles.tipText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        {image && !uploading && (
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={pickFromLibrary}
          >
            <Text style={styles.retakeText}>Choose different photo</Text>
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.ctaText, !image && styles.ctaTextDisabled]}>
                {image ? 'Create My Stickers →' : 'Take or Choose a Photo'}
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
  backBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.screen,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  backText: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.textMuted },

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
  cameraEmoji: { fontSize: 52 },
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  changeText: { fontSize: 13, fontFamily: FONTS.semiBold, color: '#fff' },

  libraryBtn: {
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
  tipEmoji: { fontSize: 14, width: 22 },
  tipText: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary },

  ctaContainer: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.xs,
    backgroundColor: COLORS.bg,
    gap: SPACING.sm,
  },
  retakeBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  retakeText: {
    fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.primary,
  },
  ctaButton: {
    height: 56, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: '#fff' },
  ctaTextDisabled: { color: COLORS.textMuted },
});
