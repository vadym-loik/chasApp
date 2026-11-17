export type CounterType = 'days_left' | 'days_passed' | 'goal_progress';

export interface CounterItem {
  id: string;
  title: string;
  emoji: string;
  type: CounterType;
  targetDate?: string; // YYYY-MM-DD, for days_left
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
