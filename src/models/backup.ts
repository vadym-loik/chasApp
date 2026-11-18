import { toCounter, type CounterItem } from './counter.ts';

const BACKUP_APP = 'chas';
// Increase it when the file format changes, so a newer app can read old files.
const BACKUP_VERSION = 1;

/** The text of a backup file. `now` is today, as YYYY-MM-DD. */
export function makeBackup(items: CounterItem[], now: string): string {
  return JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, date: now, counters: items }, null, 2);
}

/** The counters in a backup file. `undefined` if the text is not a Chas backup. */
export function readBackup(text: string, now: string): CounterItem[] | undefined {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return undefined;
  }
  const backup = data as { app?: unknown; counters?: unknown } | null;
  if (backup?.app !== BACKUP_APP || !Array.isArray(backup.counters)) return undefined;
  return backup.counters.map((raw) => toCounter(raw, now)).filter((c) => c !== undefined);
}

/**
 * Adds the counters from a backup. Import never deletes a counter.
 * A counter that is already in the app gets the version from the backup, and keeps its place.
 */
export function mergeCounters(current: CounterItem[], imported: CounterItem[]): CounterItem[] {
  const importedById = new Map(imported.map((c) => [c.id, c]));
  const currentIds = new Set(current.map((c) => c.id));
  return [...current.map((c) => importedById.get(c.id) ?? c), ...imported.filter((c) => !currentIds.has(c.id))];
}
