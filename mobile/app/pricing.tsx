import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { PurchasesPackage } from 'react-native-purchases';
import { COLORS, FONTS, RADIUS, SPACING, STYLES, RC_PACKAGES } from '../lib/constants';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/revenuecat';

export default function PricingScreen() {
  const router = useRouter();
  const { styleId } = useLocalSearchParams<{ styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string>(RC_PACKAGES[1].productId); // default "Most Popular"
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    loadOfferings();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  async function loadOfferings() {
    try {
      const offering = await getOfferings();
      if (offering?.availablePackages?.length) {
        setPackages(offering.availablePackages);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);

    try {
      const pkg = packages.find(p => p.product.identifier === selected);
      if (pkg) {
        await purchasePackage(pkg);
      }
      // Purchase succeeded → navigate to upload
      router.push(`/upload?styleId=${style.id}`);
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert('Purchase failed', err.message ?? 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setPurchasing(true);
    try {
      const info = await restorePurchases();
      const hasCredits = Object.keys(info.entitlements.active).length > 0;
      if (hasCredits) {
        router.push(`/upload?styleId=${style.id}`);
      } else {
        Alert.alert('No purchases found', 'No previous purchases were found for this Apple ID.');
      }
    } catch {
      Alert.alert('Restore failed', 'Could not restore purchases. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  const selectedRC = RC_PACKAGES.find(p => p.productId === selected) ?? RC_PACKAGES[1];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.styleChip, { backgroundColor: style.color + '20' }]}>
              <Text style={styles.styleChipText}>{style.emoji} {style.name}</Text>
            </View>
            <Text style={styles.title}>Choose your pack</Text>
            <Text style={styles.subtitle}>One-time purchase • No subscription • Yours forever</Text>
          </View>

          {/* Package Cards */}
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
          ) : (
            <View style={styles.packages}>
              {RC_PACKAGES.map((pkg, i) => {
                const isSelected = selected === pkg.productId;
                const rcPkg = packages.find(p => p.product.identifier === pkg.productId);
                const displayPrice = rcPkg?.product.priceString ?? pkg.price;

                return (
                  <PackageCard
                    key={pkg.productId}
                    pkg={pkg}
                    displayPrice={displayPrice}
                    isSelected={isSelected}
                    index={i}
                    onSelect={() => {
                      Haptics.selectionAsync();
                      setSelected(pkg.productId);
                    }}
                  />
                );
              })}
            </View>
          )}

          {/* What you get */}
          <View style={styles.perks}>
            {[
              { icon: '🎨', text: `${selectedRC.credits * 6} unique stickers in ${style.name} style` },
              { icon: '⚡', text: 'Generated in under 30 seconds' },
              { icon: '💾', text: 'Save to Photos or share directly' },
              { icon: '📱', text: 'Optimized for iMessage & WhatsApp' },
            ].map((p, i) => (
              <View key={i} style={styles.perkRow}>
                <Text style={styles.perkIcon}>{p.icon}</Text>
                <Text style={styles.perkText}>{p.text}</Text>
              </View>
            ))}
          </View>

          {/* Trust */}
          <View style={styles.trust}>
            <Text style={styles.trustText}>🔒  Secure payment via Apple Pay</Text>
            <Text style={styles.trustText}>🔄  30-day money-back guarantee</Text>
          </View>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={purchasing}>
            <Text style={styles.restoreText}>Restore previous purchases</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Payment will be charged to your Apple ID account. This is a one-time purchase, not a subscription.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity onPress={handlePurchase} disabled={purchasing} activeOpacity={0.85}>
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                Get {selectedRC.credits === 1 ? '1 Pack' : `${selectedRC.credits} Packs`} — {selectedRC.price}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function PackageCard({
  pkg,
  displayPrice,
  isSelected,
  index,
  onSelect,
}: {
  pkg: typeof RC_PACKAGES[0];
  displayPrice: string;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.85}
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          pkg.isPopular && styles.cardPopular,
        ]}
      >
        {pkg.isPopular && (
          <LinearGradient
            colors={['#FF6B9D', '#845EF7']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.popularBadge}
          >
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </LinearGradient>
        )}

        {pkg.isAnchor && (
          <View style={styles.anchorBadge}>
            <Text style={styles.anchorBadgeText}>BEST VALUE</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            {/* Radio */}
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>

            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {pkg.title}
              </Text>
              <Text style={styles.cardDesc}>{pkg.desc}</Text>
              {pkg.save && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{pkg.save}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.cardPrice, isSelected && styles.cardPriceSelected]}>
            {displayPrice}
          </Text>
        </View>
      </TouchableOpacity>
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

  header: { alignItems: 'center', paddingVertical: SPACING.lg },
  styleChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  styleChipText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.text },
  title: {
    fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: {
    fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center',
  },

  packages: { gap: SPACING.sm, marginBottom: SPACING.lg },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  cardPopular: {
    borderColor: COLORS.pink,
  },

  popularBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    alignItems: 'center',
  },
  popularBadgeText: {
    fontSize: 10, fontFamily: FONTS.bold, color: '#fff', letterSpacing: 1.2,
  },
  anchorBadge: {
    backgroundColor: COLORS.elevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    alignItems: 'center',
  },
  anchorBadgeText: {
    fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textMuted, letterSpacing: 1.2,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 15, fontFamily: FONTS.bold, color: COLORS.textSecondary,
    marginBottom: 2,
  },
  cardTitleSelected: { color: COLORS.text },
  cardDesc: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textMuted },
  saveBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: 'flex-start', marginTop: 4,
  },
  saveBadgeText: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.success },
  cardPrice: {
    fontSize: 18, fontFamily: FONTS.extraBold, color: COLORS.textSecondary,
  },
  cardPriceSelected: { color: COLORS.text },

  perks: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  perkIcon: { fontSize: 16, width: 24 },
  perkText: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, flex: 1 },

  trust: { gap: SPACING.xs, marginBottom: SPACING.lg },
  trustText: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textMuted, textAlign: 'center' },

  restoreBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  restoreText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.primary },

  legal: {
    fontSize: 10, fontFamily: FONTS.regular, color: COLORS.textMuted,
    textAlign: 'center', paddingHorizontal: SPACING.md, marginTop: SPACING.sm, lineHeight: 16,
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
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: '#fff' },
});
