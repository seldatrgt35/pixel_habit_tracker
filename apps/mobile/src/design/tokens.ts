export const tokens = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 },
  radius: { small: 8, panel: 20, button: 12 },
  border: { hairline: 1, pixel: 2 },
  size: { touch: 48, icon: 24, content: 720 },
  font: {
    body: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    bold: 'DMSans_700Bold',
    pixel: 'Silkscreen_400Regular',
  },
  motion: { press: 160, celebrate: 900, breathe: 2200 },
};
const light = {
  background: '#FAF8F0',
  surface: '#FFFFFF',
  ink: '#293D32',
  muted: '#647365',
  line: '#DFE5D8',
  moss: '#517C42',
  mossSoft: '#E9F0DE',
  sky: '#DCECF4',
  peach: '#FAE4C9',
  rose: '#F5DFE5',
  garden: '#EAF1DF',
  soil: '#C3AA81',
  danger: '#A43E3E',
  heat: ['#E9EDE4', '#D0E2B7', '#A3C97F', '#74A154', '#476E36'],
};
const dark: typeof light = {
  background: '#19271F',
  surface: '#23352B',
  ink: '#EDF2E5',
  muted: '#B1C2AC',
  line: '#415447',
  moss: '#A4CB85',
  mossSoft: '#344B2C',
  sky: '#304D5C',
  peach: '#59452D',
  rose: '#583B45',
  garden: '#293F2B',
  soil: '#715F43',
  danger: '#F7A6A1',
  heat: ['#334438', '#455E39', '#60834B', '#86AE65', '#B2D88E'],
};
export const palettes = { light, dark };
export type Palette = typeof light;
