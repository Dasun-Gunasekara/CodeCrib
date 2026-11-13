import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HelpAboutScreen from '../screens/HelpAboutScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProgressScreen from '../screens/ProgressScreen';
import QuizResultScreen from '../screens/QuizResultScreen';
import { STORAGE_KEYS } from '../storage/keys';
import { readJSON, writeJSON } from '../storage/storage';
import { spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { colors, isDark } = useTheme();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
  const [startupError, setStartupError] = useState('');

  const loadOnboardingState = useCallback(async () => {
    setStartupError('');
    try {
      const completed = await readJSON(STORAGE_KEYS.onboardingComplete, false);
      if (typeof completed !== 'boolean') {
        throw new Error('Saved onboarding preference is invalid.');
      }
      setHasCompletedOnboarding(completed);
    } catch (error) {
      setStartupError(error.message || 'Could not load your local app settings.');
    }
  }, []);

  useEffect(() => {
    loadOnboardingState();
  }, [loadOnboardingState]);

  const completeOnboarding = async () => {
    await writeJSON(STORAGE_KEYS.onboardingComplete, true);
    setHasCompletedOnboarding(true);
  };

  if (hasCompletedOnboarding === null) {
    return (
      <SafeAreaView style={[styles.startup, { backgroundColor: colors.background }]}>
        {startupError ? (
          <>
            <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
            <Text style={[styles.startupTitle, { color: colors.text }]}>CodeCrib could not start</Text>
            <Text accessibilityRole="alert" style={[styles.startupError, { color: colors.muted }]}>{startupError}</Text>
            <Pressable
              accessibilityLabel="Retry loading local settings"
              accessibilityRole="button"
              onPress={loadOnboardingState}
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.retryLabel, { color: isDark ? colors.background : '#FFFFFF' }]}>Try again</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.startupError, { color: colors.muted }]}>Loading local settings…</Text>
          </>
        )}
      </SafeAreaView>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreen onComplete={completeOnboarding} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="HelpAbout" component={HelpAboutScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  startup: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  startupTitle: {
    fontSize: typography.title,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  startupError: {
    fontSize: typography.body,
    lineHeight: 23,
    maxWidth: 420,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
    paddingHorizontal: spacing.lg,
  },
  retryLabel: {
    fontSize: typography.body,
    fontWeight: fontWeights.semibold,
  },
});
