import { StyleSheet, Text, View } from 'react-native';
import categories from '../data/categories.json';
import { useTheme } from '../context/ThemeContext';
import { fontWeights, typography } from '../theme/typography';

const labelColors = {
  JavaScript: '#6B4E00',
  Java: '#8A3B29',
  'HTML/CSS': '#8A3218',
};

const darkLabelColors = {
  JavaScript: '#F7C948',
  Python: '#64B5F6',
  Java: '#FF8A65',
  SQL: '#4DD0E1',
  'HTML/CSS': '#FF8A65',
  'C++': '#9FA8DA',
};

export default function LanguageBadge({ language, compact = false }) {
  const { isDark } = useTheme();
  const category = categories.find((item) => item.language === language);
  const color = category?.color || '#5B6472';
  const foreground = isDark ? darkLabelColors[language] || color : labelColors[language] || color;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A` }, compact && styles.compact]}>
      <Text style={[styles.label, { color: foreground }, compact && styles.compactLabel]}>{language}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: 10,
  },
  compact: {
    minHeight: 24,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  compactLabel: {
    fontSize: 11,
  },
});
