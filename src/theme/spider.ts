import type { TextStyle, ViewStyle } from 'react-native';
import { type CardColorKey, type Scheme, type ThemeColors } from './colors';

/** The two colors of the "glitch" effect in the Spider-Verse films: the red and blue print offset. */
export const GLITCH = { magenta: '#FF2D9A', cyan: '#00E5FF' };

/** Comic ink: the outlines and the hard shadows. */
const INK = '#111111';

// Spider-Verse colors: comic paper in light mode, a night city in dark mode.
// The accent is Spider-Man red. It has a contrast of at least 4.5:1 with white text.
const SPIDER_COLORS: Record<Scheme, ThemeColors> = {
  light: {
    background: '#FFF4DC',
    surface: '#FFFFFF',
    text: INK,
    muted: '#4A4458',
    track: '#1111111F', // ink, 12% opacity
    danger: '#B0001A',
    accent: '#D7141F',
  },
  dark: {
    background: '#0B0A1F',
    surface: '#1A1538',
    text: '#FFFFFF',
    muted: '#B8B0D9',
    track: '#FFFFFF26', // white, 15% opacity
    danger: '#FF4D6D',
    accent: '#D7141F',
  },
};

// Bright comic tints in light mode, deep neon tints in dark mode. The keys are the same as in CARD_COLORS.
const SPIDER_CARD_COLORS: Record<CardColorKey, Record<Scheme, string>> = {
  peach: { light: '#FFB199', dark: '#5A2414' },
  sun: { light: '#FFE14D', dark: '#4A3C00' },
  mint: { light: '#7FF0B2', dark: '#0E4A2E' },
  sky: { light: '#7CC8FF', dark: '#0F2F5C' },
  lilac: { light: '#C9A7FF', dark: '#3A1A6B' },
  rose: { light: '#FF9EC4', dark: '#5C0F33' },
  lime: { light: '#C8F25A', dark: '#334A0A' },
  teal: { light: '#5EE6DD', dark: '#0A4744' },
  lavender: { light: '#A9B4FF', dark: '#24296B' },
  sand: { light: '#F5D08A', dark: '#4A3618' },
  coral: { light: '#FF8A7A', dark: '#5C1414' },
  gray: { light: '#D0D0D8', dark: '#2A2838' },
};

export function getSpiderColors(scheme: Scheme): ThemeColors {
  return SPIDER_COLORS[scheme];
}

export function spiderCardColor(key: string, scheme: Scheme): string {
  const entry = SPIDER_CARD_COLORS[key as CardColorKey] ?? SPIDER_CARD_COLORS.peach;
  return entry[scheme];
}

/** Extra styles for the comic look. In the classic look, all of them are empty. */
export interface ComicStyles {
  /** A thick ink outline and a hard offset shadow, like a comic panel. */
  frame: ViewStyle;
  /** Only the ink outline, for small controls. */
  outline: ViewStyle;
  /** Bold italic text, like comic lettering. */
  heading: TextStyle;
}

export const NO_COMIC: ComicStyles = { frame: {}, outline: {}, heading: {} };

export function getComicStyles(scheme: Scheme): ComicStyles {
  // On the dark background, the shadow is the red and blue glitch offset.
  const shadow = scheme === 'dark' ? `-2px -2px 0px ${GLITCH.cyan}, 3px 3px 0px ${GLITCH.magenta}` : `4px 4px 0px ${INK}`;
  return {
    // No soft shadow: the comic shadow is hard.
    frame: { borderWidth: 2.5, borderColor: INK, boxShadow: shadow, elevation: 0, shadowOpacity: 0 },
    outline: { borderWidth: 2, borderColor: INK },
    heading: { fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.3 },
  };
}
