import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { HabitColor, HabitIcon, HabitType } from '@little/shared-types';
import { useGarden } from '../../state/garden';
import { useTheme } from '../../design/theme';
import { tokens } from '../../design/tokens';
import { PixelIcon } from '../../components/PixelArt';
import { IconButton, Label, Panel, PixelButton, Row, Screen } from '../../components/ui';

const icons: HabitIcon[] = ['book', 'water', 'move', 'leaf', 'moon', 'code', 'film'];
const colorsList: HabitColor[] = ['moss', 'sky', 'peach', 'rose'];
export default function EditHabit() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const habit = useGarden((s) => s.habits.find((h) => h.id === id));
  const saveHabit = useGarden((s) => s.saveHabit);
  const { colors } = useTheme();
  const version = habit?.versions.at(-1);
  const [name, setName] = useState(habit?.name ?? '');
  const [type, setType] = useState<HabitType>(version?.type ?? 'numeric');
  const [target, setTarget] = useState(String(version?.targetValue ?? 20));
  const [unit, setUnit] = useState(version?.unit ?? 'pages');
  const [icon, setIcon] = useState<HabitIcon>(habit?.icon ?? 'book');
  const [color, setColor] = useState<HabitColor>(habit?.color ?? 'peach');
  const [weekdays, setWeekdays] = useState(version?.weekdays ?? [1, 2, 3, 4, 5, 6, 7]);
  const [error, setError] = useState('');
  const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
  const inputStyle = {
    color: colors.ink,
    fontFamily: tokens.font.body,
    fontSize: 17,
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.background,
  };
  if ((id && !habit) || habit?.archivedDate)
    return (
      <Screen>
        <Label variant="heading">This habit is resting.</Label>
        <Label>You can still visit its history from Your space.</Label>
        <PixelButton label="Back to your garden" onPress={back} />
      </Screen>
    );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Screen>
        <Row>
          <IconButton icon="back" label="Close habit editor" onPress={back} />
          <Label variant="pixel">{id ? 'A LITTLE ADJUSTMENT' : 'A NEW LITTLE BEGINNING'}</Label>
        </Row>
        <View style={{ gap: 8 }}>
          <Label variant="title">{id ? 'Make it your own.' : 'What will you grow?'}</Label>
          <Label style={{ color: colors.muted }}>
            Start small. You can always make room for more.
          </Label>
        </View>
        <Panel>
          <Label style={{ fontFamily: tokens.font.bold }}>Give your habit a name</Label>
          <TextInput
            accessibilityLabel="Habit name"
            placeholder="Read a few good pages"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            maxLength={80}
            style={inputStyle}
          />
          <Label variant="small" style={{ color: colors.muted }}>
            {name.length}/80 · something that feels like you
          </Label>
        </Panel>
        <Panel>
          <Label style={{ fontFamily: tokens.font.bold }}>A tiny symbol, a little color</Label>
          <Row style={{ flexWrap: 'wrap' }}>
            {icons.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityLabel={`${item} icon`}
                accessibilityState={{ selected: icon === item }}
                onPress={() => setIcon(item)}
                style={{
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: icon === item ? colors.mossSoft : colors.background,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: icon === item ? colors.moss : colors.line,
                }}
              >
                <PixelIcon name={item} />
              </Pressable>
            ))}
          </Row>
          <Row>
            {colorsList.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityLabel={`${item} color`}
                accessibilityState={{ selected: color === item }}
                onPress={() => setColor(item)}
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: item === 'moss' ? colors.mossSoft : colors[item],
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: color === item ? colors.ink : colors.line,
                }}
              >
                {color === item && <PixelIcon name="check" size={16} />}
              </Pressable>
            ))}
          </Row>
        </Panel>
        <Panel>
          <Label style={{ fontFamily: tokens.font.bold }}>How does progress look?</Label>
          <Row style={{ flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <PixelButton
                compact
                label="A quantity"
                secondary={type !== 'numeric'}
                onPress={() => setType('numeric')}
              />
            </View>
            <View style={{ flex: 1, minWidth: 120 }}>
              <PixelButton
                compact
                label="A daily check-in"
                secondary={type !== 'binary'}
                onPress={() => setType('binary')}
              />
            </View>
          </Row>
          {type === 'numeric' ? (
            <Row style={{ alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 8 }}>
                <Label variant="small">Daily target</Label>
                <TextInput
                  accessibilityLabel="Daily target"
                  value={target}
                  onChangeText={setTarget}
                  keyboardType="decimal-pad"
                  style={inputStyle}
                />
              </View>
              <View style={{ flex: 1.5, gap: 8 }}>
                <Label variant="small">Measured in</Label>
                <TextInput
                  accessibilityLabel="Measurement unit"
                  value={unit}
                  onChangeText={setUnit}
                  maxLength={24}
                  style={inputStyle}
                />
              </View>
            </Row>
          ) : (
            <Label variant="small" style={{ color: colors.muted }}>
              One check-in when you’re done. Simple and satisfying.
            </Label>
          )}
        </Panel>
        <Panel>
          <Label style={{ fontFamily: tokens.font.bold }}>Make a little rhythm</Label>
          <Row style={{ flexWrap: 'wrap', gap: 6 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={day}
                accessibilityState={{ selected: weekdays.includes(i + 1) }}
                onPress={() =>
                  setWeekdays((days) =>
                    days.includes(i + 1) ? days.filter((d) => d !== i + 1) : [...days, i + 1],
                  )
                }
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: weekdays.includes(i + 1) ? colors.mossSoft : colors.background,
                  borderWidth: 1,
                  borderColor: weekdays.includes(i + 1) ? colors.moss : colors.line,
                  borderRadius: 10,
                }}
              >
                <Label variant="small">{day}</Label>
              </Pressable>
            ))}
          </Row>
          <Label variant="small" style={{ color: colors.muted }}>
            Rest days won’t break your streak.
          </Label>
        </Panel>
        {id && (
          <Label variant="small" style={{ color: colors.muted }}>
            Target, unit, and schedule changes begin tomorrow. Previous days keep their original
            goals.
          </Label>
        )}
        {error ? (
          <Label accessibilityRole="alert" style={{ color: colors.danger }}>
            {error}
          </Label>
        ) : null}
        <PixelButton
          label={id ? 'Save little changes' : 'Plant this habit'}
          icon="leaf"
          onPress={() => {
            try {
              if (type === 'numeric' && !/^\d+(\.\d{1,3})?$/.test(target.trim()))
                throw new Error('Use a target with up to 3 decimal places.');
              saveHabit(
                {
                  name,
                  type,
                  targetValue: type === 'binary' ? 1 : Number(target),
                  unit: type === 'binary' ? 'check-in' : unit,
                  icon,
                  color,
                  weekdays,
                },
                id,
              );
              if (router.canGoBack()) router.back();
              else router.replace('/today');
            } catch (e) {
              setError(
                e instanceof Error ? e.message : 'We could not plant that habit. Try again.',
              );
            }
          }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}
