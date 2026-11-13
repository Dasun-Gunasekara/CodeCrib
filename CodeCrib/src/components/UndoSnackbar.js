import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function UndoSnackbar({
  visible,
  message,
  actionLabel = 'Undo',
  onAction,
  onDismiss,
  duration = 5000,
}) {
  const { colors } = useTheme();

  useEffect(() => {
    if (!visible) return undefined;
    const timeout = setTimeout(onDismiss, duration);
    return () => clearTimeout(timeout);
  }, [visible, onDismiss, duration]);

  if (!visible) return null;

  return (
    <View accessibilityLiveRegion="polite" style={styles.position}>
      <View style={[styles.snackbar, { backgroundColor: colors.text }]}>
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.accent} />
        <Text style={[styles.message, { color: colors.background }]}>{message}</Text>
        <Pressable
          accessibilityLabel={`${actionLabel}: ${message.toLowerCase()}`}
          accessibilityRole="button"
          onPress={onAction}
          style={styles.action}
        >
          <Text style={[styles.actionText, { color: colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  position: {
    bottom: spacing.sm,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  snackbar: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radii.control,
    flexDirection: 'row',
    gap: spacing.sm,
    maxWidth: 480,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  message: {
    flex: 1,
    fontSize: typography.small,
    fontWeight: fontWeights.medium,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 52,
  },
  actionText: {
    fontSize: typography.small,
    fontWeight: fontWeights.bold,
  },
});
