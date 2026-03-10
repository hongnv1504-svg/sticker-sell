import { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';

export default function HomeScreen() {
  const router = useRouter();
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
          <Text style={styles.title}>Choose Style</Text>
          <Text style={styles.subtitle}>Pick a style, upload selfie, get 6 stickers</Text>
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true,
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
        <View style={[styles.card, { borderColor: style.color + '22' }]}>
          {/* Tag */}
          {style.tag && (
            <LinearGradient
              colors={style.tag === 'Most Popular' ? ['#FF6B9D', '#845EF7'] : ['#20C997', '#0ca678']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.tag}
            >
              <Text style={styles.tagText}>{style.tag}</Text>
            </LinearGradient>
          )}

          <View style={styles.cardRow}>
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: style.color + '18' }]}>
              <Text style={styles.emoji}>{style.emoji}</Text>
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{style.name}</Text>
              <Text style={styles.cardDesc}>{style.desc}</Text>

              {/* Preview emojis */}
              <View style={styles.emojiRow}>
                {style.expressions.slice(0, 6).map((expr, j) => (
                  <View key={j} style={styles.emojiChip}>
                    <Text style={styles.emojiChipText}>{expr.emoji}</Text>
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
    overflow: 'hidden',
  },
  tag: {
    position: 'absolute', top: -1, right: 16,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, zIndex: 1,
  },
  tagText: {
    fontSize: 10, fontFamily: FONTS.bold, color: '#fff',
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emoji: { fontSize: 28 },
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
    alignItems: 'center', justifyContent: 'center',
  },
  emojiChipText: { fontSize: 14 },
  chevron: { fontSize: 20, color: COLORS.textMuted },
});
