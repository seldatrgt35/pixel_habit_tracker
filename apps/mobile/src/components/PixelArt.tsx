import { useCallback } from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import type { HabitIcon } from '@little/shared-types';
import { useTheme } from '../design/theme';
import { tokens } from '../design/tokens';

export type IconName =
  | HabitIcon
  | 'home'
  | 'garden'
  | 'stats'
  | 'settings'
  | 'plus'
  | 'remove'
  | 'check'
  | 'back'
  | 'next'
  | 'spark';
const paths: Record<IconName, string> = {
  book: 'M3 4h7v2h4V4h7v15h-7v2h-4v-2H3z M5 6v11h5V8H5m9 2v7h5V6h-3v4z',
  water: 'M10 2h4v4h2v4h3v3h2v6h-2v3H5v-3H3v-6h2v-3h3V6h2z M6 15v4h3v-2H8v-2z',
  move: 'M2 7h3v3h3V5h3v14H8v-6H5v4H2z M13 10h3V7h3v10h-3v-4h-3z M21 5h2v14h-2z',
  leaf: 'M3 5h9V3h9v9h-2v4h-4v3h-4v-3H8v-3H5V9H3z M9 19h3v3H6v-3h3z',
  moon: 'M9 2h5v3h-3v9h3v3h8v3h-3v2H8v-2H5v-3H3V8h3V5h3z',
  code: 'M8 5h3v3H8v3H5v2h3v3h3v3H8v-2H5v-3H2v-4h3V7h3z M16 5h-3v3h3v3h3v2h-3v3h-3v3h3v-2h3v-3h3v-4h-3V7h-3z',
  film: 'M2 3h20v18H2z M4 5v3h3V5z M4 10v4h3v-4z M4 16v3h3v-3z M17 5v3h3V5z M17 10v4h3v-4z M17 16v3h3v-3z M9 6v12h6V6z',
  home: 'M10 2h4v3h3v3h3v3h2v3h-3v8h-6v-7h-2v7H5v-8H2v-3h2V8h3V5h3z',
  garden: 'M11 3h3v6h3V5h5v6h-4v3h-4v4h6v4H5v-4h6v-6H6V9H2V4h6v4h3z',
  stats: 'M3 14h4v8H3z M10 8h4v14h-4z M17 2h4v20h-4z',
  settings: 'M9 2h6v3h4v4h3v6h-3v4h-4v3H9v-3H5v-4H2V9h3V5h4z M9 9v6h6V9z',
  plus: 'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z',
  remove: 'M4 10h16v4H4z',
  check: 'M2 10h4v4h4v-4h4V6h4V2h4v6h-4v4h-4v4h-4v4H6v-4H2z',
  back: 'M14 3h4v4h-4v4h-4v2h4v4h4v4h-4v-2h-4v-4H6V9h4V5h4z',
  next: 'M6 3h4v2h4v4h4v6h-4v4h-4v2H6v-4h4v-4h4v-2h-4V7H6z',
  spark: 'M10 2h4v6h6v4h-6v6h-4v-6H4V8h6z M19 17h3v3h-3z M3 20h3v3H3z',
};
export function PixelIcon({
  name,
  size = 22,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path d={paths[name]} fill={color ?? colors.ink} fillRule="evenodd" />
    </Svg>
  );
}
export function PixelHabitIcon({ name, color }: { name: HabitIcon; color: string }) {
  return <PixelIcon name={name} size={26} color={color} />;
}
function Pip({ happy = false }: { happy?: boolean }) {
  return (
    <G>
      <Path d="M15 3h3v5h-3z M17 1h7v3h-3v3h-4z" fill="#46794A" />
      <Path d="M8 3h6v2h3v4h-5V7H8z" fill="#8CB868" />
      <Path d="M9 9h15v3h3v3h2v10h-3v3H7v-3H4V15h2v-3h3z" fill="#35624B" />
      <Path d="M9 12h15v3h2v9h-3v2H9v-2H7V15h2z" fill="#B8D99F" />
      <Rect x="10" y="13" width="11" height="3" fill="#D6EABE" />
      {happy ? (
        <Path d="M10 18v-2h4v2h-1v-1h-2v1z M19 18v-2h4v2h-1v-1h-2v1z" fill="#293D32" />
      ) : (
        <Path d="M11 17h2v3h-2z M20 17h2v3h-2z" fill="#293D32" />
      )}
      <Path d={happy ? 'M14 20h5v2h-1v1h-3v-1h-1z' : 'M15 21h4v1h-4z'} fill="#293D32" />
      <Path d="M8 21h3v2H8z M23 21h3v2h-3z" fill="#EBAB95" />
      <Path d="M8 28h5v2H7v-2z M21 28h5v2h-6v-2z" fill="#35624B" />
      {happy && (
        <Path d="M0 8h2V6h2v2h2v2H4v2H2v-2H0z M29 2h2v2h2v2h-2v2h-2V6h-2V4h2z" fill="#DFA454" />
      )}
    </G>
  );
}
export function PixelCompanion({ happy = false, size = 108 }: { happy?: boolean; size?: number }) {
  const offset = useSharedValue(0);
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const animate = (reduced: boolean) => {
        cancelAnimation(offset);
        offset.value = 0;
        if (!reduced)
          offset.value = withRepeat(withTiming(-4, { duration: tokens.motion.breathe }), -1, true);
      };
      void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (mounted) animate(reduced);
      });
      const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', animate);
      return () => {
        mounted = false;
        subscription.remove();
        cancelAnimation(offset);
      };
    }, [offset]),
  );
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  return (
    <Animated.View style={style} accessible={false}>
      <Svg width={size} height={size} viewBox="0 0 34 34">
        <Pip happy={happy} />
      </Svg>
    </Animated.View>
  );
}
export function GardenLandscape({ height = 140 }: { height?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width="100%" height={height} viewBox="0 0 320 140" accessible={false}>
      <Path
        d="M0 96h24V84h28v8h24v-8h32v12h24V84h32v8h32V80h36v8h28V76h28v12h32v52H0z"
        fill="#D1DFBD"
      />
      <Path d="M0 114h36v-6h28v10h48v-10h28v8h44v-12h36v8h32v-10h40v12h28v26H0z" fill="#ADC58F" />
      <Path d="M44 104v-8h4v8h8v4H36v-4z M266 100v-8h4v8h8v4h-20v-4z" fill="#6F9759" />
      <Path d="M40 88h12v4H40z M44 84h4v12h-4z" fill="#F1C683" />
      <Path d="M262 84h12v4h-12z M266 80h4v12h-4z" fill="#E5B3B2" />
      <Path d="M128 124h56v4h-56z M140 112h32v4h-32z M145 104h24v4h-24z" fill="#EADBC0" />
      <Rect x="278" y="20" width="16" height="16" fill="#EBC789" />
      <Path d="M26 30h16v-4h12v4h8v8H20v-4h6z M206 48h12v-4h16v4h8v6h-36z" fill={colors.surface} />
    </Svg>
  );
}
