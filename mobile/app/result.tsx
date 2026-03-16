import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Image, ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { getJobStatus, JobStatus } from '../lib/api';

export default function ResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { jobId, styleId } = useLocalSearchParams<{ jobId: string; styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [stickers, setStickers] = useState<JobStatus['stickers']>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStickers();
  }, []);

  async function loadStickers(attempt = 1) {
    setLoadError(false);
    setLoading(true);
    try {
      // Retry up to 3 times — handles transient network errors and DB timing races
      for (let i = 0; i < attempt; i++) {
        const status = await getJobStatus(jobId!);
        if (status.stickers.length > 0 || status.status === 'failed') {
          setStickers(status.stickers);
          return;
        }
        // Job completed but stickers not visible yet — wait and retry
        if (i < attempt - 1) await new Promise(r => setTimeout(r, 2000));
        else setStickers(status.stickers);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function saveAll() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('result.permissionTitle'), t('result.permissionMsg'));
      return;
    }

    setSavingAll(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      for (const sticker of stickers) {
        await MediaLibrary.saveToLibraryAsync(sticker.imageUrl);
      }
      Alert.alert(t('result.savedTitle'), t('result.savedMsg', { count: stickers.length }), [
        { text: t('common.ok'), onPress: () => router.push(`/success?jobId=${jobId}&styleId=${style.id}`) },
      ]);
    } catch {
      Alert.alert(t('result.saveErrorTitle'), t('result.saveErrorMsg'));
    } finally {
      setSavingAll(false);
    }
  }

  async function shareSticker(url: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert(t('result.shareUnavailableTitle'), t('result.shareUnavailableMsg'));
      return;
    }
    await Sharing.shareAsync(url, { mimeType: 'image/png' });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="sparkles" size={52} color={style.accent} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.title}>{t('result.title')}</Text>
          <Text style={styles.subtitle}>{t('result.subtitle')}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={style.accent} style={{ marginVertical: SPACING.xl }} />
        ) : loadError ? (
          <Animated.View style={[styles.errorCard, { opacity: fadeAnim }]}>
            <Text style={styles.errorTitle}>{t('common.error')}</Text>
            <Text style={styles.errorMsg}>{t('result.loadErrorMsg')}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: style.accent }]} onPress={() => loadStickers(3)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : stickers.length === 0 ? (
          <Animated.View style={[styles.errorCard, { opacity: fadeAnim }]}>
            <Text style={styles.errorTitle}>{t('result.emptyTitle', 'No stickers found')}</Text>
            <Text style={styles.errorMsg}>{t('result.emptyMsg', 'Generation may have failed. Please try again.')}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: style.accent }]} onPress={() => loadStickers(3)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Sticker Grid 3×2 */}
            <View style={styles.grid}>
              {stickers.map((sticker, i) => (
                <StickerTile
                  key={sticker.id}
                  sticker={sticker}
                  index={i}
                  onShare={() => shareSticker(sticker.imageUrl)}
                />
              ))}
            </View>

            {/* Style info */}
            <View style={styles.styleRow}>
              <View style={[styles.styleIcon, { backgroundColor: style.accent + '20' }]}>
                <Image source={{ uri: style.sampleImage }} style={styles.styleImage} resizeMode="cover" />
              </View>
              <View>
                <Text style={styles.styleName}>{style.name}</Text>
                <Text style={styles.styleCount}>{t('result.stickersGenerated', { count: stickers.length })}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.tryAnotherBtn}
          onPress={() => router.push('/home')}
        >
          <Text style={[styles.tryAnotherText, { color: style.accent }]}>{t('result.tryAnother')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveAll}
          disabled={savingAll || loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={style.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.saveButton}
          >
            {savingAll ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <View style={styles.saveButtonRow}>
                <Ionicons name="download-outline" size={18} color={COLORS.text} />
                <Text style={styles.saveButtonText}>{'  '}{t('result.saveAll')}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StickerTile({
  sticker,
  index,
  onShare,
}: {
  sticker: JobStatus['stickers'][0];
  index: number;
  onShare: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 120,
      friction: 7,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.tile, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onShare}
        activeOpacity={0.8}
        style={styles.tileTouch}
      >
        <Image
          source={{ uri: sticker.imageUrl }}
          style={styles.tileImage}
          resizeMode="cover"
        />
        <View style={styles.tileLabel}>
          <Text style={styles.tileLabelText}>{sticker.emotion}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const TILE_SIZE = '31%';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.screen, paddingBottom: SPACING.xl },

  header: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 26, fontFamily: FONTS.extraBold, color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: {
    fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textSecondary,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    justifyContent: 'space-between',
  },

  tile: { width: TILE_SIZE },
  tileTouch: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    aspectRatio: 1,
  },
  tileImage: {
    width: '100%', height: '100%',
  },
  tileLabel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.overlayDark,
    paddingVertical: 4,
    alignItems: 'center',
  },
  tileLabelText: {
    fontSize: 10, fontFamily: FONTS.semiBold, color: COLORS.text,
    textTransform: 'capitalize',
  },
  saveButtonRow: { flexDirection: 'row', alignItems: 'center' },

  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  styleIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  styleImage: { width: 32, height: 32, borderRadius: 8 },
  styleName: { fontSize: 15, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 2 },
  styleCount: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textSecondary },

  actions: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.bg,
    gap: SPACING.sm,
  },
  tryAnotherBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  tryAnotherText: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary },
  saveButton: {
    height: 56, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  saveButtonText: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.text },

  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  errorTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.text },
  errorMsg: {
    fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  retryBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  retryText: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.bg },
});
