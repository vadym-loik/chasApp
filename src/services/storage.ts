import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CounterItem } from '../models/counter';
import { DEFAULT_SETTINGS, type Settings } from '../models/settings';

const COUNTERS_KEY = 'counters:v1';
const SETTINGS_KEY = 'settings:v1';

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function getCounters(): Promise<CounterItem[]> {
  return readJSON<CounterItem[]>(COUNTERS_KEY, []);
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
  return { ...DEFAULT_SETTINGS, ...(await readJSON<Partial<Settings>>(SETTINGS_KEY, {})) };
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJSON(SETTINGS_KEY, settings);
}
