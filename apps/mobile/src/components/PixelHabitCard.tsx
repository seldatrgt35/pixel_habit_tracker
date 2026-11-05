import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import {
  normalizeEntryItems,
  normalizedProgress,
  versionForDate,
  type Habit,
  type HabitEntryItem,
} from '@little/shared-types';
import { useTheme } from '../design/theme';
import { tokens } from '../design/tokens';
import { PixelHabitIcon, PixelIcon } from './PixelArt';
import { DailyEntryItemsEditor } from './DailyEntryItemsEditor';
import { makeId } from '../state/garden';
import { Label, PixelButton, PixelProgressBar, Row } from './ui';

export function PixelHabitCard({
  habit,
  date,
  value,
  items = [],
  onChange,
  onOpen,
}: {
  habit: Habit;
  date: string;
  value: number;
  items?: HabitEntryItem[];
  onChange: (value: number, items?: HabitEntryItem[]) => void;
  onOpen?: () => void;
}) {
  const { colors, dark } = useTheme();
  const version = versionForDate(habit, date)!;
  const progress = normalizedProgress(value, version.targetValue);
  const complete = progress === 1;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [draftItems, setDraftItems] = useState<HabitEntryItem[]>([]);
  const [focusDetails, setFocusDetails] = useState(false);
  const [error, setError] = useState('');
  const accent = habit.color === 'moss' ? colors.mossSoft : colors[habit.color];
  const openEditor = (details: boolean) => {
    setDraft(String(value));
    setDraftItems(items.length ? items.map((item) => ({ ...item })) : [{ id: makeId(), text: '' }]);
    setFocusDetails(details);
    setError('');
    setEditing(true);
  };
  const save = (quantity: number, details?: HabitEntryItem[]) => {
    try {
      if (details === undefined) onChange(quantity);
      else onChange(quantity, details);
      setEditing(false);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try that again.');
    }
  };
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: complete ? colors.moss : colors.line,
        borderRadius: 18,
        padding: 16,
        gap: 12,
      }}
    >
      <Row>
        <View
          style={{
            backgroundColor: accent,
            width: 50,
            height: 50,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PixelHabitIcon name={habit.icon} color={colors.ink} />
        </View>
        <Pressable
          disabled={!onOpen}
          onPress={onOpen}
          accessibilityRole={onOpen ? 'button' : undefined}
          accessibilityLabel={`${habit.name}, view history`}
          style={{ flex: 1, minHeight: 48, justifyContent: 'center' }}
        >
          <Label style={{ fontFamily: tokens.font.bold, fontSize: 16, lineHeight: 22 }}>
            {habit.name}
          </Label>
          <Label variant="small" style={{ color: colors.muted }}>
            {version.type === 'binary'
              ? complete
                ? 'A little promise, kept.'
                : 'One small check-in'
              : `${value} / ${version.targetValue} ${version.unit}`}
          </Label>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            version.type === 'binary'
              ? `${complete ? 'Undo' : 'Complete'} ${habit.name}`
              : `Log progress for ${habit.name}`
          }
          accessibilityState={{ checked: complete, disabled: editing }}
          disabled={editing}
          onPress={() => {
            if (version.type === 'binary') save(complete ? 0 : 1);
            else openEditor(false);
          }}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: complete ? colors.moss : colors.mossSoft,
            borderColor: complete ? colors.moss : colors.line,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: editing ? 0.45 : pressed ? 0.7 : 1,
          })}
        >
          <PixelIcon
            name={complete ? 'check' : 'plus'}
            size={18}
            color={complete ? (dark ? colors.background : '#FFF') : colors.moss}
          />
        </Pressable>
      </Row>
      {version.type === 'numeric' && (
        <PixelProgressBar value={progress} label={`${habit.name} progress`} />
      )}
      {!editing && (
        <>
          {items.length > 0 && (
            <View style={{ gap: 8 }}>
              <Label variant="pixel" style={{ color: colors.muted }}>
                ON THIS DAY
              </Label>
              {items.map((item) => (
                <Row key={item.id} style={{ alignItems: 'flex-start', gap: 10 }}>
                  <View
                    style={{ width: 5, height: 5, backgroundColor: colors.moss, marginTop: 8 }}
                    accessible={false}
                  />
                  <Label style={{ flex: 1, fontSize: 14, lineHeight: 22 }}>{item.text}</Label>
                </Row>
              ))}
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${items.length ? 'Edit' : 'Add'} daily details for ${habit.name}`}
            onPress={() => openEditor(true)}
            style={({ pressed }) => ({
              minHeight: 48,
              justifyContent: 'center',
              borderTopWidth: 1,
              borderTopColor: colors.line,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Row style={{ gap: 8 }}>
              <PixelIcon name="plus" size={12} color={colors.moss} />
              <Label variant="small" style={{ color: colors.moss, fontFamily: tokens.font.bold }}>
                {items.length ? 'Edit daily details' : 'Add daily details'}
              </Label>
            </Row>
          </Pressable>
        </>
      )}
      {editing && (
        <View style={{ gap: 16 }}>
          {version.type === 'numeric' ? (
            <View style={{ gap: 8 }}>
              <Label variant="small">Actual quantity · {version.unit}</Label>
              <TextInput
                accessibilityLabel={`Actual quantity for ${habit.name}`}
                value={draft}
                onChangeText={setDraft}
                keyboardType="decimal-pad"
                autoFocus={!focusDetails}
                selectTextOnFocus
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: 10,
                  color: colors.ink,
                  backgroundColor: colors.background,
                  padding: 12,
                  fontFamily: tokens.font.body,
                  fontSize: 18,
                }}
              />
            </View>
          ) : (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={`Completed for this day: ${habit.name}`}
              accessibilityState={{ checked: draft === '1' }}
              onPress={() => setDraft((current) => (current === '1' ? '0' : '1'))}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                padding: 12,
                borderRadius: 10,
                backgroundColor: colors.mossSoft,
              }}
            >
              <Row>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderWidth: 2,
                    borderColor: colors.moss,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {draft === '1' && <PixelIcon name="check" size={14} color={colors.moss} />}
                </View>
                <Label style={{ flex: 1 }}>Completed for this day</Label>
              </Row>
            </Pressable>
          )}
          <DailyEntryItemsEditor
            habitName={habit.name}
            items={draftItems}
            onChange={setDraftItems}
            autoFocus={focusDetails}
          />
          <Label variant="small" style={{ color: colors.muted }}>
            Save titles and notes alongside your quantity or check-in. A note on its own doesn’t
            complete your goal.
          </Label>
          <Row>
            <View style={{ flex: 1 }}>
              <PixelButton
                label="Save progress"
                onPress={() => {
                  const trimmed = draft.trim();
                  if (!/^\d+(\.\d{1,3})?$/.test(trimmed)) {
                    setError('Enter a number with up to 3 decimal places.');
                    return;
                  }
                  try {
                    const details = normalizeEntryItems(
                      draftItems.filter((item) => item.text.trim()),
                    );
                    save(Number(trimmed), details);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Please check your daily details.');
                  }
                }}
              />
            </View>
            <PixelButton
              label="Cancel"
              secondary
              onPress={() => {
                setEditing(false);
                setError('');
              }}
            />
          </Row>
        </View>
      )}
      {error ? (
        <Label accessibilityRole="alert" variant="small" style={{ color: colors.danger }}>
          {error}
        </Label>
      ) : null}
    </View>
  );
}
