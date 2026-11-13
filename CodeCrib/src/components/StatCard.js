import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function StatCard({ label, value, icon }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 104,
    padding: spacing.md,
  },
  value: {
    fontSize: typography.title,
    fontWeight: fontWeights.bold,
  },
  label: {
    fontSize: typography.caption,
    lineHeight: 17,
  },
});
