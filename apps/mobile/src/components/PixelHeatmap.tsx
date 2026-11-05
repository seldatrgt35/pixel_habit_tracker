import { useRef, type ComponentRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { addDays, dateRange, isoWeekday, type DayProgress } from '@little/shared-types';
import { useTheme } from '../design/theme';
import { Label, Row } from './ui';

// Black/white selection guarantees readable calendar numbers across both heat palettes.
function calendarTextColor(fill: string): string {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((offset) => {
    const channel = parseInt(fill.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.179 ? '#000000' : '#FFFFFF';
}

export function PixelHeatmap({
  days,
  selected,
  onSelect,
  label,
}: {
  days: DayProgress[];
  selected?: string;
  onSelect?: (date: string) => void;
  label?: string;
}) {
  const { colors } = useTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const start = days[0]?.date;
  if (!start) return null;
  const padded = [...Array.from({ length: isoWeekday(start) - 1 }, () => null), ...days];
  const columns = Math.ceil(padded.length / 7);
  const color = (day: DayProgress | null) =>
    colors.heat[
      day?.intensity == null
        ? 0
        : day.intensity === 0
          ? 0
          : Math.min(4, Math.ceil(day.intensity * 4))
    ]!;
  return (
    <View style={{ gap: 12 }}>
      {onSelect ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          accessibilityLabel={`${label ? `${label}. ` : ''}Daily progress map. Scroll horizontally to explore.`}
        >
          <Row style={{ alignItems: 'flex-start', gap: 0 }}>
            {Array.from({ length: columns }, (_, column) => (
              <View key={column}>
                {Array.from({ length: 7 }, (_, row) => {
                  const day = padded[column * 7 + row];
                  return day ? (
                    <Pressable
                      key={row}
                      accessibilityRole="button"
                      accessibilityLabel={`${label ? `${label}, ` : ''}${day.date}: ${day.intensity == null ? 'rest day' : `${Math.round(day.intensity * 100)} percent progress`}`}
                      accessibilityState={{ selected: selected === day.date }}
                      onPress={() => onSelect(day.date)}
                      style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <View
                        style={{
                          width: 29,
                          height: 29,
                          borderRadius: 4,
                          backgroundColor: color(day),
                          borderWidth: selected === day.date ? 2 : 0,
                          borderColor: colors.ink,
                        }}
                      />
                    </Pressable>
                  ) : (
                    <View key={row} style={{ width: 48, height: 48 }} />
                  );
                })}
              </View>
            ))}
          </Row>
        </ScrollView>
      ) : (
        <View
          accessible
          accessibilityLabel={`${label ? `${label}. ` : ''}Progress over ${days.length} days. Open the habit calendar to select a day.`}
        >
          <Svg width="100%" height={116} viewBox={`0 0 ${columns * 18} 126`} accessible={false}>
            {padded.map(
              (day, i) =>
                day && (
                  <Rect
                    key={day.date}
                    x={Math.floor(i / 7) * 18}
                    y={(i % 7) * 18}
                    width={14}
                    height={14}
                    rx={2}
                    fill={color(day)}
                  />
                ),
            )}
          </Svg>
        </View>
      )}
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Label variant="small" style={{ color: colors.muted }}>
          Every little square counts.
        </Label>
        <Row style={{ gap: 4 }}>
          <Label variant="small" style={{ color: colors.muted }}>
            Less
          </Label>
          {colors.heat.map((fill) => (
            <View
              key={fill}
              style={{ width: 10, height: 10, backgroundColor: fill, borderRadius: 2 }}
            />
          ))}
          <Label variant="small" style={{ color: colors.muted }}>
            More
          </Label>
        </Row>
      </Row>
    </View>
  );
}

export function PixelCalendar({
  month,
  today,
  selected,
  onSelect,
  progress,
}: {
  month: string;
  today: string;
  selected: string;
  onSelect: (date: string) => void;
  progress: (date: string) => number | null;
}) {
  const { colors } = useTheme();
  const first = `${month}-01`;
  const next = new Date(`${first}T12:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const last = addDays(next.toISOString().slice(0, 10), -1);
  const cells: (string | null)[] = [
    ...Array.from({ length: isoWeekday(first) - 1 }, () => null),
    ...dateRange(first, last),
  ];
  while (cells.length % 7) cells.push(null);
  return (
    <ScrollView
      horizontal
      style={{ marginHorizontal: -10 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ minWidth: 336, flex: 1 }}>
        <Row style={{ gap: 0 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={{ flex: 1, minWidth: 48, alignItems: 'center' }}>
              <Label variant="pixel" style={{ color: colors.muted }}>
                {day}
              </Label>
            </View>
          ))}
        </Row>
        {Array.from({ length: cells.length / 7 }, (_, week) => (
          <Row key={week} style={{ gap: 0 }}>
            {cells.slice(week * 7, week * 7 + 7).map((date, i) => {
              const intensity = date && date <= today ? progress(date) : null;
              const fill =
                intensity == null
                  ? colors.background
                  : colors.heat[intensity === 0 ? 0 : Math.ceil(intensity * 4)]!;
              return (
                <View key={i} style={{ flex: 1, minWidth: 48 }}>
                  {date ? (
                    <Pressable
                      disabled={date > today}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selected === date, disabled: date > today }}
                      accessibilityLabel={`${date}, ${intensity == null ? 'no scheduled habits' : `${Math.round(intensity * 100)} percent progress`}`}
                      onPress={() => onSelect(date)}
                      style={{
                        minHeight: 48,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: date > today ? 0.3 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 38,
                          minHeight: 38,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: fill,
                          borderRadius: 8,
                          borderColor: colors.ink,
                          borderWidth: selected === date ? 2 : 0,
                        }}
                      >
                        <Label
                          variant="small"
                          style={{
                            color: calendarTextColor(fill),
                          }}
                        >
                          {Number(date.slice(-2))}
                        </Label>
                      </View>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </Row>
        ))}
      </View>
    </ScrollView>
  );
}
