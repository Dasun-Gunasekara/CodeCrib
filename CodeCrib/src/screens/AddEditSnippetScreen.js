import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import categories from '../data/categories.json';
import bundledSnippets from '../data/snippets.json';
import FilterChips from '../components/FilterChips';
import PrimaryButton from '../components/PrimaryButton';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const snippetCategories = [...new Set(['Basics', ...bundledSnippets.map((snippet) => snippet.category)])];

const emptyForm = {
  title: '',
  language: categories[0].language,
  category: 'Basics',
  difficulty: 'Beginner',
  description: '',
  code: '',
  tags: '',
  commonMistake: '',
};

export default function AddEditSnippetScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { snippets, isLoading, saveSnippet } = useSnippets();
  const snippetId = route.params?.snippetId;
  const snippet = snippets.find((item) => item.id === snippetId);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(snippetId);
  const fields = useMemo(
    () => [
      { key: 'title', label: 'Title', placeholder: 'e.g. Filter a list', multiline: false, maxLength: 80 },
      { key: 'description', label: 'Description', placeholder: 'What does this example help you do?', multiline: true, maxLength: 400 },
      { key: 'code', label: 'Code', placeholder: 'Write or paste your code example', multiline: true, code: true, maxLength: 5000 },
      { key: 'tags', label: 'Tags', placeholder: 'Separate tags with commas', multiline: false, maxLength: 200 },
      { key: 'commonMistake', label: 'Common mistake', placeholder: 'What should someone watch out for?', multiline: true, maxLength: 400 },
    ],
    [],
  );

  useEffect(() => {
    if (!snippet) return;

    if (!snippet.isUserCreated) {
      setFormError('Bundled snippets are read-only. You can create a copy as a new snippet instead.');
      return;
    }

    setForm({
      title: snippet.title || '',
      language: snippet.language || categories[0].language,
      category: snippet.category || 'Basics',
      difficulty: snippet.difficulty || 'Beginner',
      description: snippet.description || '',
      code: snippet.code || '',
      tags: (snippet.tags || []).join(', '),
      commonMistake: snippet.commonMistake || '',
    });
  }, [snippet]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: '' }));
    setFormError('');
  };

  const validate = () => {
    const errors = {};
    const requiredFields = ['title', 'description', 'code', 'tags', 'commonMistake'];

    requiredFields.forEach((key) => {
      if (!form[key].trim()) {
        errors[key] = 'This field is required.';
      }
    });

    if (form.title.trim().length > 80) {
      errors.title = 'Keep the title to 80 characters or fewer.';
    }

    if (form.description.trim().length > 400) {
      errors.description = 'Keep the description to 400 characters or fewer.';
    }

    if (form.code.length > 5000) {
      errors.code = 'Keep the code example under 5,000 characters.';
    }

    if (form.commonMistake.trim().length > 400) {
      errors.commonMistake = 'Keep the common-mistake note to 400 characters or fewer.';
    }

    if (form.tags.length > 200) {
      errors.tags = 'Keep the tags field under 200 characters.';
    }

    const tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);

    if (tags.length > 8) {
      errors.tags = 'Use no more than 8 tags.';
    } else if (tags.some((tag) => tag.length > 24)) {
      errors.tags = 'Each tag must be 24 characters or fewer.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setFormError('Please fix the highlighted fields before saving.');
      return;
    }

    if (isEditing && (!snippet || !snippet.isUserCreated)) {
      setFormError('This snippet is not editable.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      await saveSnippet(
        {
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          code: form.code.trim(),
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          commonMistake: form.commonMistake.trim(),
        },
        snippetId,
      );
      navigation.goBack();
    } catch (saveError) {
      setFormError(saveError.message || 'Could not save your snippet. Your changes are still on this screen.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing && isLoading && !snippet) {
    return (
      <SafeAreaView edges={['top']} style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading snippet…</Text>
      </SafeAreaView>
    );
  }

  if (isEditing && (!snippet || !snippet.isUserCreated)) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.missing}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Snippet unavailable</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {formError || 'This snippet could not be found in your local library.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
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
          <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PERSONAL LIBRARY</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit snippet' : 'Add a snippet'}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Keep your own useful programming example available offline.
          </Text>

          {formError ? (
            <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
              <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.text }]}>{formError}</Text>
            </View>
          ) : null}

          <FilterChips
            label="Language"
            options={categories.map((category) => category.language)}
            value={form.language}
            onChange={(value) => updateField('language', value)}
          />
          <FilterChips
            label="Category"
            options={snippetCategories}
            value={form.category}
            onChange={(value) => updateField('category', value)}
          />
          <FilterChips
            label="Difficulty"
            options={difficulties}
            value={form.difficulty}
            onChange={(value) => updateField('difficulty', value)}
          />

          {fields.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
              <TextInput
                accessibilityLabel={field.label}
                accessibilityHint={`Maximum ${field.maxLength} characters`}
                autoCapitalize={field.key === 'tags' ? 'none' : 'sentences'}
                autoCorrect={!field.code}
                maxLength={field.maxLength}
                multiline={field.multiline}
                onChangeText={(value) => updateField(field.key, value)}
                placeholder={field.placeholder}
                placeholderTextColor={colors.muted}
                returnKeyType={field.multiline ? 'default' : 'next'}
                style={[
                  styles.input,
                  field.multiline && styles.multiline,
                  field.code && styles.codeInput,
                  { backgroundColor: colors.surface, borderColor: fieldErrors[field.key] ? colors.danger : colors.border, color: colors.text },
                ]}
                textAlignVertical={field.multiline ? 'top' : 'center'}
                value={form[field.key]}
              />
              {fieldErrors[field.key] ? (
                <Text style={[styles.fieldError, { color: colors.danger }]}>{fieldErrors[field.key]}</Text>
              ) : null}
              <Text style={[styles.characterCount, { color: colors.muted }]}>
                {`${form[field.key].length}/${field.maxLength}`}
              </Text>
            </View>
          ))}

          <PrimaryButton title={isEditing ? 'Save changes' : 'Save snippet'} onPress={handleSave} loading={isSaving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 23,
    marginBottom: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  input: {
    borderRadius: radii.control,
    borderWidth: 1,
    fontSize: typography.body,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 92,
    paddingTop: spacing.md,
  },
  codeInput: {
    fontFamily: 'monospace',
    minHeight: 180,
  },
  fieldError: {
    fontSize: typography.caption,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: typography.caption,
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
    gap: spacing.md,
    padding: spacing.lg,
  },
});
