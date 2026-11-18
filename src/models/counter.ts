export type CounterType = 'days_left' | 'days_passed' | 'goal_progress';
export type Repeat = 'none' | 'monthly' | 'yearly';
export const REPEATS: Repeat[] = ['none', 'monthly', 'yearly'];

/** Countdown reminders: the number of days before the event. */
export const REMINDER_DAYS = { on_day: 0, day_before: 1, week_before: 7 } as const;
export type DaysBeforeReminder = keyof typeof REMINDER_DAYS;
/** 'custom' is one reminder at `reminderDate`. All counter types can use it, but not repeating countdowns. */
export type Reminder = 'none' | DaysBeforeReminder | 'custom';
export const REMINDERS: Reminder[] = ['none', 'on_day', 'day_before', 'week_before', 'custom'];
export const DEFAULT_REMINDER_TIME = '09:00';

interface BaseCounter {
  id: string;
  title: string;
  emoji: string;
  color: string; // key of CARD_COLORS
  reminder?: Reminder;
  reminderTime?: string; // HH:mm, the time of the reminder
  reminderDate?: string; // YYYY-MM-DD, for the 'custom' reminder
}

/** Days left until an event. */
export interface CountdownCounter extends BaseCounter {
  type: 'days_left';
  targetDate: string; // YYYY-MM-DD
  repeat: Repeat; // e.g. birthdays repeat every year
  startDate: string; // YYYY-MM-DD, the start of the progress bar
}

/** Days passed since a date. */
export interface SinceCounter extends BaseCounter {
  type: 'days_passed';
  startDate: string; // YYYY-MM-DD
}

/** Progress from a start value to a target value, e.g. weight 88 → 80. */
export interface GoalCounter extends BaseCounter {
  type: 'goal_progress';
  initialValue: number;
  currentValue: number;
  targetValue: number;
}

export type CounterItem = CountdownCounter | SinceCounter | GoalCounter;
/** A counter before it gets an id. */
export type NewCounter = Omit<CountdownCounter, 'id'> | Omit<SinceCounter, 'id'> | Omit<GoalCounter, 'id'>;

export const COUNTER_TYPE_EMOJI: Record<CounterType, string> = {
  days_left: '✈️',
  days_passed: '🌱',
  goal_progress: '🎯',
};

export const COUNTER_TYPE_KEYS = Object.keys(COUNTER_TYPE_EMOJI) as CounterType[];

/** Gives the old reminder hour of version 1.2.0 to each counter with a reminder and no own time. */
export function applyReminderHour(items: CounterItem[], hour: number): CounterItem[] {
  const time = `${String(hour).padStart(2, '0')}:00`;
  return items.map((c) => (c.reminder && !c.reminderTime ? { ...c, reminderTime: time } : c));
}

const text = (value: unknown, fallback: string) => (typeof value === 'string' ? value : fallback);
const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

/**
 * Makes a counter from saved data, or gives `undefined` if the data is not a counter.
 * A missing field gets the default that the screens used before, so old or damaged counters do not get lost.
 * `now` is today, as YYYY-MM-DD.
 */
export function toCounter(raw: unknown, now: string): CounterItem | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const c = raw as Record<string, unknown>;
  const type = c.type as CounterType;
  if (typeof c.id !== 'string' || typeof c.title !== 'string' || !COUNTER_TYPE_KEYS.includes(type)) return undefined;
  const base: BaseCounter = { id: c.id, title: c.title, emoji: text(c.emoji, COUNTER_TYPE_EMOJI[type]), color: text(c.color, '') };
  // Add the optional fields only when they have a value.
  if (REMINDERS.includes(c.reminder as Reminder)) base.reminder = c.reminder as Reminder;
  if (typeof c.reminderTime === 'string') base.reminderTime = c.reminderTime;
  if (typeof c.reminderDate === 'string') base.reminderDate = c.reminderDate;
  switch (type) {
    case 'days_left':
      return {
        ...base,
        type,
        targetDate: text(c.targetDate, now),
        repeat: REPEATS.includes(c.repeat as Repeat) ? (c.repeat as Repeat) : 'none',
        startDate: text(c.startDate, now),
      };
    case 'days_passed':
      return { ...base, type, startDate: text(c.startDate, now) };
    case 'goal_progress': {
      // Missing values give the same start and target. The screens show 0% for them.
      const initialValue = num(c.initialValue) ?? 0;
      return {
        ...base,
        type,
        initialValue,
        currentValue: num(c.currentValue) ?? initialValue,
        targetValue: num(c.targetValue) ?? initialValue,
      };
    }
  }
}
