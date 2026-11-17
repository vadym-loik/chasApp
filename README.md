# Chas

<img src="assets/icon.png" width="96" alt="Chas logo" />

**Chas** (from the Ukrainian word «час», "time") is a free, ad-free app that counts days to events, days since events, and progress to goals.
It runs on Android and iOS. Built with React Native, Expo and Expo Router.

## Features

- **Countdown** — days left until a date, with a progress bar.
- **Days since** — count days since a date, for habits. You can start again from today.
- **Goal** — progress from a start value to a target value, for example weight 88 → 80.
- Create and edit counters with a live preview, emoji and card colors.
- Native date picker on Android and iOS.
- Light, dark and system themes, and six accent colors.
- English, Ukrainian and French. The app follows the phone language, or you can choose one in Settings.
- All data stays on the device (AsyncStorage).

## Run

```bash
npm install
npm start          # scan the QR code with Expo Go on Android or iOS
npm run android    # open in an Android emulator or a connected device
npm run ios        # open in the iOS simulator (macOS only)
```

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Logo

`scripts/generate-icons.sh` generates all icons (app icon, Android adaptive icon, splash, favicon) from one SVG design.
It needs `rsvg-convert`.

## Project structure

```
src/
├── app/            # Screens (Expo Router)
│   ├── _layout.tsx # Theme and stack navigator
│   ├── index.tsx   # Counter list
│   ├── edit.tsx    # Create or edit a counter
│   ├── [id].tsx    # Counter details
│   └── settings.tsx# Language, theme, accent color, support
├── components/     # UI parts
├── models/         # TypeScript types
├── i18n/           # Translations (en, uk, fr)
├── services/       # Storage (AsyncStorage)
├── theme/          # Colors
├── utils/          # Day and percent calculations
└── AppProvider.tsx # Settings, theme and language for all screens
```

## Roadmap

- Home screen widgets. They need a development build.
- GitHub Actions: build an `.apk` on each release.
