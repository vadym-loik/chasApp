import { useLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { resolveLanguage, STRINGS, type Language, type Strings } from './i18n/strings';
import { DEFAULT_SETTINGS, type Settings } from './models/settings';
import { getSettings, saveSettings } from './services/storage';
import { cardColor, getThemeColors, type Scheme, type ThemeColors } from './theme/colors';
import { getComicStyles, getSpiderColors, NO_COMIC, spiderCardColor, type ComicStyles } from './theme/spider';

interface AppContextValue {
  settings: Settings;
  setSettings: (changes: Partial<Settings>) => void;
  scheme: Scheme;
  colors: ThemeColors;
  cardColor: (key: string) => string;
  /** True in the Spider-Verse look. Screens use it to turn on the comic animations. */
  spider: boolean;
  comic: ComicStyles;
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
    // If the storage fails, start with the defaults. A blank screen would block the user.
    getSettings()
      .catch((error: unknown) => {
        console.warn('Settings load failed', error);
        return DEFAULT_SETTINGS;
      })
      .then(setSettingsState);
  }, []);

  const value = useMemo<AppContextValue | null>(() => {
    if (!settings) return null;
    const scheme: Scheme =
      settings.mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.mode;
    const language = resolveLanguage(settings.language, deviceLanguage);
    const spider = settings.look === 'spider';
    return {
      settings,
      setSettings: (changes) => {
        const next = { ...settings, ...changes };
        setSettingsState(next);
        saveSettings(next).catch((error: unknown) => console.warn('Settings save failed', error));
      },
      scheme,
      colors: spider ? getSpiderColors(scheme) : getThemeColors(scheme, settings.accent),
      cardColor: (key) => (spider ? spiderCardColor(key, scheme) : cardColor(key, scheme)),
      spider,
      comic: spider ? getComicStyles(scheme) : NO_COMIC,
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
