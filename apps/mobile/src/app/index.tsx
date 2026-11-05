import { Redirect } from 'expo-router';
import { useGarden } from '../state/garden';

export default function Index() {
  const initialized = useGarden((s) => s.initialized);
  return <Redirect href={initialized ? '/today' : '/welcome'} />;
}
