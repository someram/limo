import { Stack } from 'expo-router';

import { usePalette } from '@/constants/theme';

export default function AppLayout() {
  const palette = usePalette();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    />
  );
}
