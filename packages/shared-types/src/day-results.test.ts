import { describe, expect, it } from 'vitest';
import { habitResultsForDay, progressForDay, type Habit, type HabitEntry } from './index';

const date = '2026-11-04';
const makeHabit = (id: string, targetValue: number): Habit => ({
  id,
  name: id,
  icon: 'book',
  color: 'moss',
  createdDate: '2026-11-01',
  archivedDate: null,
  versions: [
    {
      id: `${id}-v1`,
      effectiveFrom: '2026-11-01',
      effectiveTo: null,
      type: 'numeric',
      targetValue,
      unit: 'pages',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
  ],
});
const habits = [makeHabit('read', 20), makeHabit('water', 2), makeHabit('move', 30)];
const entries: HabitEntry[] = [
  { habitId: 'read', entryDate: date, value: 25, items: [{ id: 'book', text: 'Dune' }] },
  { habitId: 'water', entryDate: date, value: 1 },
  {
    habitId: 'read',
    entryDate: '2026-11-03',
    value: 5,
    items: [{ id: 'old', text: 'Yesterday’s title' }],
  },
];

describe('selected-day results', () => {
  it('separates completed, partial and missing habits without mixing dates or notes', () => {
    const results = habitResultsForDay(habits, entries, date);
    expect(results.map((result) => result.status)).toEqual(['completed', 'partial', 'pending']);
    expect(results[0]).toMatchObject({
      value: 25,
      progress: 1,
      items: [{ id: 'book', text: 'Dune' }],
    });
    expect(results[1]?.progress).toBe(0.5);
    expect(results[2]?.value).toBe(0);
    const overall = progressForDay(habits, entries, date);
    expect(overall.completed).toBe(
      results.filter((result) => result.status === 'completed').length,
    );
    expect(overall.intensity).toBe(0.5);
  });
  it('keeps an individual habit’s map distinct from overall completion', () => {
    expect(progressForDay([habits[0]!], entries, date).intensity).toBe(1);
    expect(progressForDay([habits[1]!], entries, date).intensity).toBe(0.5);
    expect(progressForDay([habits[2]!], entries, date).intensity).toBe(0);
    expect(habitResultsForDay([habits[0]!], entries, '2026-11-03')[0]?.items[0]?.text).toBe(
      'Yesterday’s title',
    );
  });
  it('excludes rest, not-yet-created and archived days and keeps historical targets', () => {
    const rest = {
      ...makeHabit('rest', 1),
      versions: [{ ...habits[0]!.versions[0]!, weekdays: [1] }],
    };
    const future = { ...makeHabit('future', 1), createdDate: '2026-11-05' };
    const archived = { ...makeHabit('archived', 1), archivedDate: date };
    expect(habitResultsForDay([rest, future, archived], entries, date)).toEqual([]);
    const revised: Habit = {
      ...habits[0]!,
      versions: [
        { ...habits[0]!.versions[0]!, effectiveTo: '2026-11-05' },
        { ...habits[0]!.versions[0]!, id: 'v2', effectiveFrom: '2026-11-05', targetValue: 40 },
      ],
    };
    expect(habitResultsForDay([revised], entries, date)[0]?.version.targetValue).toBe(20);
  });
});
