# Checkpoint — 18 November 2026

## State

- Latest release: **v1.4.0** (versionCode 5), Android APK on GitHub Releases. The release workflow built it.
- All work is committed and pushed to `main`. The release commit is `3b04307`, the tag is `v1.4.0`.
- Checks pass: `npm run typecheck`, `npm run lint`, `npm test` (32 tests), `npx expo-doctor` (20/20).
- CI and the release workflow pass on GitHub.

## Releases

| Version | versionCode | Changes |
|---|---|---|
| 1.0.0 | 1 | First release |
| 1.1.0 | 2 | Android widgets, fewer permissions |
| 1.2.0 | 3 | Reminders for countdowns, swipe to edit or delete, wide widgets |
| 1.3.0 | 4 | Reminder date and time for all counters, 12 card colors, year in the date, new year card |
| 1.4.0 | 5 | Backup and restore, 3 reminders ahead for repeating events, better contrast, bug fixes |

## What the app has

- Countdowns (with monthly and yearly repeat), "days since" counters, goals.
- Home screen: the date with the year, and a year card (ring, days left and weekends left side by side, day of the year).
- Swipe a counter card: right to edit, left to delete (with a confirm dialog).
- 12 card colors. Light, dark and system themes, six accent colors.
- English, Ukrainian, French.
- Android widgets: Year, and Counter (the user chooses the counter). Wide widgets put the text beside the ring or the number.
- Android reminders (`expo-notifications`):
  - Countdowns: on the day, 1 day or 1 week before.
  - All counters: one custom date ("Choose a date"). Not for repeating countdowns.
  - Each counter has its own time (default 09:00).
  - Tap the notification to open the counter.
- Backup (Android and iOS, not web): Settings → Export counters makes a JSON file and opens the share sheet.
  Import counters adds the counters from a file. It never deletes a counter. A counter with the same id gets the version from the file.

## Where the code is

- `src/app/`: screens (Expo Router). `index` home, `[id]` details, `edit` form, `settings`.
- `src/models/counter.ts`: one type for each counter type (`CountdownCounter`, `SinceCounter`, `GoalCounter`).
  `toCounter()` reads saved data and fills missing fields with defaults, so old counters do not get lost.
- `src/utils/counter.ts`: all date and counter logic, with tests in `counter.test.ts`. Reminder dates: `getNextReminders()`.
- `src/models/backup.ts`: the backup file format and the import merge, with tests in `backup.test.ts`.
  `src/services/backup.ts`: the file and the share sheet (`expo-file-system`, `expo-sharing`).
- `src/services/storage.ts`: AsyncStorage. Each save updates the widgets and the reminders. All changes run in one queue.
  `migrateReminderHour()` moves the 1.2.0 global reminder hour to the counters.
- `src/services/reminders.ts`: schedules notifications. It cancels all and schedules again after each change (one queue).
- `src/widgets/`: Android widgets. The widget renderer does not support React fragments (`<>`).
- `src/i18n/strings.ts`: all text. `t.daysLeft(n)` and `t.weekendsLeft(n)` give only the label, not the number.
- `src/i18n/deviceStrings.ts`: `getStrings(settings)` for code outside React (reminders, widgets).
  It is not in `strings.ts`, because the Node tests cannot load `expo-localization`.
- `src/hooks/useReload.ts`: reloads a screen on focus and when the app comes back from the background.
- `src/theme/colors.ts`: each accent must have a contrast of at least 4.5:1 with white text (buttons use white text).
- `src/components/DateField.tsx`: a small date or time button for a form row (`mode="time"`), with a web version.
  iOS uses the native compact picker.
- Edit form (not released yet): `CardEditor` is the card with the name field, the icon button and the colors under it.
  `FormGroup` and `FormRow` join the date, the repeat and the reminder in one panel.
- Settings (not released yet): the same `FormGroup` panels. Appearance (theme, accent, language as chips),
  Widgets and Backup use `ActionRow` (a tappable row). The logo and the version are at the bottom.
- Calendar (not released yet): `src/services/calendar.ts` reads events with `expo-calendar` (read only,
  `WRITE_CALENDAR` is blocked). `src/utils/calendar.ts` turns them into choices, with tests in `calendar.test.ts`.
  `CalendarEventPicker` is the list. Monthly and yearly events become repeating countdowns.

## Rules for the code

- Tests run with Node (`src/utils/*.test.ts`). Node cannot load Expo or React Native modules.
  Put logic that needs tests in `src/models/` or `src/utils/`, without native imports.
- Read saved counters only through `getCounters()`. It uses `toCounter()` to repair old data.
- `updateCounter()` takes the whole counter, not a partial change, so the types stay strict.
- Write new storage changes inside `queued()` in `storage.ts`.
- Release notes: the same sections as 1.3.0 and 1.4.0, in simple English, and an "Install" section at the end.

## Build and release (Android)

### With GitHub Actions (normal way)

1. Raise `expo.version` and `expo.android.versionCode` in `app.json`, and `version` in `package.json`.
   Then `npm install --package-lock-only`.
2. Commit, then `git tag -a vX.Y.Z -m "Chas X.Y.Z"` and `git push origin main vX.Y.Z`.
3. The release workflow builds and signs the APK (about 15 minutes) and creates a **draft** release.
4. Write the notes (`gh release edit vX.Y.Z --notes-file ...`), then publish (`gh release edit vX.Y.Z --draft=false --latest`).

Details:

- `.github/workflows/ci.yml`: typecheck, lint and tests on each push to `main` and each pull request.
- `.github/workflows/release.yml`: the tag must match `expo.version` in `app.json`.
- The secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD` and `ANDROID_KEY_ALIAS` are in the GitHub
  environment `release`. It accepts only `v*` tags. To run the workflow by hand, choose a tag, not `main`.
- The actions are pinned to commit hashes. To update an action, change the hash and the version comment together.

### On this computer (backup way)

Tools (not global):

- JDK 17: `mise where java@temurin-17`
- Android SDK: `~/Android/Sdk` (build-tools 37.0.0)
- Emulator profile `chas-test` (Android 16): `ANDROID_AVD_HOME=~/.config/.android/avd`

Steps:

1. Raise the versions (as above).
2. `CI=1 npx expo prebuild --platform android --clean`, then put back the `android` and `ios` scripts in `package.json` (prebuild changes them).
3. `cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a`
4. Sign with `apksigner` (put `$JAVA_HOME/bin` on `PATH`) and the release key.
5. Tag `vX.Y.Z`, push the tag, `gh release create` with the APK.

Release key: `~/.local/share/chasapp/` (keystore and password). Keep a backup. It is not in git.
Without this key, users cannot install updates over the old version.
Certificate SHA-256: `8927b7fc…48e89b93`. Each new APK must have the same one.

## Not yet tested on a phone

These parts pass the checks, but nobody has used them on a device yet:

- Reminders: the notification, the tap that opens the counter, the custom date, the time picker.
- The move of the 1.2.0 reminder hour to the counters.
- Swipe to edit or delete.
- The new year card and the wide widgets.
- Not released: the calendar event list (permission, all-day dates, birthdays), the new edit form on Android and iOS.
- 1.4.0: backup export and import (the share sheet and the file picker), the bar behind the status bar,
  the reload after the app comes back from the background, 3 reminders ahead for repeating countdowns.

## Known limits

- Widgets refresh every 30 minutes (Android minimum). Widgets do not work in Expo Go.
- Widget names in the Android widget list are English only.
- `npm audit`: build-time issues in `picomatch` and `minimatch` (not in the APK). Update with the next Expo SDK.
- iOS: needs a Mac or EAS Build, and an Apple Developer account to install on an iPhone. Reminders are Android only.
- Reminders use inexact alarms (no `SCHEDULE_EXACT_ALARM`). Android can deliver them some minutes late.
- Repeating countdowns schedule their next 3 reminders when the app opens or a counter changes.
  If the user does not open the app for 3 full periods, the next reminder does not come.
- A custom reminder comes only once. There is no repeating reminder (for example, each week for a goal).
- Swipe actions have no screen reader support. The details screen still has edit and delete.
- A backup has only the counters. It does not have the settings or the widget choices.
- The README screenshots show the old accent colors (before 1.4.0). Do not change them without the owner's approval.

## Ideas for next time

- Add a screenshot of the reminder options to the README (from a phone; the web build has no reminders).
- Repeating reminders, for example each week to update a goal.
- Calendar view, tags, pinned counters.
- Settings in the backup file (the format has a `version` field for this change).
