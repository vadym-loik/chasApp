import { isLanguage, type Language } from '../i18n/strings.ts';
import { ACCENT_KEYS, type AccentKey } from '../theme/colors.ts';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  mode: ThemeMode;
  accent: AccentKey;
  language: Language | 'system';
  reminderHour: number; // the hour of the day when reminders come
}

export const REMINDER_HOURS = [8, 9, 12, 18, 20];

export const DEFAULT_SETTINGS: Settings = { mode: 'system', accent: 'coral', language: 'system', reminderHour: 9 };

const MODES: ThemeMode[] = ['system', 'light', 'dark'];

/** Keeps only valid values from saved settings. Damaged or old values fall back to the defaults. */
export function sanitizeSettings(raw: unknown): Settings {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const { mode, accent, language, reminderHour } = value;
  return {
    mode: MODES.includes(mode as ThemeMode) ? (mode as ThemeMode) : DEFAULT_SETTINGS.mode,
    accent: ACCENT_KEYS.includes(accent as AccentKey) ? (accent as AccentKey) : DEFAULT_SETTINGS.accent,
    language: language === 'system' || isLanguage(language as string) ? (language as Settings['language']) : DEFAULT_SETTINGS.language,
    reminderHour: REMINDER_HOURS.includes(reminderHour as number) ? (reminderHour as number) : DEFAULT_SETTINGS.reminderHour,
  };
}
