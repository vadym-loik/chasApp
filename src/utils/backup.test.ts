/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBackup, mergeCounters, readBackup } from '../models/backup.ts';
import type { CounterItem } from '../models/counter.ts';

const now = '2026-11-17';
const trip: CounterItem = {
  id: 'trip', title: 'Trip', emoji: '✈️', color: 'sky', type: 'days_left', targetDate: '2026-12-01', repeat: 'none', startDate: now,
};
const habit: CounterItem = { id: 'habit', title: 'No sugar', emoji: '🍬', color: 'mint', type: 'days_passed', startDate: now };

test('a backup file gives back the same counters', () => {
  assert.deepEqual(readBackup(makeBackup([trip, habit], now), now), [trip, habit]);
});

test('readBackup rejects files that are not a Chas backup, and drops damaged counters', () => {
  assert.equal(readBackup('not json', now), undefined);
  assert.equal(readBackup('[]', now), undefined);
  assert.equal(readBackup('null', now), undefined);
  assert.equal(readBackup(JSON.stringify({ app: 'other', counters: [trip] }), now), undefined);
  assert.deepEqual(readBackup(JSON.stringify({ app: 'chas', counters: [trip, { id: 5 }] }), now), [trip]);
});

test('mergeCounters adds new counters and updates the ones with the same id, in place', () => {
  const newer = { ...trip, title: 'Trip to Rome' };
  const goal: CounterItem = {
    id: 'goal', title: 'Weight', emoji: '🎯', color: 'sun', type: 'goal_progress', initialValue: 88, currentValue: 85, targetValue: 80,
  };
  assert.deepEqual(mergeCounters([trip, habit], [goal, newer]), [newer, habit, goal]);
  assert.deepEqual(mergeCounters([], [trip]), [trip]);
});
