import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
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

    // Auto-navigate: show onboarding first-time, else go straight to home
    let cancelled = false;
    const minDelay = new Promise<void>(r => setTimeout(r, 1500));
    const check = SecureStore.getItemAsync('onboarding_done');
    Promise.all([minDelay, check]).then(([, done]) => {
      if (!cancelled) router.replace(done ? '/home' : '/onboarding');
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
          <Image source={require('../assets/splash-logo.png')} style={styles.logoImage} />
        </Animated.View>

        <LinearGradient
          colors={[COLORS.primary, COLORS.pink]}
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
  iconWrap: {
    marginBottom: 16,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  titleGradient: {
    borderRadius: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: FONTS.extraBold,
    color: COLORS.text,
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
