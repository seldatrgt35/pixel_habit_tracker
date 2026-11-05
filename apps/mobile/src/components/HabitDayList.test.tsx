import { render, screen } from '@testing-library/react-native';
import { addDays, localDateInZone } from '@little/shared-types';
import { useGarden } from '../state/garden';
import { HabitDayList } from './HabitDayList';

it('shows each selected date’s own details when navigating through history', async () => {
  useGarden.getState().initialize(true);
  const today = localDateInZone(new Date(), useGarden.getState().timezone);
  const yesterday = addDays(today, -1);
  useGarden
    .getState()
    .setEntry('sample-0', yesterday, 15, [{ id: 'old-book', text: 'Yesterday’s book: Dune' }]);
  useGarden
    .getState()
    .setEntry('sample-0', today, 20, [{ id: 'new-book', text: 'Today’s book: İnce Memed' }]);
  const view = await render(<HabitDayList date={yesterday} filterId="sample-0" />);
  expect(screen.getByText('Yesterday’s book: Dune')).toBeTruthy();
  expect(screen.queryByText('Today’s book: İnce Memed')).toBeNull();
  await view.rerender(<HabitDayList date={today} filterId="sample-0" />);
  expect(screen.getByText('Today’s book: İnce Memed')).toBeTruthy();
  expect(screen.queryByText('Yesterday’s book: Dune')).toBeNull();
});
