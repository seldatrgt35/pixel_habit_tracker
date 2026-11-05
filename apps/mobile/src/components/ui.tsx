import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../design/theme';
import { tokens } from '../design/tokens';
import { PixelCompanion, PixelIcon, type IconName } from './PixelArt';

export function Label({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: 'body' | 'small' | 'pixel' | 'title' | 'heading' }) {
  const { colors } = useTheme();
  return (
    <Text
      {...props}
      style={[
        {
          color: colors.ink,
          fontFamily: tokens.font.body,
          fontSize: 16,
          lineHeight: 24,
          flexShrink: 1,
        },
        textStyles[variant],
        style,
      ]}
    />
  );
}
const textStyles = StyleSheet.create({
  body: {},
  small: { fontSize: 13, lineHeight: 20 },
  pixel: { fontFamily: tokens.font.pixel, fontSize: 11, lineHeight: 18, letterSpacing: 0.4 },
  title: { fontFamily: tokens.font.bold, fontSize: 32, lineHeight: 38, letterSpacing: -1 },
  heading: { fontFamily: tokens.font.bold, fontSize: 20, lineHeight: 28, letterSpacing: -0.4 },
});
export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            {
              width: '100%',
              maxWidth: tokens.size.content,
              alignSelf: 'center',
              padding: 24,
              gap: 24,
              paddingBottom: 40,
            },
            style,
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export function Row({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>{children}</View>
  );
}
export function Panel({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderWidth: 1,
          borderRadius: tokens.radius.panel,
          padding: 20,
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function PixelButton({
  label,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { colors, dark } = useTheme();
  const foreground = secondary ? colors.ink : dark ? colors.background : '#FFFFFF';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: compact ? 12 : 20,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: secondary ? colors.mossSoft : colors.moss,
        borderWidth: 1,
        borderColor: secondary ? colors.line : colors.moss,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        transform: [{ translateY: pressed ? 2 : 0 }],
      })}
    >
      <Row style={{ justifyContent: 'center', gap: 8 }}>
        {icon && <PixelIcon name={icon} color={foreground} size={18} />}
        <Label style={{ color: foreground, fontFamily: tokens.font.bold, fontSize: 14 }}>
          {label}
        </Label>
      </Row>
    </Pressable>
  );
}
export function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 48,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        backgroundColor: pressed ? colors.line : colors.mossSoft,
        opacity: disabled ? 0.35 : 1,
      })}
    >
      <PixelIcon name={icon} size={18} />
    </Pressable>
  );
}
export function PixelProgressBar({
  value,
  color,
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  const { colors } = useTheme();
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Daily progress'}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={{ height: 10, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' }}
    >
      <View
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: color ?? colors.moss,
          borderRadius: 2,
        }}
      />
    </View>
  );
}
export function PixelStreakBadge({ days }: { days: number }) {
  const { colors } = useTheme();
  return (
    <Row
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.peach,
        borderRadius: 12,
        gap: 6,
      }}
    >
      <PixelIcon name="spark" size={16} />
      <Label variant="small" style={{ fontFamily: tokens.font.bold }}>
        {days} day{days === 1 ? '' : 's'}
      </Label>
    </Row>
  );
}
export function PixelStatCard({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  const { colors } = useTheme();
  return (
    <Panel style={{ flex: 1, minWidth: 135 }}>
      <Label variant="pixel" style={{ color: colors.muted }}>
        {label}
      </Label>
      <Label variant="title">{value}</Label>
      {hint && (
        <Label variant="small" style={{ color: colors.muted }}>
          {hint}
        </Label>
      )}
    </Panel>
  );
}
export function PixelEmptyState({
  title = 'A little beginning.',
  body = 'Plant one small habit. Pip will keep you company.',
  action,
}: {
  title?: string;
  body?: string;
  action?: () => void;
}) {
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: 32 }}>
      <PixelCompanion />
      <Label variant="heading">{title}</Label>
      <Label style={{ textAlign: 'center' }}>{body}</Label>
      {action && <PixelButton label="Plant a habit" onPress={action} icon="plus" />}
    </Panel>
  );
}
export function PixelCelebration({ visible }: { visible: boolean }) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <Row style={{ backgroundColor: colors.mossSoft, padding: 12, borderRadius: 12 }}>
      <PixelIcon name="spark" />
      <Label accessibilityLiveRegion="polite" style={{ flex: 1 }}>
        A small step, a little growth. Nicely done!
      </Label>
    </Row>
  );
}
export function LoadingGarden() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.moss} accessibilityLabel="Opening your garden" />
      <Label>Opening your little garden…</Label>
    </View>
  );
}
