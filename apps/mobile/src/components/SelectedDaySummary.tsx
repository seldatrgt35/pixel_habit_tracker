import { View } from 'react-native';
import {
  habitResultsForDay,
  type Habit,
  type HabitEntry,
  type HabitDayResult,
} from '@little/shared-types';
import { useTheme } from '../design/theme';
import { tokens } from '../design/tokens';
import { PixelIcon } from './PixelArt';
import { Label, Row } from './ui';

export function SelectedDaySummary({
  date,
  habits,
  entries,
}: {
  date: string;
  habits: Habit[];
  entries: HabitEntry[];
}) {
  const { colors } = useTheme();
  const results = habitResultsForDay(habits, entries, date);
  const completed = results.filter((result) => result.status === 'completed').length;
  const progress = results.length
    ? results.reduce((sum, result) => sum + result.progress, 0) / results.length
    : 0;
  const groups: { status: HabitDayResult['status']; label: string }[] = [
    { status: 'completed', label: 'Completed' },
    { status: 'partial', label: 'In progress' },
    { status: 'pending', label: 'Not completed' },
  ];
  return (
    <View style={{ gap: 16, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16 }}>
      <View style={{ gap: 6 }}>
        <Label variant="pixel" style={{ color: colors.moss }}>
          SELECTED DAY
        </Label>
        <Label variant="heading" accessibilityRole="header">
          {new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </Label>
        <Label variant="small" accessibilityLiveRegion="polite" style={{ color: colors.muted }}>
          {results.length
            ? `${completed} of ${results.length} ${results.length === 1 ? 'habit' : 'habits'} completed · ${Math.round(progress * 100)}% progress`
            : 'Rest day · no scheduled habits'}
        </Label>
      </View>
      {!results.length && (
        <Label style={{ color: colors.muted }}>
          No habits were scheduled for this day. Rest belongs here, too.
        </Label>
      )}
      {groups.map((group) => {
        const rows = results.filter((result) => result.status === group.status);
        if (!rows.length) return null;
        return (
          <View key={group.status} style={{ gap: 12 }}>
            <Label
              variant="small"
              accessibilityRole="header"
              style={{
                fontFamily: tokens.font.bold,
                color: group.status === 'completed' ? colors.moss : colors.muted,
              }}
            >{`${group.label} (${rows.length})`}</Label>
            {rows.map(({ habit, version, value, items, status }) => (
              <View key={habit.id} style={{ gap: 6 }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        habit.color === 'moss' ? colors.mossSoft : colors[habit.color],
                    }}
                  >
                    <PixelIcon name={habit.icon} size={19} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Label style={{ fontFamily: tokens.font.bold, fontSize: 15 }}>
                      {habit.name}
                    </Label>
                    <Label variant="small" style={{ color: colors.muted }}>
                      {version.type === 'binary'
                        ? status === 'completed'
                          ? 'Checked in'
                          : 'Not checked in'
                        : `${value} / ${version.targetValue} ${version.unit}`}
                    </Label>
                    {items.map((item) => (
                      <Row key={item.id} style={{ alignItems: 'flex-start', gap: 8 }}>
                        <View
                          style={{
                            width: 4,
                            height: 4,
                            backgroundColor: colors.moss,
                            marginTop: 8,
                          }}
                        />
                        <Label variant="small" style={{ flex: 1 }}>
                          {item.text}
                        </Label>
                      </Row>
                    ))}
                  </View>
                  {status === 'completed' && (
                    <PixelIcon name="check" color={colors.moss} size={16} />
                  )}
                </Row>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
