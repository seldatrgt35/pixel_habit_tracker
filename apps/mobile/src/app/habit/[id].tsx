import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  addDays,
  calculateStatistics,
  dateRange,
  progressForDay,
  versionForDate,
} from '@little/shared-types';
import { useGarden } from '../../state/garden';
import { useToday } from '../../hooks/useToday';
import { useTheme } from '../../design/theme';
import { PixelIcon } from '../../components/PixelArt';
import { PixelHeatmap } from '../../components/PixelHeatmap';
import { HabitDayList } from '../../components/HabitDayList';
import { SelectedDaySummary } from '../../components/SelectedDaySummary';
import {
  IconButton,
  Label,
  Panel,
  PixelButton,
  PixelStatCard,
  Row,
  Screen,
} from '../../components/ui';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useGarden((s) => s.habits.find((h) => h.id === id));
  const entries = useGarden((s) => s.entries);
  const archiveHabit = useGarden((s) => s.archiveHabit);
  const { colors } = useTheme();
  const today = useToday();
  const [date, setDate] = useState(today);
  const [confirm, setConfirm] = useState(false);
  const [editingDay, setEditingDay] = useState(false);
  const selectDate = (next: string) => {
    setDate(next);
    setEditingDay(false);
  };
  const back = () => (router.canGoBack() ? router.back() : router.replace('/today'));
  if (!habit)
    return (
      <Screen>
        <Label variant="heading">This little path is empty.</Label>
        <PixelButton label="Back to your garden" onPress={back} />
      </Screen>
    );
  const days = dateRange(addDays(today, -83), today).map((d) =>
    progressForDay([habit], entries, d),
  );
  const stats = calculateStatistics(days, today);
  const version = versionForDate(habit, date);
  const totals = new Map<string, number>();
  for (const entry of entries.filter((e) => e.habitId === habit.id)) {
    const historicalVersion = versionForDate(habit, entry.entryDate);
    if (historicalVersion) {
      const unit = historicalVersion.type === 'binary' ? 'check-ins' : historicalVersion.unit;
      totals.set(unit, (totals.get(unit) ?? 0) + entry.value);
    }
  }
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="back" label="Back to your garden" onPress={back} />
        {!habit.archivedDate && (
          <PixelButton
            label="Edit habit"
            secondary
            onPress={() => router.push({ pathname: '/habit/edit', params: { id: habit.id } })}
          />
        )}
      </Row>
      <View style={{ gap: 12 }}>
        <View
          style={{
            width: 72,
            height: 72,
            backgroundColor: habit.color === 'moss' ? colors.mossSoft : colors[habit.color],
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PixelIcon name={habit.icon} size={36} />
        </View>
        <Label variant="title">{habit.name}</Label>
        <Label style={{ color: colors.muted }}>
          {habit.archivedDate
            ? `Resting from ${habit.archivedDate}. Your history stays here.`
            : version?.type === 'numeric'
              ? `${version.targetValue} ${version.unit} · a little at a time`
              : 'One small check-in, one good feeling.'}
        </Label>
      </View>
      <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }}>
        <PixelStatCard
          value={`${Math.round(stats.consistency * 100)}%`}
          label="CONSISTENCY"
          hint="Last 12 weeks"
        />
        <PixelStatCard
          value={String(stats.completedDays)}
          label="COMPLETED DAYS"
          hint="Last 12 weeks"
        />
      </Row>
      <Panel>
        <Label variant="heading">This habit’s little trail</Label>
        <Label variant="small" style={{ color: colors.muted }}>
          Only {habit.name} · last 12 weeks. Tap a square for its check-in and daily details.
        </Label>
        <PixelHeatmap days={days} label={habit.name} selected={date} onSelect={selectDate} />
      </Panel>
      <View style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton
            icon="back"
            label="Previous history day"
            disabled={date <= addDays(today, -365)}
            onPress={() => selectDate(addDays(date, -1))}
          />
          <Label style={{ fontFamily: 'DMSans_700Bold' }}>{date}</Label>
          <IconButton
            icon="next"
            label="Next history day"
            disabled={date >= today}
            onPress={() => selectDate(addDays(date, 1))}
          />
        </Row>
        <SelectedDaySummary date={date} habits={[habit]} entries={entries} />
        <PixelButton
          label={editingDay ? 'Close entry editor' : 'Edit this day'}
          secondary
          onPress={() => setEditingDay(!editingDay)}
        />
        {editingDay && <HabitDayList date={date} filterId={habit.id} />}
      </View>
      <Panel>
        <Label variant="heading">All those little efforts</Label>
        <Label>
          {totals.size
            ? [...totals]
                .map(([unit, value]) => `${Number(value.toFixed(3)).toLocaleString()} ${unit}`)
                .join(' · ')
            : 'Your first check-in is waiting.'}
        </Label>
        <Label variant="small" style={{ color: colors.muted }}>
          Actual quantities, including everything beyond your target. Different units stay separate.
        </Label>
      </Panel>
      {!habit.archivedDate &&
        (confirm ? (
          <Panel>
            <Label>
              Let this habit rest from tomorrow? Today and previous check-ins stay editable.
            </Label>
            <PixelButton
              label="Archive from tomorrow"
              onPress={() => {
                archiveHabit(habit.id);
                setConfirm(false);
              }}
            />
            <PixelButton label="Keep growing" secondary onPress={() => setConfirm(false)} />
          </Panel>
        ) : (
          <PixelButton label="Let this habit rest" secondary onPress={() => setConfirm(true)} />
        ))}
    </Screen>
  );
}
