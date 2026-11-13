import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import PrimaryButton from './PrimaryButton';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}) {
  const { colors, isDark } = useTheme();

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              disabled={loading}
              onPress={onCancel}
              style={[styles.cancel, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelLabel, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <View style={styles.confirm}>
              {destructive ? (
                <Pressable
                  accessibilityLabel={confirmLabel}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loading }}
                  disabled={loading}
                  onPress={onConfirm}
                  style={[styles.deleteButton, { backgroundColor: colors.danger, opacity: loading ? 0.65 : 1 }]}
                >
                  {loading ? (
                    <Text style={[styles.deleteLabel, { color: isDark ? colors.background : '#FFFFFF' }]}>Please wait…</Text>
                  ) : (
                    <Text style={[styles.deleteLabel, { color: isDark ? colors.background : '#FFFFFF' }]}>{confirmLabel}</Text>
                  )}
                </Pressable>
              ) : (
                <PrimaryButton title={confirmLabel} onPress={onConfirm} loading={loading} />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: '#00000066',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 440,
    padding: spacing.lg,
    width: '100%',
  },
  title: {
    fontSize: typography.title,
    fontWeight: fontWeights.bold,
  },
  message: {
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancel: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelLabel: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  confirm: {
    flex: 1,
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteLabel: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
});
