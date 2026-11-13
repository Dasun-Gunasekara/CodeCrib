import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentStreak, formatShortDate } from '../utils/date';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function ProgressScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    snippets,
    favorites,
    viewedSnippetIds,
    activityDates,
    quizHistory,
    isLoading,
    error,
    refresh,
  } = useSnippets();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const quizAverage = quizHistory.length
    ? Math.round(quizHistory.reduce((total, result) => total + (result.score / result.total) * 100, 0) / quizHistory.length)
    : 0;
  const bestScore = quizHistory.length
    ? Math.max(...quizHistory.map((result) => Math.round((result.score / result.total) * 100)))
    : 0;
  const recentScores = useMemo(() => quizHistory.slice(0, 5).reverse(), [quizHistory]);
  const streak = getCurrentStreak(activityDates);
  const chartMax = Math.max(100, ...recentScores.map((result) => (result.score / result.total) * 100));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && snippets.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading your learning progress…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>SMALL STEPS ADD UP</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Your progress</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>A snapshot of what you’ve learned on this device.</Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <Pressable
              accessibilityLabel="Retry loading progress"
              accessibilityRole="button"
              onPress={refresh}
              style={styles.retry}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <ProgressStat icon="eye-outline" label="Snippets viewed" value={viewedSnippetIds.length} colors={colors} />
          <ProgressStat icon="heart-outline" label="Favorites" value={favorites.length} colors={colors} />
          <ProgressStat icon="analytics-outline" label="Quiz average" value={`${quizAverage}%`} colors={colors} />
          <ProgressStat icon="trophy-outline" label="Best score" value={`${bestScore}%`} colors={colors} />
        </View>

        <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.streakIcon, { backgroundColor: `${colors.accent}1A` }]}>
            <Ionicons name="flame-outline" size={24} color={colors.accent} />
          </View>
          <View style={styles.streakCopy}>
            <Text style={[styles.streakTitle, { color: colors.text }]}>
              {streak === 1 ? '1 day learning streak' : `${streak} day learning streak`}
            </Text>
            <Text style={[styles.streakSubtitle, { color: colors.muted }]}>
              {streak > 0 ? 'You showed up for your learning.' : 'Open a snippet or finish a quiz to start your streak.'}
            </Text>
          </View>
        </View>

        <View style={styles.chartHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent quiz scores</Text>
          <Text style={[styles.chartCaption, { color: colors.muted }]}>Last 5</Text>
        </View>

        {recentScores.length > 0 ? (
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.chart}>
              {recentScores.map((result) => {
                const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                const height = Math.max(8, (percent / chartMax) * 112);

                return (
                  <View key={result.id} style={styles.barGroup}>
                    <Text style={[styles.barValue, { color: colors.text }]}>{`${percent}%`}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          { backgroundColor: colors.primary, height },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barDate, { color: colors.muted }]}>{formatShortDate(result.date)}</Text>
                  </View>
                );
              })}
            </View>
            <View style={[styles.chartFootnote, { borderTopColor: colors.border }]}>
              <Ionicons name="phone-portrait-outline" size={16} color={colors.muted} />
              <Text style={[styles.footnoteText, { color: colors.muted }]}>Scores are stored locally on this device.</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyChart, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <EmptyState
              icon="bar-chart-outline"
              title="Your score chart starts here"
              message="Finish a quiz to see your recent scores and build a learning streak."
            />
          </View>
        )}

        <Text style={[styles.libraryNote, { color: colors.muted }]}>
          {`Your library currently includes ${snippets.length} snippets to explore.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressStat({ icon, label, value, colors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 44,
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
    marginBottom: spacing.xs,
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  retry: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 48,
  },
  retryText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 116,
    padding: spacing.md,
  },
  statValue: {
    fontSize: typography.title,
    fontWeight: fontWeights.bold,
  },
  statLabel: {
    fontSize: typography.caption,
  },
  streakCard: {
    alignItems: 'center',
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  streakIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  streakCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  streakTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
  streakSubtitle: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  chartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.title,
    fontWeight: fontWeights.semibold,
  },
  chartCaption: {
    fontSize: typography.caption,
  },
  chartCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 154,
    justifyContent: 'space-around',
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 11,
    fontWeight: fontWeights.semibold,
  },
  barTrack: {
    alignItems: 'center',
    height: 112,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxWidth: 36,
    minWidth: 20,
    width: '68%',
  },
  barDate: {
    fontSize: 10,
    minHeight: 16,
  },
  chartFootnote: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    minHeight: 44,
  },
  footnoteText: {
    fontSize: typography.caption,
  },
  emptyChart: {
    borderRadius: radii.card,
    borderWidth: 1,
  },
  libraryNote: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
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
