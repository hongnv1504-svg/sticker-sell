import { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';

export default function PreviewScreen() {
  const router = useRouter();
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCTA = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/pricing?styleId=${style.id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Style Hero */}
          <View style={styles.hero}>
            <Animated.View style={[styles.heroIcon, { backgroundColor: style.color + '18', transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.heroEmoji}>{style.emoji}</Text>
            </Animated.View>
            <Text style={styles.heroName}>{style.name}</Text>
            <Text style={styles.heroDesc}>{style.desc}</Text>
          </View>

          {/* Expressions label */}
          <Text style={styles.sectionLabel}>6 EXPRESSIONS YOU'LL GET</Text>

          {/* Expression Grid */}
          <View style={styles.grid}>
            {style.expressions.map((expr, i) => (
              <ExpressionTile
                key={i}
                expr={expr}
                color={style.color}
                index={i}
              />
            ))}
          </View>

          {/* What you get */}
          <View style={styles.infoCard}>
            <Text style={styles.infoRow}>✨  6 unique stickers in {style.name} style</Text>
            <Text style={styles.infoRow}>📱  Optimized for iMessage & WhatsApp</Text>
            <Text style={styles.infoRow}>⚡  Ready in under 30 seconds</Text>
            <Text style={styles.infoRow}>💾  Save to Photos or share directly</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity onPress={handleCTA} activeOpacity={0.85}>
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Get This Style →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ExpressionTile({
  expr,
  color,
  index,
}: {
  expr: { name: string; emoji: string };
  color: string;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.tile, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.tileInner, { backgroundColor: color + '10', borderColor: color + '18' }]}>
        <Text style={styles.tileEmoji}>{expr.emoji}</Text>
        <Text style={styles.tileName}>{expr.name}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.screen, paddingBottom: SPACING.xl },
  backBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  backText: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  hero: { alignItems: 'center', paddingVertical: SPACING.lg },
  heroIcon: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  heroEmoji: { fontSize: 42 },
  heroName: {
    fontSize: 26, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 6,
  },
  heroDesc: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center', paddingHorizontal: SPACING.md,
  },
  sectionLabel: {
    fontSize: 11, fontFamily: FONTS.bold, color: COLORS.textMuted,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  tile: { width: '30%' },
  tileInner: {
    borderRadius: RADIUS.md, borderWidth: 1,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  tileEmoji: { fontSize: 32, marginBottom: SPACING.xs },
  tileName: {
    fontSize: 11, fontFamily: FONTS.semiBold, color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoRow: {
    fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, lineHeight: 20,
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
