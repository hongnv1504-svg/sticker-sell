import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { getJobStatus, JobStatus } from '../lib/api';

export default function SuccessScreen() {
  const router = useRouter();
  const { jobId, styleId } = useLocalSearchParams<{ jobId: string; styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [stickers, setStickers] = useState<JobStatus['stickers']>([]);

  const checkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Other styles to upsell (exclude current)
  const otherStyles = STYLES.filter(s => s.id !== style.id).slice(0, 3);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(checkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    if (jobId) {
      getJobStatus(jobId).then(s => setStickers(s.stickers)).catch(() => {});
    }
  }, []);

  async function shareToApp(appName: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const available = await Sharing.isAvailableAsync();
    if (!available || stickers.length === 0) return;

    // Share first sticker as example
    await Sharing.shareAsync(stickers[0].imageUrl, {
      dialogTitle: `Share your ${style.name} sticker on ${appName}`,
      mimeType: 'image/png',
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success checkmark */}
        <View style={styles.checkContainer}>
          <Animated.View style={[
            styles.checkCircle,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <LinearGradient
              colors={['#34C759', '#30d158']}
              style={styles.checkGradient}
            >
              <Animated.Text style={[styles.checkMark, { opacity: checkAnim }]}>✓</Animated.Text>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Stickers saved!</Text>
          <Text style={styles.subtitle}>
            Your {style.name} stickers are in your Photos.{'\n'}
            Ready to send on any app!
          </Text>

          {/* Share buttons */}
          <View style={styles.shareSection}>
            <Text style={styles.sectionLabel}>SHARE VIA</Text>
            <View style={styles.shareRow}>
              {[
                { name: 'iMessage', emoji: '💬', color: '#34C759' },
                { name: 'WhatsApp', emoji: '📱', color: '#25D366' },
                { name: 'Telegram', emoji: '✈️', color: '#229ED9' },
                { name: 'Instagram', emoji: '📸', color: '#E1306C' },
              ].map(app => (
                <TouchableOpacity
                  key={app.name}
                  style={[styles.shareApp, { backgroundColor: app.color + '18', borderColor: app.color + '30' }]}
                  onPress={() => shareToApp(app.name)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.shareAppEmoji}>{app.emoji}</Text>
                  <Text style={styles.shareAppName}>{app.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upsell — try other styles */}
          <View style={styles.upsellSection}>
            <Text style={styles.sectionLabel}>MORE STYLES</Text>
            <View style={styles.upsellRow}>
              {otherStyles.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.upsellCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/preview?styleId=${s.id}`);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[s.color + '25', s.color + '08']}
                    style={styles.upsellCardInner}
                  >
                    <Text style={styles.upsellEmoji}>{s.emoji}</Text>
                    <Text style={styles.upsellName}>{s.name}</Text>
                    {s.tag && (
                      <View style={[styles.upsellTag, { backgroundColor: s.color + '30' }]}>
                        <Text style={[styles.upsellTagText, { color: s.color }]}>{s.tag}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.browseAllBtn}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.browseAllText}>Browse all 6 styles →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Done CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          onPress={() => router.push('/home')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Make More Stickers</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.screen, paddingBottom: SPACING.xl },

  checkContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  checkCircle: {
    width: 88, height: 88,
    borderRadius: 44,
    overflow: 'hidden',
  },
  checkGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 42, color: '#fff' },

  title: {
    fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.5, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl,
  },

  sectionLabel: {
    fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textMuted,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },

  shareSection: { marginBottom: SPACING.xl },
  shareRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  shareApp: {
    flex: 1, alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  shareAppEmoji: { fontSize: 22 },
  shareAppName: { fontSize: 10, fontFamily: FONTS.semiBold, color: COLORS.textSecondary },

  upsellSection: { marginBottom: SPACING.lg },
  upsellRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  upsellCard: { flex: 1 },
  upsellCardInner: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  upsellEmoji: { fontSize: 28 },
  upsellName: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.text, textAlign: 'center' },
  upsellTag: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  upsellTagText: { fontSize: 9, fontFamily: FONTS.bold },

  browseAllBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  browseAllText: {
    fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary,
  },

  ctaContainer: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.bg,
  },
  ctaButton: {
    height: 56, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: '#fff' },
});
