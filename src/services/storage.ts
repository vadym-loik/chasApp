import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CounterItem } from '../models/counter';

const KEY = 'counters:v1';

export async function getCounters(): Promise<CounterItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as CounterItem[]) : [];
}

async function saveCounters(items: CounterItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function getCounter(id: string): Promise<CounterItem | undefined> {
  return (await getCounters()).find((c) => c.id === id);
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
