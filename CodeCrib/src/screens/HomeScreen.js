import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import categories from '../data/categories.json';
import EmptyState from '../components/EmptyState';
import LanguageBadge from '../components/LanguageBadge';
import SnippetCard from '../components/SnippetCard';
import StatCard from '../components/StatCard';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { getDateSeed, getGreeting } from '../utils/date';
import { fontWeights, typography } from '../theme/typography';
import { radii, spacing } from '../theme/spacing';

export default function HomeScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { snippets, favorites, recentlyViewed, recordViewed, isLoading, error, refresh } = useSnippets();
  const dailySnippet = useMemo(() => {
    if (snippets.length === 0) return null;
    return snippets[getDateSeed() % snippets.length];
  }, [snippets]);
  const recentSnippets = useMemo(
    () => recentlyViewed.map((id) => snippets.find((snippet) => snippet.id === id)).filter(Boolean).slice(0, 3),
    [recentlyViewed, snippets],
  );
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const openSnippet = (snippetId) => {
    recordViewed(snippetId);
    navigation.navigate('Snippets', {
      screen: 'SnippetDetails',
      params: { snippetId },
    });
  };
  const openLanguage = (language) => navigation.navigate('Snippets', {
    screen: 'SnippetList',
    params: { language },
  });

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading your offline library…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingCopy}>
            <Text style={[styles.greeting, { color: colors.muted }]}>{getGreeting()}</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Welcome to CodeCrib</Text>
          </View>
          <View style={[styles.offlineBadge, { backgroundColor: `${colors.accent}1A` }]}>
            <View style={[styles.offlineDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.offlineText, { color: colors.text }]}>Offline ready</Text>
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <Pressable
              accessibilityLabel="Retry loading local data"
              accessibilityRole="button"
              onPress={refresh}
              style={styles.retryButton}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <SectionTitle title="Snippet of the day" color={colors.text} />
        {dailySnippet ? (
          <Pressable
            accessibilityHint="Opens the snippet of the day"
            accessibilityLabel={`Open snippet ${dailySnippet.title}`}
            accessibilityRole="button"
            onPress={() => openSnippet(dailySnippet.id)}
            style={({ pressed }) => [
              styles.dailyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 2,
              },
            ]}
          >
            <View style={styles.dailyTop}>
              <Text style={[styles.dailyEyebrow, { color: colors.primary }]}>A little practice, every day</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.dailyTitle, { color: colors.text }]}>{dailySnippet.title}</Text>
            <Text numberOfLines={2} style={[styles.dailyDescription, { color: colors.muted }]}>
              {dailySnippet.description}
            </Text>
            <View style={styles.dailyMeta}>
              <LanguageBadge language={dailySnippet.language} compact />
              <Text style={[styles.difficulty, { color: colors.muted }]}>{dailySnippet.difficulty}</Text>
            </View>
          </Pressable>
        ) : (
          <EmptyState title="Your library is ready to grow" message="Snippets will show up here once they are loaded." />
        )}

        <View style={styles.sectionHeader}>
          <SectionTitle title="Explore languages" color={colors.text} />
          <Text style={[styles.sectionCount, { color: colors.muted }]}>{categories.length} languages</Text>
        </View>
        <View style={styles.languageGrid}>
          {categories.map((category) => {
            const count = snippets.filter((snippet) => snippet.language === category.language).length;
            const lightLabelColors = {
              JavaScript: '#6B4E00',
              Java: '#8A3B29',
              'HTML/CSS': '#8A3218',
            };
            const labelColor = isDark
              ? category.color
              : lightLabelColors[category.language] || category.color;

            return (
              <Pressable
                accessibilityHint={`Open all ${category.language} snippets`}
                accessibilityLabel={`${category.language} snippets`}
                accessibilityRole="button"
                key={category.language}
                onPress={() => openLanguage(category.language)}
                style={({ pressed }) => [
                  styles.languageCard,
                  {
                    width: cardWidth,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.88 : 1,
                    shadowColor: colors.text,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 1,
                  },
                ]}
              >
                <View style={[styles.languageIcon, { backgroundColor: `${category.color}1A` }]}>
                  <Ionicons name={category.icon} size={20} color={labelColor} />
                </View>
                <Text numberOfLines={1} style={[styles.languageName, { color: colors.text }]}>{category.language}</Text>
                <Text style={[styles.languageCount, { color: colors.muted }]}>{`${count} snippets`}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle title="Your quick stats" color={colors.text} />
        <View style={styles.statsRow}>
          <StatCard label="Snippets" value={snippets.length} icon="code-slash-outline" />
          <StatCard label="Favorites" value={favorites.length} icon="heart-outline" />
          <StatCard label="Languages" value={categories.length} icon="grid-outline" />
        </View>
        <Pressable
          accessibilityHint="Opens your learning statistics and recent quiz scores"
          accessibilityLabel="View progress"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Progress')}
          style={({ pressed }) => [styles.progressLink, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.progressLinkText, { color: colors.primary }]}>View progress</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.primary} />
        </Pressable>

        <View style={styles.sectionHeader}>
          <SectionTitle title="Recently viewed" color={colors.text} />
        </View>
        {recentSnippets.length > 0 ? (
          <View style={styles.recentList}>
            {recentSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} onPress={() => openSnippet(snippet.id)} />
            ))}
          </View>
        ) : (
          <View style={[styles.recentEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={20} color={colors.muted} />
            <Text style={[styles.recentEmptyText, { color: colors.muted }]}>
              Open a snippet and it will appear here for quick access.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, color }) {
  return <Text accessibilityRole="header" style={[styles.sectionTitle, { color }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  greetingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: typography.small,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  offlineBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
  offlineDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  offlineText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.small,
    lineHeight: 20,
  },
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 48,
  },
  retryText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: typography.title,
    fontWeight: fontWeights.semibold,
  },
  sectionCount: {
    fontSize: typography.caption,
  },
  dailyCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  dailyTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyEyebrow: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  dailyTitle: {
    fontSize: typography.title,
    fontWeight: fontWeights.bold,
  },
  dailyDescription: {
    fontSize: typography.small,
    lineHeight: 21,
  },
  dailyMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  difficulty: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  languageCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 126,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  languageIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 36,
  },
  languageName: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
  languageCount: {
    fontSize: typography.caption,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressLink: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  progressLinkText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  recentList: {
    gap: spacing.sm,
  },
  recentEmpty: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.md,
  },
  recentEmptyText: {
    flex: 1,
    fontSize: typography.small,
    lineHeight: 20,
  },
});
