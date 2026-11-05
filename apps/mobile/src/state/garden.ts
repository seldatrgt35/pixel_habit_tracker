import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addDays,
  dateRange,
  localDateInZone,
  normalizeEntryItems,
  reviseHabit,
  validateEntry,
  type Habit,
  type HabitEntry,
  type HabitEntryItem,
  type HabitVersion,
} from '@little/shared-types';

export type HabitDraft = Pick<Habit, 'name' | 'icon' | 'color'> &
  Omit<HabitVersion, 'id' | 'effectiveFrom' | 'effectiveTo'>;
export const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const reportStorageFailure = () =>
  queueMicrotask(() => {
    if (!useGarden.getState().storageError) useGarden.setState({ storageError: true });
  });
const previewStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      reportStorageFailure();
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      reportStorageFailure();
    }
  },
};

export function sampleGarden(today: string): { habits: Habit[]; entries: HabitEntry[] } {
  const samples: HabitDraft[] = [
    {
      name: 'A few good pages',
      icon: 'book',
      color: 'peach',
      type: 'numeric',
      targetValue: 20,
      unit: 'pages',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Stay a little hydrated',
      icon: 'water',
      color: 'sky',
      type: 'numeric',
      targetValue: 2,
      unit: 'liters',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Make room to move',
      icon: 'move',
      color: 'rose',
      type: 'numeric',
      targetValue: 30,
      unit: 'minutes',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'A moment of quiet',
      icon: 'leaf',
      color: 'moss',
      type: 'binary',
      targetValue: 1,
      unit: 'check-in',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
  ];
  const habits = samples.map((s, i): Habit => ({
    id: `sample-${i}`,
    name: s.name,
    icon: s.icon,
    color: s.color,
    createdDate: addDays(today, -83),
    archivedDate: null,
    versions: [
      { ...s, id: `sample-v-${i}`, effectiveFrom: addDays(today, -83), effectiveTo: null },
    ],
  }));
  const entries = dateRange(addDays(today, -83), addDays(today, -1)).flatMap((entryDate, day) =>
    habits.flatMap((h, i) => {
      const score = (day * 13 + i * 7) % 17;
      const ratio = score < 3 ? 0 : score < 5 && h.versions[0]!.type === 'numeric' ? 0.5 : 1;
      return ratio ? [{ habitId: h.id, entryDate, value: h.versions[0]!.targetValue * ratio }] : [];
    }),
  );
  entries.push(
    { habitId: 'sample-0', entryDate: today, value: 20 },
    { habitId: 'sample-1', entryDate: today, value: 1.25 },
  );
  return { habits, entries };
}

interface GardenState {
  initialized: boolean;
  hydrated: boolean;
  storageError: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  habits: Habit[];
  entries: HabitEntry[];
  setHydrated: (error?: boolean) => void;
  initialize: (sample: boolean) => void;
  setTheme: (theme: GardenState['theme']) => void;
  setTimezone: (zone: string) => void;
  saveHabit: (draft: HabitDraft, id?: string) => string;
  archiveHabit: (id: string) => void;
  setEntry: (id: string, date: string, value: number, items?: HabitEntryItem[]) => void;
  clear: () => void;
}

export const useGarden = create<GardenState>()(
  persist(
    (set, get) => ({
      initialized: false,
      hydrated: false,
      storageError: false,
      theme: 'system',
      timezone: deviceZone,
      habits: [],
      entries: [],
      setHydrated: (error = false) => set({ hydrated: true, storageError: error }),
      initialize: (sample) => {
        const data = sample
          ? sampleGarden(localDateInZone(new Date(), get().timezone))
          : { habits: [], entries: [] };
        set({ ...data, initialized: true });
      },
      setTheme: (theme) => set({ theme }),
      setTimezone: (timezone) => {
        localDateInZone(new Date(), timezone); // Intl rejects unknown IANA zones.
        set({ timezone });
      },
      saveHabit: (draft, id) => {
        const today = localDateInZone(new Date(), get().timezone);
        if (!draft.name.trim() || draft.name.trim().length > 80)
          throw new Error('Give your habit a name of 1–80 characters.');
        if (draft.unit.trim().length > 24 || !draft.unit.trim())
          throw new Error('Choose a short measurement unit.');
        const existing = id ? get().habits.find((h) => h.id === id) : undefined;
        if (id && !existing) throw new Error('We could not find that habit.');
        if (existing?.archivedDate) throw new Error('This habit has been archived.');
        if (!id && get().habits.filter((h) => !h.archivedDate).length >= 30)
          throw new Error('This local garden has room for 30 active habits.');
        const rules = {
          type: draft.type,
          targetValue: draft.targetValue,
          unit: draft.unit.trim(),
          weekdays: [...draft.weekdays].sort((a, b) => a - b),
        };
        const habitId = id ?? makeId();
        const base: Habit = existing ?? {
          id: habitId,
          name: draft.name.trim(),
          icon: draft.icon,
          color: draft.color,
          createdDate: today,
          archivedDate: null,
          versions: [],
        };
        // Validate rules using the same revision helper, then choose the initial/effective date.
        const revised = reviseHabit(base, rules, today, makeId());
        const previous = base.versions.at(-1);
        const unchangedRules =
          previous &&
          JSON.stringify({
            type: previous.type,
            targetValue: previous.targetValue,
            unit: previous.unit,
            weekdays: previous.weekdays,
          }) === JSON.stringify(rules);
        const versions = existing
          ? unchangedRules
            ? existing.versions
            : revised.versions
          : [{ ...revised.versions.at(-1)!, effectiveFrom: today }];
        const result = {
          ...base,
          name: draft.name.trim(),
          icon: draft.icon,
          color: draft.color,
          versions,
        };
        set({
          habits: existing
            ? get().habits.map((h) => (h.id === habitId ? result : h))
            : [...get().habits, result],
        });
        return habitId;
      },
      archiveHabit: (id) =>
        set({
          habits: get().habits.map((h) =>
            h.id === id && !h.archivedDate
              ? { ...h, archivedDate: addDays(localDateInZone(new Date(), get().timezone), 1) }
              : h,
          ),
        }),
      setEntry: (id, date, value, items) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) throw new Error('We could not find that habit.');
        validateEntry(habit, date, value, localDateInZone(new Date(), get().timezone));
        const existing = get().entries.find((e) => e.habitId === id && e.entryDate === date);
        const savedItems = normalizeEntryItems(items ?? existing?.items ?? []);
        set({
          entries: [
            ...get().entries.filter((e) => !(e.habitId === id && e.entryDate === date)),
            { habitId: id, entryDate: date, value, items: savedItems },
          ],
        });
      },
      clear: () => set({ initialized: false, habits: [], entries: [], storageError: false }),
    }),
    {
      name: 'little-by-little-preview-v1',
      version: 1,
      storage: createJSONStorage(() => previewStorage),
      partialize: ({ initialized, theme, timezone, habits, entries }) => ({
        initialized,
        theme,
        timezone,
        habits,
        entries,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Run after store construction even when a storage adapter hydrates synchronously.
        queueMicrotask(() => useGarden.getState().setHydrated(Boolean(error) || !state));
      },
    },
  ),
);
