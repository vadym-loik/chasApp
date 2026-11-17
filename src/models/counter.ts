export type CounterType = 'days_left' | 'days_passed' | 'goal_progress';

export interface CounterItem {
  id: string;
  title: string; // "No sugar", "Weight goal"
  emoji: string;
  type: CounterType;
  targetDate?: string; // YYYY-MM-DD, for days_left
  startDate?: string; // YYYY-MM-DD, for days_passed (and progress of days_left)
  initialValue?: number; // e.g. weight 88
  currentValue?: number; // e.g. weight 85
  targetValue?: number; // e.g. weight 80
  color: string; // pastel card color
}

export const COUNTER_TYPE_LABELS: Record<CounterType, string> = {
  days_left: 'Days left',
  days_passed: 'Days passed',
  goal_progress: 'Goal progress',
};
