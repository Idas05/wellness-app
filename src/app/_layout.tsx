import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FAF7F2' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#FAF7F2' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Reminders' }} />
      </Stack>
    </>
  );
}
