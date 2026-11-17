# chasApp

A free, ad-free countdown and habit tracker for Android and iOS (in the style of Days Left).
Built with React Native, Expo and Expo Router.

## Features

- **Days left** — countdown to a target date, with a progress bar.
- **Days passed** — count days since a start date (habits such as "No sugar"). You can reset it.
- **Goal progress** — track a value from a start value to a target value (for example, weight 88 → 80).
- Pastel, minimal cards with an emoji and a color.
- All data stays on the device (AsyncStorage).
- Support the developer with Buy Me a Coffee (Settings screen).

## Run

```bash
npm install
npm start          # then scan the QR code with Expo Go
npm run web        # run in a browser
```

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Project structure

```
src/
├── app/            # Screens (Expo Router)
│   ├── _layout.tsx # Stack navigator
│   ├── index.tsx   # Counter list
│   ├── create.tsx  # Create a counter
│   ├── [id].tsx    # Details, reset, update, delete
│   └── settings.tsx# Donate button
├── components/     # UI: cards, progress bar, buttons, fields
├── models/         # TypeScript types
├── services/       # Storage (AsyncStorage)
└── utils/          # Day and percent calculations
```

## Roadmap

- Home screen widgets (react-native-android-widget, WidgetKit). They need a development build.
- GitHub Actions: build an `.apk` on each release.
