import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../localization/i18n';
import { useAppStore } from '../store/useAppStore';
import { getThemeTokens } from '../utils/themeTokens';

export default function RootLayout() {
  const themeMode = useAppStore((state) => state.themeMode);
  const tokens = getThemeTokens(themeMode);

  return (
    <SafeAreaProvider>
      <StatusBar
        style={themeMode === 'tactical' ? 'light' : 'dark'}
        backgroundColor={tokens.appBackground}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.appBackground },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="currency-picker"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
