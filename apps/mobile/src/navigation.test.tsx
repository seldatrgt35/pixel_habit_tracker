import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import Welcome from './app/welcome';
import EditHabit from './app/habit/edit';
import { Label } from './components/ui';
import { useGarden } from './state/garden';

it('navigates from onboarding through planting the first habit', async () => {
  useGarden.getState().clear();
  await renderRouter({
    index: Welcome,
    'habit/edit': EditHabit,
    today: () => <Label>Your habit is planted.</Label>,
  });
  await fireEvent.press(screen.getByRole('button', { name: 'Plant my first habit' }));
  await fireEvent.changeText(await screen.findByLabelText('Habit name'), 'An evening stretch');
  await fireEvent.press(screen.getByRole('button', { name: 'A daily check-in' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Plant this habit' }));
  expect(await screen.findByText('Your habit is planted.')).toBeTruthy();
  expect(useGarden.getState().habits[0]?.name).toBe('An evening stretch');
  expect(useGarden.getState().habits[0]?.versions[0]?.type).toBe('binary');
});
