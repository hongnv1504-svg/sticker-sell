import { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { styleKey } from '../lib/i18n';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectStyle = (styleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/preview?styleId=${styleId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Style Cards */}
        {STYLES.map((style, i) => (
          <StyleCard
            key={style.id}
            style={style}
            index={i}
            onPress={() => handleSelectStyle(style.id)}
          />
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function StyleCard({
  style,
  index,
  onPress,
}: {
  style: (typeof STYLES)[0];
  index: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0, delay: index * 80, tension: 120, friction: 8, useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        marginBottom: SPACING.sm,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[
          styles.card,
          { borderColor: style.accent + '22' },
          style.tag === 'Most Popular' && styles.cardFeatured,
        ]}>
          {/* Tag */}
          {style.tag && (
            <View style={[
              styles.tag,
              { borderColor: style.tag === 'Most Popular' ? COLORS.primary + '55' : COLORS.success + '55' },
            ]}>
              <Ionicons
                name={style.tag === 'Most Popular' ? 'star' : 'flash'}
                size={9}
                color={style.tag === 'Most Popular' ? COLORS.primary : COLORS.success}
              />
              <Text style={[
                styles.tagText,
                { color: style.tag === 'Most Popular' ? COLORS.primary : COLORS.success },
              ]}>
                {t(`home.${style.tag === 'Most Popular' ? 'mostPopular' : 'new'}`).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.cardRow}>
            {/* Sample image */}
            <View style={[styles.iconBox, { backgroundColor: style.accent + '18' }]}>
              <Image
                source={{ uri: style.sampleImage }}
                style={styles.sampleImg}
                resizeMode="cover"
              />
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{t(`styles.${styleKey(style.id)}.name`)}</Text>
              <Text style={styles.cardDesc}>{t(`styles.${styleKey(style.id)}.desc`)}</Text>

              {/* Expression preview images — per-style */}
              <View style={styles.emojiRow}>
                {style.expressions.map((expr, j) => (
                  <View key={j} style={styles.emojiChip}>
                    <Image
                      source={{ uri: expr.imageUrl }}
                      style={styles.exprImg}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.screen, paddingBottom: SPACING.xxl },
  header: { paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  title: {
    fontSize: 30, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  cardFeatured: {
    borderColor: COLORS.primary + '70',
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  tag: {
    position: 'absolute', top: 10, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    zIndex: 1,
  },
  tagText: {
    fontSize: 9, fontFamily: FONTS.bold, letterSpacing: 0.6,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: RADIUS.md,
    overflow: 'hidden', flexShrink: 0,
  },
  sampleImg: { width: '100%', height: '100%' },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textMuted, lineHeight: 17,
  },
  emojiRow: { flexDirection: 'row', gap: 4, marginTop: 8, flexWrap: 'wrap' },
  emojiChip: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: COLORS.elevated,
    overflow: 'hidden',
  },
  exprImg: { width: '100%', height: '100%' },
  chevron: { fontSize: 20, color: COLORS.textMuted },
});
