import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import { getAnswerText } from '../utils/quizBuilder';

export default function QuizResultScreen({ navigation, route }) {
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [reviewOffset, setReviewOffset] = useState(0);
  const result = route.params?.result;

  if (!result || typeof result.score !== 'number' || typeof result.total !== 'number') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Result unavailable"
          message="Your saved quiz result could not be opened."
        />
        <View style={styles.fallbackButton}>
          <PrimaryButton title="Back to CodeCrib" onPress={() => navigation.navigate('MainTabs')} />
        </View>
      </SafeAreaView>
    );
  }

  const scorePercent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const headline = scorePercent >= 80 ? 'Excellent work!' : scorePercent >= 50 ? 'Nice progress!' : 'Keep practicing!';
  const wrongAnswers = Array.isArray(result.wrongAnswers) ? result.wrongAnswers : [];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.trophy, { backgroundColor: `${colors.accent}1A` }]}>
            <Ionicons name="trophy-outline" size={34} color={colors.accent} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>QUIZ COMPLETE</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{headline}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Every question is a step forward.</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: colors.text }]}>{result.score}</Text>
            <Text style={[styles.scoreTotal, { color: colors.muted }]}>{` / ${result.total}`}</Text>
          </View>
          <View style={[styles.scoreTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.scoreFill, { backgroundColor: colors.accent, width: `${scorePercent}%` }]} />
          </View>
          <Text style={[styles.percent, { color: colors.muted }]}>{`${scorePercent}% correct`}</Text>
        </View>

        <View
          onLayout={(event) => setReviewOffset(event.nativeEvent.layout.y)}
          style={styles.reviewHeader}
        >
          <Text style={[styles.reviewTitle, { color: colors.text }]}>Review your answers</Text>
          <Text style={[styles.reviewCount, { color: colors.muted }]}>
            {wrongAnswers.length === 0 ? 'All correct' : `${wrongAnswers.length} to revisit`}
          </Text>
        </View>

        {wrongAnswers.length === 0 ? (
          <View style={[styles.allCorrect, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
            <Text style={[styles.allCorrectText, { color: colors.text }]}>
              You got every answer right. Great recall!
            </Text>
          </View>
        ) : (
          wrongAnswers.map((entry, index) => (
            <View
              key={`${entry.question?.id || index}`}
              style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.reviewMeta}>
                <Text style={[styles.reviewLanguage, { color: colors.primary }]}>{entry.question?.language}</Text>
                <Text style={[styles.reviewNumber, { color: colors.muted }]}>{`Question ${index + 1}`}</Text>
              </View>
              <Text style={[styles.question, { color: colors.text }]}>{entry.question?.question}</Text>
              <View style={styles.answerRow}>
                <Ionicons name="close-circle" size={18} color={colors.danger} />
                <Text style={[styles.answerText, { color: colors.muted }]}>
                  {`Your answer: ${entry.selectedAnswer ?? 'No answer'}`}
                </Text>
              </View>
              <View style={styles.answerRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                <Text style={[styles.correctAnswer, { color: colors.text }]}>
                  {`Correct: ${getAnswerText(entry.question) || 'Unavailable'}`}
                </Text>
              </View>
              <Text style={[styles.explanation, { color: colors.muted }]}>{entry.question?.explanation}</Text>
            </View>
          ))
        )}

        <View style={styles.actions}>
          <PrimaryButton
            title={wrongAnswers.length ? 'Review mistakes' : 'Review answers'}
            variant="secondary"
            onPress={() => scrollRef.current?.scrollTo({ y: reviewOffset, animated: true })}
          />
          <PrimaryButton
            title="Try again"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Quiz', params: { restart: Date.now() } })}
          />
          <PrimaryButton
            title="Back to Home"
            variant="secondary"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  hero: {
    alignItems: 'center',
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  trophy: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 56,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.small,
    textAlign: 'center',
  },
  scoreRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  score: {
    fontSize: 48,
    fontWeight: fontWeights.bold,
  },
  scoreTotal: {
    fontSize: typography.title,
    fontWeight: fontWeights.medium,
  },
  scoreTrack: {
    borderRadius: 999,
    height: 10,
    marginTop: spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  scoreFill: {
    borderRadius: 999,
    height: 10,
  },
  percent: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  reviewHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  reviewTitle: {
    fontSize: typography.title,
    fontWeight: fontWeights.semibold,
  },
  reviewCount: {
    fontSize: typography.caption,
  },
  allCorrect: {
    alignItems: 'center',
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  allCorrectText: {
    flex: 1,
    fontSize: typography.body,
    lineHeight: 23,
  },
  reviewCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  reviewMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLanguage: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
  },
  reviewNumber: {
    fontSize: typography.caption,
  },
  question: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
    lineHeight: 23,
  },
  answerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  answerText: {
    flex: 1,
    fontSize: typography.small,
    lineHeight: 21,
  },
  correctAnswer: {
    flex: 1,
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
    lineHeight: 21,
  },
  explanation: {
    fontSize: typography.small,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  fallbackButton: {
    padding: spacing.lg,
  },
});
