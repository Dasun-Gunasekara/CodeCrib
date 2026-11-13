import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

export default function Toast({ message, onHide, duration = 2200, bottomOffset = spacing.xl }) {
  const { colors } = useTheme();

  useEffect(() => {
    if (!message) return undefined;
    const timeout = setTimeout(onHide, duration);
    return () => clearTimeout(timeout);
  }, [message, onHide, duration]);

  if (!message) return null;

  return (
    <View accessibilityLiveRegion="polite" pointerEvents="none" style={[styles.position, { bottom: bottomOffset }]}>
      <View style={[styles.toast, { backgroundColor: colors.text }]}>
        <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
        <Text style={[styles.message, { color: colors.background }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  position: {
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
  },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radii.control,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  message: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
});
