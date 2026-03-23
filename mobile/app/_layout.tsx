import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as usePlusJakartaSans,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceMono_700Bold,
  useFonts as useSpaceMono,
} from '@expo-google-fonts/space-mono';
import '../lib/i18n';
import { configureRevenueCat } from '../lib/revenuecat';
import { COLORS } from '../lib/constants';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [plusLoaded] = usePlusJakartaSans({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [monoLoaded] = useSpaceMono({ SpaceMono_700Bold });

  const [iconsLoaded] = useFonts({ ...Ionicons.font });

  const fontsLoaded = plusLoaded && monoLoaded && iconsLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      configureRevenueCat();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="processing" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
        <Stack.Screen name="success" options={{ gestureEnabled: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
