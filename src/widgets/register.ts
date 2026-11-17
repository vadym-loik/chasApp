import {
  registerWidgetConfigurationScreen,
  registerWidgetTaskHandler,
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';
import { setWidgetCounterId } from '../services/storage';
import { WidgetConfigScreen } from './ConfigScreen';
import { renderWidget } from './render';

/** Android calls this when a widget is added, resized, updated or removed. */
async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(await renderWidget(props.widgetInfo));
      break;
    case 'WIDGET_DELETED':
      await setWidgetCounterId(props.widgetInfo.widgetId, undefined);
      break;
  }
}

export function register(): void {
  registerWidgetTaskHandler(widgetTaskHandler);
  registerWidgetConfigurationScreen(WidgetConfigScreen);
}
