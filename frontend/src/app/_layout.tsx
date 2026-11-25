import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { darkPalette, lightPalette, usePalette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { ThemeProvider as AppThemeProvider, useThemeMode } from '@/providers/theme-provider';

SplashScreen.preventAutoHideAsync().catch(() => {});

function NavigationThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useThemeMode();
  const palette = colorScheme === 'light' ? lightPalette : darkPalette;
  const baseTheme = colorScheme === 'light' ? DefaultTheme : DarkTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
      primary: palette.accent,
      notification: palette.danger,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AuthProvider>
          <NavigationThemeProvider>
            <AppNavigator />
          </NavigationThemeProvider>
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { isLoading, user } = useAuth();
  const palette = usePalette();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}>
      <Stack.Protected guard={!!user} redirectTo="/welcome">
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="call/[id]"
          options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!user} redirectTo="/(app)/home">
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}