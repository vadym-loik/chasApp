import dayjs from 'dayjs';
import type { Strings } from '../i18n/strings';
import {
  DEFAULT_REMINDER_TIME, REMINDER_DAYS, REMINDERS, type CounterItem, type CounterType, type Reminder, type Repeat,
} from '../models/counter.ts';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';

export interface CounterStats {
  value: string; // main text on the card: "12", "50%", "🎉"
  label: string; // text under the value: "days left"
  progress?: number; // 0..1, if a progress bar applies
}

export function today(): string {
  return dayjs().format(DATE_FORMAT);
}

export function addDays(date: string, n: number, unit: 'day' | 'week' | 'month' | 'year' = 'day'): string {
  return dayjs(date).add(n, unit).format(DATE_FORMAT);
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format(DATE_FORMAT) === value;
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function parseNumber(text: string): number | undefined {
  const n = Number(text.replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(n) ? n : undefined;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function daysBetween(from: string, to: string): number {
  return dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day');
}

/** Number of Saturdays after `from`, up to and including `to`. */
export function countWeekends(from: string, to: string): number {
  const days = daysBetween(from, to);
  const firstSaturday = (6 - dayjs(from).day() + 7) % 7 || 7;
  return days >= firstSaturday ? Math.floor((days - firstSaturday) / 7) + 1 : 0;
}

const REPEAT_UNIT = { monthly: 'month', yearly: 'year' } as const;

/**
 * The period a countdown runs in: from `start` to the next event date `target`.
 * A repeating event moves to its next date after it passes. Its period starts at the previous date.
 */
export function getEventWindow(item: CounterItem, now: string = today()): { start: string; target: string } {
  const target = item.targetDate ?? now;
  const repeat = item.repeat ?? 'none';
  if (repeat === 'none' || target >= now) return { start: item.startDate ?? now, target };
  const unit = REPEAT_UNIT[repeat];
  // Count from the first date each time, so "31 January" stays on the last day of short months.
  const nth = (k: number) => addDays(target, k, unit);
  let k = Math.max(1, dayjs(now).diff(target, unit));
  while (nth(k) < now) k++;
  return { start: nth(k - 1), target: nth(k) };
}

/** The time of a reminder, from the saved date and time. */
function reminderAt(day: string, time: string): Date {
  return dayjs(`${day}T${time}`).toDate();
}

/**
 * The reminder options for a counter. Only countdowns have reminders before the event.
 * A repeating countdown has no custom date, because one date does not repeat.
 */
export function getReminderOptions(type: CounterType, repeat: Repeat = 'none'): Reminder[] {
  if (type !== 'days_left') return ['none', 'custom'];
  return repeat === 'none' ? REMINDERS : REMINDERS.filter((r) => r !== 'custom');
}

/** True if the custom reminder of the item is set and still in the future. */
export function isFutureCustomReminder(item: Pick<CounterItem, 'reminderDate' | 'reminderTime'>, now: Date = new Date()): boolean {
  return !!item.reminderDate && reminderAt(item.reminderDate, item.reminderTime ?? DEFAULT_REMINDER_TIME) > now;
}

/** The text of a reminder on `day`: "In 7 days", "12 days passed", "Time to update your progress." */
function reminderBody(item: CounterItem, t: Strings, day: string): string {
  if (item.type === 'goal_progress') return t.goalReminder;
  if (item.type === 'days_left') {
    const left = daysBetween(day, getEventWindow(item, day).target);
    if (left >= 0) return t.reminderBody(left);
  }
  const stats = getCounterStats(item, t, day);
  return `${stats.value} ${stats.label}`;
}

/**
 * The next reminder of a counter and its text. `undefined` if there is no reminder to send.
 * When the reminder of a repeating countdown has passed, it moves to the next event date.
 */
export function getNextReminder(
  item: CounterItem,
  t: Strings,
  now: Date = new Date(),
): { date: Date; body: string } | undefined {
  const reminder = item.reminder ?? 'none';
  if (reminder === 'none' || !getReminderOptions(item.type, item.repeat).includes(reminder)) return undefined;
  const time = item.reminderTime ?? DEFAULT_REMINDER_TIME;

  if (reminder === 'custom') {
    if (!item.reminderDate || !isFutureCustomReminder(item, now)) return undefined;
    return { date: reminderAt(item.reminderDate, time), body: reminderBody(item, t, item.reminderDate) };
  }

  const remindDay = (target: string) => addDays(target, -REMINDER_DAYS[reminder]);
  let day = remindDay(getEventWindow(item, dayjs(now).format(DATE_FORMAT)).target);
  if (reminderAt(day, time) <= now && (item.repeat ?? 'none') !== 'none') {
    day = remindDay(getEventWindow(item, addDays(day, REMINDER_DAYS[reminder] + 1)).target);
  }
  const date = reminderAt(day, time);
  return date > now ? { date, body: reminderBody(item, t, day) } : undefined;
}

export function getCounterStats(item: CounterItem, t: Strings, now: string = today()): CounterStats {
  switch (item.type) {
    case 'days_left': {
      const { start, target } = getEventWindow(item, now);
      const left = daysBetween(now, target);
      const total = daysBetween(start, target);
      const progress = total > 0 ? clamp01(daysBetween(start, now) / total) : 1;
      if (left === 0) return { value: '🎉', label: t.today, progress };
      if (left < 0) return { value: String(-left), label: t.daysAgo(-left), progress };
      return { value: String(left), label: t.daysLeft(left), progress };
    }
    case 'days_passed': {
      const passed = Math.max(0, daysBetween(item.startDate ?? now, now));
      return { value: String(passed), label: t.daysPassed(passed) };
    }
    case 'goal_progress': {
      const { initialValue: initial, targetValue: target } = item;
      if (initial === undefined || target === undefined || initial === target) {
        return { value: t.formatPercent(0, 0), label: t.done, progress: 0 };
      }
      const current = item.currentValue ?? initial;
      const progress = clamp01((current - initial) / (target - initial));
      const percent = Math.round(progress * 100);
      return { value: t.formatPercent(percent, 0), label: percent === 100 ? t.goalReached : t.done, progress };
    }
  }
}

/** Short detail line: "until March 12, 2026 · Every year", "since January 1, 2025", "88 → 80 · now 84". */
export function getCounterDetails(item: CounterItem, t: Strings, now: string = today()): string {
  switch (item.type) {
    case 'days_left': {
      if (!item.targetDate) return '';
      const until = t.until(t.formatDate(getEventWindow(item, now).target));
      const repeat = item.repeat ?? 'none';
      return repeat === 'none' ? until : `${until} · ${t.repeats[repeat]}`;
    }
    case 'days_passed':
      return item.startDate ? t.since(t.formatDate(item.startDate)) : '';
    case 'goal_progress':
      if (item.initialValue === undefined || item.targetValue === undefined) return '';
      return t.goalDetails(item.initialValue, item.targetValue, item.currentValue ?? item.initialValue);
  }
}

/** "2 weeks 4 days" */
export function formatWeeksAndDays(days: number, t: Strings): string {
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  if (weeks === 0) return t.days(rest);
  return rest === 0 ? t.weeks(weeks) : `${t.weeks(weeks)} ${t.days(rest)}`;
}

/** Extra lines for the detail screen, e.g. ["2 weeks 4 days · 3 weekends left", "53 of 110 days"]. */
export function getCounterBreakdown(item: CounterItem, t: Strings, now: string = today()): string[] {
  if (item.type === 'days_left') {
    const { start, target } = getEventWindow(item, now);
    const left = daysBetween(now, target);
    if (left <= 0) return [];
    const weekends = countWeekends(now, target);
    const lines = [`${formatWeeksAndDays(left, t)} · ${weekends} ${t.weekendsLeft(weekends)}`];
    const total = daysBetween(start, target);
    if (total > 0) lines.push(t.daysOfTotal(Math.max(0, total - left), total));
    return lines;
  }
  if (item.type === 'days_passed') {
    const passed = daysBetween(item.startDate ?? now, now);
    return passed >= 7 ? [formatWeeksAndDays(passed, t)] : [];
  }
  return [];
}

export interface YearProgress {
  year: number;
  day: number; // day of the year, from 1
  total: number; // 365 or 366
  daysLeft: number; // days after today
  weekendsLeft: number;
  progress: number; // 0..1, at the start of today
}

export function getYearProgress(now: string = today()): YearProgress {
  const date = dayjs(now);
  const first = date.startOf('year');
  const last = date.endOf('year').format(DATE_FORMAT);
  const total = daysBetween(first.format(DATE_FORMAT), last) + 1;
  const day = date.diff(first, 'day') + 1;
  return {
    year: date.year(),
    day,
    total,
    daysLeft: total - day,
    weekendsLeft: countWeekends(now, last),
    progress: (day - 1) / total,
  };
}

export type SectionKey = 'upcoming' | 'since' | 'goals' | 'past';

/** Groups counters for the home screen. Upcoming events come first, the nearest on top. */
export function groupCounters(
  items: CounterItem[],
  now: string = today(),
): { key: SectionKey; data: CounterItem[] }[] {
  const daysLeft = (i: CounterItem) => daysBetween(now, getEventWindow(i, now).target);
  const countdowns = items.filter((i) => i.type === 'days_left');
  const sections: { key: SectionKey; data: CounterItem[] }[] = [
    { key: 'upcoming', data: countdowns.filter((i) => daysLeft(i) >= 0).sort((a, b) => daysLeft(a) - daysLeft(b)) },
    { key: 'since', data: items.filter((i) => i.type === 'days_passed') },
    { key: 'goals', data: items.filter((i) => i.type === 'goal_progress') },
    { key: 'past', data: countdowns.filter((i) => daysLeft(i) < 0).sort((a, b) => daysLeft(b) - daysLeft(a)) },
  ];
  return sections.filter((s) => s.data.length > 0);
}
