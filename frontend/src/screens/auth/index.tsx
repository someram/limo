import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DecorativeHalo } from '@/components/decorative-halo';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AppText } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { usePalette, spacing } from '@/constants/theme';
import { useAuth, type AuthMode } from '@/providers/auth-provider';

type AuthScreenProps = {
  initialMode: AuthMode;
};

const modes: { value: AuthMode; label: string }[] = [
  { value: 'signin', label: 'Sign in' },
  { value: 'signup', label: 'Sign up' },
];

export function AuthScreen({ initialMode }: AuthScreenProps) {
  const { width } = useWindowDimensions();
  const { user, authenticate } = useAuth();
  const palette = usePalette();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Redirect href="/(app)/home" />;

  const isSignIn = mode === 'signin';

  async function handleSubmit() {
    if (submitting) return;

    setError(undefined);
    setSubmitting(true);

    try {
      await authenticate(email, mode);
      router.replace('/(app)/home');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setError(undefined);
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <DecorativeHalo size={width * 1.15} top={-width * 0.68} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <SegmentedControl options={modes} value={mode} onChange={handleModeChange} />

            <View style={styles.header}>
              <AppText variant="largeTitle">{isSignIn ? 'Welcome back' : 'Create an account'}</AppText>
              <AppText variant="body" color={palette.textSecondary} style={styles.subtitle}>
                {isSignIn
                  ? 'Enter your email to continue.'
                  : 'Enter your email to get started.'}
              </AppText>
            </View>

            <TextField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError(undefined);
              }}
              error={error}
              containerStyle={styles.field}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <Button
              title="Continue"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.continue}
            />

            <View style={styles.spacer} />

            <AppText variant="tiny" color={palette.textTertiary} style={styles.terms}>
              By continuing you agree to our Terms & Privacy Policy.
            </AppText>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  header: {
    marginTop: spacing.xxl + spacing.lg,
    gap: spacing.sm,
  },
  subtitle: {
    maxWidth: 280,
  },
  field: {
    marginTop: spacing.xl,
  },
  continue: {
    marginTop: spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
  terms: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
