import { Platform, TurboModuleRegistry } from 'react-native';

// The widget library throws on import when its native module is missing:
// in Expo Go, on iOS and on web. So load the widget code only when the module exists.
export const widgetsAvailable = Platform.OS === 'android' && TurboModuleRegistry.get('AndroidWidget') != null;

export const WIDGET_NAMES = { year: 'ChasYear', counter: 'ChasCounter' } as const;

export function registerWidgets(): void {
  if (!widgetsAvailable) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- load only when available
  const { register } = require('./register') as typeof import('./register');
  register();
}

/** Redraws all widgets on the home screen. Call it after counters or settings change. */
export function updateWidgets(): void {
  if (!widgetsAvailable) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- load only when available
  const { updateAll } = require('./render') as typeof import('./render');
  updateAll().catch((error: unknown) => console.warn('Widget update failed', error));
}

/** Asks the launcher to add a widget to the home screen. Android shows a confirm dialog. */
export function pinWidget(name: (typeof WIDGET_NAMES)[keyof typeof WIDGET_NAMES]): void {
  if (!widgetsAvailable) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- load only when available
  const { requestPinWidget } = require('react-native-android-widget') as typeof import('react-native-android-widget');
  requestPinWidget({ widgetName: name }).catch((error: unknown) => console.warn('Widget pin failed', error));
}
