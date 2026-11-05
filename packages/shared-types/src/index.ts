export type LocalDate = string;
export type HabitColor = 'moss' | 'sky' | 'peach' | 'rose';
export type HabitIcon = 'book' | 'water' | 'move' | 'leaf' | 'moon' | 'code' | 'film';
export type HabitType = 'binary' | 'numeric';

export interface HabitVersion {
  id: string;
  effectiveFrom: LocalDate;
  effectiveTo: LocalDate | null;
  type: HabitType;
  targetValue: number;
  unit: string;
  weekdays: number[];
}
export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  color: HabitColor;
  createdDate: LocalDate;
  archivedDate: LocalDate | null;
  versions: HabitVersion[];
}
export interface HabitEntryItem {
  id: string;
  text: string;
}
export interface HabitEntry {
  habitId: string;
  entryDate: LocalDate;
  value: number;
  /** Optional for existing preview records. Items describe this date, not the habit itself. */
  items?: HabitEntryItem[];
}
export interface DayProgress {
  date: LocalDate;
  scheduled: number;
  completed: number;
  intensity: number | null;
}
export interface HabitDayResult {
  habit: Habit;
  version: HabitVersion;
  value: number;
  progress: number;
  status: 'completed' | 'partial' | 'pending';
  items: HabitEntryItem[];
}
export interface PeriodStatistics {
  completionRate: number;
  consistency: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  scheduled: number;
  completed: number;
}
export const MAX_QUANTITY = 999999999.999;
export const MAX_ENTRY_ITEMS = 20;
export const MAX_ENTRY_ITEM_LENGTH = 160;

export function normalizeEntryItems(items: HabitEntryItem[]): HabitEntryItem[] {
  if (!Array.isArray(items) || items.length > MAX_ENTRY_ITEMS)
    throw new Error(`Add up to ${MAX_ENTRY_ITEMS} details for one day.`);
  const seen = new Set<string>();
  return items.map((item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,64}$/.test(item.id) ||
      seen.has(item.id)
    )
      throw new Error('Each daily detail needs its own identifier.');
    if (
      typeof item.text !== 'string' ||
      !item.text.trim() ||
      item.text.trim().length > MAX_ENTRY_ITEM_LENGTH
    )
      throw new Error(`Keep each daily detail between 1 and ${MAX_ENTRY_ITEM_LENGTH} characters.`);
    seen.add(item.id);
    return { id: item.id, text: item.text.trim() };
  });
}

export function isLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function assertDate(date: string): void {
  if (!isLocalDate(date)) throw new Error('Expected a valid calendar date.');
}
export function localDateInZone(instant: Date, timezone: string): LocalDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function addDays(date: LocalDate, amount: number): LocalDate {
  assertDate(date);
  if (!Number.isInteger(amount)) throw new Error('Calendar offset must be an integer.');
  const parsed = new Date(`${date}T12:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + amount);
  return parsed.toISOString().slice(0, 10);
}
export function dateRange(from: LocalDate, to: LocalDate): LocalDate[] {
  assertDate(from);
  assertDate(to);
  const days = Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000,
  );
  if (days < 0 || days > 365) throw new Error('Choose a range of 1 to 366 days.');
  return Array.from({ length: days + 1 }, (_, i) => addDays(from, i));
}
export function isoWeekday(date: LocalDate): number {
  assertDate(date);
  return new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
}
export function versionForDate(habit: Habit, date: LocalDate): HabitVersion | undefined {
  return habit.versions.find(
    (v) => v.effectiveFrom <= date && (!v.effectiveTo || date < v.effectiveTo),
  );
}
export function isScheduled(habit: Habit, date: LocalDate): boolean {
  if (date < habit.createdDate || (habit.archivedDate && date >= habit.archivedDate)) return false;
  return versionForDate(habit, date)?.weekdays.includes(isoWeekday(date)) ?? false;
}
export function isValidQuantity(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_QUANTITY &&
    Math.abs(Math.round(value * 1000) - value * 1000) < 0.0001
  );
}
export function normalizedProgress(value: number, target: number): number {
  if (!isValidQuantity(value) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.min(value / target, 1);
}
export function habitResultsForDay(
  habits: Habit[],
  entries: HabitEntry[],
  date: LocalDate,
): HabitDayResult[] {
  const dailyEntries = new Map(
    entries.filter((entry) => entry.entryDate === date).map((entry) => [entry.habitId, entry]),
  );
  return habits
    .filter((habit) => isScheduled(habit, date))
    .map((habit) => {
      const version = versionForDate(habit, date)!;
      const entry = dailyEntries.get(habit.id);
      const value = entry?.value ?? 0;
      const progress = normalizedProgress(value, version.targetValue);
      return {
        habit,
        version,
        value,
        progress,
        status: progress === 1 ? 'completed' : progress > 0 ? 'partial' : 'pending',
        items: entry?.items ?? [],
      };
    });
}
export function progressForDay(
  habits: Habit[],
  entries: HabitEntry[],
  date: LocalDate,
): DayProgress {
  const scheduled = habits.filter((habit) => isScheduled(habit, date));
  const values = new Map(
    entries.filter((e) => e.entryDate === date).map((e) => [e.habitId, e.value]),
  );
  let total = 0;
  let completed = 0;
  for (const habit of scheduled) {
    const version = versionForDate(habit, date)!;
    const progress = normalizedProgress(values.get(habit.id) ?? 0, version.targetValue);
    total += progress;
    if (progress === 1) completed++;
  }
  return {
    date,
    scheduled: scheduled.length,
    completed,
    intensity: scheduled.length ? total / scheduled.length : null,
  };
}
export function calculateStatistics(days: DayProgress[], today: LocalDate): PeriodStatistics {
  const elapsed = days.filter((d) => d.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  const scheduledDays = elapsed.filter((d) => d.scheduled > 0);
  let longestStreak = 0;
  let run = 0;
  for (const day of scheduledDays) {
    run = day.completed === day.scheduled ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }
  let currentStreak = 0;
  for (const day of [...scheduledDays].reverse()) {
    if (day.date === today && day.completed < day.scheduled) continue;
    if (day.completed < day.scheduled) break;
    currentStreak++;
  }
  const scheduled = elapsed.reduce((sum, d) => sum + d.scheduled, 0);
  const completed = elapsed.reduce((sum, d) => sum + d.completed, 0);
  return {
    completionRate: scheduled ? completed / scheduled : 0,
    consistency: scheduled
      ? elapsed.reduce((sum, d) => sum + (d.intensity ?? 0) * d.scheduled, 0) / scheduled
      : 0,
    completedDays: scheduledDays.filter((d) => d.completed === d.scheduled).length,
    currentStreak,
    longestStreak,
    scheduled,
    completed,
  };
}

/** Local-preview helper. API must enforce these rules inside an owner-scoped transaction. */
export function validateEntry(
  habit: Habit,
  date: LocalDate,
  value: number,
  today: LocalDate,
): void {
  assertDate(date);
  if (date > today) throw new Error('Future days are still waiting to grow.');
  if (!isScheduled(habit, date)) throw new Error('This habit is resting on that day.');
  if (!isValidQuantity(value))
    throw new Error('Use a positive quantity or zero, with up to 3 decimal places.');
  if (versionForDate(habit, date)?.type === 'binary' && value !== 0 && value !== 1)
    throw new Error('A check-in must be zero or one.');
}

/** Rule changes take effect tomorrow; editing twice replaces tomorrow's pending version. */
export function reviseHabit(
  habit: Habit,
  rules: Omit<HabitVersion, 'id' | 'effectiveFrom' | 'effectiveTo'>,
  today: LocalDate,
  id: string,
): Habit {
  if (!isValidQuantity(rules.targetValue) || rules.targetValue <= 0)
    throw new Error('Choose a target greater than zero.');
  if (
    !rules.weekdays.length ||
    new Set(rules.weekdays).size !== rules.weekdays.length ||
    rules.weekdays.some((d) => !Number.isInteger(d) || d < 1 || d > 7)
  )
    throw new Error('Choose at least one recurrence day.');
  if (rules.type === 'binary' && rules.targetValue !== 1)
    throw new Error('Binary target must be one.');
  const effectiveFrom = addDays(today, 1);
  const versions = habit.versions
    .filter((v) => v.effectiveFrom < effectiveFrom)
    .map((v) => ({
      ...v,
      effectiveTo: !v.effectiveTo || v.effectiveTo > effectiveFrom ? effectiveFrom : v.effectiveTo,
    }));
  return { ...habit, versions: [...versions, { ...rules, id, effectiveFrom, effectiveTo: null }] };
}
