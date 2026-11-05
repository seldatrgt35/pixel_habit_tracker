import { fireEvent, render, screen } from '@testing-library/react-native';
import { addDays, localDateInZone } from '@little/shared-types';
import Garden from './app/(tabs)/garden';
import { useGarden } from './state/garden';

it('opens an overall square’s report and switches to a habit-specific heatmap', async () => {
  useGarden.getState().initialize(true);
  const today = localDateInZone(new Date(), useGarden.getState().timezone);
  const yesterday = addDays(today, -1);
  for (const id of ['sample-0', 'sample-1', 'sample-2', 'sample-3'])
    useGarden.getState().setEntry(id, yesterday, 0);
  useGarden
    .getState()
    .setEntry('sample-0', yesterday, 20, [{ id: 'title', text: 'Yesterday: Dune' }]);
  await render(<Garden />);
  await fireEvent.press(
    screen.getByRole('button', { name: `All habits, ${yesterday}: 25 percent progress` }),
  );
  expect(screen.getByText('1 of 4 habits completed · 25% progress')).toBeTruthy();
  expect(screen.getByText('Yesterday: Dune')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'A few good pages' }));
  expect(
    screen.getByRole('button', { name: `A few good pages, ${yesterday}: 100 percent progress` }),
  ).toBeTruthy();
  expect(screen.getByText('1 of 1 habit completed · 100% progress')).toBeTruthy();
  for (const name of [
    'A few good pages',
    'Stay a little hydrated',
    'Make room to move',
    'A moment of quiet',
  ])
    expect(screen.getByRole('button', { name: `Open ${name} calendar` })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'All habits' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Edit this day' }));
  expect(
    screen.getByRole('button', { name: 'Edit daily details for A few good pages' }),
  ).toBeTruthy();
});
