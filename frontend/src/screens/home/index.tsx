import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactRow } from '@/components/contact-row';
import { EmptyState } from '@/components/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { AppText } from '@/components/ui/text';
import { CONTACTS } from '@/data/contacts';
import { usePalette, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import type { Contact } from '@/types';
import { initialsFor } from '@/utils/format';

export function HomeScreen() {
  const { user } = useAuth();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const contacts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return CONTACTS;
    return CONTACTS.filter((contact) => contact.name.toLowerCase().includes(term));
  }, [query]);

  function openChat(contact: Contact) {
    router.push({ pathname: '/(app)/chat/[id]', params: { id: contact.id } });
  }

  function startVideoCall(contact: Contact) {
    router.push({
      pathname: '/call/[id]',
      params: { id: contact.id, kind: 'video', direction: 'outgoing' },
    });
  }

  function openProfile() {
    router.push('/(app)/profile');
  }

  const initial = initialsFor(user?.name ?? 'You').charAt(0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="largeTitle">Friends</AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={openProfile}
          style={({ pressed }) => [
            styles.profile,
            { backgroundColor: palette.surfaceStrong, borderColor: palette.borderStrong },
            pressed && styles.pressed,
          ]}>
          <AppText variant="headline">{initial}</AppText>
        </Pressable>
      </View>

      <View style={[styles.search, { backgroundColor: palette.surfaceMuted }]}>
        <SymbolView
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          tintColor={palette.textTertiary}
          size={16}
          style={styles.searchIcon}
        />
        <TextInput
          accessibilityLabel="Search contacts"
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={palette.textTertiary}
          selectionColor={palette.accent}
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.searchInput, { color: palette.text }]}
        />
        {query ? (
          <IconButton
            name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
            label="Clear search"
            onPress={() => setQuery('')}
            variant="ghost"
            size={28}
            iconSize={16}
          />
        ) : null}
      </View>

      <AppText variant="caption" color={palette.textSecondary} style={styles.sectionLabel}>
        All contacts
      </AppText>

      <FlatList
        data={contacts}
        keyExtractor={(contact) => contact.id}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            onPress={() => openChat(item)}
            onCall={() => startVideoCall(item)}
          />
        )}
        ItemSeparatorComponent={ContactSeparator}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.lg }]}
        ListEmptyComponent={
          <EmptyState
            icon={{ ios: 'person.crop.circle.badge.questionmark', android: 'person', web: 'person' }}
            title="No contacts found"
            description={`Nobody matches “${query.trim()}”. Try a different name.`}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ContactSeparator() {
  const palette = usePalette();
  return <View style={[styles.separator, { backgroundColor: palette.border }]} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  profile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingLeft: spacing.md,
    paddingRight: 10,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  searchIcon: {
    width: 16,
    height: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  sectionLabel: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
