import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { makeBackup, readBackup } from '../models/backup';
import type { CounterItem } from '../models/counter';
import { today } from '../utils/counter';
import { getCounters } from './storage';

// expo-file-system does not support web.
export const backupAvailable = Platform.OS !== 'web';

/** Saves all counters to a JSON file, then opens the share sheet, so the user can keep the file. */
export async function exportBackup(dialogTitle: string): Promise<void> {
  const now = today();
  const file = new File(Paths.cache, `chas-backup-${now}.json`);
  file.create({ overwrite: true });
  await file.write(makeBackup(await getCounters(), now));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle });
}

/**
 * Asks the user for a backup file and gives its counters. `undefined` if the user cancels.
 * Throws if the file is not a Chas backup or has no counters.
 */
export async function pickBackup(): Promise<CounterItem[] | undefined> {
  // Any file type: file managers often do not mark a .json file as JSON. readBackup() checks the content.
  const picked = await File.pickFileAsync();
  if (picked.canceled) return undefined;
  const items = readBackup(await picked.result.text(), today());
  if (!items?.length) throw new Error('The file is not a Chas backup');
  return items;
}
