import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appVersion, indexNumber, moduleName, studentName } from '../constants/appInfo';
import quizQuestions from '../data/quiz.json';
import bundledSnippets from '../data/snippets.json';
import ScreenHeader from '../components/ScreenHeader';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

const helpTopics = [
  {
    icon: 'search-outline',
    title: 'Find a snippet',
    body: 'Search by title, description, or tag. Use language chips and Filters to narrow the local library.',
  },
  {
    icon: 'bookmark-outline',
    title: 'Save examples',
    body: 'Use the heart action to save a snippet to Favorites. Add your own example from the library and edit or remove only your personal snippets.',
  },
  {
    icon: 'help-circle-outline',
    title: 'Practice with quizzes',
    body: 'Choose a language and difficulty, answer each question, and review explanations and missed answers when you finish.',
  },
  {
    icon: 'phone-portrait-outline',
    title: 'Offline and private',
    body: 'CodeCrib uses bundled learning content and stores your snippets, notes, favorites, and progress on this device. It does not need an account or network connection.',
  },
];

export default function HelpAboutScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { snippets, favorites, snippetNotes, isLoading } = useSnippets();
  const userSnippetCount = snippets.filter((snippet) => snippet.isUserCreated).length;
  const noteCount = Object.values(snippetNotes).filter((note) => note.trim()).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="CODECRIB GUIDE"
          title="Help & About"
          subtitle="A quick guide to your offline study companion."
          onBack={() => navigation.goBack()}
        />
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image
            accessibilityLabel="CodeCrib logo"
            source={isDark
              ? require('../../assets/images/logo-dark.png')
              : require('../../assets/images/logo.png')}
            style={styles.logo}
          />
          <View style={styles.aboutCopy}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>CodeCrib</Text>
            <Text style={[styles.aboutSubtitle, { color: colors.muted }]}>{`Version ${appVersion} · Student project`}</Text>
          </View>
        </View>
        <View style={[styles.topic, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={21} color={colors.primary} />
          <View style={styles.topicCopy}>
            <Text accessibilityRole="header" style={[styles.topicTitle, { color: colors.text }]}>
              Student details
            </Text>
            <Text style={[styles.topicBody, { color: colors.muted }]}>{`Name: ${studentName}`}</Text>
            <Text style={[styles.topicBody, { color: colors.muted }]}>{`Index number: ${indexNumber}`}</Text>
            <Text style={[styles.topicBody, { color: colors.muted }]}>{`Module: ${moduleName}`}</Text>
          </View>
        </View>
        <View style={[styles.topic, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="stats-chart-outline" size={21} color={colors.primary} />
          <View style={styles.topicCopy}>
            <Text accessibilityRole="header" style={[styles.topicTitle, { color: colors.text }]}>
              Learning data
            </Text>
            <Text style={[styles.topicBody, { color: colors.muted }]}>{`Bundled snippets: ${bundledSnippets.length}`}</Text>
            <Text style={[styles.topicBody, { color: colors.muted }]}>{`Bundled quiz questions: ${quizQuestions.length}`}</Text>
            {isLoading ? (
              <Text style={[styles.topicBody, { color: colors.muted }]}>Loading your local counts…</Text>
            ) : (
              <>
                <Text style={[styles.topicBody, { color: colors.muted }]}>{`Your snippets: ${userSnippetCount}`}</Text>
                <Text style={[styles.topicBody, { color: colors.muted }]}>{`Favorites: ${favorites.length}`}</Text>
                <Text style={[styles.topicBody, { color: colors.muted }]}>{`Notes: ${noteCount}`}</Text>
              </>
            )}
          </View>
        </View>
        <View style={[styles.topic, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="phone-portrait-outline" size={21} color={colors.primary} />
          <View style={styles.topicCopy}>
            <Text accessibilityRole="header" style={[styles.topicTitle, { color: colors.text }]}>
              Works fully offline
            </Text>
            <Text style={[styles.topicBody, { color: colors.muted }]}>
              Snippets and quiz questions are bundled in the app. Personal snippets, notes, favorites, search history,
              quiz history, progress, and preferences are stored locally with AsyncStorage on this device.
            </Text>
          </View>
        </View>
        {helpTopics.map((topic) => (
          <View
            key={topic.title}
            style={[styles.topic, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={topic.icon} size={21} color={colors.primary} />
            <View style={styles.topicCopy}>
              <Text accessibilityRole="header" style={[styles.topicTitle, { color: colors.text }]}>
                {topic.title}
              </Text>
              <Text style={[styles.topicBody, { color: colors.muted }]}>{topic.body}</Text>
            </View>
          </View>
        ))}
        <Text style={[styles.footer, { color: colors.muted }]}>
          Your personal data remains on this device. Use Settings to manage or reset it.
        </Text>
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
  aboutCard: {
    alignItems: 'center',
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  logo: {
    borderRadius: radii.control,
    height: 52,
    width: 52,
  },
  aboutCopy: {
    gap: spacing.xs,
  },
  aboutTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
  },
  aboutSubtitle: {
    fontSize: typography.caption,
  },
  topic: {
    alignItems: 'flex-start',
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  topicCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  topicTitle: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  topicBody: {
    fontSize: typography.small,
    lineHeight: 21,
  },
  footer: {
    fontSize: typography.caption,
    lineHeight: 19,
    textAlign: 'center',
  },
});
