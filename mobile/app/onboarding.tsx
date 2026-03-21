import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { styleKey } from '../lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING, STYLES, SAMPLE_EXPRESSIONS } from '../lib/constants';

// 3D Cartoon is the hero style for onboarding Screen 0
const HERO_STYLE   = STYLES.find(s => s.id === '3d-cartoon')!;
const HERO_EXPRS   = HERO_STYLE.expressions;  // 6 expressions of the 3D Cartoon style

// Sticker chip positions for Screen 0 burst
// Center of 280×320 container = (140, 160), chip 56×56, radius 120
const BURST: { x: number; y: number }[] = [0, 1, 2, 3, 4, 5].map(i => {
  const angle = (i * 60 - 90) * (Math.PI / 180);
  return {
    x: Math.round(Math.cos(angle) * 120 + 140 - 28),
    y: Math.round(Math.sin(angle) * 120 + 160 - 28),
  };
});

const PLATFORMS = [
  { name: 'Telegram', color: '#229ED9' },
  { name: 'WhatsApp', color: '#25D366' },
  { name: 'iMessage', color: '#34C759' },
  { name: 'Discord',  color: '#5865F2' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [screen, setScreen] = useState(0);

  // Page transition
  const pageOpacity = useRef(new Animated.Value(1)).current;
  const pageSlide   = useRef(new Animated.Value(0)).current;

  // Screen 0 — sticker pop
  const stickerAnims = useRef(BURST.map(() => new Animated.Value(0))).current;

  // Screen 1 — style rotation
  const [activeStyle, setActiveStyle]   = useState(0);
  const styleOpacity = useRef(new Animated.Value(1)).current;
  const styleScale   = useRef(new Animated.Value(1)).current;

  // Screen 2 — chat bubbles
  const chat1 = useRef(new Animated.Value(0)).current;
  const chat2 = useRef(new Animated.Value(0)).current;
  const chat3 = useRef(new Animated.Value(0)).current;

  // CTA pulse
  const pulse     = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // ── Run per-screen animations ─────────────────────────────────────────────
  useEffect(() => {
    if (screen === 0) {
      stickerAnims.forEach(a => a.setValue(0));
      Animated.parallel(
        stickerAnims.map((anim, i) =>
          Animated.spring(anim, {
            toValue: 1, delay: 300 + i * 150,
            tension: 130, friction: 7, useNativeDriver: true,
          })
        )
      ).start();
    }

    if (screen === 1) {
      setActiveStyle(0);
      styleOpacity.setValue(1);
      styleScale.setValue(1);
    }

    if (screen === 2) {
      [chat1, chat2, chat3].forEach(a => a.setValue(0));
      Animated.stagger(420, [
        Animated.timing(chat1, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(chat2, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(chat3, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();

      pulseLoop.current?.stop();
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 750, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 750, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulse.setValue(1);
    }
  }, [screen]);

  // ── Style auto-rotate (screen 1 only) ────────────────────────────────────
  useEffect(() => {
    if (screen !== 1) return;
    const id = setInterval(() => {
      Animated.parallel([
        Animated.timing(styleOpacity, { toValue: 0,    duration: 200, useNativeDriver: true }),
        Animated.timing(styleScale,   { toValue: 0.85, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setActiveStyle(s => (s + 1) % STYLES.length);
        Animated.parallel([
          Animated.timing(styleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(styleScale,   { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    }, 900);
    return () => clearInterval(id);
  }, [screen]);

  // ── Navigation ────────────────────────────────────────────────────────────
  async function finish() {
    await SecureStore.setItemAsync('onboarding_done', 'true');
    router.replace('/home');
  }

  function skip() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    finish();
  }

  function goNext() {
    if (screen < 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(pageOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setScreen(s => s + 1);
        pageSlide.setValue(18);
        Animated.parallel([
          Animated.timing(pageOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(pageSlide,   { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start();
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      finish();
    }
  }

  const s = STYLES[activeStyle];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Skip */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.skipBtn} onPress={skip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Page */}
      <Animated.View style={[
        styles.pageWrap,
        { opacity: pageOpacity, transform: [{ translateY: pageSlide }] },
      ]}>

        {/* ─── SCREEN 0: Your face. 6 stickers. ─────────────────────── */}
        {screen === 0 && (
          <View style={styles.screen}>
            {/* Burst container */}
            <View style={styles.burstWrap}>
              {/* Avatar — reference photo of the 3D Cartoon subject */}
              <View style={styles.avatar}>
                <Image source={{ uri: HERO_STYLE.referenceImage }} style={{ width: '100%', height: '100%', borderRadius: 50 }} resizeMode="cover" />
              </View>

              {/* 6 sticker chips pop out — all 3D Cartoon expressions */}
              {HERO_EXPRS.map((expr, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.stickerChip,
                    {
                      left:            BURST[i].x,
                      top:             BURST[i].y,
                      backgroundColor: HERO_STYLE.accent + '18',
                      borderColor:     HERO_STYLE.accent + '50',
                      opacity:         stickerAnims[i],
                      transform:       [{ scale: stickerAnims[i] }],
                    },
                  ]}
                >
                  <Image source={{ uri: expr.imageUrl }} style={styles.chipImg} resizeMode="cover" />
                </Animated.View>
              ))}
            </View>

            <Text style={styles.headline}>
              {t('onboarding.screen1Title')}{'\n'}
              <Text style={{ color: COLORS.primary }}>{t('onboarding.screen1Highlight')}</Text>
            </Text>
            <Text style={styles.sub}>
              {t('onboarding.screen1Desc')}
            </Text>
          </View>
        )}

        {/* ─── SCREEN 1: 6 styles. One you. ─────────────────────────── */}
        {screen === 1 && (
          <View style={styles.screen}>
            <Animated.View style={[
              styles.styleShowcase,
              { opacity: styleOpacity, transform: [{ scale: styleScale }] },
            ]}>
              <View style={[
                styles.styleImgWrap,
                { borderColor: s.accent + '50', backgroundColor: s.accent + '18' },
              ]}>
                <Image source={{ uri: s.sampleImage }} style={styles.styleImg} resizeMode="cover" />
              </View>
              <View style={[
                styles.styleChip,
                { backgroundColor: s.accent + '20', borderColor: s.accent + '35' },
              ]}>
                <Text style={[styles.styleChipText, { color: s.accent }]}>{t(`styles.${styleKey(s.id)}.name`)}</Text>
              </View>
            </Animated.View>

            {/* Per-style dots */}
            <View style={styles.styleDots}>
              {STYLES.map((st, i) => (
                <View
                  key={i}
                  style={[
                    styles.styleDot,
                    {
                      width:           activeStyle === i ? 20 : 6,
                      backgroundColor: activeStyle === i ? st.accent : COLORS.border,
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.headline}>
              {t('onboarding.screen2Title')}{'\n'}
              <Text style={{ color: COLORS.textSecondary }}>{t('onboarding.screen2Highlight')}</Text>
            </Text>
            <Text style={styles.sub}>
              {t('onboarding.screen2Desc')}
            </Text>
          </View>
        )}

        {/* ─── SCREEN 2: Use everywhere. ─────────────────────────────── */}
        {screen === 2 && (
          <View style={styles.screen}>
            <View style={styles.chatWrap}>
              {/* Received */}
              <Animated.View style={[styles.chatRow, {
                opacity:   chat1,
                transform: [{ translateX: chat1.interpolate({ inputRange: [0,1], outputRange: [-20, 0] }) }],
              }]}>
                <View style={styles.chatAvatar}>
                  <Ionicons name="person" size={15} color={COLORS.textMuted} />
                </View>
                <View style={styles.bubbleLeft}>
                  <Text style={styles.bubbleText}>{t('onboarding.chatReceived')}</Text>
                </View>
              </Animated.View>

              {/* Stickers */}
              <Animated.View style={[styles.chatStickerRow, {
                opacity:   chat2,
                transform: [{ scale: chat2.interpolate({ inputRange: [0,1], outputRange: [0.7, 1] }) }],
              }]}>
                <View style={{ width: 34 }} />
                {SAMPLE_EXPRESSIONS.slice(0, 3).map((expr, i) => (
                  <View key={i} style={[
                    styles.chatSticker,
                    { borderColor: STYLES[i].accent + '35', backgroundColor: STYLES[i].accent + '12' },
                  ]}>
                    <Image source={{ uri: expr.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                ))}
              </Animated.View>

              {/* Reply */}
              <Animated.View style={[styles.chatRowRight, {
                opacity:   chat3,
                transform: [{ translateX: chat3.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }],
              }]}>
                <View style={styles.bubbleRight}>
                  <Text style={[styles.bubbleText, { color: COLORS.bg }]}>{t('onboarding.chatReply')}</Text>
                </View>
                <View style={[styles.chatAvatar, { backgroundColor: COLORS.primary + '20' }]}>
                  <Ionicons name="person" size={15} color={COLORS.primary} />
                </View>
              </Animated.View>

              {/* Platform badges */}
              <View style={styles.platformRow}>
                {PLATFORMS.map(p => (
                  <View key={p.name} style={[
                    styles.platformBadge,
                    { borderColor: p.color + '35', backgroundColor: p.color + '12' },
                  ]}>
                    <Text style={[styles.platformText, { color: p.color }]}>{p.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.headline}>
              {t('onboarding.screen3Title')}{'\n'}
              <Text style={{ color: '#C8E6C0' }}>{t('onboarding.screen3Highlight')}</Text>
            </Text>
            <Text style={styles.sub}>
              {t('onboarding.screen3Desc')}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ── Bottom: dots + CTA ─────────────────────────────────────────── */}
      <View style={styles.bottom}>
        {/* Page dots */}
        <View style={styles.pageDots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.pageDot,
                screen === i
                  ? { width: 28, backgroundColor: COLORS.primary }
                  : { width: 8,  backgroundColor: COLORS.border },
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        {screen < 2 ? (
          <TouchableOpacity style={styles.ctaOutline} onPress={goNext} activeOpacity={0.85}>
            <Text style={styles.ctaOutlineText}>{t('onboarding.continue')}</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.pink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaSolid}
              >
                <Text style={styles.ctaSolidText}>{t('onboarding.getStarted')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  skipBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.textMuted },

  pageWrap: { flex: 1 },

  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.sm,
  },

  // ── Screen 0 ──────────────────────────────────────────────────────────────
  burstWrap: {
    width: 280, height: 320,
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    position: 'absolute',
    left: 90, top: 110,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.elevated,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  stickerChip: {
    position: 'absolute',
    width: 56, height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  chipImg: { width: '100%', height: '100%' },

  // ── Screen 1 ──────────────────────────────────────────────────────────────
  styleShowcase: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  styleImgWrap: {
    width: 140, height: 140,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  styleImg: { width: '100%', height: '100%' },
  styleChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  styleChipText: { fontSize: 17, fontFamily: FONTS.bold },

  styleDots: {
    flexDirection: 'row', gap: 6,
    marginBottom: SPACING.lg,
  },
  styleDot: { height: 6, borderRadius: RADIUS.full },

  // ── Screen 2 ──────────────────────────────────────────────────────────────
  chatWrap: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  chatRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  chatRowRight: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 8 },
  chatAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.elevated,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  bubbleLeft: {
    backgroundColor: COLORS.surface,
    borderRadius: 18, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
    maxWidth: '75%',
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderRadius: 18, borderBottomRightRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    maxWidth: '75%',
  },
  bubbleText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text },
  chatStickerRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chatSticker: {
    width: 62, height: 62,
    borderRadius: RADIUS.md,
    borderWidth: 1, overflow: 'hidden',
  },
  platformRow: {
    flexDirection: 'row', gap: 6,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  platformBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  platformText: { fontSize: 11, fontFamily: FONTS.semiBold },

  // ── Shared text ───────────────────────────────────────────────────────────
  headline: {
    fontSize: 30, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.8, textAlign: 'center', lineHeight: 38,
    marginBottom: 10,
  },
  sub: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textMuted,
    textAlign: 'center', lineHeight: 21,
  },

  // ── Bottom ────────────────────────────────────────────────────────────────
  bottom: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  pageDots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  pageDot:  { height: 8, borderRadius: RADIUS.full },

  ctaOutline: {
    height: 56, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.primary + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaOutlineText: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.primary },

  ctaSolid: {
    height: 56, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaSolidText: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.bg },
});
