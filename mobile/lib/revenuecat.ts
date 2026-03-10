import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!;

let configured = false;

export function configureRevenueCat(): void {
  if (configured) return;
  if (Platform.OS === 'ios' && RC_IOS_KEY) {
    Purchases.configure({ apiKey: RC_IOS_KEY });
    configured = true;
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}
