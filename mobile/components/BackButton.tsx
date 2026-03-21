import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, SPACING } from '../lib/constants';

export default function BackButton() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
    >
      <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
      <Text style={styles.text}>{t('common.back')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xs,
  },
  text: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
});
