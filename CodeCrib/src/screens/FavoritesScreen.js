import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import LanguageBadge from '../components/LanguageBadge';
import Toast from '../components/Toast';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function FavoritesScreen({ navigation }) {
  const { colors } = useTheme();
  const { snippets, favorites, toggleFavorite, isLoading } = useSnippets();
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');
  const favoriteSnippets = useMemo(
    () => favorites.map((id) => snippets.find((snippet) => snippet.id === id)).filter(Boolean),
    [favorites, snippets],
  );

  const removeFavorite = async (snippetId) => {
    setError('');

    try {
      await toggleFavorite(snippetId);
      setToastMessage('Removed from favorites');
    } catch (saveError) {
      setError(saveError.message || 'Could not update favorites.');
    }
  };

  const listHeader = (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PERSONAL COLLECTION</Text>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Favorites</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>The snippets you choose to keep close.</Text>
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  if (isLoading && snippets.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading your favorites…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={favoriteSnippets}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            message="Tap the heart on any snippet to save it here for quick access."
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              accessibilityHint={`Opens the details for ${item.title}`}
              accessibilityLabel={`Open ${item.title}`}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('Snippets', {
                  screen: 'SnippetDetails',
                  params: { snippetId: item.id },
                })
              }
              style={styles.cardContent}
            >
              <View style={styles.meta}>
                <LanguageBadge language={item.language} compact />
                <Text style={[styles.difficulty, { color: colors.muted }]}>{item.difficulty}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text numberOfLines={2} style={[styles.description, { color: colors.muted }]}>{item.description}</Text>
            </Pressable>
            <Pressable
              accessibilityHint={`Removes ${item.title} from your saved list`}
              accessibilityLabel={`Remove ${item.title} from favorites`}
              accessibilityRole="button"
              onPress={() => removeFavorite(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="heart" size={21} color={colors.danger} />
            </Pressable>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      <Toast message={toastMessage} onHide={() => setToastMessage('')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 23,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficulty: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
  description: {
    fontSize: typography.small,
    lineHeight: 20,
  },
  removeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.small,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.small,
  },
});
