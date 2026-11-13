import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../storage/keys';
import { readJSON, writeJSON } from '../storage/storage';

const AppPreferencesContext = createContext(null);
const codeFontSizes = ['small', 'medium', 'large'];

export function AppPreferencesProvider({ children }) {
  const [codeFontSize, setCodeFontSizeState] = useState('medium');
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [preferencesError, setPreferencesError] = useState(null);

  const refreshPreferences = useCallback(async () => {
    setPreferencesError(null);
    try {
      const [savedFontSize, savedHaptics] = await Promise.all([
        readJSON(STORAGE_KEYS.codeFontSize, 'medium'),
        readJSON(STORAGE_KEYS.hapticsEnabled, true),
      ]);
      if (!codeFontSizes.includes(savedFontSize) || typeof savedHaptics !== 'boolean') {
        throw new Error('Saved display preferences are invalid.');
      }
      setCodeFontSizeState(savedFontSize);
      setHapticsEnabledState(savedHaptics);
    } catch (error) {
      setPreferencesError(error.message || 'Could not load your display preferences.');
    }
  }, []);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences]);

  const setCodeFontSize = useCallback(async (size) => {
    if (!codeFontSizes.includes(size)) {
      throw new Error('Choose a small, medium, or large code size.');
    }
    await writeJSON(STORAGE_KEYS.codeFontSize, size);
    setCodeFontSizeState(size);
    setPreferencesError(null);
  }, []);

  const setHapticsEnabled = useCallback(async (enabled) => {
    if (typeof enabled !== 'boolean') {
      throw new Error('Haptics preference must be enabled or disabled.');
    }
    await writeJSON(STORAGE_KEYS.hapticsEnabled, enabled);
    setHapticsEnabledState(enabled);
    setPreferencesError(null);
  }, []);

  const value = useMemo(
    () => ({
      codeFontSize,
      setCodeFontSize,
      hapticsEnabled,
      setHapticsEnabled,
      preferencesError,
      refreshPreferences,
    }),
    [
      codeFontSize,
      setCodeFontSize,
      hapticsEnabled,
      setHapticsEnabled,
      preferencesError,
      refreshPreferences,
    ],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error('useAppPreferences must be used within an AppPreferencesProvider');
  }
  return context;
}
