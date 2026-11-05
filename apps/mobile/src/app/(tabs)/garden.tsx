import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { addDays, dateRange, progressForDay, type DayProgress } from '@little/shared-types';
import { useGarden } from '../../state/garden';
import { useToday } from '../../hooks/useToday';
import { useTheme } from '../../design/theme';
import { PixelCalendar, PixelHeatmap } from '../../components/PixelHeatmap';
import { HabitDayList } from '../../components/HabitDayList';
import { SelectedDaySummary } from '../../components/SelectedDaySummary';
import { PixelIcon } from '../../components/PixelArt';
import { IconButton, Label, Panel, PixelButton, Row, Screen } from '../../components/ui';

export default function Garden() {
  const { colors } = useTheme();
  const today = useToday();
  const habits = useGarden((s) => s.habits);
  const entries = useGarden((s) => s.entries);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [filter, setFilter] = useState<string | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(false);
  const activeHabit = habits.find((habit) => habit.id === filter);
  const scoped = activeHabit ? [activeHabit] : habits;
  const scopeLabel = activeHabit?.name ?? 'All habits';
  const progress = (date: string) => progressForDay(scoped, entries, date);
  const selectDate = (date: string) => {
    setSelected(date);
    setEditingDay(false);
  };
  const moveMonth = (amount: number) => {
    const shifted = new Date(`${month}-01T12:00:00Z`);
    shifted.setUTCMonth(shifted.getUTCMonth() + amount);
    const next = shifted.toISOString().slice(0, 7);
    if (next <= today.slice(0, 7) && next >= '1970-01') setMonth(next);
  };
  const nextMonth = new Date(`${month}-01T12:00:00Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  const end =
    month === today.slice(0, 7) ? today : addDays(nextMonth.toISOString().slice(0, 10), -1);
  const series = useMemo(() => {
    const dates = dateRange(addDays(end, -83), end);
    const byDate = new Map<string, typeof entries>();
    for (const entry of entries) {
      const bucket = byDate.get(entry.entryDate) ?? [];
      bucket.push(entry);
      byDate.set(entry.entryDate, bucket);
    }
    const perHabit = new Map<string, DayProgress[]>(habits.map((habit) => [habit.id, []]));
    const overall = dates.map((date) => {
      const daily = byDate.get(date) ?? [];
      for (const habit of habits)
        perHabit.get(habit.id)!.push(progressForDay([habit], daily, date));
      return progressForDay(habits, daily, date);
    });
    return { overall, perHabit };
  }, [habits, entries, end]);
  const days = activeHabit ? series.perHabit.get(activeHabit.id)! : series.overall;
  return (
    <Screen style={{ paddingHorizontal: 16 }}>
      <View style={{ gap: 8 }}>
        <Label variant="pixel" style={{ color: colors.moss }}>
          YOUR PATCH OF PROGRESS
        </Label>
        <Label variant="title">Every day leaves{`\n`}a little something.</Label>
        <Label style={{ color: colors.muted }}>
          An overall garden and a little trail for each habit. Tap a square to see that day’s
          check-ins.
        </Label>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Row>
          {[{ id: undefined, name: 'All habits' }, ...habits].map((habit) => (
            <Pressable
              key={habit.id ?? 'all'}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === habit.id }}
              onPress={() => {
                setFilter(habit.id);
                setEditingDay(false);
              }}
              style={{
                minHeight: 48,
                padding: 12,
                borderRadius: 12,
                backgroundColor: filter === habit.id ? colors.mossSoft : colors.surface,
                borderColor: filter === habit.id ? colors.moss : colors.line,
                borderWidth: 1,
              }}
            >
              <Label variant="small">{habit.name}</Label>
            </Pressable>
          ))}
        </Row>
      </ScrollView>
      <Panel>
        <Label variant="pixel" style={{ color: colors.moss }}>
          {activeHabit ? 'THIS HABIT’S PROGRESS' : 'OVERALL PROGRESS'}
        </Label>
        <Label variant="heading">{scopeLabel}</Label>
        <Label variant="small" style={{ color: colors.muted }}>
          {activeHabit
            ? 'Each square belongs only to this habit.'
            : 'Each square combines the habits scheduled for that day.'}{' '}
          Last 12 weeks ending {end}. Scroll sideways to explore.
        </Label>
        <PixelHeatmap days={days} label={scopeLabel} selected={selected} onSelect={selectDate} />
        <SelectedDaySummary date={selected} habits={scoped} entries={entries} />
        <PixelButton
          label={editingDay ? 'Close entry editor' : 'Edit this day'}
          secondary
          onPress={() => setEditingDay(!editingDay)}
        />
        {editingDay && <HabitDayList date={selected} filterId={activeHabit?.id} />}
      </Panel>
      <PixelButton
        label={calendarOpen ? 'Close monthly calendar' : 'Open monthly calendar'}
        secondary
        onPress={() => setCalendarOpen(!calendarOpen)}
      />
      {calendarOpen && (
        <Panel style={{ padding: 12, marginHorizontal: -8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <IconButton icon="back" label="Previous month" onPress={() => moveMonth(-1)} />
            <Label variant="heading" style={{ flex: 1, textAlign: 'center', fontSize: 18 }}>
              {new Date(`${month}-01T12:00:00Z`).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </Label>
            <IconButton
              icon="next"
              label="Next month"
              disabled={month >= today.slice(0, 7)}
              onPress={() => moveMonth(1)}
            />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <PixelButton compact label="Previous year" secondary onPress={() => moveMonth(-12)} />
            <PixelButton
              compact
              label="Next year"
              secondary
              disabled={Number(month.slice(0, 4)) >= Number(today.slice(0, 4))}
              onPress={() => {
                const target = `${Number(month.slice(0, 4)) + 1}${month.slice(4)}`;
                setMonth(target > today.slice(0, 7) ? today.slice(0, 7) : target);
              }}
            />
          </Row>
          <PixelCalendar
            month={month}
            today={today}
            selected={selected}
            onSelect={selectDate}
            progress={(date) => progress(date).intensity}
          />
          <Label variant="small" style={{ color: colors.muted, textAlign: 'center' }}>
            Color reflects progress toward each day’s original targets.
          </Label>
        </Panel>
      )}
      <View style={{ gap: 16 }}>
        <Label variant="heading">A garden for every habit</Label>
        <Label variant="small" style={{ color: colors.muted }}>
          These maps track each habit separately. Open one to select a day and see its own history.
        </Label>
        {habits.map((habit) => (
          <Panel key={habit.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${habit.name} calendar`}
              onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
              style={({ pressed }) => ({ minHeight: 48, gap: 12, opacity: pressed ? 0.7 : 1 })}
            >
              <Row>
                <PixelIcon name={habit.icon} color={colors.moss} />
                <Label variant="heading" style={{ flex: 1 }}>
                  {habit.name}
                </Label>
                <PixelIcon name="next" size={14} />
              </Row>
              <PixelHeatmap days={series.perHabit.get(habit.id)!} label={habit.name} />
              <Label variant="small" style={{ color: colors.moss }}>
                Open this habit’s calendar →
              </Label>
            </Pressable>
          </Panel>
        ))}
        {!habits.length && (
          <Label style={{ color: colors.muted }}>
            Plant your first habit to grow its own calendar.
          </Label>
        )}
      </View>
    </Screen>
  );
}
