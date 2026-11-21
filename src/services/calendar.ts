import dayjs from 'dayjs';
import * as Calendar from 'expo-calendar';
import { PermissionsAndroid, Platform } from 'react-native';
import { toEventOptions, type CalendarEventOption } from '../utils/calendar';

// The phone calendar is not available on web.
export const calendarAvailable = Platform.OS !== 'web';

/** Asks for permission to read the calendar. Returns true if the user allows it. */
export async function requestCalendarAccess(): Promise<boolean> {
  if (!calendarAvailable) return false;
  if (Platform.OS === 'android') {
    // expo-calendar asks for read and write access together, but the app blocks WRITE_CALENDAR.
    // Reading events needs only READ_CALENDAR.
    const permission = PermissionsAndroid.PERMISSIONS.READ_CALENDAR;
    if (await PermissionsAndroid.check(permission)) return true;
    return (await PermissionsAndroid.request(permission)) === PermissionsAndroid.RESULTS.GRANTED;
  }
  if ((await Calendar.getCalendarPermissions()).granted) return true;
  return (await Calendar.requestCalendarPermissions()).granted;
}

/** The events of the visible calendars from today to one year ahead. */
export async function getUpcomingEvents(): Promise<CalendarEventOption[]> {
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  const visible = calendars.filter((c) => c.isVisible !== false);
  if (visible.length === 0) return [];
  const start = dayjs().startOf('day');
  const events = await Calendar.listEvents(visible, start.toDate(), start.add(1, 'year').toDate());
  return toEventOptions(events);
}
