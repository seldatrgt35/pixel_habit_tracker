import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { isScheduled, versionForDate, type Habit } from '@little/shared-types';
import { useGarden } from '../state/garden';
import { PixelHabitCard } from './PixelHabitCard';
import { PixelCelebration, PixelEmptyState } from './ui';

export function HabitDayList({
  date,
  filterId,
  onCelebrate,
}: {
  date: string;
  filterId?: string;
  onCelebrate?: () => void;
}) {
  const habits = useGarden((s) => s.habits);
  const entries = useGarden((s) => s.entries);
  const setEntry = useGarden((s) => s.setEntry);
  const [celebrating, setCelebrating] = useState(false);
  const scheduled = habits.filter((h) => (!filterId || h.id === filterId) && isScheduled(h, date));
  return (
    <View style={{ gap: 12 }}>
      <PixelCelebration visible={celebrating} />
      {scheduled.length ? (
        scheduled.map((habit: Habit) => {
          const entry = entries.find((e) => e.habitId === habit.id && e.entryDate === date);
          const value = entry?.value ?? 0;
          return (
            <PixelHabitCard
              key={`${habit.id}-${date}`}
              habit={habit}
              date={date}
              value={value}
              items={entry?.items}
              onOpen={
                filterId
                  ? undefined
                  : () => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })
              }
              onChange={(quantity, items) => {
                setEntry(habit.id, date, quantity, items);
                const target = versionForDate(habit, date)!.targetValue;
                const completedNow = value < target && quantity >= target;
                setCelebrating(completedNow);
                if (completedNow) onCelebrate?.();
              }}
            />
          );
        })
      ) : (
        <PixelEmptyState
          title="A little breathing room."
          body="No habits scheduled for this day. Rest belongs here, too."
        />
      )}
    </View>
  );
}
