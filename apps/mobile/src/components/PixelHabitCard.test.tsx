import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Habit } from '@little/shared-types';
import { PixelHabitCard } from './PixelHabitCard';

const habit: Habit = {
  id: 'h1',
  name: 'Read a little',
  icon: 'book',
  color: 'peach',
  createdDate: '2026-11-01',
  archivedDate: null,
  versions: [
    {
      id: 'v1',
      type: 'numeric',
      targetValue: 20,
      unit: 'pages',
      weekdays: [1, 2, 3, 4, 5, 6, 7],
      effectiveFrom: '2026-11-01',
      effectiveTo: null,
    },
  ],
};

it('saves an actual quantity above the target and validates malformed input', async () => {
  const onChange = jest.fn();
  await render(<PixelHabitCard habit={habit} date="2026-11-04" value={12} onChange={onChange} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Log progress for Read a little' }));
  await fireEvent.changeText(screen.getByLabelText('Actual quantity for Read a little'), '-5');
  await fireEvent.press(screen.getByRole('button', { name: 'Save progress' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('Enter a number with up to 3 decimal places.')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Actual quantity for Read a little'), '35');
  await fireEvent.press(screen.getByRole('button', { name: 'Save progress' }));
  expect(onChange).toHaveBeenCalledWith(35, []);
});

it('allows undoing a binary completion', async () => {
  const onChange = jest.fn();
  const binary: Habit = {
    ...habit,
    versions: [{ ...habit.versions[0]!, type: 'binary', targetValue: 1 }],
  };
  await render(<PixelHabitCard habit={binary} date="2026-11-04" value={1} onChange={onChange} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Undo Read a little' }));
  expect(onChange).toHaveBeenCalledWith(0);
});

it('keeps an entry editor open when saving fails with a friendly error', async () => {
  await render(
    <PixelHabitCard
      habit={habit}
      date="2026-11-04"
      value={0}
      onChange={() => {
        throw new Error('That day is resting.');
      }}
    />,
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Log progress for Read a little' }));
  await fireEvent.changeText(screen.getByLabelText('Actual quantity for Read a little'), '10');
  await fireEvent.press(screen.getByRole('button', { name: 'Save progress' }));
  expect(screen.getByText('That day is resting.')).toBeTruthy();
  expect(screen.getByLabelText('Actual quantity for Read a little')).toBeTruthy();
});

it('saves several named daily details with a binary check-in, including edits and removal', async () => {
  const onChange = jest.fn();
  const binary: Habit = {
    ...habit,
    name: 'Watch a film',
    icon: 'film',
    versions: [{ ...habit.versions[0]!, type: 'binary', targetValue: 1 }],
  };
  await render(<PixelHabitCard habit={binary} date="2026-11-04" value={0} onChange={onChange} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Add daily details for Watch a film' }));
  await fireEvent.changeText(
    screen.getByLabelText('Daily detail 1 for Watch a film'),
    'Interstellar',
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Add another item' }));
  await fireEvent.changeText(
    screen.getByLabelText('Daily detail 2 for Watch a film'),
    'Remove this item',
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Add another item' }));
  await fireEvent.changeText(
    screen.getByLabelText('Daily detail 3 for Watch a film'),
    'Discussed the ending',
  );
  await fireEvent.press(
    screen.getByRole('button', { name: 'Remove daily detail 2 for Watch a film' }),
  );
  await fireEvent.changeText(screen.getByLabelText('Daily detail 1 for Watch a film'), 'Arrival');
  await fireEvent.press(
    screen.getByRole('checkbox', { name: 'Completed for this day: Watch a film' }),
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Save progress' }));
  expect(onChange).toHaveBeenCalledWith(1, [
    { id: expect.any(String), text: 'Arrival' },
    { id: expect.any(String), text: 'Discussed the ending' },
  ]);
});

it('records a title without automatically completing the numeric goal', async () => {
  const onChange = jest.fn();
  await render(<PixelHabitCard habit={habit} date="2026-11-04" value={0} onChange={onChange} />);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Add daily details for Read a little' }),
  );
  await fireEvent.changeText(
    screen.getByLabelText('Daily detail 1 for Read a little'),
    '  İnce Memed  ',
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Save progress' }));
  expect(onChange).toHaveBeenCalledWith(0, [{ id: expect.any(String), text: 'İnce Memed' }]);
});

it('shows saved details and discards unsaved changes when cancelled', async () => {
  const onChange = jest.fn();
  await render(
    <PixelHabitCard
      habit={habit}
      date="2026-11-04"
      value={20}
      items={[{ id: 'book-1', text: 'Dune' }]}
      onChange={onChange}
    />,
  );
  expect(screen.getByText('Dune')).toBeTruthy();
  await fireEvent.press(
    screen.getByRole('button', { name: 'Edit daily details for Read a little' }),
  );
  await fireEvent.changeText(
    screen.getByLabelText('Daily detail 1 for Read a little'),
    'An unsaved title',
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText('Dune')).toBeTruthy();
  expect(screen.queryByText('An unsaved title')).toBeNull();
});
