import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function SearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = 'Search by title, tag or description',
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={20} color={colors.muted} />
      <TextInput
        accessibilityHint="Search the local snippet library"
        accessibilityLabel="Search snippets"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    minHeight: 50,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
