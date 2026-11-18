import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyReminderHour, toCounter, type CounterItem, type NewCounter } from '../models/counter';
import { sanitizeSettings, type Settings } from '../models/settings';
import { today } from '../utils/counter';
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

let writes: Promise<unknown> = Promise.resolve();

/**
 * Runs each change after the previous one ends. A change reads the data, then writes it back,
 * so two fast changes could otherwise overwrite each other.
 */
function queued<T>(change: () => Promise<T>): Promise<T> {
  const result = writes.then(change);
  writes = result.catch(() => undefined);
  return result;
}

export async function getCounters(): Promise<CounterItem[]> {
  const items = await readJSON(COUNTERS_KEY);
  if (!Array.isArray(items)) return [];
  const now = today();
  return items.map((raw) => toCounter(raw, now)).filter((c) => c !== undefined);
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

export function addCounter(item: NewCounter): Promise<CounterItem> {
  return queued(async () => {
    const created: CounterItem = { ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
    await saveCounters([...(await getCounters()), created]);
    return created;
  });
}

/** Saves the new version of a counter, found by its id. */
export function updateCounter(item: CounterItem): Promise<void> {
  return queued(async () => {
    const items = await getCounters();
    await saveCounters(items.map((c) => (c.id === item.id ? item : c)));
  });
}

export function deleteCounter(id: string): Promise<void> {
  return queued(async () => saveCounters((await getCounters()).filter((c) => c.id !== id)));
}

/**
 * Version 1.2.0 had one reminder hour for all counters, in the settings.
 * Now each counter has its own time. This copies the old hour to the counters once, then removes it.
 */
export function migrateReminderHour(): Promise<void> {
  return queued(async () => {
    const raw = await readJSON(SETTINGS_KEY);
    const hour = (raw as { reminderHour?: unknown } | undefined)?.reminderHour;
    if (typeof hour !== 'number') return;
    await writeJSON(COUNTERS_KEY, applyReminderHour(await getCounters(), hour));
    await writeJSON(SETTINGS_KEY, sanitizeSettings(raw));
  });
}

export async function getSettings(): Promise<Settings> {
  return sanitizeSettings(await readJSON(SETTINGS_KEY));
}

export function saveSettings(settings: Settings): Promise<void> {
  return queued(async () => {
    await writeJSON(SETTINGS_KEY, settings);
    updateWidgets();
    updateReminders();
  });
}

async function getWidgetMap(): Promise<Record<string, string>> {
  const map = await readJSON(WIDGETS_KEY);
  return map && typeof map === 'object' && !Array.isArray(map) ? (map as Record<string, string>) : {};
}

/** The counter a home screen widget shows. */
export async function getWidgetCounterId(widgetId: number): Promise<string | undefined> {
  return (await getWidgetMap())[String(widgetId)];
}

export function setWidgetCounterId(widgetId: number, counterId: string | undefined): Promise<void> {
  return queued(async () => {
    const map = await getWidgetMap();
    if (counterId) map[String(widgetId)] = counterId;
    else delete map[String(widgetId)];
    await writeJSON(WIDGETS_KEY, map);
  });
}
