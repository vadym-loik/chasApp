import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CounterItem } from '../models/counter';
import { sanitizeSettings, type Settings } from '../models/settings';

const COUNTERS_KEY = 'counters:v1';
const SETTINGS_KEY = 'settings:v1';

/** Reads saved JSON. Damaged data gives `undefined`, so the app still starts. */
async function readJSON(key: string): Promise<unknown> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getCounters(): Promise<CounterItem[]> {
  const items = await readJSON(COUNTERS_KEY);
  return Array.isArray(items) ? items.filter(isCounter) : [];
}

function isCounter(item: unknown): item is CounterItem {
  const c = item as CounterItem;
  return !!c && typeof c.id === 'string' && typeof c.title === 'string' && typeof c.type === 'string';
}

export async function getCounter(id: string): Promise<CounterItem | undefined> {
  return (await getCounters()).find((c) => c.id === id);
}

export async function addCounter(item: Omit<CounterItem, 'id'>): Promise<CounterItem> {
  const created = { ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
  await writeJSON(COUNTERS_KEY, [...(await getCounters()), created]);
  return created;
}

export async function updateCounter(id: string, changes: Partial<CounterItem>): Promise<void> {
  const items = await getCounters();
  await writeJSON(COUNTERS_KEY, items.map((c) => (c.id === id ? { ...c, ...changes, id } : c)));
}

export async function deleteCounter(id: string): Promise<void> {
  await writeJSON(COUNTERS_KEY, (await getCounters()).filter((c) => c.id !== id));
}

export async function getSettings(): Promise<Settings> {
  return sanitizeSettings(await readJSON(SETTINGS_KEY));
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJSON(SETTINGS_KEY, settings);
}
