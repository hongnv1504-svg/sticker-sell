import { Platform, NativeModules } from 'react-native';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!;

// True only when the native RevenueCat module is actually linked in the current build.
// — Expo Go (no custom build): RNPurchases is undefined → mock mode
// — Dev client / preview / production build: RNPurchases exists → real purchases
const RC_AVAILABLE = Platform.OS === 'ios' && !!NativeModules.RNPurchases;

let configured = false;

export function configureRevenueCat(): void {
  if (!RC_AVAILABLE) return;   // not linked — skip silently (Expo Go / web)
  if (configured) return;
  if (RC_IOS_KEY) {
    const Purchases = require('react-native-purchases').default;
    Purchases.configure({ apiKey: RC_IOS_KEY });
    configured = true;
  }
}

export async function getOfferings() {
  if (!RC_AVAILABLE) return null; // pricing screen falls back to RC_PACKAGES static data
  try {
    const Purchases = require('react-native-purchases').default;
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  if (!RC_AVAILABLE) {
    // Native module not linked (Expo Go) — simulate success for UI testing
    await new Promise(r => setTimeout(r, 1000));
    return { entitlements: { active: {} } } as unknown as CustomerInfo;
  }
  const Purchases = require('react-native-purchases').default;
  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!RC_AVAILABLE) {
    await new Promise(r => setTimeout(r, 800));
    return { entitlements: { active: {} } } as unknown as CustomerInfo;
  }
  const Purchases = require('react-native-purchases').default;
  return await Purchases.restorePurchases();
}
