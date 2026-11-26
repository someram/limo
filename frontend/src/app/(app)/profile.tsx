import { Stack } from 'expo-router';
import { StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
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
  const { user, signOut, updateUser } = useAuth();
  const palette = usePalette();
  const { mode, setMode } = useThemeMode();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');

  async function handleSignOut() {
    await signOut();
  }

  async function handleSaveName() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === user?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateUser(trimmed);
      setIsEditingName(false);
    } catch (error) {
      console.warn('[profile] Failed to update name', error);
    }
  }

  function handleCancelEditName() {
    setEditName(user?.name ?? '');
    setIsEditingName(false);
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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
                <AppText variant="body">Name</AppText>
                {isEditingName ? (
                  <TextInput
                    style={[styles.editInput, { color: palette.text, textAlign: 'right', marginTop: 2 }]}
                    value={editName}
                    onChangeText={setEditName}
                    onBlur={handleSaveName}
                    onSubmitEditing={handleSaveName}
                    autoFocus
                    maxLength={50}
                    returnKeyType="done"
                  />
                ) : (
                  <AppText variant="body" color={palette.text} style={styles.nameDisplay}>
                    {user?.name ?? 'User'}
                  </AppText>
                )}
              </View>
              <IconButton
                name={isEditingName ? { ios: 'xmark', android: 'close' } : { ios: 'pencil', android: 'edit' }}
                label={isEditingName ? 'Cancel' : 'Edit name'}
                variant="ghost"
                size={32}
                iconSize={16}
                onPress={isEditingName ? handleCancelEditName : () => setIsEditingName(true)}
                style={styles.editButton}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

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
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
  editInput: {
    fontSize: 17,
    fontWeight: '400',
    width: 200,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  editButton: {
    marginLeft: spacing.xs,
  },
  email: {
    marginTop: spacing.xs,
  },
  nameDisplay: {
    textAlign: 'right',
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
