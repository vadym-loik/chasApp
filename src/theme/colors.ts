export type Scheme = 'light' | 'dark';

export const ACCENTS = {
  coral: '#EE5D3F',
  indigo: '#5B5FE0',
  teal: '#0F9D8A',
  amber: '#D98E04',
  rose: '#E04F7D',
  violet: '#8B55D6',
};
export type AccentKey = keyof typeof ACCENTS;
export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

export const BASE_COLORS = {
  light: {
    background: '#F7F5F2',
    surface: '#FFFFFF',
    text: '#1C1B1F',
    muted: '#6E6A75',
    track: '#00000014', // black, 8% opacity
    danger: '#D93F3F',
  },
  dark: {
    background: '#141218',
    surface: '#211F26',
    text: '#F4F2F7',
    muted: '#A09AAB',
    track: '#FFFFFF1F', // white, 12% opacity
    danger: '#FF6B6B',
  },
};
export type BaseColors = (typeof BASE_COLORS)['light'];
export type ThemeColors = BaseColors & { accent: string };

export function getThemeColors(scheme: Scheme, accent: AccentKey): ThemeColors {
  return { ...BASE_COLORS[scheme], accent: ACCENTS[accent] };
}

// Card colors have a soft tint in light mode and a deep tint in dark mode.
export const CARD_COLORS = {
  peach: { light: '#FFE3D6', dark: '#3D2A23' },
  sun: { light: '#FFF1C2', dark: '#3A3320' },
  mint: { light: '#D5F2E3', dark: '#1F3329' },
  sky: { light: '#D6E9FF', dark: '#1F2C3D' },
  lilac: { light: '#E7DEFF', dark: '#2C2540' },
  rose: { light: '#FFDCE6', dark: '#3D2230' },
};
export type CardColorKey = keyof typeof CARD_COLORS;
export const CARD_COLOR_KEYS = Object.keys(CARD_COLORS) as CardColorKey[];

export function cardColor(key: string, scheme: Scheme): string {
  const entry = CARD_COLORS[key as CardColorKey] ?? CARD_COLORS.peach;
  return entry[scheme];
}
