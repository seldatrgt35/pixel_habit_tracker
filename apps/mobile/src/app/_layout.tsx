import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen/400Regular';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../design/theme';
import { useGarden } from '../state/garden';
import { Label, LoadingGarden, PixelButton, Screen } from '../components/ui';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Screen>
      <Label variant="heading">A little tangle.</Label>
      <Label>
        We could not open this part of your garden. Your saved check-ins are still on this device.
      </Label>
      <PixelButton label="Try again" onPress={retry} />
    </Screen>
  );
}

export default function RootLayout() {
  const { colors, dark } = useTheme();
  const hydrated = useGarden((s) => s.hydrated);
  const storageError = useGarden((s) => s.storageError);
  const clear = useGarden((s) => s.clear);
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Silkscreen_400Regular,
  });
  if (!hydrated || (!fontsLoaded && !fontError)) return <LoadingGarden />;
  if (storageError)
    return (
      <SafeAreaProvider>
        <Screen>
          <Label variant="heading">We couldn’t access device storage.</Label>
          <Label>
            Your latest changes may not survive a restart. Try reopening the app, or reset the local
            preview to start again. Resetting removes this preview’s saved habits and check-ins.
          </Label>
          <PixelButton label="Reset this local preview" onPress={clear} />
        </Screen>
      </SafeAreaProvider>
    );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'default',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="habit/edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="habit/[id]" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
