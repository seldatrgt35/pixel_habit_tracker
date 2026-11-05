# Database and calendar rules

## Entities

`User`: UUID, unique Firebase UID, optional email, IANA timezone, UTC created/updated timestamps. Collect no birth date, location history, or contacts.

`Habit`: UUID, owner FK with cascading delete, display name, icon/color enum, creation date, optional archive local date, UTC timestamps. User/date index supports bounded listing. Habits are archived rather than deleted individually in the MVP.

`HabitVersion`: UUID, habit FK, inclusive `effectiveFrom` and exclusive nullable `effectiveTo` SQL DATE, binary/numeric type, decimal target, unit, ISO recurrence weekdays (1=Monday..7=Sunday), optional local reminder time and enable flag. A PostgreSQL exclusion constraint prevents overlapping ranges per habit. A composite FK on entries prevents a version from another habit being attached. Application transactions guarantee contiguous versions and that an entry date belongs to its version; tests must cover these invariants before writes ship.

`HabitEntry`: UUID, habit and version FK, local `entryDate` SQL DATE, nonnegative decimal raw `value`, UTC timestamps. Unique `(habitId, entryDate)` makes PUT idempotent. Index `(habitId, entryDate)` supports range access. Do not store heatmap colors. Completion is derived from the effective historical version, avoiding a mutable `completed` column becoming inconsistent.

`HabitEntryItem`: UUID, entry FK with cascading delete, plain-text `text` (1–160 characters), `position` (0–19), UTC timestamps. Unique `(habitEntryId, position)` plus the position CHECK bounds each day to 20 ordered items. This is a daily list of titles/tasks, not a field on the habit: yesterday's book or project work stays attached to yesterday. Migration `202611040002_daily_details` is additive; existing entries need no backfill. A film icon joins the existing icon enum.

The local preview saves optional `items: [{ id, text }]` alongside the raw value. Missing items on older records read as an empty list. Omitting items during a quick quantity/check-in update preserves the list; passing `[]` explicitly clears it. Normalize/validate all items before changing state so invalid lists cannot partially overwrite a record. Lists have no effect on normalized completion, streaks, or quantities. Do not log personal titles or task text.

Future authenticated repositories must scope the parent entry through its owned habit, validate item identifiers against that parent, and upsert the raw value and replace a supplied item list in one transaction. Read entry items in a batched join/query with explicit position ordering. API item IDs are UUIDs; importing the existing local preview will require an explicit ID mapping, as it already does for preview habits. Those remote application operations are still planned.

## Explicit policy

- All daily identity uses calendar dates in the profile's IANA timezone. UTC timestamps describe events, never day identity. DST days may be 23 or 25 hours; use calendar arithmetic, not elapsed 24-hour windows.
- A scheduled day is inside the habit's lifetime and its effective version's weekdays. Before creation and after the archive date, days are excluded. Archive date is exclusive. Rest days are excluded from denominators and do not break streaks.
- Binary values are exactly 0 or 1 with target 1. Numeric values preserve quantities above target. Completion is `value >= target`; normalized intensity is `min(value / target, 1)`. Partial progress contributes to consistency but does not count as a completed day or extend a streak.
- A past scheduled day without an entry is missed. An incomplete current day does not break the current streak until its local day ends. Future days never contribute.
- Current streak counts consecutive fully completed scheduled days backwards, allowing today to remain incomplete. Longest streak is the maximum such run; rest days are transparent.
- Overall daily intensity is the arithmetic mean of normalized progress across habits scheduled that day, including missing entries as zero. A day with no scheduled habits has no intensity and no denominator. Overall fully completed days require all scheduled habits to meet target.
- Weekly/monthly consistency is normalized progress averaged over scheduled habit-days in the elapsed period. Completion rate counts fully completed scheduled habit-days / elapsed scheduled habit-days. Expose both names explicitly; never label partial progress as completion.
- Target/type/unit/schedule changes create a new version effective tomorrow in the profile timezone. Cosmetic name/icon/color changes apply immediately. Existing history uses its prior version. MVP does not allow retroactively rewriting version boundaries. Historical quantity edits resolve the original version and recompute statistics immediately.
- Profile timezone changes require explicit selection and affect future day interpretation; existing DATE keys and historical schedules are never rewritten. Entry writes in Phase 2 must validate the allowed date in the stored timezone. Travel never changes timezone silently. Reminder schedules are rebuilt after an explicit timezone change.
- A value of zero is valid and can be upserted. Writing on a rest day, before creation, after archive, or in the future is rejected. API date ranges are at most 366 calendar days; pagination is capped at 100 habits.

## Integrity and queries

PostgreSQL CHECK constraints validate positive targets, recurrence arrays, binary shape, finite bounded quantities, reminder time shape and ordered version dates. Prisma cannot express every constraint; keep the reviewed SQL migration authoritative. Decimal quantities use precision 12, scale 3 (maximum 999999999.999); the preview enforces the same bound and three decimal places. User-scoped transactions must enforce lifetime/date-version rules beyond FK constraints.

Statistics design: scope habits by authenticated owner; join only versions overlapping the requested interval; `generate_series` bounded calendar days; left join entries through the date index; aggregate in PostgreSQL. Return at most 366 rows, plus aggregate counters. Do not load all entries into application memory. Current/longest all-time streak queries may scan the owner's indexed history in SQL; profile before adding summary tables. Separate target-version quantity totals by unit/type to avoid summing pages and liters together.

The initial migration and integration checks establish relational constraints. API persistence operations and PostgreSQL statistics queries remain later milestones; the local preview uses the shared pure rules on its small local dataset.
