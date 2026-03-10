import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Image, ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { COLORS, FONTS, RADIUS, SPACING, STYLES } from '../lib/constants';
import { getJobStatus, JobStatus } from '../lib/api';

export default function ResultScreen() {
  const router = useRouter();
  const { jobId, styleId } = useLocalSearchParams<{ jobId: string; styleId: string }>();
  const style = STYLES.find(s => s.id === styleId) ?? STYLES[0];

  const [stickers, setStickers] = useState<JobStatus['stickers']>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStickers();
  }, []);

  async function loadStickers() {
    try {
      const status = await getJobStatus(jobId!);
      setStickers(status.stickers);
    } catch {
      Alert.alert('Error', 'Failed to load your stickers. Please try again.');
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function saveAll() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow Photos access in Settings to save stickers.');
      return;
    }

    setSavingAll(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      for (const sticker of stickers) {
        await MediaLibrary.saveToLibraryAsync(sticker.imageUrl);
      }
      Alert.alert('Saved!', `${stickers.length} stickers saved to your Photos.`, [
        { text: 'OK', onPress: () => router.push(`/success?jobId=${jobId}&styleId=${style.id}`) },
      ]);
    } catch {
      Alert.alert('Save failed', 'Some stickers could not be saved. Please try again.');
    } finally {
      setSavingAll(false);
    }
  }

  async function shareSticker(url: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(url, { mimeType: 'image/png' });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.title}>Your stickers are ready!</Text>
          <Text style={styles.subtitle}>Tap any sticker to share it directly</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
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
              <View style={[styles.styleIcon, { backgroundColor: style.color + '20' }]}>
                <Text style={styles.styleEmoji}>{style.emoji}</Text>
              </View>
              <View>
                <Text style={styles.styleName}>{style.name}</Text>
                <Text style={styles.styleCount}>{stickers.length} stickers generated</Text>
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
          <Text style={styles.tryAnotherText}>Try another style</Text>
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾  Save All to Photos</Text>
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
      tension: 60,
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
        <View style={styles.shareHint}>
          <Text style={styles.shareHintText}>↗</Text>
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
  successEmoji: { fontSize: 52, marginBottom: SPACING.sm },
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  tileLabelText: {
    fontSize: 10, fontFamily: FONTS.semiBold, color: '#fff',
    textTransform: 'capitalize',
  },
  shareHint: {
    position: 'absolute',
    top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 22, height: 22,
    borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  shareHintText: { fontSize: 11, color: '#fff', fontFamily: FONTS.bold },

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
  styleEmoji: { fontSize: 22 },
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
  saveButtonText: { fontSize: 17, fontFamily: FONTS.bold, color: '#fff' },
});
