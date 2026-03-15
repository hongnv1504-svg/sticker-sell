import { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { styleKey } from '../lib/i18n';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';

export default function PreviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
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
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Style Hero — real reference photo */}
          <View style={styles.hero}>
            <Animated.View style={[styles.heroPhotoWrap, { transform: [{ scale: scaleAnim }] }]}>
              <Image
                source={{ uri: style.referenceImage }}
                style={styles.heroPhoto}
                resizeMode="cover"
              />
              {/* accent ring */}
              <View style={[styles.heroRing, { borderColor: style.accent }]} />
            </Animated.View>
            <Text style={styles.heroName}>{t(`styles.${styleKey(style.id)}.name`)}</Text>
            <Text style={styles.heroDesc}>{t(`styles.${styleKey(style.id)}.desc`)}</Text>
          </View>

          {/* Expressions label */}
          <Text style={styles.sectionLabel}>{t('preview.expressionsLabel')}</Text>

          {/* Expression Grid — per-style images */}
          <View style={styles.grid}>
            {style.expressions.map((expr, i) => (
              <ExpressionTile
                key={i}
                expr={expr}
                color={style.accent}
                index={i}
              />
            ))}
          </View>

          {/* What you get */}
          <View style={styles.infoCard}>
            {([
              ['star-outline',          t('preview.infoStickers', { name: t(`styles.${styleKey(style.id)}.name`) })],
              ['phone-portrait-outline', t('preview.infoOptimized')],
              ['flash-outline',         t('preview.infoFast')],
              ['download-outline',      t('preview.infoDownload')],
            ] as const).map(([icon, text], i) => (
              <View key={i} style={styles.infoRow}>
                <Ionicons name={icon} size={15} color={style.accent} style={styles.infoIcon} />
                <Text style={styles.infoText}>{text}</Text>
              </View>
            ))}
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
            <Text style={styles.ctaText}>{t('preview.cta')}</Text>
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
  expr: { name: string; imageUrl: string };
  color: string;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 130,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.tile, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.tileInner, { backgroundColor: color + '10', borderColor: color + '18' }]}>
        <Image
          source={{ uri: expr.imageUrl }}
          style={styles.tileImage}
          resizeMode="cover"
        />
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
  heroPhotoWrap: {
    width: 160, height: 200, borderRadius: RADIUS.xl,
    overflow: 'hidden', marginBottom: 16,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  heroPhoto: { width: '100%', height: '100%' },
  heroRing: {
    position: 'absolute', inset: 0,
    borderRadius: RADIUS.xl, borderWidth: 2,
    opacity: 0.5,
  },
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
    paddingVertical: SPACING.sm, alignItems: 'center',
    overflow: 'hidden',
  },
  tileImage: { width: 64, height: 64, borderRadius: 10, marginBottom: SPACING.xs },
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
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  infoIcon: { width: 20 },
  infoText: {
    flex: 1,
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
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.text },
});
