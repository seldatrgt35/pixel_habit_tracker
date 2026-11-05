import { addDays, localDateInZone, versionForDate } from '@little/shared-types';
import { useGarden } from './garden';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { waitFor } from '@testing-library/react-native';

beforeEach(() => useGarden.getState().clear());

it('surfaces a storage write failure instead of silently promising persistence', async () => {
  await useGarden.persist.rehydrate();
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Device storage unavailable'));
  useGarden.getState().setTheme('light');
  await waitFor(() => expect(useGarden.getState().storageError).toBe(true));
});

it('upserts a date without duplicating entries and keeps historical targets', () => {
  const state = useGarden.getState();
  const today = localDateInZone(new Date(), state.timezone);
  const draft = {
    name: 'Read',
    icon: 'book' as const,
    color: 'peach' as const,
    type: 'numeric' as const,
    targetValue: 20,
    unit: 'pages',
    weekdays: [1, 2, 3, 4, 5, 6, 7],
  };
  const id = state.saveHabit(draft);
  state.setEntry(id, today, 20);
  state.setEntry(id, today, 35);
  expect(useGarden.getState().entries).toHaveLength(1);
  expect(useGarden.getState().entries[0]?.value).toBe(35);
  state.saveHabit({ ...draft, targetValue: 40 }, id);
  const habit = useGarden.getState().habits[0]!;
  expect(versionForDate(habit, today)?.targetValue).toBe(20);
  expect(versionForDate(habit, addDays(today, 1))?.targetValue).toBe(40);
});

it('archives from tomorrow while preserving today and prevents further rule edits', () => {
  const state = useGarden.getState();
  const draft = {
    name: 'Quiet',
    icon: 'leaf' as const,
    color: 'moss' as const,
    type: 'binary' as const,
    targetValue: 1,
    unit: 'check-in',
    weekdays: [1, 2, 3, 4, 5, 6, 7],
  };
  const id = state.saveHabit(draft);
  state.archiveHabit(id);
  const today = localDateInZone(new Date(), state.timezone);
  expect(useGarden.getState().habits[0]?.archivedDate).toBe(addDays(today, 1));
  expect(() => state.setEntry(id, today, 1)).not.toThrow();
  expect(() => state.saveHabit(draft, id)).toThrow('archived');
});

it('persists date-specific details, preserves them on quick quantity updates and supports removal', async () => {
  const state = useGarden.getState();
  state.initialize(true);
  const today = localDateInZone(new Date(), state.timezone);
  const yesterday = addDays(today, -1);
  state.setEntry('sample-0', yesterday, 10, [{ id: 'yesterday', text: 'Dune' }]);
  state.setEntry('sample-0', today, 20, [{ id: 'today', text: '  İnce Memed  ' }]);
  state.setEntry('sample-0', today, 35);
  state.setEntry('sample-1', today, 2, [{ id: 'water-note', text: 'Two bottles on my walk' }]);
  await useGarden.persist.rehydrate();
  const entry = (habitId: string, date: string) =>
    useGarden.getState().entries.find((row) => row.habitId === habitId && row.entryDate === date);
  expect(entry('sample-0', today)?.items).toEqual([{ id: 'today', text: 'İnce Memed' }]);
  expect(entry('sample-0', today)?.value).toBe(35);
  expect(entry('sample-0', yesterday)?.items).toEqual([{ id: 'yesterday', text: 'Dune' }]);
  expect(entry('sample-1', today)?.items?.[0]?.text).toBe('Two bottles on my walk');
  state.setEntry('sample-0', today, 35, []);
  expect(entry('sample-0', today)?.items).toEqual([]);
  expect(entry('sample-0', yesterday)?.items).toHaveLength(1);
});
