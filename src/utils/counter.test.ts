/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  countWeekends, getCounterBreakdown, getCounterDetails, getCounterStats, getEventWindow, getYearProgress,
  groupCounters, isValidDate, parseNumber,
} from './counter.ts';
import { resolveLanguage, STRINGS, ukPlural } from '../i18n/strings.ts';
import type { CounterItem } from '../models/counter.ts';
import { DEFAULT_SETTINGS, sanitizeSettings } from '../models/settings.ts';

const { en, uk, fr } = STRINGS;
const base: CounterItem = { id: '1', title: 't', emoji: '⭐', type: 'days_left', color: 'peach' };
const DAYS: [string, string, string] = ['день', 'дні', 'днів'];

test('ukPlural uses Ukrainian forms', () => {
  assert.equal(ukPlural(1, DAYS), 'день');
  assert.equal(ukPlural(21, DAYS), 'день');
  assert.equal(ukPlural(2, DAYS), 'дні');
  assert.equal(ukPlural(24, DAYS), 'дні');
  assert.equal(ukPlural(5, DAYS), 'днів');
  assert.equal(ukPlural(11, DAYS), 'днів');
  assert.equal(ukPlural(12, DAYS), 'днів');
  assert.equal(ukPlural(0, DAYS), 'днів');
});

test('plural forms in English and French', () => {
  assert.equal(en.daysLeft(1), 'day left');
  assert.equal(en.daysLeft(0), 'days left');
  assert.equal(fr.daysLeft(0), 'jour restant');
  assert.equal(fr.daysLeft(1), 'jour restant');
  assert.equal(fr.daysLeft(2), 'jours restants');
  assert.equal(fr.formatPercent(80.66, 1), '80,7\u00A0%');
  assert.equal(uk.formatPercent(80.66, 1), '80,7%');
});

test('days_left counts down and shows progress', () => {
  const item = { ...base, startDate: '2025-01-01', targetDate: '2025-01-11' };
  const s = getCounterStats(item, uk, '2025-01-06');
  assert.equal(s.value, '5');
  assert.equal(s.label, 'днів залишилося');
  assert.equal(s.progress, 0.5);
  assert.equal(getCounterStats(item, en, '2025-01-06').label, 'days left');
});

test('days_left on the target day and after it', () => {
  assert.equal(getCounterStats({ ...base, targetDate: '2025-01-01' }, en, '2025-01-01').label, 'today');
  const past = getCounterStats({ ...base, targetDate: '2025-01-01' }, uk, '2025-01-03');
  assert.equal(past.value, '2');
  assert.equal(past.label, 'дні тому');
});

test('days_passed counts up from start date', () => {
  const s = getCounterStats({ ...base, type: 'days_passed', startDate: '2025-01-01' }, uk, '2025-01-02');
  assert.equal(s.value, '1');
  assert.equal(s.label, 'день минув');
});

test('goal_progress works for a decreasing goal (weight 88 -> 80)', () => {
  const item: CounterItem = { ...base, type: 'goal_progress', initialValue: 88, currentValue: 84, targetValue: 80 };
  assert.equal(getCounterStats(item, en).value, '50%');
  assert.equal(getCounterDetails(item, en), '88 → 80 · now 84');
});

test('goal_progress clamps at 100% for an increasing goal', () => {
  const item: CounterItem = { ...base, type: 'goal_progress', initialValue: 0, currentValue: 150, targetValue: 100 };
  const s = getCounterStats(item, fr);
  assert.equal(s.value, '100\u00A0%');
  assert.equal(s.label, 'objectif atteint');
});

test('goal_progress with missing values shows 0% and no details', () => {
  const item: CounterItem = { ...base, type: 'goal_progress', initialValue: 88 };
  assert.equal(getCounterStats(item, en).value, '0%');
  assert.equal(getCounterDetails(item, en), '');
});

test('dates use the language format', () => {
  const item: CounterItem = { ...base, targetDate: '2026-03-12' };
  assert.equal(getCounterDetails(item, en), 'until March 12, 2026');
  assert.equal(getCounterDetails(item, uk), 'до 12 березня 2026');
  assert.equal(getCounterDetails(item, fr), 'jusqu’au 12 mars 2026');
});

test('resolveLanguage', () => {
  assert.equal(resolveLanguage('fr', 'uk'), 'fr');
  assert.equal(resolveLanguage('system', 'uk'), 'uk');
  assert.equal(resolveLanguage('system', 'de'), 'en');
  assert.equal(resolveLanguage('system', null), 'en');
});

test('isValidDate and parseNumber', () => {
  assert.equal(isValidDate('2025-02-28'), true);
  assert.equal(isValidDate('2025-02-30'), false);
  assert.equal(parseNumber('84,5'), 84.5);
  assert.equal(parseNumber(' '), undefined);
  assert.equal(parseNumber('abc'), undefined);
});

test('yearly repeat moves to the next date and starts the period at the previous one', () => {
  const birthday: CounterItem = { ...base, targetDate: '2020-03-10', repeat: 'yearly' };
  assert.deepEqual(getEventWindow(birthday, '2026-03-11'), { start: '2026-03-10', target: '2027-03-10' });
  assert.deepEqual(getEventWindow(birthday, '2026-03-10'), { start: '2025-03-10', target: '2026-03-10' });
  assert.equal(getCounterStats(birthday, en, '2026-03-10').label, 'today');
  assert.equal(getCounterDetails(birthday, en, '2026-03-11'), 'until March 10, 2027 · Every year');
});

test('monthly repeat keeps the end of the month', () => {
  const rent: CounterItem = { ...base, targetDate: '2026-01-31', repeat: 'monthly' };
  assert.equal(getEventWindow(rent, '2026-02-15').target, '2026-02-28');
  assert.equal(getEventWindow(rent, '2026-03-01').target, '2026-03-31');
});

test('a one-time event in the past does not move', () => {
  assert.equal(getEventWindow({ ...base, targetDate: '2020-01-01' }, '2026-01-01').target, '2020-01-01');
});

test('countWeekends counts Saturdays after the start date', () => {
  assert.equal(countWeekends('2026-11-16', '2026-11-21'), 1); // Monday -> Saturday
  assert.equal(countWeekends('2026-11-21', '2026-11-27'), 0); // Saturday -> Friday
  assert.equal(countWeekends('2026-11-16', '2026-12-31'), 6);
});

test('getYearProgress', () => {
  const y = getYearProgress('2026-10-22');
  assert.equal(y.day, 295);
  assert.equal(y.total, 365);
  assert.equal(y.daysLeft, 70);
  assert.equal((y.progress * 100).toFixed(1), '80.5');
  assert.equal(getYearProgress('2024-12-31').total, 366);
  assert.equal(getYearProgress('2026-01-01').progress, 0);
});

test('getCounterBreakdown for a countdown', () => {
  const trip: CounterItem = { ...base, startDate: '2026-08-30', targetDate: '2026-12-18' };
  assert.deepEqual(getCounterBreakdown(trip, en, '2026-10-22'), [
    '8 weeks 1 day · 8 weekends left',
    '53 of 110 days',
  ]);
});

test('groupCounters sorts upcoming events by date', () => {
  const items: CounterItem[] = [
    { ...base, id: 'far', targetDate: '2026-12-01' },
    { ...base, id: 'goal', type: 'goal_progress', initialValue: 1, targetValue: 2 },
    { ...base, id: 'near', targetDate: '2026-11-20' },
    { ...base, id: 'old', targetDate: '2026-01-01' },
    { ...base, id: 'habit', type: 'days_passed', startDate: '2026-01-01' },
  ];
  const groups = groupCounters(items, '2026-11-17');
  assert.deepEqual(
    groups.map((g) => [g.key, g.data.map((i) => i.id)]),
    [['upcoming', ['near', 'far']], ['since', ['habit']], ['goals', ['goal']], ['past', ['old']]],
  );
});

test('sanitizeSettings keeps valid values and replaces damaged ones', () => {
  assert.deepEqual(sanitizeSettings({ mode: 'dark', accent: 'teal', language: 'fr' }), { mode: 'dark', accent: 'teal', language: 'fr' });
  assert.deepEqual(sanitizeSettings({ mode: 'neon', accent: 'toString', language: 'de' }), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings('oops'), DEFAULT_SETTINGS);
});
