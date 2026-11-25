import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AppText } from '@/components/ui/text';
import { usePalette, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { useThemeMode, type ThemeMode } from '@/providers/theme-provider';

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const palette = usePalette();
  const { mode, setMode } = useThemeMode();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerTitleStyle: { color: palette.text, fontSize: 17, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Avatar name={user?.name ?? 'User'} color={palette.accent} size={88} />
            <AppText variant="title" style={styles.name}>
              {user?.name ?? 'User'}
            </AppText>
            <AppText variant="subhead" color={palette.textSecondary} style={styles.email}>
              {user?.email ?? ''}
            </AppText>
          </View>

          <View style={[styles.section, { borderColor: palette.border }]}>
            <AppText variant="caption" color={palette.textSecondary} style={styles.sectionTitle}>
              Appearance
            </AppText>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <AppText variant="body">Theme</AppText>
              </View>
              <Select
                value={mode}
                onChange={setMode}
                accessibilityLabel="Theme"
                options={themeOptions}
              />
            </View>
          </View>

          <View style={[styles.section, { borderColor: palette.border }]}>
            <AppText variant="caption" color={palette.textSecondary} style={styles.sectionTitle}>
              Account
            </AppText>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <AppText variant="body">Username</AppText>
                <AppText variant="caption" color={palette.textTertiary}>
                  {user?.name ?? 'User'}
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <AppText variant="body">Email</AppText>
                <AppText variant="caption" color={palette.textTertiary}>
                  {user?.email ?? ''}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Button
              title="Sign out"
              onPress={handleSignOut}
              variant="danger"
              style={styles.signOutButton}
            />
            <AppText variant="tiny" color={palette.textTertiary} style={styles.version}>
              Limo v1.0.0
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  name: {
    marginTop: spacing.sm,
  },
  email: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -spacing.md,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  signOutButton: {
    width: '100%',
    maxWidth: 320,
  },
  version: {
    marginBottom: spacing.xs,
  },
});
