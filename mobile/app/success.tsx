import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, Image, Linking, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { getJobStatus, JobStatus } from '../lib/api';
import { styleKey } from '../lib/i18n';

// Apps shown as static "works with" indicators (not buttons)
const COMPATIBLE_APPS = [
  { name: 'iMessage',  icon: 'chatbubble-ellipses-outline', color: '#34C759' },
  { name: 'WhatsApp',  icon: 'logo-whatsapp',               color: '#25D366' },
  { name: 'Telegram',  icon: 'paper-plane-outline',          color: '#229ED9' },
  { name: 'Instagram', icon: 'logo-instagram',               color: '#E1306C' },
] as const;

export default function SuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { jobId, styleId } = useLocalSearchParams<{ jobId: string; styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [stickers, setStickers] = useState<JobStatus['stickers']>([]);
  const [sharing, setSharing] = useState(false);
  const [tgModal, setTgModal] = useState(false);
  const [shareIdx, setShareIdx] = useState(0);

  const checkAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.5)).current;

  const otherStyles = STYLES.filter(s => s.id !== style.id).slice(0, 3);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
        Animated.timing(checkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    if (jobId) {
      getJobStatus(jobId).then(s => setStickers(s.stickers)).catch(() => {});
    }
  }, []);

  // Download a sticker URL to the local cache dir and return the local path
  async function downloadToCache(url: string, filename: string): Promise<string> {
    const localPath = `${FileSystem.cacheDirectory}${filename}`;
    const { uri } = await FileSystem.downloadAsync(url, localPath);
    return uri;
  }

  // Share selected sticker using local file path (native iOS share sheet)
  async function handleShare(idx: number) {
    if (stickers.length === 0 || !stickers[idx]) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSharing(true);
    try {
      const s = stickers[idx];
      const localPath = await downloadToCache(s.imageUrl, `sticker_${s.emotion}.png`);
      await Sharing.shareAsync(localPath, { mimeType: 'image/png' });
    } catch {
      // User cancelled or sharing failed — silent
    } finally {
      setSharing(false);
    }
  }

  async function openTgBot() {
    setTgModal(false);
    const tgDeep = 'tg://resolve?domain=Stickers';
    const tgWeb  = 'https://t.me/Stickers';
    const canOpen = await Linking.canOpenURL(tgDeep);
    Linking.openURL(canOpen ? tgDeep : tgWeb);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Success checkmark */}
        <View style={styles.checkContainer}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[COLORS.success, COLORS.success + 'CC']}
              style={styles.checkGradient}
            >
              <Animated.Text style={[styles.checkMark, { opacity: checkAnim }]}>✓</Animated.Text>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>{t('success.title')}</Text>
          <Text style={styles.subtitle}>
            {t('success.subtitle', { style: t(`styles.${styleKey(style.id)}.name`) })}
          </Text>

          {/* Share section */}
          <View style={styles.shareSection}>
            {/* Static "works with" app indicators — not buttons */}
            <Text style={styles.sectionLabel}>{t('success.shareVia')}</Text>
            <View style={styles.appIndicatorRow}>
              {COMPATIBLE_APPS.map(app => (
                <View
                  key={app.name}
                  style={[styles.appIndicator, { backgroundColor: app.color + '18', borderColor: app.color + '30' }]}
                >
                  <Ionicons name={app.icon} size={22} color={app.color} />
                  <Text style={styles.appIndicatorName}>{app.name}</Text>
                </View>
              ))}
            </View>

            {/* Sticker picker — tap to select, then share */}
            {stickers.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stickerPickerRow}
                style={styles.stickerPicker}
              >
                {stickers.map((s, i) => (
                  <TouchableOpacity
                    key={s.emotion}
                    onPress={() => { Haptics.selectionAsync(); setShareIdx(i); }}
                    activeOpacity={0.8}
                    style={[
                      styles.stickerThumb,
                      shareIdx === i && styles.stickerThumbSelected,
                    ]}
                  >
                    <Image source={{ uri: s.imageUrl }} style={styles.stickerThumbImg} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Share button */}
            <TouchableOpacity
              onPress={() => handleShare(shareIdx)}
              disabled={sharing || stickers.length === 0}
              activeOpacity={0.85}
              style={styles.shareBtn}
            >
              <Ionicons
                name={sharing ? 'hourglass-outline' : 'share-outline'}
                size={18}
                color={COLORS.text}
              />
              <Text style={styles.shareBtnText}>{t('success.shareBtn')}</Text>
            </TouchableOpacity>
          </View>

          {/* Create Telegram Pack — separate feature */}
          <TouchableOpacity
            style={styles.tgCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setTgModal(true); }}
            activeOpacity={0.85}
          >
            <View style={styles.tgIconWrap}>
              <Ionicons name="paper-plane" size={22} color="#229ED9" />
            </View>
            <View style={styles.tgText}>
              <Text style={styles.tgTitle}>{t('success.tgCardTitle')}</Text>
              <Text style={styles.tgSub}>{t('success.tgCardSub')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* More styles upsell */}
          <View style={styles.upsellSection}>
            <Text style={styles.sectionLabel}>{t('success.moreStyles')}</Text>
            <View style={styles.upsellRow}>
              {otherStyles.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.upsellCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/preview?styleId=${s.id}`);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[s.accent + '25', s.accent + '08']}
                    style={styles.upsellCardInner}
                  >
                    <Image source={{ uri: s.sampleImage }} style={styles.upsellImage} resizeMode="cover" />
                    <Text style={styles.upsellName}>{t(`styles.${styleKey(s.id)}.name`)}</Text>
                    {s.tag && (
                      <View style={[styles.upsellTag, { backgroundColor: s.accent + '30' }]}>
                        <Text style={[styles.upsellTagText, { color: s.accent }]}>
                          {s.tag === 'Most Popular' ? t('home.mostPopular') : t('home.new')}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.browseAllBtn} onPress={() => router.push('/home')}>
              <Text style={styles.browseAllText}>{t('success.browseAll')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Telegram Pack Modal */}
      <Modal visible={tgModal} transparent animationType="slide" onRequestClose={() => setTgModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTgModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('success.modalTitle')}</Text>
            <Text style={styles.modalSub}>{t('success.modalSub')}</Text>
            {([
              { icon: 'paper-plane-outline',   text: t('success.modalStep0') },
              { icon: 'chatbubble-outline',     text: t('success.modalStep1') },
              { icon: 'images-outline',         text: t('success.modalStep2') },
              { icon: 'checkmark-done-outline', text: t('success.modalStep3') },
            ] as const).map((step, i) => (
              <View key={i} style={styles.modalStep}>
                <View style={styles.modalStepNum}>
                  <Text style={styles.modalStepNumText}>{i + 1}</Text>
                </View>
                <Ionicons name={step.icon} size={18} color={COLORS.textSecondary} />
                <Text style={styles.modalStepText}>{step.text}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.modalCta} onPress={openTgBot} activeOpacity={0.85}>
              <Ionicons name="paper-plane" size={16} color={COLORS.bg} />
              <Text style={styles.modalCtaText}>{t('success.modalOpenBot')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Make More Stickers CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity onPress={() => router.push('/home')} activeOpacity={0.85}>
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>{t('success.makeMore')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.screen, paddingBottom: SPACING.xl },

  checkContainer: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  checkCircle:    { width: 88, height: 88, borderRadius: 44, overflow: 'hidden' },
  checkGradient:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  checkMark:      { fontSize: 42, color: COLORS.text },

  title: {
    fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.5, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl,
  },

  sectionLabel: {
    fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textMuted,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },

  // Share section
  shareSection: { marginBottom: SPACING.xl },

  appIndicatorRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  appIndicator: {
    flex: 1, alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 4,
  },
  appIndicatorName: {
    fontSize: 9, fontFamily: FONTS.semiBold, color: COLORS.textMuted,
  },

  stickerPicker: { marginBottom: SPACING.md },
  stickerPickerRow: { gap: SPACING.sm },
  stickerThumb: {
    width: 56, height: 56, borderRadius: RADIUS.sm,
    borderWidth: 2, borderColor: 'transparent',
    overflow: 'hidden',
  },
  stickerThumbSelected: {
    borderColor: COLORS.primary,
  },
  stickerThumbImg: { width: '100%', height: '100%' },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
  },
  shareBtnText: {
    fontSize: 15, fontFamily: FONTS.bold, color: COLORS.text,
  },

  // Telegram card
  tgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#229ED930',
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  tgIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: '#229ED918',
    alignItems: 'center', justifyContent: 'center',
  },
  tgText:  { flex: 1 },
  tgTitle: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.text },
  tgSub:   { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 2 },

  // More styles
  upsellSection: { marginBottom: SPACING.lg },
  upsellRow:     { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  upsellCard:    { flex: 1 },
  upsellCardInner: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  upsellImage: { width: 48, height: 48, borderRadius: RADIUS.sm },
  upsellName:  { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.text, textAlign: 'center' },
  upsellTag:   { borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 },
  upsellTagText: { fontSize: 9, fontFamily: FONTS.bold },

  browseAllBtn:  { alignItems: 'center', paddingVertical: SPACING.sm },
  browseAllText: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary },

  // CTA
  ctaContainer: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.bg,
  },
  ctaButton: { height: 56, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  ctaText:   { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.text },

  // Telegram Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlayDark, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  modalHandle: {
    width: 36, height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle:       { fontSize: 18, fontFamily: FONTS.extraBold, color: COLORS.text },
  modalSub:         { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: -SPACING.sm },
  modalStep:        { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  modalStepNum:     { width: 24, height: 24, borderRadius: 12, backgroundColor: '#229ED920', alignItems: 'center', justifyContent: 'center' },
  modalStepNumText: { fontSize: 12, fontFamily: FONTS.bold, color: '#229ED9' },
  modalStepText:    { flex: 1, fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text },
  modalCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#229ED9', borderRadius: RADIUS.md,
    height: 50, gap: SPACING.sm, marginTop: SPACING.sm,
  },
  modalCtaText: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.bg },
});
