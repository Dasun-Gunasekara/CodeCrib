import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fontWeights, typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export default function ScreenHeader({ title, subtitle, eyebrow, onBack, rightAction }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {onBack || rightAction ? (
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={onBack}
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <View style={styles.spacer} />
          {rightAction}
        </View>
      ) : null}
      {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  spacer: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 23,
  },
});
