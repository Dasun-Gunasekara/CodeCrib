import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { STORAGE_KEYS } from '../storage/keys';
import { readJSON, writeJSON } from '../storage/storage';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(null);
const themeModes = ['system', 'light', 'dark'];

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('system');
  const [themeError, setThemeError] = useState(null);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const refreshTheme = useCallback(async () => {
    setThemeError(null);
    try {
      const savedMode = await readJSON(STORAGE_KEYS.themeMode, 'system');
      if (!themeModes.includes(savedMode)) {
        throw new Error('Saved theme preference is invalid.');
      }
      setThemeModeState(savedMode);
    } catch (error) {
      setThemeError(error.message || 'Could not load your theme preference.');
    }
  }, []);

  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  const setThemeMode = useCallback(async (mode) => {
    if (!themeModes.includes(mode)) {
      throw new Error('Choose system, light, or dark theme.');
    }

    await writeJSON(STORAGE_KEYS.themeMode, mode);
    setThemeModeState(mode);
    setThemeError(null);
  }, []);

  const value = useMemo(
    () => ({
      colors,
      isDark,
      themeMode,
      setThemeMode,
      themeError,
      refreshTheme,
    }),
    [colors, isDark, themeMode, setThemeMode, themeError, refreshTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
