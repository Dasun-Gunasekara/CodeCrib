import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CodeBlock from '../components/CodeBlock';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LanguageBadge from '../components/LanguageBadge';
import PrimaryButton from '../components/PrimaryButton';
import SnippetCard from '../components/SnippetCard';
import Toast from '../components/Toast';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function SnippetDetailsScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { hapticsEnabled } = useAppPreferences();
  const {
    snippets,
    favorites,
    isLoading,
    error: contextError,
    recordViewed,
    toggleFavorite,
    deleteSnippet,
    snippetNotes,
    saveSnippetNote,
    refresh,
  } = useSnippets();
  const snippet = snippets.find((item) => item.id === route.params?.snippetId);
  const [toastMessage, setToastMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const relatedSnippets = useMemo(
    () =>
      snippet
        ? snippets
            .filter(
              (item) =>
                item.id !== snippet.id &&
                (item.language === snippet.language || item.category === snippet.category),
            )
            .slice(0, 3)
        : [],
    [snippet, snippets],
  );

  useEffect(() => {
    if (snippet) {
      recordViewed(snippet.id);
    }
  }, [recordViewed, snippet]);

  useEffect(() => {
    setIsFavorite(Boolean(snippet && favorites.includes(snippet.id)));
  }, [favorites, snippet]);

  useEffect(() => {
    setNoteDraft(snippet ? snippetNotes[snippet.id] || '' : '');
  }, [snippet, snippetNotes]);

  const toggleCurrentFavorite = async () => {
    if (!snippet || isSavingFavorite) return;
    setIsSavingFavorite(true);
    setActionError('');

    try {
      const saved = await toggleFavorite(snippet.id);
      setIsFavorite(saved);
      setToastMessage(saved ? 'Saved to favorites' : 'Removed from favorites');
    } catch (saveError) {
      setActionError(saveError.message || 'Could not update favorites.');
    } finally {
      setIsSavingFavorite(false);
    }
  };

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(snippet.code);
    } catch (copyError) {
      setActionError(copyError.message || 'Could not copy code to the clipboard.');
      return;
    }

    if (hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        setToastMessage('Copied');
        return;
      }
    }

    setToastMessage('Copied');
  };

  const confirmDelete = async () => {
    if (!snippet) return;
    setIsDeleting(true);
    setActionError('');

    try {
      await deleteSnippet(snippet.id);
      setShowDeleteDialog(false);
      navigation.navigate('SnippetList', { undoToken: Date.now() });
    } catch (deleteError) {
      setActionError(deleteError.message || 'Could not delete this snippet.');
    } finally {
      setIsDeleting(false);
    }
  };

  const saveNote = async () => {
    if (!snippet || isSavingNote) return;
    setIsSavingNote(true);
    setActionError('');
    try {
      await saveSnippetNote(snippet.id, noteDraft);
      setToastMessage('Note saved on this device');
    } catch (saveError) {
      setActionError(saveError.message || 'Could not save your note.');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (!snippet) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading snippet…</Text>
          </View>
        ) : (
          <View style={styles.missing}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <EmptyState
              icon={contextError ? 'alert-circle-outline' : 'document-text-outline'}
              title={contextError ? 'Could not load this snippet' : 'Snippet not found'}
              message={contextError || 'It may have been removed from your local library.'}
            />
            {contextError ? <PrimaryButton title="Retry" onPress={refresh} /> : null}
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Go back to snippets"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.topActions}>
            {snippet.isUserCreated ? (
              <>
                <Pressable
                  accessibilityLabel="Edit snippet"
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('AddEditSnippet', { snippetId: snippet.id })}
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Ionicons name="create-outline" size={21} color={colors.text} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Delete snippet"
                  accessibilityRole="button"
                  onPress={() => setShowDeleteDialog(true)}
                  style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Ionicons name="trash-outline" size={21} color={colors.danger} />
                </Pressable>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.heading}>
          <View style={styles.badges}>
            <LanguageBadge language={snippet.language} />
            <View style={[styles.metadataChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="speedometer-outline" size={15} color={colors.muted} />
              <Text style={[styles.difficultyText, { color: colors.muted }]}>{snippet.difficulty}</Text>
            </View>
            <View style={[styles.metadataChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="folder-outline" size={15} color={colors.muted} />
              <Text style={[styles.difficultyText, { color: colors.muted }]}>{snippet.category}</Text>
            </View>
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{snippet.title}</Text>
          <SectionHeading title="What it does" color={colors.text} />
          <Text style={[styles.description, { color: colors.muted }]}>{snippet.description}</Text>
          <View style={styles.tags}>
            {(snippet.tags || []).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{`#${tag}`}</Text>
              </View>
            ))}
          </View>
        </View>

        {actionError || contextError ? (
          <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.text }]}>{actionError || contextError}</Text>
          </View>
        ) : null}

        <SectionHeading title="Code" color={colors.text} />
        <CodeBlock code={snippet.code} showCopyButton={false} />

        <View style={[styles.notesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.mistakeHeading}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={[styles.notesTitle, { color: colors.text }]}>My notes</Text>
          </View>
          <Text style={[styles.notesHint, { color: colors.muted }]}>
            Private notes saved only on this device.
          </Text>
          <TextInput
            accessibilityHint="Add a personal note for this snippet. Maximum 1,000 characters."
            accessibilityLabel="My snippet notes"
            maxLength={1000}
            multiline
            onChangeText={setNoteDraft}
            placeholder="Write a reminder or explanation…"
            placeholderTextColor={colors.muted}
            style={[styles.noteInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            textAlignVertical="top"
            value={noteDraft}
          />
          <View style={styles.noteFooter}>
            <Text style={[styles.noteCount, { color: colors.muted }]}>{`${noteDraft.length}/1000`}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSavingNote }}
              disabled={isSavingNote}
              onPress={saveNote}
              style={[styles.noteSaveButton, { backgroundColor: colors.primary, opacity: isSavingNote ? 0.6 : 1 }]}
            >
              <Text style={[styles.noteSaveText, { color: isDark ? colors.background : '#FFFFFF' }]}>
                {isSavingNote ? 'Saving…' : 'Save note'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.mistakeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.mistakeHeading}>
            <Ionicons name="bulb-outline" size={20} color={colors.danger} />
            <Text style={[styles.mistakeTitle, { color: colors.text }]}>Common mistake</Text>
          </View>
          <Text style={[styles.mistakeText, { color: colors.muted }]}>{snippet.commonMistake}</Text>
        </View>

        {relatedSnippets.length > 0 ? (
          <View style={styles.related}>
            <SectionHeading title="Related snippets" color={colors.text} />
            {relatedSnippets.map((related) => (
              <SnippetCard
                key={related.id}
                snippet={related}
                onPress={() => {
                  recordViewed(related.id);
                  navigation.push('SnippetDetails', { snippetId: related.id });
                }}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          accessibilityHint="Copies this snippet's code to the clipboard"
          accessibilityLabel="Copy code"
          accessibilityRole="button"
          onPress={copyCode}
          style={({ pressed }) => [
            styles.bottomAction,
            styles.copyAction,
            { backgroundColor: `${colors.primary}1A`, borderColor: colors.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name="copy-outline" size={19} color={colors.primary} />
          <Text style={[styles.bottomActionText, { color: colors.primary }]}>Copy code</Text>
        </Pressable>
        <Pressable
          accessibilityHint={isFavorite ? 'Removes this snippet from your saved list' : 'Adds this snippet to your saved list'}
          accessibilityLabel={isFavorite ? 'Saved' : 'Save snippet'}
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite, disabled: isSavingFavorite }}
          disabled={isSavingFavorite}
          onPress={toggleCurrentFavorite}
          style={({ pressed }) => [
            styles.bottomAction,
            styles.saveAction,
            { backgroundColor: colors.primary, opacity: pressed || isSavingFavorite ? 0.75 : 1 },
          ]}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={19} color={isDark ? colors.background : '#FFFFFF'} />
          <Text style={[styles.bottomActionText, { color: isDark ? colors.background : '#FFFFFF' }]}>{isFavorite ? 'Saved' : 'Save'}</Text>
        </Pressable>
      </View>
      <Toast message={toastMessage} duration={2000} bottomOffset={84} onHide={() => setToastMessage('')} />
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete this snippet?"
        message="This removes the snippet from your local library and favorites. You can undo this from the library for a short time."
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete'}
        onCancel={() => !isDeleting && setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        destructive
      />
    </SafeAreaView>
  );
}

function SectionHeading({ title, color }) {
  return <Text accessibilityRole="header" style={[styles.sectionHeading, { color }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    elevation: 2,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 44,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    elevation: 2,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 44,
  },
  heading: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metadataChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: spacing.sm,
  },
  difficultyText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: typography.body,
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    fontSize: typography.caption,
  },
  sectionHeading: {
    fontSize: typography.title,
    fontWeight: fontWeights.semibold,
  },
  mistakeCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    elevation: 2,
    gap: spacing.sm,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  notesCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  notesTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
  notesHint: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  noteInput: {
    borderRadius: radii.control,
    borderWidth: 1,
    fontSize: typography.small,
    lineHeight: 21,
    minHeight: 96,
    padding: spacing.sm,
  },
  noteFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteCount: {
    fontSize: typography.caption,
  },
  noteSaveButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  noteSaveText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  mistakeHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mistakeTitle: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
  mistakeText: {
    fontSize: typography.small,
    lineHeight: 22,
  },
  related: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: typography.small,
    lineHeight: 20,
  },
  bottomBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bottomAction: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  copyAction: {
    flex: 1,
  },
  saveAction: {
    minWidth: 112,
  },
  bottomActionText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
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
  missing: {
    flex: 1,
    padding: spacing.lg,
  },
});
