import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import quizQuestions from '../data/quiz.json';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import PrimaryButton from '../components/PrimaryButton';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import { buildShuffledQuestion, getAnswerText } from '../utils/quizBuilder';

const questionCount = 10;
const languages = ['All', 'JavaScript', 'Python', 'Java', 'SQL', 'HTML/CSS', 'C++'];
const difficulties = ['Any', 'Beginner', 'Intermediate', 'Advanced'];

function chooseQuestions(language, difficulty) {
  const matchingQuestions = quizQuestions.filter(
    (question) =>
      (language === 'All' || question.language === language) &&
      (difficulty === 'Any' || question.difficulty === difficulty),
  );
  const shuffled = [...matchingQuestions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
}

export default function QuizScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { saveQuizResult, quizHistory } = useSnippets();
  const [questions, setQuestions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Any');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const availableCount = useMemo(
    () =>
      quizQuestions.filter(
        (question) =>
          (selectedLanguage === 'All' || question.language === selectedLanguage) &&
          (selectedDifficulty === 'Any' || question.difficulty === selectedDifficulty),
      ).length,
    [selectedDifficulty, selectedLanguage],
  );
  const lastScore = quizHistory[0];
  const bestScore = quizHistory.reduce(
    (best, result) => Math.max(best, result.total > 0 ? Math.round((result.score / result.total) * 100) : 0),
    0,
  );

  useEffect(() => {
    if (route.params?.restart) {
      setQuestions([]);
      setQuestionIndex(0);
      setSelectedIndex(null);
      setAnswers([]);
      setError('');
      setShowExitDialog(false);
    }
  }, [route.params?.restart]);

  const startQuiz = () => {
    if (isSaving) return;
    setQuestions(chooseQuestions(selectedLanguage, selectedDifficulty).map((question) => buildShuffledQuestion(question)));
    setQuestionIndex(0);
    setSelectedIndex(null);
    setAnswers([]);
    setError('');
  };

  const confirmExitQuiz = () => {
    setShowExitDialog(false);
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setAnswers([]);
    setError('');
  };

  const finishQuiz = async (finalAnswers) => {
    const rootNavigation = navigation.getParent();
    if (!rootNavigation) {
      setError('Could not open your quiz results.');
      return;
    }

    const correctCount = finalAnswers.filter(
      (entry) => entry.selectedAnswer === getAnswerText(entry.question),
    ).length;
    const wrongAnswers = finalAnswers
      .filter((entry) => entry.selectedAnswer !== getAnswerText(entry.question))
      .map((entry) => ({
        question: entry.question,
        selectedAnswer: entry.selectedAnswer,
        correctAnswer: getAnswerText(entry.question),
      }));

    setIsSaving(true);
    setError('');

    try {
      const savedResult = await saveQuizResult({
        score: correctCount,
        total: questions.length,
        wrongAnswers,
      });
      setQuestions([]);
      setAnswers([]);
      setSelectedIndex(null);
      rootNavigation.navigate('QuizResult', { result: savedResult });
    } catch (saveError) {
      setError(saveError.message || 'Could not save your quiz result. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const goToNext = () => {
    if (selectedIndex === null || isSaving) return;
    const currentQuestion = questions[questionIndex];
    const selectedAnswer = currentQuestion.options[selectedIndex];
    const lastAnswer = answers[answers.length - 1];
    const answerAlreadyRecorded = lastAnswer?.question.id === currentQuestion.id;
    const nextAnswers = answerAlreadyRecorded
      ? answers
      : [...answers, { question: currentQuestion, selectedIndex, selectedAnswer }];
    setAnswers(nextAnswers);

    if (questionIndex + 1 === questions.length) {
      finishQuiz(nextAnswers);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedIndex(null);
    setError('');
  };

  if (quizQuestions.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="help-circle-outline"
          title="Quiz questions unavailable"
          message="The bundled quiz data could not be found."
        />
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[questionIndex] || null;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {questions.length === 0 ? (
        <ScrollView contentContainerStyle={styles.introContent}>
          <View style={[styles.heroIcon, { backgroundColor: `${colors.primary}1A` }]}>
            <Ionicons name="school-outline" size={34} color={colors.primary} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>PRACTICE, NOT PRESSURE</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Quick knowledge check</Text>
          <Text style={[styles.introText, { color: colors.muted }]}>
            Choose a language and difficulty, then practice with questions from your offline quiz library.
          </Text>
          <FilterChips
            label="Language"
            options={languages}
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
          <FilterChips
            label="Difficulty"
            options={difficulties}
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          />
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow icon="help-circle-outline" label={`${Math.min(questionCount, availableCount)} multiple-choice questions`} color={colors.text} muted={colors.muted} />
            <InfoRow icon="time-outline" label="About 3 minutes" color={colors.text} muted={colors.muted} />
            <InfoRow icon="chatbubble-ellipses-outline" label="Instant answer explanations" color={colors.text} muted={colors.muted} />
            <InfoRow
              icon="trophy-outline"
              label={`Last: ${lastScore ? `${lastScore.score}/${lastScore.total}` : 'No quiz yet'} · Best: ${quizHistory.length ? `${bestScore}%` : '—'}`}
              color={colors.text}
              muted={colors.muted}
            />
          </View>
          {availableCount > 0 && availableCount < questionCount ? (
            <Text style={[styles.availabilityNote, { color: colors.muted }]}>
              {`Only ${availableCount} questions match. This quiz will use all ${availableCount}.`}
            </Text>
          ) : null}
          {availableCount === 0 ? (
            <Text style={[styles.availabilityNote, { color: colors.danger }]}>
              No questions match these filters. Choose a different combination.
            </Text>
          ) : null}
          <PrimaryButton title="Start quiz" onPress={startQuiz} disabled={availableCount === 0} />
          <View style={styles.statsNote}>
            <Ionicons name="sparkles-outline" size={17} color={colors.accent} />
            <Text style={[styles.statsNoteText, { color: colors.muted }]}>You can take the quiz as often as you like.</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.quizContent}>
          <View style={styles.quizHeader}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>QUICK PRACTICE</Text>
            <View style={styles.quizHeaderActions}>
              <Text style={[styles.progressLabel, { color: colors.muted }]}>
                {`Question ${questionIndex + 1} of ${questions.length}`}
              </Text>
              <Pressable
                accessibilityLabel="Exit quiz"
                accessibilityRole="button"
                accessibilityState={{ disabled: isSaving }}
                disabled={isSaving}
                onPress={() => setShowExitDialog(true)}
                style={styles.exitButton}
              >
                <Ionicons name="close" size={19} color={colors.text} />
                <Text style={[styles.exitText, { color: colors.text }]}>Exit</Text>
              </Pressable>
            </View>
          </View>
          <View
            accessibilityLabel={`Quiz progress: ${Math.round(((questionIndex + 1) / questions.length) * 100)} percent`}
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${((questionIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.questionMeta}>
            <View style={[styles.languageChip, { backgroundColor: `${colors.primary}1A` }]}>
              <Text style={[styles.languageText, { color: colors.primary }]}>{questions[questionIndex].language}</Text>
            </View>
            <Text style={[styles.smallCount, { color: colors.muted }]}>{`${answers.length} answered`}</Text>
          </View>
          <Text accessibilityRole="header" style={[styles.question, { color: colors.text }]}>
            {currentQuestion.question}
          </Text>

          <View style={styles.options}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const answered = selectedIndex !== null;
              const correctOption = index === currentQuestion.correctAnswerIndex;
              const statusForeground = isDark ? colors.background : '#FFFFFF';
              const optionColor = answered && correctOption
                ? colors.accent
                : answered && isSelected
                  ? colors.danger
                  : colors.border;

              return (
                <Pressable
                  accessibilityHint={`Choose ${option} as your answer`}
                  accessibilityLabel={`Option ${String.fromCharCode(65 + index)}: ${option}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: answered }}
                  disabled={answered}
                  key={`${questions[questionIndex].id}-${option}`}
                  onPress={() => setSelectedIndex(index)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: colors.surface,
                      borderColor: optionColor,
                      opacity: pressed ? 0.85 : 1,
                      shadowColor: colors.text,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 1,
                    },
                    answered && correctOption && styles.correctOption,
                    answered && isSelected && !correctOption && styles.wrongOption,
                  ]}
                >
                  <View
                    style={[
                      styles.optionLetter,
                      {
                        backgroundColor: answered && (correctOption || isSelected) ? optionColor : `${colors.primary}1A`,
                      },
                    ]}
                  >
                    {answered && correctOption ? (
                      <Ionicons name="checkmark" size={16} color="#14181F" />
                    ) : answered && isSelected && !correctOption ? (
                      <Ionicons name="close" size={16} color={statusForeground} />
                    ) : (
                      <Text style={[styles.optionLetterText, { color: answered && isSelected ? '#FFFFFF' : colors.primary }]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          {selectedIndex !== null ? (
            <View
              accessibilityRole="alert"
              style={[
                styles.explanation,
                {
                  backgroundColor: selectedIndex === currentQuestion.correctAnswerIndex
                    ? `${colors.accent}1A`
                    : `${colors.danger}12`,
                  borderColor: selectedIndex === currentQuestion.correctAnswerIndex ? colors.accent : colors.danger,
                },
              ]}
            >
              <Text style={[styles.explanationTitle, { color: colors.text }]}>
                {selectedIndex === currentQuestion.correctAnswerIndex ? 'Correct!' : 'Incorrect'}
              </Text>
              <Text style={[styles.explanationText, { color: colors.text }]}>
                {`Correct answer: ${currentQuestion.correctAnswerText}`}
              </Text>
              <Text style={[styles.explanationText, { color: colors.text }]}>
                {questions[questionIndex].explanation}
              </Text>
            </View>
          ) : null}

          {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          <PrimaryButton
            title={isSaving ? 'Saving result…' : questionIndex + 1 === questions.length ? 'See my result' : 'Next question'}
            onPress={goToNext}
            loading={isSaving}
            disabled={selectedIndex === null || isSaving}
          />
        </ScrollView>
      )}
      <ConfirmDialog
        visible={showExitDialog}
        title="Exit this quiz?"
        message="Your answers in this round will not be saved."
        confirmLabel="Exit quiz"
        onCancel={() => setShowExitDialog(false)}
        onConfirm={confirmExitQuiz}
      />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, color, muted }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={muted} />
      <Text style={[styles.infoLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  introContent: {
    flexGrow: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 72,
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
  introText: {
    fontSize: typography.body,
    lineHeight: 25,
    marginBottom: spacing.sm,
  },
  infoCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 28,
  },
  infoLabel: {
    flex: 1,
    fontSize: typography.small,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  },
  statsNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 36,
  },
  statsNoteText: {
    fontSize: typography.caption,
  },
  availabilityNote: {
    fontSize: typography.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
  quizContent: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exitButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  exitText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  progressLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: 8,
  },
  questionMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  languageChip: {
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: spacing.sm,
  },
  languageText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  smallCount: {
    fontSize: typography.caption,
  },
  question: {
    fontSize: typography.title,
    fontWeight: fontWeights.semibold,
    lineHeight: 29,
    marginVertical: spacing.xs,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  correctOption: {
    borderWidth: 2,
  },
  wrongOption: {
    borderWidth: 2,
  },
  optionLetter: {
    alignItems: 'center',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  optionLetterText: {
    fontSize: typography.small,
    fontWeight: fontWeights.bold,
  },
  optionText: {
    flex: 1,
    fontSize: typography.body,
    lineHeight: 22,
  },
  explanation: {
    borderRadius: radii.control,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  explanationTitle: {
    fontSize: typography.small,
    fontWeight: fontWeights.bold,
  },
  explanationText: {
    fontSize: typography.small,
    lineHeight: 21,
  },
  error: {
    fontSize: typography.small,
    lineHeight: 20,
  },
  restart: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  restartText: {
    fontSize: typography.small,
    fontWeight: fontWeights.medium,
  },
});
