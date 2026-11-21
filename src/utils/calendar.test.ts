/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventDay, toEventOptions, type RawCalendarEvent } from './calendar.ts';

const event = (changes: Partial<RawCalendarEvent>): RawCalendarEvent => ({
  id: '1',
  title: 'Trip',
  startDate: '2027-03-10T12:00:00.000Z',
  allDay: false,
  recurrenceRule: null,
  ...changes,
});

test('eventDay uses the UTC date for all-day events', () => {
  assert.equal(eventDay({ startDate: '2027-03-10T00:00:00.000Z', allDay: true }), '2027-03-10');
  assert.equal(eventDay({ startDate: new Date('2027-03-10T00:00:00.000Z'), allDay: true }), '2027-03-10');
});

test('eventDay uses the local date for other events', () => {
  const start = new Date(2027, 2, 10, 23, 30); // local time
  assert.equal(eventDay({ startDate: start.toISOString(), allDay: false }), '2027-03-10');
});

test('toEventOptions sorts by date and keeps the next time of a repeating event', () => {
  const options = toEventOptions([
    event({ id: 'b', title: 'Birthday', startDate: '2028-05-01T00:00:00.000Z', allDay: true, recurrenceRule: { frequency: 'yearly' } }),
    event({ id: 'a', title: ' Trip ' }),
    event({ id: 'b', title: 'Birthday', startDate: '2027-05-01T00:00:00.000Z', allDay: true, recurrenceRule: { frequency: 'yearly' } }),
  ]);
  assert.deepEqual(options, [
    { id: 'a', title: 'Trip', date: '2027-03-10', repeat: 'none' },
    { id: 'b', title: 'Birthday', date: '2027-05-01', repeat: 'yearly' },
  ]);
});

test('toEventOptions repeats only monthly and yearly events, and skips events without a name', () => {
  const options = toEventOptions([
    event({ id: 'a', recurrenceRule: { frequency: 'weekly' } }),
    event({ id: 'b', recurrenceRule: { frequency: 'monthly' } }),
    event({ id: 'c', title: '  ' }),
  ]);
  assert.deepEqual(options.map((o) => [o.id, o.repeat]), [['a', 'none'], ['b', 'monthly']]);
});
