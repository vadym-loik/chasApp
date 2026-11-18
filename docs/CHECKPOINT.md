# Checkpoint — 18 November 2026

## State

- Latest release: **v1.2.0** (versionCode 3), Android APK on GitHub Releases.
- All work is committed and pushed to `main`.
- Checks pass: `npm run typecheck`, `npm run lint`, `npm test` (22 tests), `npx expo-doctor`.

## What the app has

- Countdowns (with monthly and yearly repeat), "days since" counters, goals.
- Year countdown card on the home screen.
- Light, dark and system themes, six accent colors.
- English, Ukrainian, French.
- Android widgets: Year, and Counter (the user chooses the counter).
- Swipe a counter card: right to edit, left to delete.
- Wide widgets put the text beside the ring or the number.
- Android reminders (`expo-notifications`). Countdowns: on the day, 1 day or 1 week before. All counters: one custom date
  (not for repeating countdowns). Each counter has its own time. The 1.2.0 global hour moves to the counters at start.
- 12 card colors.

## Build and release (Android)

### With GitHub Actions

- `.github/workflows/ci.yml`: typecheck, lint and tests on each push to `main` and each pull request.
- `.github/workflows/release.yml`: on a tag `vX.Y.Z`, builds and signs the APK and creates a **draft** release.
  Edit the notes, then publish. The tag must match `expo.version` in `app.json`.
- The secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD` and `ANDROID_KEY_ALIAS` are in the GitHub
  environment `release`. It accepts only `v*` tags. To run the workflow by hand, choose a tag, not `main`.
- The actions are pinned to commit hashes.

Steps: raise the versions (step 1 below), commit, then `git tag -a vX.Y.Z -m "Chas X.Y.Z"` and `git push origin main vX.Y.Z`.

### On this computer

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
