import type { TextStyle } from 'react-native';

import { useThemeMode } from '@/providers/theme-provider';

const darkPalette = {
  background: '#0A0A0A',
  decorative: '#141414',
  surface: '#171717',
  surfaceMuted: '#1A1A1A',
  surfaceStrong: '#242426',
  border: '#262626',
  borderStrong: '#34343A',
  text: '#F7F7F8',
  textSecondary: '#9A9AA0',
  textTertiary: '#6C6C72',
  accent: '#FFFFFF',
  onAccent: '#0A0A0A',
  online: '#3DDC84',
  offline: '#7C7C82',
  busy: '#F5A623',
  danger: '#FF453A',
  success: '#34C759',
} as const;

const lightPalette = {
  background: '#FAFAFA',
  decorative: '#F0F0F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  surfaceStrong: '#E8E8E8',
  border: '#E0E0E0',
  borderStrong: '#D0D0D0',
  text: '#1A1A1A',
  textSecondary: '#6C6C72',
  textTertiary: '#9A9AA0',
  accent: '#000000',
  onAccent: '#FFFFFF',
  online: '#30B060',
  offline: '#9A9AA0',
  busy: '#E08010',
  danger: '#FF3B30',
  success: '#30D158',
} as const;

type PaletteKeys = keyof typeof darkPalette;

export type Palette = {
  [K in PaletteKeys]: (typeof darkPalette)[K] | (typeof lightPalette)[K];
};

export function usePalette(): Palette {
  const { colorScheme } = useThemeMode();
  return colorScheme === 'light' ? lightPalette : darkPalette;
}

export { darkPalette as palette };
export { darkPalette, lightPalette };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '700' },
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  tiny: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
  button: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof typography;

export const statusColors = {
  online: darkPalette.online,
  offline: darkPalette.offline,
  busy: darkPalette.busy,
} as const;

export const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
} as const;