import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterChips from '../components/FilterChips';
import ScreenHeader from '../components/ScreenHeader';
import Toast from '../components/Toast';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

const confirmations = {
  favorites: {
    title: 'Clear all favorites?',
    message: 'This removes every saved favorite from this device. Your snippets will stay in the library.',
    confirmLabel: 'Clear favorites',
    success: 'Favorites cleared',
  },
  history: {
    title: 'Clear quiz history?',
    message: 'This permanently removes your saved quiz scores and explanations from this device.',
    confirmLabel: 'Clear history',
    success: 'Quiz history cleared',
  },
  searches: {
    title: 'Clear recent searches?',
    message: 'This removes your saved search terms from this device. Your snippets are not affected.',
    confirmLabel: 'Clear searches',
    success: 'Recent searches cleared',
  },
  reset: {
    title: 'Reset your personal data?',
    message: 'This deletes your saved snippets, notes, favorites, recent searches, viewing activity, and quiz scores. Bundled snippets will remain. This action cannot be undone.',
    confirmLabel: 'Reset data',
    success: 'Personal data reset',
  },
};

export default function SettingsScreen({ navigation }) {
  const { colors, themeMode, setThemeMode, themeError } = useTheme();
  const {
    codeFontSize,
    setCodeFontSize,
    hapticsEnabled,
    setHapticsEnabled,
    preferencesError,
  } = useAppPreferences();
  const { clearFavorites, clearQuizHistory, clearRecentSearches, resetUserData } = useSnippets();
  const [dialogAction, setDialogAction] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const selectTheme = async (choice) => {
    setError('');
    try {
      await setThemeMode(choice.toLowerCase());
    } catch (saveError) {
      setError(saveError.message || 'Could not save your theme preference.');
    }
  };

  const confirmAction = async () => {
    if (!dialogAction || isWorking) return;
    setIsWorking(true);
    setError('');

    try {
      if (dialogAction === 'favorites') await clearFavorites();
      if (dialogAction === 'history') await clearQuizHistory();
      if (dialogAction === 'searches') await clearRecentSearches();
      if (dialogAction === 'reset') await resetUserData();
      setToastMessage(confirmations[dialogAction].success);
      setDialogAction(null);
    } catch (actionError) {
      setError(actionError.message || 'Could not update your local data.');
    } finally {
      setIsWorking(false);
    }
  };

  const selectedTheme = themeMode.charAt(0).toUpperCase() + themeMode.slice(1);
  const selectedCodeFontSize = codeFontSize.charAt(0).toUpperCase() + codeFontSize.slice(1);
  const activeDialog = dialogAction ? confirmations[dialogAction] : null;
  const preferenceError = error || themeError || preferencesError;

  const selectCodeFontSize = async (choice) => {
    setError('');
    try {
      await setCodeFontSize(choice.toLowerCase());
    } catch (saveError) {
      setError(saveError.message || 'Could not save your code size preference.');
    }
  };

  const toggleHaptics = async (enabled) => {
    setError('');
    try {
      await setHapticsEnabled(enabled);
    } catch (saveError) {
      setError(saveError.message || 'Could not save your haptics preference.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="MAKE IT YOURS"
          title="Settings"
          subtitle="Your preferences and data stay on this device."
        />

        <SettingsSection title="Learning" colors={colors}>
          <ActionRow
            accessibilityHint="View your learning activity, quiz scores, and streak"
            icon="stats-chart-outline"
            title="My progress"
            subtitle="Review quiz scores and learning activity"
            onPress={() => navigation.navigate('Progress')}
            colors={colors}
          />
        </SettingsSection>

        {preferenceError ? (
          <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.text }]}>{preferenceError}</Text>
          </View>
        ) : null}

        <SettingsSection title="Appearance" colors={colors}>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>
            Choose the look that works best for you.
          </Text>
          <FilterChips
            label="Theme"
            options={['System', 'Light', 'Dark']}
            value={selectedTheme}
            onChange={selectTheme}
          />
        </SettingsSection>

        <SettingsSection title="Reading & comfort" colors={colors}>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>
            Adjust code readability and optional touch feedback.
          </Text>
          <FilterChips
            label="Code text size"
            options={['Small', 'Medium', 'Large']}
            value={selectedCodeFontSize}
            onChange={selectCodeFontSize}
          />
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Haptic feedback</Text>
              <Text style={[styles.actionSubtitle, { color: colors.muted }]}>Vibrate lightly after copying code</Text>
            </View>
            <Switch
              accessibilityLabel="Haptic feedback"
              accessibilityHint="Enable or disable vibration feedback when copying code"
              accessibilityRole="switch"
              onValueChange={toggleHaptics}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
              value={hapticsEnabled}
            />
          </View>
        </SettingsSection>

        <SettingsSection title="Manage local data" colors={colors}>
          <ActionRow
            accessibilityHint="Clear all saved favorites from this device"
            icon="heart-outline"
            title="Clear favorites"
            subtitle="Remove all saved favorites"
            onPress={() => setDialogAction('favorites')}
            colors={colors}
          />
          <ActionRow
            accessibilityHint="Delete all saved quiz scores and explanations"
            icon="time-outline"
            title="Clear quiz history"
            subtitle="Delete saved scores and answer reviews"
            onPress={() => setDialogAction('history')}
            colors={colors}
          />
          <ActionRow
            accessibilityHint="Clear recent searches saved on this device"
            icon="search-outline"
            title="Clear recent searches"
            subtitle="Remove locally saved search terms"
            onPress={() => setDialogAction('searches')}
            colors={colors}
          />
          <ActionRow
            accessibilityHint="Reset all personal snippet and learning data on this device"
            icon="trash-outline"
            title="Reset personal data"
            subtitle="Remove personal snippets and learning activity"
            onPress={() => setDialogAction('reset')}
            colors={colors}
            destructive
          />
        </SettingsSection>

        <SettingsSection title="About CodeCrib" colors={colors}>
          <ActionRow
            accessibilityHint="Open the CodeCrib guide and app information"
            icon="information-circle-outline"
            title="Help & About"
            subtitle="How to use CodeCrib and where your data lives"
            onPress={() => navigation.navigate('HelpAbout')}
            colors={colors}
          />
          <View style={styles.aboutRow}>
            <View style={[styles.aboutIcon, { backgroundColor: `${colors.primary}1A` }]}>
              <Ionicons name="code-slash-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.aboutCopy}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>CodeCrib</Text>
              <Text style={[styles.aboutSubtitle, { color: colors.muted }]}>Version 1.0.0 · Student project</Text>
            </View>
          </View>
          <InfoNote
            icon="school-outline"
            title="Made for students"
            body="A simple study companion for practicing programming fundamentals."
            colors={colors}
          />
          <InfoNote
            icon="phone-portrait-outline"
            title="Offline by design"
            body="Snippets, favorites, quizzes, and progress are stored locally. CodeCrib does not need an internet connection."
            colors={colors}
          />
          <Text style={[styles.disclaimer, { color: colors.muted }]}>
            Your personal snippets and quiz history remain on this device unless you reset them.
          </Text>
        </SettingsSection>
      </ScrollView>

      <Toast message={toastMessage} onHide={() => setToastMessage('')} />
      {activeDialog ? (
        <ConfirmDialog
          visible
          title={activeDialog.title}
          message={activeDialog.message}
          confirmLabel={activeDialog.confirmLabel}
          onCancel={() => !isWorking && setDialogAction(null)}
          onConfirm={confirmAction}
          loading={isWorking}
          destructive
        />
      ) : null}
    </SafeAreaView>
  );
}

function SettingsSection({ title, children, colors }) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function ActionRow({ accessibilityHint, icon, title, subtitle, onPress, colors, destructive = false }) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[styles.actionIcon, { backgroundColor: destructive ? `${colors.danger}1A` : `${colors.primary}1A` }]}>
        <Ionicons name={icon} size={20} color={destructive ? colors.danger : colors.primary} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, { color: destructive ? colors.danger : colors.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: colors.muted }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

function InfoNote({ icon, title, body, colors }) {
  return (
    <View style={styles.infoNote}>
      <Ionicons name={icon} size={19} color={colors.primary} />
      <View style={styles.infoCopy}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.infoBody, { color: colors.muted }]}>{body}</Text>
      </View>
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
  section: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
  },
  sectionDescription: {
    fontSize: typography.small,
    lineHeight: 21,
    marginTop: -spacing.sm,
  },
  actionRow: {
    alignItems: 'center',
    borderRadius: radii.control,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.xs,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  actionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  preferenceCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  actionSubtitle: {
    fontSize: typography.caption,
    lineHeight: 17,
  },
  aboutRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  aboutIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  aboutCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  aboutTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
  aboutSubtitle: {
    fontSize: typography.caption,
  },
  infoNote: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  infoTitle: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  infoBody: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: typography.caption,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
