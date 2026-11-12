import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AppPreferencesProvider } from './src/context/AppPreferencesContext';
import { SnippetsProvider } from './src/context/SnippetsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function AppContent() {
  const { colors, isDark } = useTheme();
  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AppPreferencesProvider>
            <SnippetsProvider>
              <AppContent />
            </SnippetsProvider>
          </AppPreferencesProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
