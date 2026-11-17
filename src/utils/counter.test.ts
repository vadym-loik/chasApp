/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCounterDetails, getCounterStats, isValidDate, parseNumber } from './counter.ts';
import { resolveLanguage, STRINGS, ukPlural } from '../i18n/strings.ts';
import type { CounterItem } from '../models/counter.ts';

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
  assert.equal(s.value, '100%');
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
