export type Scheme = 'light' | 'dark';

// Buttons show white text on the accent, so each accent has a contrast of at least 4.5:1 with white (WCAG AA).
export const ACCENTS = {
  coral: '#C94F35',
  indigo: '#5B5FE0',
  teal: '#0D8575',
  amber: '#A36A03',
  rose: '#CA4770',
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
  lime: { light: '#E6F5C9', dark: '#2C3420' },
  teal: { light: '#CFF0EE', dark: '#1C3332' },
  lavender: { light: '#DCE0FF', dark: '#24273F' },
  sand: { light: '#F1E6D6', dark: '#353026' },
  coral: { light: '#FFD6D1', dark: '#3D2522' },
  gray: { light: '#E6E6EA', dark: '#2A2A30' },
};
export type CardColorKey = keyof typeof CARD_COLORS;
export const CARD_COLOR_KEYS = Object.keys(CARD_COLORS) as CardColorKey[];

export function cardColor(key: string, scheme: Scheme): string {
  const entry = CARD_COLORS[key as CardColorKey] ?? CARD_COLORS.peach;
  return entry[scheme];
}
