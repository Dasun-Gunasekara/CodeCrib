import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import LanguageBadge from './LanguageBadge';

export default function SnippetCard({
  snippet,
  onPress,
  trailingText,
  isFavorite,
  onToggleFavorite,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.metaRow}>
        <View style={styles.metaGroup}>
          <LanguageBadge language={snippet.language} compact />
          <View style={styles.difficulty}>
            <Ionicons name="speedometer-outline" size={15} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]}>{snippet.difficulty}</Text>
          </View>
        </View>
        <View style={styles.metaActions}>
          {snippet.isUserCreated ? (
            <View style={[styles.mineBadge, { backgroundColor: `${colors.accent}1A` }]}>
              <Text style={[styles.mineText, { color: colors.accent }]}>Mine</Text>
            </View>
          ) : null}
          {onToggleFavorite ? (
            <Pressable
              accessibilityLabel={isFavorite ? `Remove ${snippet.title} from favorites` : `Save ${snippet.title} to favorites`}
              accessibilityRole="button"
              accessibilityState={{ selected: Boolean(isFavorite) }}
              hitSlop={4}
              onPress={onToggleFavorite}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={21}
                color={isFavorite ? colors.danger : colors.muted}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
      <Pressable
        accessibilityHint="Opens the snippet details"
        accessibilityLabel={`Open snippet ${snippet.title}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.82 : 1 }]}
      >
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>{snippet.title}</Text>
        <Text numberOfLines={2} style={[styles.description, { color: colors.muted }]}>{snippet.description}</Text>
        <View style={styles.footer}>
          <View style={styles.tags}>
            {(snippet.tags || []).slice(0, 2).map((tag) => (
              <Text key={tag} style={[styles.tag, { color: colors.primary }]}>{`#${tag}`}</Text>
            ))}
          </View>
          {trailingText ? (
            <Text style={[styles.trailing, { color: colors.muted }]}>{trailingText}</Text>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    elevation: 2,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  metaGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficulty: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mineBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: spacing.sm,
  },
  mineText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  favoriteButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  metaText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
  },
  title: {
    fontSize: typography.title,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.small,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
  },
  trailing: {
    fontSize: typography.caption,
  },
});
