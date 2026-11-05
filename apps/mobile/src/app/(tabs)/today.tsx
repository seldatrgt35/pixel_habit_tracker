import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { addDays, calculateStatistics, dateRange, progressForDay } from '@little/shared-types';
import { useGarden } from '../../state/garden';
import { useToday } from '../../hooks/useToday';
import { useTheme } from '../../design/theme';
import { GardenLandscape, PixelCompanion, PixelIcon } from '../../components/PixelArt';
import { PixelHeatmap } from '../../components/PixelHeatmap';
import { HabitDayList } from '../../components/HabitDayList';
import { SelectedDaySummary } from '../../components/SelectedDaySummary';
import {
  IconButton,
  Label,
  Panel,
  PixelButton,
  PixelEmptyState,
  PixelProgressBar,
  PixelStreakBadge,
  Row,
  Screen,
} from '../../components/ui';

export default function Today() {
  const { colors } = useTheme();
  const today = useToday();
  const habits = useGarden((s) => s.habits);
  const entries = useGarden((s) => s.entries);
  const [offset, setOffset] = useState(0);
  const [happy, setHappy] = useState(false);
  const [heatmapDate, setHeatmapDate] = useState<string | null>(null);
  useEffect(() => {
    if (!happy) return;
    const timer = setTimeout(() => setHappy(false), 1600);
    return () => clearTimeout(timer);
  }, [happy]);
  const date = addDays(today, offset);
  const day = progressForDay(habits, entries, date);
  const days = dateRange(addDays(today, -83), today).map((d) => progressForDay(habits, entries, d));
  const stats = calculateStatistics(
    dateRange(addDays(today, -365), today).map((d) => progressForDay(habits, entries, d)),
    today,
  );
  const fullDate = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 8 }}>
          <PixelIcon name="garden" color={colors.moss} />
          <Label variant="pixel">LITTLE BY LITTLE</Label>
        </Row>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open preview settings"
          onPress={() => router.push('/settings')}
          style={{ minHeight: 48, justifyContent: 'center' }}
        >
          <Label variant="small" style={{ color: colors.muted }}>
            LOCAL PREVIEW
          </Label>
        </Pressable>
      </Row>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Label variant="small" style={{ color: colors.muted }}>
            Your everyday, a little greener.
          </Label>
          <Label variant="title">Let’s grow{`\n`}something good.</Label>
        </View>
        <PixelStreakBadge days={stats.currentStreak} />
      </Row>
      <View
        style={{
          backgroundColor: colors.garden,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.line,
          overflow: 'hidden',
        }}
      >
        <Row style={{ padding: 22, paddingBottom: 0, alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Label variant="pixel" style={{ color: colors.moss }}>
              A NOTE FROM PIP
            </Label>
            <Label style={{ fontSize: 18, lineHeight: 26 }}>
              {happy || (day.scheduled > 0 && day.completed === day.scheduled)
                ? 'Look at you growing! Your small steps made a lovely day.'
                : 'No need to do it all. A little progress is still progress.'}
            </Label>
          </View>
          <View style={{ marginTop: 8 }}>
            <PixelCompanion happy={happy} size={100} />
          </View>
        </Row>
        <GardenLandscape height={80} />
        <View style={{ padding: 20, gap: 12, backgroundColor: colors.surface }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label style={{ fontFamily: 'DMSans_700Bold' }}>
              Your {offset === 0 ? 'daily' : 'day’s'} little steps
            </Label>
            <Label variant="pixel">
              {day.completed}/{day.scheduled} GROWN
            </Label>
          </Row>
          <PixelProgressBar value={day.intensity ?? 0} />
          <Label variant="small" style={{ color: colors.muted }}>
            {day.scheduled
              ? `${Math.round((day.intensity ?? 0) * 100)}% progress · showing up is a good beginning`
              : 'Make a little room for something meaningful.'}
          </Label>
        </View>
      </View>
      <View style={{ gap: 14 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label variant="heading">
            {offset === 0 ? 'Today’s habits' : 'A day in your garden'}
          </Label>
          <IconButton
            icon="plus"
            label="Create a new habit"
            onPress={() => router.push('/habit/edit')}
          />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <IconButton
            icon="back"
            label="Previous day"
            disabled={offset <= -365}
            onPress={() => setOffset((o) => o - 1)}
          />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Label variant="small" style={{ fontFamily: 'DMSans_700Bold' }}>
              {fullDate}
            </Label>
            {offset !== 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setOffset(0)}
                style={{ minHeight: 48, justifyContent: 'center' }}
              >
                <Label variant="small" style={{ color: colors.moss }}>
                  Back to today
                </Label>
              </Pressable>
            )}
          </View>
          <IconButton
            icon="next"
            label="Next day"
            disabled={offset === 0}
            onPress={() => setOffset((o) => o + 1)}
          />
        </Row>
        {habits.length ? (
          <HabitDayList date={date} onCelebrate={() => setHappy(true)} />
        ) : (
          <PixelEmptyState action={() => router.push('/habit/edit')} />
        )}
      </View>
      <Panel>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Label variant="heading">Little steps, adding up.</Label>
            <Label variant="small" style={{ color: colors.muted }}>
              All habits · last 12 weeks
            </Label>
          </View>
          <PixelIcon name="leaf" color={colors.moss} />
        </Row>
        <Label variant="small" style={{ color: colors.muted }}>
          Tap a square to see which habits you completed that day. Scroll the map sideways for more
          weeks.
        </Label>
        <PixelHeatmap
          days={days}
          label="All habits"
          selected={heatmapDate ?? undefined}
          onSelect={setHeatmapDate}
        />
        {heatmapDate && <SelectedDaySummary date={heatmapDate} habits={habits} entries={entries} />}
        <PixelButton
          label="Wander through your garden"
          secondary
          onPress={() => router.push('/garden')}
        />
      </Panel>
      <Label variant="pixel" style={{ textAlign: 'center', color: colors.muted }}>
        GROW AT YOUR OWN PACE.
      </Label>
    </Screen>
  );
}
