import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useGarden } from '../../state/garden';
import { useTheme } from '../../design/theme';
import { PixelCompanion } from '../../components/PixelArt';
import { Label, Panel, PixelButton, Row, Screen } from '../../components/ui';

export default function Settings() {
  const { colors } = useTheme();
  const theme = useGarden((s) => s.theme);
  const timezone = useGarden((s) => s.timezone);
  const setTheme = useGarden((s) => s.setTheme);
  const setTimezone = useGarden((s) => s.setTimezone);
  const clear = useGarden((s) => s.clear);
  const [zone, setZone] = useState(timezone);
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState(false);
  const habits = useGarden((s) => s.habits);
  const archived = habits.filter((h) => h.archivedDate);
  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Label variant="pixel" style={{ color: colors.moss }}>
          MAKE YOURSELF AT HOME
        </Label>
        <Label variant="title">Your little space.</Label>
      </View>
      <Panel style={{ backgroundColor: colors.garden }}>
        <Row>
          <PixelCompanion size={80} />
          <View style={{ flex: 1, gap: 6 }}>
            <Label variant="heading">A garden on this device</Label>
            <Label variant="small">
              You’re using the local preview. Your habits stay here; they aren’t synced or backed up
              to an account.
            </Label>
          </View>
        </Row>
      </Panel>
      <Panel>
        <Label variant="heading">A change of light</Label>
        <Row style={{ flexWrap: 'wrap' }}>
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <PixelButton
              key={mode}
              compact
              label={`${mode[0]!.toUpperCase()}${mode.slice(1)}${theme === mode ? ' ✓' : ''}`}
              secondary={theme !== mode}
              onPress={() => setTheme(mode)}
            />
          ))}
        </Row>
      </Panel>
      <Panel>
        <Label variant="heading">Where your day begins</Label>
        <Label variant="small" style={{ color: colors.muted }}>
          Use an IANA timezone, like Europe/Istanbul. Existing calendar dates stay the same. Travel
          won’t change this automatically.
        </Label>
        <TextInput
          accessibilityLabel="Calendar timezone"
          autoCapitalize="none"
          autoCorrect={false}
          value={zone}
          onChangeText={setZone}
          style={{
            color: colors.ink,
            fontSize: 16,
            padding: 12,
            minHeight: 48,
            borderColor: colors.line,
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: colors.background,
          }}
        />
        <PixelButton
          label="Save timezone"
          secondary
          onPress={() => {
            try {
              setTimezone(zone.trim());
              setMessage('Your day now follows this timezone.');
            } catch {
              setMessage('We could not find that timezone. Try Europe/Istanbul or UTC.');
            }
          }}
        />
        {message ? (
          <Label accessibilityLiveRegion="polite" variant="small">
            {message}
          </Label>
        ) : null}
      </Panel>
      <Panel>
        <Label variant="heading">One thing at a time</Label>
        <Label style={{ color: colors.muted }}>
          Account sign-in, cloud sync, and device reminders are planned for the next milestones.
          They aren’t connected in this preview.
        </Label>
      </Panel>
      {archived.length ? (
        <Panel>
          <Label variant="heading">Resting habits</Label>
          {archived.map((h) => (
            <PixelButton
              key={h.id}
              label={`${h.name} · history`}
              secondary
              onPress={() => router.push({ pathname: '/habit/[id]', params: { id: h.id } })}
            />
          ))}
        </Panel>
      ) : null}
      <Panel>
        <Label variant="heading">A fresh patch</Label>
        <Label variant="small" style={{ color: colors.muted }}>
          Resetting removes all habits and check-ins from this local preview.
        </Label>
        {confirm ? (
          <View style={{ gap: 12 }}>
            <Label>Delete this device’s preview garden? This cannot be undone.</Label>
            <PixelButton
              label="Delete local data and restart"
              onPress={() => {
                clear();
                router.replace('/welcome');
              }}
            />
            <PixelButton label="Keep my garden" secondary onPress={() => setConfirm(false)} />
          </View>
        ) : (
          <PixelButton label="Reset local garden" secondary onPress={() => setConfirm(true)} />
        )}
      </Panel>
      <Label variant="pixel" style={{ color: colors.muted, textAlign: 'center' }}>
        LITTLE BY LITTLE · FOUNDATION 0.1.0{`\n`}SMALL STEPS. ROOM TO GROW.
      </Label>
    </Screen>
  );
}
