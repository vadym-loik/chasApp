import dayjs from 'dayjs';
import type { CounterItem } from '../models/counter';

export const DATE_FORMAT = 'YYYY-MM-DD';

export interface CounterStats {
  value: number; // main number on the card
  unit: string; // "days" or "%"
  progress?: number; // 0..1, if a progress bar applies
}

export function today(): string {
  return dayjs().format(DATE_FORMAT);
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format(DATE_FORMAT) === value;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function daysBetween(from: string, to: string): number {
  return dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day');
}

export function getCounterStats(item: CounterItem, now: string = today()): CounterStats {
  switch (item.type) {
    case 'days_left': {
      const left = Math.max(0, daysBetween(now, item.targetDate ?? now));
      const start = item.startDate ?? now;
      const total = daysBetween(start, item.targetDate ?? now);
      const progress = total > 0 ? clamp01(daysBetween(start, now) / total) : 1;
      return { value: left, unit: 'days', progress };
    }
    case 'days_passed':
      return { value: Math.max(0, daysBetween(item.startDate ?? now, now)), unit: 'days' };
    case 'goal_progress': {
      const initial = item.initialValue ?? 0;
      const current = item.currentValue ?? initial;
      const target = item.targetValue ?? initial;
      const span = target - initial;
      const progress = span === 0 ? 1 : clamp01((current - initial) / span);
      return { value: Math.round(progress * 100), unit: '%', progress };
    }
  }
}

export function parseNumber(text: string): number | undefined {
  const n = Number(text.replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(n) ? n : undefined;
}
