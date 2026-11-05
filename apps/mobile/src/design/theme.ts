import { useColorScheme } from 'react-native';
import { useGarden } from '../state/garden';
import { palettes } from './tokens';

export function useTheme() {
  const preference = useGarden((s) => s.theme);
  const system = useColorScheme();
  const mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  return { colors: palettes[mode], dark: mode === 'dark' };
}
