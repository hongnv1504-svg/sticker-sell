import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../lib/constants';

export default function SplashScreen() {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Auto-navigate
    const t = setTimeout(() => {
      router.replace('/home');
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.Text
          style={[styles.emoji, { transform: [{ translateY: floatAnim }] }]}
        >
          🎨
        </Animated.Text>

        <LinearGradient
          colors={['#FF6B9D', '#845EF7', '#20C997']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradient}
        >
          <Text style={styles.title}>Stickerify</Text>
        </LinearGradient>

        <Text style={styles.subtitle}>Your face → Your stickers</Text>

        <View style={styles.spinner} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  titleGradient: {
    borderRadius: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: FONTS.extraBold,
    color: '#FFFFFF',
    letterSpacing: -1,
    paddingHorizontal: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 36,
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderTopColor: COLORS.primary,
  },
});
