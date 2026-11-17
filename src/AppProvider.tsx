import { useLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { resolveLanguage, STRINGS, type Language, type Strings } from './i18n/strings';
import type { Settings } from './models/settings';
import { getSettings, saveSettings } from './services/storage';
import { ACCENTS, BASE_COLORS, cardColor, type BaseColors, type Scheme } from './theme/colors';

interface AppContextValue {
  settings: Settings;
  setSettings: (changes: Partial<Settings>) => void;
  scheme: Scheme;
  colors: BaseColors & { accent: string };
  cardColor: (key: string) => string;
  language: Language;
  t: Strings;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Holds the user settings and gives the theme colors and translations to all screens. */
export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const deviceLanguage = useLocales()[0]?.languageCode;
  const [settings, setSettingsState] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettingsState);
  }, []);

  const value = useMemo<AppContextValue | null>(() => {
    if (!settings) return null;
    const scheme: Scheme =
      settings.mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.mode;
    const language = resolveLanguage(settings.language, deviceLanguage);
    return {
      settings,
      setSettings: (changes) => {
        const next = { ...settings, ...changes };
        setSettingsState(next);
        saveSettings(next);
      },
      scheme,
      colors: { ...BASE_COLORS[scheme], accent: ACCENTS[settings.accent] },
      cardColor: (key) => cardColor(key, scheme),
      language,
      t: STRINGS[language],
    };
  }, [settings, systemScheme, deviceLanguage]);

  // Wait for saved settings, so the app does not flash the wrong colors or language.
  if (!value) return null;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
