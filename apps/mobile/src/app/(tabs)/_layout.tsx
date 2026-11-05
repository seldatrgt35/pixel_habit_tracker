import { Redirect, Tabs } from 'expo-router';
import { useTheme } from '../../design/theme';
import { tokens } from '../../design/tokens';
import { useGarden } from '../../state/garden';
import { PixelIcon, type IconName } from '../../components/PixelArt';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'today', title: 'Today', icon: 'home' },
  { name: 'garden', title: 'Garden', icon: 'garden' },
  { name: 'insights', title: 'Journal', icon: 'stats' },
  { name: 'settings', title: 'Your space', icon: 'settings' },
];
export default function TabsLayout() {
  const { colors } = useTheme();
  const initialized = useGarden((s) => s.initialized);
  if (!initialized) return <Redirect href="/welcome" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.moss,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.line,
          minHeight: 76,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontFamily: tokens.font.medium, fontSize: 12, marginTop: 4 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <PixelIcon
                name={tab.icon}
                color={typeof color === 'string' ? color : colors.muted}
                size={22}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
