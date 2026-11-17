import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'My counters' }} />
        <Stack.Screen name="create" options={{ title: 'New counter', presentation: 'modal' }} />
        <Stack.Screen name="[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}
