import type { Language } from '../i18n/strings';
import type { AccentKey } from '../theme/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  mode: ThemeMode;
  accent: AccentKey;
  language: Language | 'system';
}

export const DEFAULT_SETTINGS: Settings = { mode: 'system', accent: 'coral', language: 'system' };
