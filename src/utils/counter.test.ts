/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCounterStats, isValidDate } from './counter.ts';
import type { CounterItem } from '../models/counter.ts';

const base: CounterItem = { id: '1', title: 't', emoji: '⭐', type: 'days_left', color: '#fff' };

test('days_left counts down and shows progress', () => {
  const s = getCounterStats(
    { ...base, startDate: '2025-01-01', targetDate: '2025-01-11' },
    '2025-01-06',
  );
  assert.equal(s.value, 5);
  assert.equal(s.progress, 0.5);
});

test('days_left does not go below zero', () => {
  const s = getCounterStats({ ...base, targetDate: '2025-01-01' }, '2025-02-01');
  assert.equal(s.value, 0);
});

test('days_passed counts up from start date', () => {
  const s = getCounterStats({ ...base, type: 'days_passed', startDate: '2025-01-01' }, '2025-03-01');
  assert.equal(s.value, 59);
});

test('goal_progress works for a decreasing goal (weight 88 -> 80)', () => {
  const s = getCounterStats({
    ...base, type: 'goal_progress', initialValue: 88, currentValue: 84, targetValue: 80,
  });
  assert.equal(s.value, 50);
});

test('goal_progress works for an increasing goal and clamps', () => {
  const s = getCounterStats({
    ...base, type: 'goal_progress', initialValue: 0, currentValue: 150, targetValue: 100,
  });
  assert.equal(s.value, 100);
});

test('isValidDate', () => {
  assert.equal(isValidDate('2025-02-28'), true);
  assert.equal(isValidDate('2025-02-30'), false);
  assert.equal(isValidDate('25-1-1'), false);
});
