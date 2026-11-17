import * as Linking from 'expo-linking';
import { getLocales } from 'expo-localization';
import type { ReactElement } from 'react';
import { requestWidgetUpdate, type WidgetInfo, type WidgetRepresentation } from 'react-native-android-widget';
import { resolveLanguage, STRINGS } from '../i18n/strings';
import { getCounters, getSettings, getWidgetCounterId } from '../services/storage';
import { cardColor, getThemeColors, type Scheme } from '../theme/colors';
import { groupCounters, today } from '../utils/counter';
import { WIDGET_NAMES } from './index';
import { CounterWidget, YearWidget } from './widgets';

/** Builds a widget with the saved settings. With the system theme, Android gets a light and a dark version. */
export async function renderWidget(info: WidgetInfo): Promise<WidgetRepresentation> {
  const settings = await getSettings();
  const t = STRINGS[resolveLanguage(settings.language, getLocales()[0]?.languageCode)];
  const now = today();
  const size = { t, width: info.width, height: info.height, now };

  let draw: (scheme: Scheme) => ReactElement;
  if (info.widgetName === WIDGET_NAMES.counter) {
    const id = await getWidgetCounterId(info.widgetId);
    const items = await getCounters();
    // Without a chosen (or with a deleted) counter, show the first one from the home screen: the nearest event.
    const item = items.find((c) => c.id === id) ?? groupCounters(items, now)[0]?.data[0];
    draw = (scheme) => (
      <CounterWidget
        {...size}
        item={item}
        colors={getThemeColors(scheme, settings.accent)}
        background={item ? cardColor(item.color, scheme) : getThemeColors(scheme, settings.accent).surface}
        link={Linking.createURL(item ? `/${item.id}` : '/')}
      />
    );
  } else {
    draw = (scheme) => <YearWidget {...size} colors={getThemeColors(scheme, settings.accent)} />;
  }

  return settings.mode === 'system' ? { light: draw('light'), dark: draw('dark') } : draw(settings.mode);
}

export async function updateAll(): Promise<void> {
  for (const widgetName of Object.values(WIDGET_NAMES)) {
    await requestWidgetUpdate({ widgetName, renderWidget });
  }
}
