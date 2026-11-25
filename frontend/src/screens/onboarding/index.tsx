import { router } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DecorativeHalo } from '@/components/decorative-halo';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { usePalette, spacing } from '@/constants/theme';

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const palette = usePalette();

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <DecorativeHalo size={width * 1.02} top={-width * 0.37} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.hero, { marginTop: width * 0.35 }]}>
          <View style={[styles.logo, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
            <AppText style={styles.logoLetter}>L</AppText>
          </View>

          <AppText variant="display" style={styles.title}>
            Limo
          </AppText>
          <AppText variant="body" color={palette.textSecondary}>
            Video calls, beautifully simple.
          </AppText>

          <View style={[styles.dash, { backgroundColor: palette.borderStrong }]} />
        </View>

        <View style={styles.spacer} />

        <Button
          title="Get started"
          onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })}
        />

        <View style={styles.footer}>
          <AppText variant="subhead" color={palette.textSecondary}>
            Already have an account?
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            hitSlop={8}
            onPress={() => router.push({ pathname: '/auth', params: { mode: 'signin' } })}>
            <AppText variant="subhead" style={[styles.signIn, { color: palette.text }]}>
              Sign in
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '500',
  },
  title: {
    marginTop: spacing.sm + 4,
  },
  dash: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginTop: spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  signIn: {
    fontWeight: '600',
  },
});