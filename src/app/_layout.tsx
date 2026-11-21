import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '../AppProvider';
import { useReminders } from '../services/reminders';

export default function RootLayout() {
  return (
    // Swipe actions on the counter cards need the gesture handler root.
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <AppStack />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

function AppStack() {
  const { colors, comic, scheme, spider, t } = useApp();
  useReminders();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, ...comic.heading },
          // The Spider-Verse look uses a fast jump up from the bottom, like a new comic panel.
          animation: spider ? 'fade_from_bottom' : 'default',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: t.settings }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
