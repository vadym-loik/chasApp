import { Alert, Platform } from 'react-native';

// Alert.alert has no buttons on web, so use window.confirm there.
export function confirm(title: string, message: string, onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', style: 'destructive', onPress: onConfirm },
  ]);
}
