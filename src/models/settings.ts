import { isLanguage, type Language } from '../i18n/strings.ts';
import { ACCENT_KEYS, type AccentKey } from '../theme/colors.ts';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  mode: ThemeMode;
  accent: AccentKey;
  language: Language | 'system';
}

export const DEFAULT_SETTINGS: Settings = { mode: 'system', accent: 'coral', language: 'system' };

export const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

/** Keeps only valid values from saved settings. Damaged or old values fall back to the defaults. */
export function sanitizeSettings(raw: unknown): Settings {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const { mode, accent, language } = value;
  return {
    mode: THEME_MODES.includes(mode as ThemeMode) ? (mode as ThemeMode) : DEFAULT_SETTINGS.mode,
    accent: ACCENT_KEYS.includes(accent as AccentKey) ? (accent as AccentKey) : DEFAULT_SETTINGS.accent,
    language: language === 'system' || isLanguage(language as string) ? (language as Settings['language']) : DEFAULT_SETTINGS.language,
  };
}
