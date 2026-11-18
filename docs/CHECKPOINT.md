# Checkpoint — 17 November 2026

## State

- Latest release: **v1.1.0** (versionCode 2), Android APK on GitHub Releases.
- All work is committed and pushed to `main`.
- Checks pass: `npm run typecheck`, `npm run lint`, `npm test` (19 tests), `npx expo-doctor`.

## What the app has

- Countdowns (with monthly and yearly repeat), "days since" counters, goals.
- Year countdown card on the home screen.
- Light, dark and system themes, six accent colors.
- English, Ukrainian, French.
- Android widgets: Year, and Counter (the user chooses the counter).
- Android reminders for countdowns (`expo-notifications`): on the day, 1 day or 1 week before, at an hour from Settings.

## Build and release (Android)

Tools on this computer (not global):

- JDK 17: `mise where java@temurin-17`
- Android SDK: `~/Android/Sdk`
- Emulator profile `chas-test` (Android 16): `ANDROID_AVD_HOME=~/.config/.android/avd`

Steps:

1. Raise `expo.version` and `expo.android.versionCode` in `app.json`, and `version` in `package.json`.
2. `npx expo prebuild --platform android --clean`, then put back the `android` and `ios` scripts in `package.json` (prebuild changes them).
3. `cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a`
4. Sign with `apksigner` (put `$JAVA_HOME/bin` on `PATH`) and the release key.
5. Tag `vX.Y.Z`, push the tag, `gh release create` with the APK.

Release key: `~/.local/share/chasapp/` (keystore and password). Keep a backup. It is not in git.
Without this key, users cannot install updates over the old version.

## Known limits

- Widgets refresh every 30 minutes (Android minimum). Widgets do not work in Expo Go.
- Widget names in the Android widget list are English only.
- `npm audit`: build-time issues in `picomatch` and `minimatch` (not in the APK). Update with the next Expo SDK.
- iOS: needs a Mac or EAS Build, and an Apple Developer account to install on an iPhone.
- Reminders use inexact alarms (no `SCHEDULE_EXACT_ALARM`). Android can deliver them some minutes late.
- Repeating countdowns schedule their next reminder when the app opens or a counter changes. If the user does not open the app for a full period, the next reminder does not come.

## Ideas for next time

- Calendar view, tags, pinned counters.
- GitHub Actions to build the APK on each tag.
