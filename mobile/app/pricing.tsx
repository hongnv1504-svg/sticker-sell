import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { PurchasesPackage } from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING, STYLES, RC_PACKAGES } from '../lib/constants';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/revenuecat';
import { styleKey } from '../lib/i18n';
import BackButton from '../components/BackButton';

export default function PricingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 8, useNativeDriver: true }),
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
      } else if (packages.length > 0) {
        // Packages loaded but selected ID not found — shouldn't happen
        throw new Error('Selected package unavailable. Please restart the app.');
      }
      // packages.length === 0 → dev / RC unavailable → allow through for testing
      // Purchase succeeded → navigate to upload
      router.push(`/upload?styleId=${style.id}`);
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert(t('pricing.purchaseErrorTitle'), err.message ?? 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setPurchasing(true);
    try {
      const info = await restorePurchases();
      const hasCredits = Object.keys(info?.entitlements?.active ?? {}).length > 0;
      if (hasCredits) {
        router.push(`/upload?styleId=${style.id}`);
      } else {
        Alert.alert(t('pricing.noRestoreTitle'), t('pricing.noRestoreMsg'));
      }
    } catch {
      Alert.alert(t('pricing.restoreErrorTitle'), t('pricing.restoreErrorMsg'));
    } finally {
      setPurchasing(false);
    }
  }

  const selectedRC = RC_PACKAGES.find(p => p.productId === selected) ?? RC_PACKAGES[1];
  const selectedRCPkg = packages.find(p => p.product.identifier === selected);
  const ctaPrice = selectedRCPkg?.product.priceString ?? selectedRC.price;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackButton />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.styleChip, { backgroundColor: style.accent + '20' }]}>
              <Image source={{ uri: style.sampleImage }} style={styles.styleChipImage} resizeMode="cover" />
              <Text style={styles.styleChipText}>{t(`styles.${styleKey(style.id)}.name`)}</Text>
            </View>
            <Text style={styles.title}>{t('pricing.title')}</Text>
            <Text style={styles.subtitle}>{t('pricing.subtitle')}</Text>
          </View>

          {/* Package Cards */}
          {loading ? (
            <ActivityIndicator color={style.accent} style={{ marginVertical: SPACING.xl }} />
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
                    accentColor={style.accent}
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
            {([
              ['color-palette-outline', t('pricing.featureStickers', { count: selectedRC.credits * 6, name: t(`styles.${styleKey(style.id)}.name`) })],
              ['flash-outline',         t('pricing.featureFast')],
              ['download-outline',      t('pricing.featureDownload')],
              ['phone-portrait-outline', t('pricing.featureOptimized')],
            ] as const).map(([icon, text], i) => (
              <View key={i} style={styles.perkRow}>
                <Ionicons name={icon} size={16} color={style.accent} style={styles.perkIcon} />
                <Text style={styles.perkText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Trust */}
          <View style={styles.trust}>
            <View style={styles.trustRow}>
              <Ionicons name="lock-closed-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.trustText}>{t('pricing.securePay')}</Text>
            </View>
            <View style={styles.trustRow}>
              <Ionicons name="refresh-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.trustText}>{t('pricing.moneyBack')}</Text>
            </View>
          </View>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} disabled={purchasing}>
            <Text style={[styles.restoreText, { color: style.accent }]}>{t('pricing.restore')}</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            {t('pricing.legal')}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity onPress={handlePurchase} disabled={purchasing} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Purchase ${selectedRC.credits} packs`}>
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.ctaText}>
                {selectedRC.credits === 1 ? t('pricing.ctaPack', { price: ctaPrice }) : t('pricing.ctaPacks', { count: selectedRC.credits, price: ctaPrice })}
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
  accentColor,
  index,
  onSelect,
}: {
  pkg: typeof RC_PACKAGES[0];
  displayPrice: string;
  isSelected: boolean;
  accentColor: string;
  index: number;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 130,
      friction: 7,
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
          isSelected && [styles.cardSelected, { borderColor: accentColor, backgroundColor: accentColor + '0D' }],
          pkg.isPopular && [styles.cardPopular, { borderColor: accentColor }],
        ]}
      >
        {pkg.isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: accentColor }]}>
            <Ionicons name="star" size={10} color={COLORS.bg} />
            <Text style={[styles.popularBadgeText, { color: COLORS.bg }]}>{' '}{t('pricing.mostPopular')}</Text>
          </View>
        )}

        {pkg.isAnchor && (
          <View style={styles.anchorBadge}>
            <Text style={styles.anchorBadgeText}>{t('pricing.bestValue')}</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            {/* Radio */}
            <View style={[styles.radio, isSelected && [styles.radioSelected, { borderColor: accentColor }]]}>
              {isSelected && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
            </View>

            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {t(`pricing.${pkg.credits === 6 ? 'allStyles' : pkg.credits === 3 ? 'threeStyles' : 'oneStyle'}`)}
              </Text>
              <Text style={styles.cardDesc}>
                {t(`pricing.${pkg.credits === 6 ? 'allStylesDesc' : pkg.credits === 3 ? 'threeStylesDesc' : 'oneStyleDesc'}`)}
              </Text>
              {pkg.save && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{t('pricing.save22')}</Text>
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

  header: { alignItems: 'center', paddingVertical: SPACING.lg },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    gap: 6,
  },
  styleChipImage: { width: 18, height: 18, borderRadius: 4 },
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
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadgeText: {
    fontSize: 10, fontFamily: FONTS.bold, color: COLORS.text, letterSpacing: 1.2,
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
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  trustText: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textMuted },

  restoreBtn: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
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
  ctaText: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.text },
});
