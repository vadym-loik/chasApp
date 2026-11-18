import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AppState } from 'react-native';

/**
 * Calls `load` when the screen gets focus, and when the app comes back from the background.
 * Focus alone does not run after a resume, so an app that stays open overnight would show yesterday.
 */
export function useReload(load: () => void): void {
  useFocusEffect(
    useCallback(() => {
      load();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') load();
      });
      return () => subscription.remove();
    }, [load]),
  );
}
