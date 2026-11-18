export type CounterType = 'days_left' | 'days_passed' | 'goal_progress';
export type Repeat = 'none' | 'monthly' | 'yearly';
export const REPEATS: Repeat[] = ['none', 'monthly', 'yearly'];

/** When a countdown sends a notification: the number of days before the event. */
export const REMINDER_DAYS = { on_day: 0, day_before: 1, week_before: 7 } as const;
export type Reminder = 'none' | keyof typeof REMINDER_DAYS;
export const REMINDERS: Reminder[] = ['none', 'on_day', 'day_before', 'week_before'];

export interface CounterItem {
  id: string;
  title: string;
  emoji: string;
  type: CounterType;
  targetDate?: string; // YYYY-MM-DD, for days_left
  repeat?: Repeat; // for days_left, e.g. birthdays repeat every year
  reminder?: Reminder; // for days_left
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
