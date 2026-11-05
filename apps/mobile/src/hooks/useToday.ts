import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDateInZone } from '@little/shared-types';
import { useGarden } from '../state/garden';

export function useToday(): string {
  const timezone = useGarden((s) => s.timezone);
  const [instant, setInstant] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setInstant(new Date());
    const timer = setInterval(refresh, 30000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  return localDateInZone(instant, timezone);
}
