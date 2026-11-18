import { getLocales } from 'expo-localization';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { resolveLanguage, STRINGS, type Strings } from '../i18n/strings';
import { getNextReminder } from '../utils/counter';
import { getCounters, getSettings, migrateReminderHour } from './storage';

// Reminders are for Android only for now.
export const remindersAvailable = Platform.OS === 'android';

const CHANNEL_ID = 'reminders';

if (remindersAvailable) {
  // Show reminders also when the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Android 13 and later show the permission prompt only after the app creates a channel.
function createChannel(t: Strings) {
  return Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: t.reminder,
    importance: AndroidImportance.HIGH,
  });
}

/** Asks for permission to show notifications. Returns true if the user allows them. */
export async function requestReminderPermission(t: Strings): Promise<boolean> {
  if (!remindersAvailable) return false;
  await createChannel(t);
  if ((await Notifications.getPermissionsAsync()).granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Schedules the next reminder of each countdown again, with the saved settings.
 * Call it after counters or settings change, and when the app starts (repeating events move to the next date).
 */
async function syncReminders(): Promise<void> {
  if (!remindersAvailable) return;
  const [items, settings] = await Promise.all([getCounters(), getSettings()]);
  const t = STRINGS[resolveLanguage(settings.language, getLocales()[0]?.languageCode)];
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  await createChannel(t);
  for (const item of items) {
    const reminder = getNextReminder(item, t);
    if (!reminder) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: {
        title: `${item.emoji} ${item.title}`,
        body: reminder.body,
        data: { url: `/${item.id}` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.date, channelId: CHANNEL_ID },
    });
  }
}

/** Syncs reminders when the app starts, and opens the counter when the user taps its reminder. */
export function useReminders(): void {
  useEffect(() => {
    if (!remindersAvailable) return;
    migrateReminderHour().finally(updateReminders);

    function open(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url);
        Notifications.clearLastNotificationResponse();
      }
    }
    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) open(last.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification));
    return () => subscription.remove();
  }, []);
}

let queue = Promise.resolve();

/**
 * Starts the reminder sync after the previous one ends, so two fast saves do not mix.
 * Errors only go to the log, so the app keeps working.
 */
export function updateReminders(): void {
  queue = queue.then(syncReminders).catch((error: unknown) => console.warn('Reminder update failed', error));
}
