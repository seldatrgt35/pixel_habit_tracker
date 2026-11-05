# Little by Little · design system

## Direction

A pocket-sized garden journal: warm ivory paper, pine ink, moss green, apricot sunlight, pale sky blue, and quiet pink. Original companion **Pip** is a small mint sprout with square cheeks, dark eyes and a crooked leaf. Pip invites another small step; missed days receive the same kindness as completed days. Never use guilt, punishment, or disappearing progress.

## Tokens and hierarchy

Centralized TypeScript tokens live under `apps/mobile/src/design`. 4-point spacing scale; 24-pixel screen gutters; 12/20-pixel panel corners; 2-pixel key outlines; restrained offset button edge. Minimum touch size 48 logical pixels. Body typography uses DM Sans; Silkscreen is reserved for short pixel labels and counters, never long paragraphs. Text stays readable at font scaling; content scrolls and layouts wrap at narrow widths.

Light: warm paper background, deep pine foreground. Dark: charcoal pine background, pale cream foreground. Habit accents use dark text on pale fills and never communicate status alone. Selection adds an outline, completion adds a check, and every cell has an accessible date/progress label.

## Components

PixelButton, PixelHabitCard, PixelProgressBar, PixelHeatmap, PixelCalendar, PixelCompanion, PixelStreakBadge, PixelStatCard, PixelEmptyState, PixelCelebration, PixelHabitIcon. Build components as needed for the preview; do not add unused placeholder abstractions. SVG pixel shapes use integer grids without raster blur. Art is original and code-native; it is not copied game art or emoji.

## Interaction

Short press feedback, 160–240 ms transitions, gentle companion breathing and a brief happy reaction after completing a target. Respect the platform's reduced-motion preference. Use calm inline validation, explicit numeric entry, reversible binary completion, and an obvious way to edit a previous day. No forced animation waiting. Screen readers receive button actions and current values. Keyboard-aware editor and safe areas on native platforms.

## Acceptance before release

VoiceOver/TalkBack, text scaling at 200%, contrast, Android back, keyboard avoidance, reduced motion, iOS and Android notifications, and device performance require manual testing. Browser QA verifies layout and common flows but cannot replace native device testing. Detailed asset principles: [docs/design-system/ART_DIRECTION.md](docs/design-system/ART_DIRECTION.md).
