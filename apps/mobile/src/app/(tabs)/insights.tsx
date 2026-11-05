import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  addDays,
  calculateStatistics,
  dateRange,
  isoWeekday,
  progressForDay,
  versionForDate,
} from '@little/shared-types';
import { useGarden } from '../../state/garden';
import { useToday } from '../../hooks/useToday';
import { useTheme } from '../../design/theme';
import { PixelIcon } from '../../components/PixelArt';
import { Label, Panel, PixelProgressBar, PixelStatCard, Row, Screen } from '../../components/ui';

export default function Insights() {
  const { colors } = useTheme();
  const today = useToday();
  const habits = useGarden((s) => s.habits);
  const entries = useGarden((s) => s.entries);
  const [period, setPeriod] = useState(30);
  const from = addDays(today, -(period - 1));
  const days = dateRange(from, today).map((d) => progressForDay(habits, entries, d));
  const stats = calculateStatistics(days, today);
  const yearStats = calculateStatistics(
    dateRange(addDays(today, -365), today).map((d) => progressForDay(habits, entries, d)),
    today,
  );
  const weekFrom = addDays(today, -(isoWeekday(today) - 1));
  const rate = (start: string) =>
    Math.round(
      calculateStatistics(
        dateRange(start, today).map((d) => progressForDay(habits, entries, d)),
        today,
      ).completionRate * 100,
    );
  const week = dateRange(addDays(today, -6), today).map((d) => progressForDay(habits, entries, d));
  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Label variant="pixel" style={{ color: colors.moss }}>
          NOTICING THE LITTLE THINGS
        </Label>
        <Label variant="title">Look how far{`\n`}you’ve grown.</Label>
        <Label style={{ color: colors.muted }}>A little reflection, without the pressure.</Label>
      </View>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {[7, 30, 90, 366].map((p) => (
          <Pressable
            key={p}
            accessibilityRole="button"
            accessibilityState={{ selected: p === period }}
            onPress={() => setPeriod(p)}
            style={{
              minHeight: 48,
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              paddingHorizontal: 12,
              backgroundColor: p === period ? colors.mossSoft : colors.surface,
              borderColor: p === period ? colors.moss : colors.line,
              borderWidth: 1,
            }}
          >
            <Label variant="small">{p === 366 ? 'Past year' : `${p} days`}</Label>
          </Pressable>
        ))}
      </Row>
      <Row style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
        <PixelStatCard
          value={`${Math.round(stats.consistency * 100)}%`}
          label="CONSISTENCY"
          hint="Partial steps count, too"
        />
        <PixelStatCard
          value={String(stats.completedDays)}
          label="FULLY GROWN DAYS"
          hint={`In the last ${period} days`}
        />
      </Row>
      <Panel style={{ backgroundColor: colors.garden }}>
        <Row>
          <PixelIcon name="spark" color={colors.moss} />
          <Label variant="heading">Your steady little rhythm</Label>
        </Row>
        <Row style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Label variant="title">{yearStats.currentStreak}</Label>
            <Label variant="small">Current day streak</Label>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Label variant="title">{yearStats.longestStreak}</Label>
            <Label variant="small">Longest day streak</Label>
          </View>
        </Row>
        <Label variant="small" style={{ color: colors.muted }}>
          Within the past year. Rest days are a pause; today has room to grow.
        </Label>
      </Panel>
      <Panel>
        <Label variant="heading">Seven small days</Label>
        <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 12 }}>
          {week.map((d) => (
            <View
              key={d.date}
              accessible
              accessibilityLabel={`${d.date}, ${d.intensity === null ? 'rest day' : `${Math.round(d.intensity * 100)} percent progress`}`}
              style={{ alignItems: 'center', flex: 1, gap: 10 }}
            >
              <View
                style={{
                  height: 100,
                  width: 22,
                  backgroundColor: colors.mossSoft,
                  justifyContent: 'flex-end',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: `${Math.round((d.intensity ?? 0) * 100)}%`,
                    backgroundColor: colors.moss,
                  }}
                />
              </View>
              <Label variant="pixel" style={{ color: colors.muted }}>
                {new Date(`${d.date}T12:00:00Z`).toLocaleDateString('en-US', {
                  weekday: 'narrow',
                  timeZone: 'UTC',
                })}
              </Label>
            </View>
          ))}
        </Row>
      </Panel>
      <Panel>
        <Label variant="heading">Promises kept</Label>
        <Label variant="small" style={{ color: colors.muted }}>
          Fully completed scheduled check-ins
        </Label>
        {[
          { label: 'This week', value: rate(weekFrom) },
          { label: 'This month', value: rate(`${today.slice(0, 7)}-01`) },
          { label: `Last ${period} days`, value: Math.round(stats.completionRate * 100) },
        ].map((r) => (
          <View key={r.label} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Label>{r.label}</Label>
              <Label>{r.value}%</Label>
            </Row>
            <PixelProgressBar value={r.value / 100} label={`${r.label} completion rate`} />
          </View>
        ))}
      </Panel>
      <View style={{ gap: 12 }}>
        <Label variant="heading">A little of each</Label>
        {habits.map((habit) => {
          const habitStats = calculateStatistics(
            dateRange(from, today).map((d) => progressForDay([habit], entries, d)),
            today,
          );
          const totals = new Map<string, number>();
          for (const entry of entries.filter(
            (e) => e.habitId === habit.id && e.entryDate >= from && e.entryDate <= today,
          )) {
            const version = versionForDate(habit, entry.entryDate);
            if (version) {
              const unit = version.type === 'binary' ? 'check-ins' : version.unit;
              totals.set(unit, (totals.get(unit) ?? 0) + entry.value);
            }
          }
          return (
            <Panel key={habit.id}>
              <Row>
                <PixelIcon name={habit.icon} />
                <Label style={{ flex: 1, fontFamily: 'DMSans_700Bold' }}>{habit.name}</Label>
                <Label variant="small">{Math.round(habitStats.consistency * 100)}%</Label>
              </Row>
              <PixelProgressBar value={habitStats.consistency} />
              <Label variant="small" style={{ color: colors.muted }}>
                {totals.size
                  ? [...totals]
                      .map(
                        ([unit, value]) => `${Number(value.toFixed(3)).toLocaleString()} ${unit}`,
                      )
                      .join(' · ')
                  : 'Your first little step is waiting.'}
              </Label>
            </Panel>
          );
        })}
      </View>
    </Screen>
  );
}
