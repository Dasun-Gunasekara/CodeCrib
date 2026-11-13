import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import { tokenizeCode } from '../utils/highlight';
import Toast from './Toast';

const syntaxColors = {
  keyword: '#C792EA',
  string: '#C3E88D',
  number: '#F78C6C',
  comment: '#7F8C9F',
  plain: '#E8ECF3',
};

export default function CodeBlock({ code, showCopyButton = true }) {
  const { colors } = useTheme();
  const { codeFontSize, hapticsEnabled } = useAppPreferences();
  const [toastMessage, setToastMessage] = useState('');
  const tokens = useMemo(() => tokenizeCode(code), [code]);
  const codeTextSize = { small: 12, medium: typography.small, large: typography.body }[codeFontSize];
  const codeLineHeight = { small: 20, medium: 23, large: 27 }[codeFontSize];

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(code);
    } catch (error) {
      setToastMessage(`Could not copy code: ${error.message}`);
      return;
    }

    if (hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        setToastMessage('Code copied to clipboard');
        return;
      }
    }

    setToastMessage('Code copied to clipboard');
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={styles.windowDots}>
            <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
            <View style={[styles.dot, { backgroundColor: '#FFD166' }]} />
            <View style={[styles.dot, { backgroundColor: '#06D6A0' }]} />
          </View>
          {showCopyButton ? (
            <Pressable
              accessibilityHint="Copies the code example to your clipboard"
              accessibilityLabel="Copy code to clipboard"
              accessibilityRole="button"
              onPress={copyCode}
              style={styles.copyButton}
            >
              <Ionicons name="copy-outline" size={17} color="#E8ECF3" />
              <Text style={styles.copyText}>Copy</Text>
            </Pressable>
          ) : null}
          {!showCopyButton ? <View style={styles.headerSpacer} /> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <Text selectable style={[styles.code, { fontSize: codeTextSize, lineHeight: codeLineHeight }]}>
            {tokens.map((token, index) => (
              <Text key={`${index}-${token.type}`} style={{ color: syntaxColors[token.type] }}>
                {token.text}
              </Text>
            ))}
          </Text>
        </ScrollView>
      </View>
      <Toast message={toastMessage} onHide={() => setToastMessage('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    backgroundColor: '#111722',
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#2A3140',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  windowDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerSpacer: {
    minHeight: 44,
    minWidth: 72,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  copyButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 72,
  },
  copyText: {
    color: '#E8ECF3',
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  code: {
    color: syntaxColors.plain,
    fontFamily: 'monospace',
    fontSize: typography.small,
    lineHeight: 23,
    padding: spacing.md,
  },
});
