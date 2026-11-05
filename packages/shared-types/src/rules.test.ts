import { describe, expect, it } from 'vitest';
import {
  addDays,
  calculateStatistics,
  dateRange,
  isLocalDate,
  isValidQuantity,
  localDateInZone,
  normalizedProgress,
  progressForDay,
  reviseHabit,
  validateEntry,
  versionForDate,
  type Habit,
} from './index';

const habit: Habit = {
  id: 'read',
  name: 'Read',
  color: 'moss',
  icon: 'book',
  createdDate: '2026-03-01',
  archivedDate: null,
  versions: [
    {
      id: 'v1',
      effectiveFrom: '2026-03-01',
      effectiveTo: null,
      type: 'numeric',
      targetValue: 20,
      unit: 'pages',
      weekdays: [1, 2, 3, 4, 5],
    },
  ],
};
describe('local calendar rules', () => {
  it('rejects invalid days and bounds ranges', () => {
    expect(isLocalDate('2026-02-30')).toBe(false);
    expect(isLocalDate('2028-02-29')).toBe(true);
    expect(() => dateRange('2025-01-01', '2026-01-02')).toThrow();
    expect(() => dateRange('2026-03-02', '2026-03-01')).toThrow();
  });
  it('uses calendar arithmetic across DST and year boundaries', () => {
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(localDateInZone(new Date('2026-03-08T04:30:00Z'), 'America/New_York')).toBe(
      '2026-03-07',
    );
    expect(localDateInZone(new Date('2026-11-01T05:30:00Z'), 'America/New_York')).toBe(
      '2026-11-01',
    );
    expect(localDateInZone(new Date('2026-11-01T06:30:00Z'), 'America/New_York')).toBe(
      '2026-11-01',
    );
    expect(localDateInZone(new Date('2026-11-04T21:05:00Z'), 'Europe/Istanbul')).toBe('2026-11-05');
  });
});
describe('quantities and history', () => {
  it('preserves over-target raw values while clamping intensity', () => {
    expect(normalizedProgress(35, 20)).toBe(1);
    expect(isValidQuantity(1.234)).toBe(true);
    expect(isValidQuantity(1.2345)).toBe(false);
    expect(isValidQuantity(Infinity)).toBe(false);
    expect(isValidQuantity(1000000000)).toBe(false);
  });
  it('keeps historical target and schedule when a revision becomes effective tomorrow', () => {
    const revised = reviseHabit(
      habit,
      { type: 'numeric', targetValue: 40, unit: 'pages', weekdays: [1, 2, 3, 4, 5, 6, 7] },
      '2026-03-05',
      'v2',
    );
    expect(versionForDate(revised, '2026-03-05')?.targetValue).toBe(20);
    expect(versionForDate(revised, '2026-03-06')?.targetValue).toBe(40);
    expect(
      progressForDay(
        [revised],
        [{ habitId: 'read', entryDate: '2026-03-05', value: 20 }],
        '2026-03-05',
      ).completed,
    ).toBe(1);
    const twice = reviseHabit(
      revised,
      { type: 'numeric', targetValue: 30, unit: 'pages', weekdays: [1] },
      '2026-03-05',
      'v3',
    );
    expect(twice.versions).toHaveLength(2);
  });
  it('rejects future, rest and archived-day writes and invalid binary values', () => {
    expect(() => validateEntry(habit, '2026-03-09', 1, '2026-03-05')).toThrow('Future');
    expect(() => validateEntry(habit, '2026-03-07', 1, '2026-03-09')).toThrow('resting');
    expect(() =>
      validateEntry({ ...habit, archivedDate: '2026-03-05' }, '2026-03-05', 1, '2026-03-05'),
    ).toThrow();
    const binary = {
      ...habit,
      versions: [{ ...habit.versions[0]!, type: 'binary' as const, targetValue: 1 }],
    };
    expect(() => validateEntry(binary, '2026-03-05', 0.5, '2026-03-05')).toThrow('zero or one');
  });
  it('weights overall progress by normalized scheduled habits', () => {
    const second = { ...habit, id: 'water', versions: [{ ...habit.versions[0]!, targetValue: 2 }] };
    expect(
      progressForDay(
        [habit, second],
        [{ habitId: 'read', entryDate: '2026-03-05', value: 20 }],
        '2026-03-05',
      ).intensity,
    ).toBe(0.5);
    expect(progressForDay([habit], [], '2026-03-07').intensity).toBeNull();
  });
});
describe('statistics and streaks', () => {
  it('skips rest days, protects incomplete today, and distinguishes partial consistency', () => {
    const days = [
      { date: '2026-03-05', scheduled: 1, completed: 1, intensity: 1 },
      { date: '2026-03-06', scheduled: 1, completed: 1, intensity: 1 },
      { date: '2026-03-07', scheduled: 0, completed: 0, intensity: null },
      { date: '2026-03-08', scheduled: 0, completed: 0, intensity: null },
      { date: '2026-03-09', scheduled: 1, completed: 0, intensity: 0.5 },
    ];
    const stats = calculateStatistics(days, '2026-03-09');
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
    expect(stats.completionRate).toBeCloseTo(2 / 3);
    expect(stats.consistency).toBeCloseTo(2.5 / 3);
    expect(
      calculateStatistics(
        [...days, { date: '2026-03-10', scheduled: 1, completed: 0, intensity: 0 }],
        '2026-03-10',
      ).currentStreak,
    ).toBe(0);
  });
  it('historical edits immediately recalculate longest streak', () => {
    const dates = dateRange('2026-03-02', '2026-03-05');
    const entries = dates.map((entryDate) => ({ habitId: habit.id, entryDate, value: 20 }));
    const stats = () =>
      calculateStatistics(
        dates.map((date) => progressForDay([habit], entries, date)),
        '2026-03-05',
      );
    expect(stats().longestStreak).toBe(4);
    entries[1]!.value = 0;
    expect(stats().longestStreak).toBe(2);
  });
});
