import { describe, expect, it } from 'vitest';
import {
  MAX_ENTRY_ITEM_LENGTH,
  MAX_ENTRY_ITEMS,
  normalizeEntryItems,
  progressForDay,
  type Habit,
} from './index';

describe('daily item lists', () => {
  it('trims titles while preserving stable item order and the caller’s data', () => {
    const items = [
      { id: 'film-1', text: '  Interstellar  ' },
      { id: 'project-1', text: 'Search page finished' },
    ];
    expect(normalizeEntryItems(items)).toEqual([{ id: 'film-1', text: 'Interstellar' }, items[1]]);
    expect(items[0]?.text).toBe('  Interstellar  ');
    expect(normalizeEntryItems([])).toEqual([]);
  });
  it('rejects blank, oversized, duplicate and excessive items', () => {
    expect(() => normalizeEntryItems([{ id: 'a', text: '  ' }])).toThrow();
    expect(() =>
      normalizeEntryItems([{ id: 'a', text: 'x'.repeat(MAX_ENTRY_ITEM_LENGTH + 1) }]),
    ).toThrow();
    expect(() =>
      normalizeEntryItems([
        { id: 'a', text: 'One' },
        { id: 'a', text: 'Two' },
      ]),
    ).toThrow();
    expect(() =>
      normalizeEntryItems(
        Array.from({ length: MAX_ENTRY_ITEMS + 1 }, (_, i) => ({ id: String(i), text: 'Detail' })),
      ),
    ).toThrow();
  });
  it('does not treat writing details as completion or heatmap progress', () => {
    const habit: Habit = {
      id: 'film',
      name: 'Watch a film',
      icon: 'film',
      color: 'sky',
      createdDate: '2026-11-01',
      archivedDate: null,
      versions: [
        {
          id: 'v1',
          type: 'numeric',
          targetValue: 1,
          unit: 'film',
          weekdays: [1, 2, 3, 4, 5, 6, 7],
          effectiveFrom: '2026-11-01',
          effectiveTo: null,
        },
      ],
    };
    const entry = {
      habitId: habit.id,
      entryDate: '2026-11-04',
      value: 0,
      items: [{ id: 'movie', text: 'Interstellar' }],
    };
    expect(progressForDay([habit], [entry], entry.entryDate)).toMatchObject({
      completed: 0,
      intensity: 0,
    });
    expect(progressForDay([habit], [{ ...entry, value: 1 }], entry.entryDate)).toMatchObject({
      completed: 1,
      intensity: 1,
    });
  });
});
