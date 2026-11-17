import dayjs from 'dayjs';
import type { Strings } from '../i18n/strings';
import type { CounterItem } from '../models/counter';

export const DATE_FORMAT = 'YYYY-MM-DD';

export interface CounterStats {
  value: string; // main text on the card: "12", "50%", "🎉"
  label: string; // text under the value: "days left"
  progress?: number; // 0..1, if a progress bar applies
}

export function today(): string {
  return dayjs().format(DATE_FORMAT);
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format(DATE_FORMAT) === value;
}

export function parseNumber(text: string): number | undefined {
  const n = Number(text.replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(n) ? n : undefined;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function daysBetween(from: string, to: string): number {
  return dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day');
}

export function getCounterStats(item: CounterItem, t: Strings, now: string = today()): CounterStats {
  switch (item.type) {
    case 'days_left': {
      const target = item.targetDate ?? now;
      const left = daysBetween(now, target);
      const start = item.startDate ?? now;
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
        return { value: '0%', label: t.done, progress: 0 };
      }
      const current = item.currentValue ?? initial;
      const progress = clamp01((current - initial) / (target - initial));
      const percent = Math.round(progress * 100);
      return { value: `${percent}%`, label: percent === 100 ? t.goalReached : t.done, progress };
    }
  }
}

/** Short detail line: "until March 12, 2026", "since January 1, 2025", "88 → 80 · now 84". */
export function getCounterDetails(item: CounterItem, t: Strings): string {
  switch (item.type) {
    case 'days_left':
      return item.targetDate ? t.until(t.formatDate(item.targetDate)) : '';
    case 'days_passed':
      return item.startDate ? t.since(t.formatDate(item.startDate)) : '';
    case 'goal_progress':
      if (item.initialValue === undefined || item.targetValue === undefined) return '';
      return t.goalDetails(item.initialValue, item.targetValue, item.currentValue ?? item.initialValue);
  }
}
