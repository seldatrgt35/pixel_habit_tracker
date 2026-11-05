import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { MAX_ENTRY_ITEMS, MAX_ENTRY_ITEM_LENGTH, type HabitEntryItem } from '@little/shared-types';
import { makeId } from '../state/garden';
import { useTheme } from '../design/theme';
import { tokens } from '../design/tokens';
import { IconButton, Label, PixelButton, Row } from './ui';

export function DailyEntryItemsEditor({
  habitName,
  items,
  onChange,
  autoFocus,
}: {
  habitName: string;
  items: HabitEntryItem[];
  onChange: (items: HabitEntryItem[]) => void;
  autoFocus: boolean;
}) {
  const { colors } = useTheme();
  const [focusId, setFocusId] = useState(autoFocus ? items[0]?.id : undefined);
  return (
    <View style={{ gap: 10 }}>
      <Label style={{ fontFamily: tokens.font.bold }}>What did you do?</Label>
      <Label variant="small" style={{ color: colors.muted }}>
        A book or film title, a project, or the little things you worked on. Each item belongs to
        this day.
      </Label>
      {items.map((item, index) => (
        <Row key={item.id} style={{ alignItems: 'flex-start', gap: 8 }}>
          <TextInput
            accessibilityLabel={`Daily detail ${index + 1} for ${habitName}`}
            placeholder="A title or something you did…"
            placeholderTextColor={colors.muted}
            value={item.text}
            maxLength={MAX_ENTRY_ITEM_LENGTH}
            autoFocus={item.id === focusId}
            autoCorrect={false}
            onChangeText={(text) =>
              onChange(items.map((row) => (row.id === item.id ? { ...row, text } : row)))
            }
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 48,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 10,
              color: colors.ink,
              backgroundColor: colors.background,
              fontFamily: tokens.font.body,
              fontSize: 16,
            }}
          />
          <IconButton
            icon="remove"
            label={`Remove daily detail ${index + 1} for ${habitName}`}
            onPress={() => onChange(items.filter((row) => row.id !== item.id))}
          />
        </Row>
      ))}
      <PixelButton
        secondary
        compact
        icon="plus"
        label={items.length ? 'Add another item' : 'Add an item'}
        disabled={items.length >= MAX_ENTRY_ITEMS}
        onPress={() => {
          const id = makeId();
          setFocusId(id);
          onChange([...items, { id, text: '' }]);
        }}
      />
      {items.length >= MAX_ENTRY_ITEMS && (
        <Label variant="small" style={{ color: colors.muted }}>
          Up to {MAX_ENTRY_ITEMS} items per day.
        </Label>
      )}
    </View>
  );
}
