import dayjs from 'dayjs';
import type { Repeat } from '../models/counter';
import { DATE_FORMAT } from './counter.ts';

/** The fields of a phone calendar event that a countdown needs. */
export interface RawCalendarEvent {
  id: string;
  title: string;
  startDate: string | Date;
  allDay: boolean;
  recurrenceRule: { frequency: string } | null;
}

/** A calendar event that the user can turn into a countdown. */
export interface CalendarEventOption {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  repeat: Repeat;
}

/**
 * The day of the event, as YYYY-MM-DD.
 * An all-day event starts at midnight UTC, so its day is the UTC date. Other events use the local date.
 */
export function eventDay(event: Pick<RawCalendarEvent, 'startDate' | 'allDay'>): string {
  const start = new Date(event.startDate);
  return event.allDay ? start.toISOString().slice(0, 10) : dayjs(start).format(DATE_FORMAT);
}

/** Only monthly and yearly events repeat in a countdown. Other events count down to the next time. */
function toRepeat(rule: RawCalendarEvent['recurrenceRule']): Repeat {
  const frequency = rule?.frequency;
  return frequency === 'monthly' || frequency === 'yearly' ? frequency : 'none';
}

/**
 * Makes the list of events to choose from, sorted by date.
 * The calendar gives each time of a repeating event. The list keeps only the next time.
 */
export function toEventOptions(events: RawCalendarEvent[]): CalendarEventOption[] {
  const options = events
    .map((e) => ({ id: e.id, title: e.title.trim(), date: eventDay(e), repeat: toRepeat(e.recurrenceRule) }))
    .filter((e) => e.title)
    .sort((a, b) => a.date.localeCompare(b.date));
  const seen = new Set<string>();
  return options.filter((e) => !seen.has(e.id) && seen.add(e.id));
}
