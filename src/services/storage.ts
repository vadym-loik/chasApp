import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CounterItem } from '../models/counter';
import { sanitizeSettings, type Settings } from '../models/settings';
import { updateWidgets } from '../widgets';
import { updateReminders } from './reminders';

const COUNTERS_KEY = 'counters:v1';
const SETTINGS_KEY = 'settings:v1';
const WIDGETS_KEY = 'widgets:v1'; // home screen widget id -> counter id

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

// Widgets and reminders show counters and use the settings, so they must update after each change.
async function saveCounters(items: CounterItem[]): Promise<void> {
  await writeJSON(COUNTERS_KEY, items);
  updateWidgets();
  updateReminders();
}

export async function addCounter(item: Omit<CounterItem, 'id'>): Promise<CounterItem> {
  const created = { ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
  await saveCounters([...(await getCounters()), created]);
  return created;
}

export async function updateCounter(id: string, changes: Partial<CounterItem>): Promise<void> {
  const items = await getCounters();
  await saveCounters(items.map((c) => (c.id === id ? { ...c, ...changes, id } : c)));
}

export async function deleteCounter(id: string): Promise<void> {
  await saveCounters((await getCounters()).filter((c) => c.id !== id));
}

export async function getSettings(): Promise<Settings> {
  return sanitizeSettings(await readJSON(SETTINGS_KEY));
}

export async function saveSettings(settings: Settings): Promise<void> {
  await writeJSON(SETTINGS_KEY, settings);
  updateWidgets();
  updateReminders();
}

async function getWidgetMap(): Promise<Record<string, string>> {
  const map = await readJSON(WIDGETS_KEY);
  return map && typeof map === 'object' && !Array.isArray(map) ? (map as Record<string, string>) : {};
}

/** The counter a home screen widget shows. */
export async function getWidgetCounterId(widgetId: number): Promise<string | undefined> {
  return (await getWidgetMap())[String(widgetId)];
}

export async function setWidgetCounterId(widgetId: number, counterId: string | undefined): Promise<void> {
  const map = await getWidgetMap();
  if (counterId) map[String(widgetId)] = counterId;
  else delete map[String(widgetId)];
  await writeJSON(WIDGETS_KEY, map);
}
