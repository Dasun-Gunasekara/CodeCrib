import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function FilterChips({ label, options, value, onChange }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const selected = value === option;

          return (
            <Pressable
              accessibilityHint={`Select ${option} for ${label}`}
              accessibilityLabel={`${label} option ${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => onChange(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? (isDark ? colors.background : '#FFFFFF') : colors.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    fontSize: typography.small,
    fontWeight: fontWeights.medium,
  },
});
