import { Alert, Platform } from 'react-native';

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
