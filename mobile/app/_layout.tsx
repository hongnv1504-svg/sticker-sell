import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
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
import { configureRevenueCat } from '../lib/revenuecat';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [plusLoaded] = usePlusJakartaSans({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [monoLoaded] = useSpaceMono({ SpaceMono_700Bold });

  const fontsLoaded = plusLoaded && monoLoaded;

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
          contentStyle: { backgroundColor: '#06060A' },
          animation: 'fade',
        }}
      />
    </SafeAreaProvider>
  );
}
