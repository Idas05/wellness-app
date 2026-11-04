import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthSheet } from '../components/AuthSheet';
import { AppProvider, useApp } from '../lib/store';

function GlobalSheets() {
  const { authOpen, setAuthOpen } = useApp();
  return <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAF7F2' } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <GlobalSheets />
    </AppProvider>
  );
}
