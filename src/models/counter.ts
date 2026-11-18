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

export interface CounterItem {
  id: string;
  title: string;
  emoji: string;
  type: CounterType;
  targetDate?: string; // YYYY-MM-DD, for days_left
  repeat?: Repeat; // for days_left, e.g. birthdays repeat every year
  reminder?: Reminder;
  reminderTime?: string; // HH:mm, the time of the reminder
  reminderDate?: string; // YYYY-MM-DD, for the 'custom' reminder
  startDate?: string; // YYYY-MM-DD, for days_passed (and progress of days_left)
  initialValue?: number; // e.g. weight 88
  currentValue?: number; // e.g. weight 85
  targetValue?: number; // e.g. weight 80
  color: string; // key of CARD_COLORS
}

export const COUNTER_TYPE_EMOJI: Record<CounterType, string> = {
  days_left: '✈️',
  days_passed: '🌱',
  goal_progress: '🎯',
};

export const COUNTER_TYPE_KEYS = Object.keys(COUNTER_TYPE_EMOJI) as CounterType[];

/** True if saved data is a counter that the app can show. An unknown type would break the screens. */
export function isCounter(item: unknown): item is CounterItem {
  const c = item as CounterItem;
  return (
    !!c &&
    typeof c === 'object' &&
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    COUNTER_TYPE_KEYS.includes(c.type)
  );
}
