import { View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../design/theme';
import { useGarden } from '../state/garden';
import { GardenLandscape, PixelCompanion, PixelIcon } from '../components/PixelArt';
import { Label, PixelButton, Row, Screen } from '../components/ui';

export default function Welcome() {
  const { colors } = useTheme();
  const initialize = useGarden((s) => s.initialize);
  return (
    <Screen style={{ paddingTop: 48, gap: 32 }}>
      <Row>
        <PixelIcon name="garden" color={colors.moss} />
        <Label variant="pixel">LITTLE BY LITTLE</Label>
      </Row>
      <View
        style={{
          backgroundColor: colors.garden,
          borderRadius: 24,
          paddingTop: 36,
          overflow: 'hidden',
          alignItems: 'center',
        }}
      >
        <Label variant="pixel" style={{ color: colors.moss }}>
          MEET YOUR GROWING COMPANION
        </Label>
        <View style={{ marginTop: 24, marginBottom: -24, zIndex: 1 }}>
          <PixelCompanion size={160} happy />
        </View>
        <GardenLandscape />
      </View>
      <View style={{ gap: 16 }}>
        <Label variant="title" style={{ fontSize: 42, lineHeight: 48 }}>
          Small habits.{`\n`}A little more you.
        </Label>
        <Label style={{ color: colors.muted, fontSize: 18, lineHeight: 28 }}>
          A cozy place for the things you want to keep showing up for. One small step at a time,
          with Pip by your side.
        </Label>
      </View>
      <View style={{ gap: 12 }}>
        <PixelButton
          label="Plant my first habit"
          icon="plus"
          onPress={() => {
            initialize(false);
            router.replace('/habit/edit');
          }}
        />
        <PixelButton
          label="Explore the sample garden"
          secondary
          onPress={() => {
            initialize(true);
            router.replace('/today');
          }}
        />
      </View>
      <Label variant="small" style={{ textAlign: 'center', color: colors.muted }}>
        Local preview · saved on this device{`\n`}No account needed. Cloud sync is coming in a later
        phase.
      </Label>
    </Screen>
  );
}
