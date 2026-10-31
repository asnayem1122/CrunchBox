import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../localization/i18n';
import { useAppStore } from '../store/useAppStore';
import { getThemeTokens } from '../utils/themeTokens';
import { HardwareErrorBoundary } from '../components/chassis/HardwareErrorBoundary';

export default function RootLayout() {
  const themeMode = useAppStore((state) => state.themeMode);
  const tokens = getThemeTokens(themeMode);

  return (
    <HardwareErrorBoundary>
      <SafeAreaProvider>
        <StatusBar
          translucent={false}
          style={themeMode === 'tactical' ? 'light' : 'dark'}
          backgroundColor={tokens.chassisSurface}
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
              presentation: Platform.OS === 'android' ? 'card' : 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: Platform.OS === 'android' ? 'card' : 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </HardwareErrorBoundary>
  );
}
