import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString)
  throw new Error('Set TEST_DATABASE_URL to a disposable PostgreSQL database ending in _test.');
if (!new URL(connectionString).pathname.endsWith('_test'))
  throw new Error('Refusing to migrate a database whose name does not end in _test.');
const migration = spawnSync(
  process.execPath,
  ['../../node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  {
    cwd: fileURLToPath(new URL('../apps/api', import.meta.url)),
    env: { ...process.env, DATABASE_URL: connectionString },
    stdio: 'inherit',
  },
);
assert.equal(migration.status, 0, 'Migrations should apply');
const client = new pg.Client({ connectionString });
await client.connect();
try {
  await client.query('BEGIN');
  const user = randomUUID(),
    habit = randomUUID(),
    otherHabit = randomUUID(),
    v1 = randomUUID(),
    v2 = randomUUID();
  await client.query(
    'INSERT INTO "User" (id, "firebaseUid", timezone, "updatedAt") VALUES ($1,$2,$3,now())',
    [user, randomUUID(), 'Europe/Istanbul'],
  );
  for (const id of [habit, otherHabit])
    await client.query(
      'INSERT INTO "Habit" (id,"userId",name,icon,color,"createdDate","updatedAt") VALUES ($1,$2,\'Read\',\'book\',\'moss\',\'2026-01-01\',now())',
      [id, user],
    );
  const insertVersion = (id, h, from, to, target, weekdays = [1, 2, 3, 4, 5, 6, 7]) =>
    client.query(
      'INSERT INTO "HabitVersion" (id,"habitId","effectiveFrom","effectiveTo",type,"targetValue",unit,weekdays) VALUES ($1,$2,$3,$4,\'numeric\',$5,\'pages\',$6)',
      [id, h, from, to, target, weekdays],
    );
  await insertVersion(v1, habit, '2026-01-01', '2026-11-05', 20);
  await insertVersion(v2, habit, '2026-11-05', null, 40);
  const expectConstraint = async (operation, code) => {
    await client.query('SAVEPOINT expected_failure');
    await assert.rejects(operation, (error) => error.code === code);
    await client.query('ROLLBACK TO SAVEPOINT expected_failure');
  };
  await expectConstraint(
    () => insertVersion(randomUUID(), habit, '2026-05-01', '2026-12-01', 20),
    '23P01',
  );
  await expectConstraint(
    () => insertVersion(randomUUID(), otherHabit, '2026-01-01', null, 0),
    '23514',
  );
  for (const days of [[], [1, 1], [0], [8], [1, null]])
    await expectConstraint(
      () => insertVersion(randomUUID(), otherHabit, '2026-01-01', null, 20, days),
      '23514',
    );
  const insertEntry = (entryHabit, version, value) =>
    client.query(
      'INSERT INTO "HabitEntry" (id,"habitId","habitVersionId","entryDate",value,"updatedAt") VALUES ($1,$2,$3,\'2026-11-04\',$4,now())',
      [randomUUID(), entryHabit, version, value],
    );
  await insertEntry(habit, v1, 20);
  await expectConstraint(() => insertEntry(habit, v1, 20), '23505');
  await expectConstraint(() => insertEntry(otherHabit, v1, 20), '23503');
  await client.query('UPDATE "HabitEntry" SET value=35 WHERE "habitId"=$1', [habit]);
  const historical = await client.query(
    'SELECT e.value, v."targetValue", e.value >= v."targetValue" AS completed FROM "HabitEntry" e JOIN "HabitVersion" v ON v.id=e."habitVersionId" WHERE e."habitId"=$1',
    [habit],
  );
  assert.equal(historical.rows[0].value, '35.000');
  assert.equal(historical.rows[0].targetValue, '20.000');
  assert.equal(historical.rows[0].completed, true);
  await expectConstraint(
    () => client.query('UPDATE "HabitEntry" SET value=-1 WHERE "habitId"=$1', [habit]),
    '23514',
  );
  await expectConstraint(
    () => client.query('UPDATE "HabitEntry" SET value=\'NaN\' WHERE "habitId"=$1', [habit]),
    '23514',
  );
  // The future repository uses this exact unique key for atomic idempotent upserts.
  await client.query(
    'INSERT INTO "HabitEntry" (id,"habitId","habitVersionId","entryDate",value,"updatedAt") VALUES ($1,$2,$3,\'2026-11-04\',42,now()) ON CONFLICT ("habitId","entryDate") DO UPDATE SET value=EXCLUDED.value',
    [randomUUID(), habit, v1],
  );
  const count = await client.query(
    'SELECT count(*)::int AS count, max(value) AS value FROM "HabitEntry" WHERE "habitId"=$1',
    [habit],
  );
  assert.equal(count.rows[0].count, 1);
  assert.equal(count.rows[0].value, '42.000');

  const currentEntryId = (
    await client.query(
      'SELECT id FROM "HabitEntry" WHERE "habitId"=$1 AND "entryDate"=\'2026-11-04\'',
      [habit],
    )
  ).rows[0].id;
  const pastEntryId = randomUUID();
  await client.query(
    'INSERT INTO "HabitEntry" (id,"habitId","habitVersionId","entryDate",value,"updatedAt") VALUES ($1,$2,$3,\'2026-11-03\',10,now())',
    [pastEntryId, habit, v1],
  );
  const insertItem = (entryId, text, position) =>
    client.query(
      'INSERT INTO "HabitEntryItem" (id,"habitEntryId",text,position,"updatedAt") VALUES ($1,$2,$3,$4,now())',
      [randomUUID(), entryId, text, position],
    );
  await insertItem(currentEntryId, 'İnce Memed', 0);
  await insertItem(currentEntryId, 'Search page finished', 1);
  await insertItem(pastEntryId, 'Yesterday: Dune', 0);
  const dailyItems = await client.query(
    'SELECT i.text FROM "HabitEntryItem" i JOIN "HabitEntry" e ON e.id=i."habitEntryId" WHERE e."habitId"=$1 AND e."entryDate"=\'2026-11-04\' ORDER BY i.position',
    [habit],
  );
  assert.deepEqual(
    dailyItems.rows.map((row) => row.text),
    ['İnce Memed', 'Search page finished'],
  );
  await expectConstraint(() => insertItem(currentEntryId, 'Duplicate position', 0), '23505');
  await expectConstraint(() => insertItem(currentEntryId, 'Too many', 20), '23514');
  await expectConstraint(() => insertItem(currentEntryId, 'Negative position', -1), '23514');
  await expectConstraint(() => insertItem(currentEntryId, '  ', 2), '23514');
  await expectConstraint(() => insertItem(currentEntryId, 'x'.repeat(161), 2), '22001');
  await expectConstraint(() => insertItem(randomUUID(), 'Missing parent', 0), '23503');
  await client.query('DELETE FROM "User" WHERE id=$1', [user]);
  assert.equal(
    (
      await client.query('SELECT count(*)::int AS count FROM "HabitEntry" WHERE "habitId"=$1', [
        habit,
      ])
    ).rows[0].count,
    0,
  );
  assert.equal(
    (
      await client.query(
        'SELECT count(*)::int AS count FROM "HabitEntryItem" WHERE "habitEntryId"=ANY($1::uuid[])',
        [[currentEntryId, pastEntryId]],
      )
    ).rows[0].count,
    0,
  );
  console.log(
    'PostgreSQL integration passed: migrations, version overlap, targets/weekdays, duplicate entries, cross-habit FK, historical target, raw quantity, idempotent upsert, ordered date-specific details, item bounds and cascading cleanup.',
  );
} finally {
  await client.query('ROLLBACK');
  await client.end();
}
