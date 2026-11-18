import { Alert, Platform } from 'react-native';
import type { Strings } from '../i18n/strings';
import type { CounterItem } from '../models/counter';
import { deleteCounter } from '../services/storage';

interface ConfirmOptions {
  title: string;
  message: string;
  action: string; // label of the confirm button
  cancel: string; // label of the cancel button
}

// Alert.alert has no buttons on web, so use window.confirm there.
export function confirm({ title, message, action, cancel }: ConfirmOptions, onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);
}

/** Asks the user, then deletes the counter and calls `onDeleted`. */
export function confirmDelete(item: CounterItem, t: Strings, onDeleted: () => void): void {
  confirm({ title: t.deleteTitle, message: t.deleteMessage(item.title), action: t.delete, cancel: t.cancel }, async () => {
    await deleteCounter(item.id);
    onDeleted();
  });
}
