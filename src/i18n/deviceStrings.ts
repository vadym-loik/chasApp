import { getLocales } from 'expo-localization';
import type { Settings } from '../models/settings';
import { resolveLanguage, STRINGS, type Strings } from './strings';

/** The texts for the saved language setting. Code outside React (reminders, widgets) uses it. */
export function getStrings(settings: Settings): Strings {
  return STRINGS[resolveLanguage(settings.language, getLocales()[0]?.languageCode)];
}
