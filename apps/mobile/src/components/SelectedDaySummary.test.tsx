import { render, screen } from '@testing-library/react-native';
import type { Habit, HabitEntry } from '@little/shared-types';
import { SelectedDaySummary } from './SelectedDaySummary';

const habit = (id: string, name: string, targetValue: number): Habit => ({
  id,
  name,
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
const habits = [
  habit('book', 'Read a book', 20),
  habit('study', 'Study', 30),
  habit('move', 'Move', 30),
];
const entries: HabitEntry[] = [
  {
    habitId: 'book',
    entryDate: '2026-11-04',
    value: 25,
    items: [{ id: 'title', text: 'Dune · chapter 3' }],
  },
  {
    habitId: 'study',
    entryDate: '2026-11-04',
    value: 15,
    items: [{ id: 'project', text: 'Login screen' }],
  },
];

it('shows actual completed/partial/missing habits and their daily details', async () => {
  await render(<SelectedDaySummary date="2026-11-04" habits={habits} entries={entries} />);
  expect(screen.getByText('1 of 3 habits completed · 50% progress')).toBeTruthy();
  for (const label of [
    'Completed (1)',
    'In progress (1)',
    'Not completed (1)',
    'Read a book',
    'Study',
    'Move',
    '25 / 20 pages',
    '15 / 30 pages',
    'Dune · chapter 3',
    'Login screen',
  ])
    expect(screen.getByText(label)).toBeTruthy();
});

it('updates the report for the selected date and an individual habit scope', async () => {
  const view = await render(
    <SelectedDaySummary date="2026-11-04" habits={[habits[0]!]} entries={entries} />,
  );
  expect(screen.getByText('1 of 1 habit completed · 100% progress')).toBeTruthy();
  expect(screen.queryByText('Study')).toBeNull();
  await view.rerender(
    <SelectedDaySummary date="2026-11-03" habits={[habits[0]!]} entries={entries} />,
  );
  expect(screen.getByText('0 of 1 habit completed · 0% progress')).toBeTruthy();
  expect(screen.queryByText('Dune · chapter 3')).toBeNull();
});

it('explains days with no scheduled habits', async () => {
  await render(<SelectedDaySummary date="2026-10-31" habits={habits} entries={entries} />);
  expect(
    screen.getByText('No habits were scheduled for this day. Rest belongs here, too.'),
  ).toBeTruthy();
  expect(screen.getByText('Rest day · no scheduled habits')).toBeTruthy();
});
