import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { AppText } from '@/components/ui/text';
import { MY_USER_ID } from '@/data/contacts';
import { usePalette, radius, spacing } from '@/constants/theme';
import { useConversation } from '@/hooks/use-conversation';
import { useLastCall } from '@/hooks/use-last-call';
import { MessageBubble } from '@/screens/chat/message-bubble';
import type { ChatMessage, Contact } from '@/types';
import { formatCallLabel, formatClockTime } from '@/utils/format';

type ChatScreenProps = {
  contact: Contact;
};

export function ChatScreen({ contact }: ChatScreenProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { messages, send } = useConversation(contact);
  const lastCall = useLastCall(contact.id);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const canSend = messages !== null && draft.trim().length > 0;
  const showMissedBanner =
    lastCall?.direction === 'incoming' && lastCall.status === 'missed';

  function handleSend() {
    if (!canSend) return;
    send(draft);
    setDraft('');
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {showMissedBanner && lastCall ? (
          <View style={[styles.banner, { backgroundColor: palette.surface, borderBottomColor: palette.border }]}>
            <SymbolView
              name={{ ios: 'phone.down.fill', android: 'call_end', web: 'call_end' }}
              tintColor={palette.danger}
              size={14}
              style={styles.bannerIcon}
            />
            <AppText variant="caption" color={palette.danger}>
              Missed {formatCallLabel(lastCall.kind)} · {formatClockTime(lastCall.startedAt)}
            </AppText>
          </View>
        ) : null}

        {messages === null ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.textSecondary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(message) => message.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} mine={item.senderId === MY_USER_ID} />
            )}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 ? styles.listEmpty : styles.listFilled,
            ]}
            ListEmptyComponent={
              <EmptyState
                icon={{ ios: 'message.fill', android: 'chat_bubble', web: 'chat_bubble' }}
                title="No messages yet"
                description={`Say hello to ${contact.name.split(' ')[0]}.`}
              />
            }
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.sm), borderTopColor: palette.border, backgroundColor: palette.background }]}>
          <TextInput
            accessibilityLabel="Message"
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={palette.textTertiary}
            selectionColor={palette.accent}
            multiline
            style={[styles.input, { backgroundColor: palette.surfaceMuted, color: palette.text }]}
            returnKeyType="default"
          />
          <IconButton
            name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
            label="Send message"
            onPress={handleSend}
            variant={canSend ? 'light' : 'surface'}
            size={44}
            iconSize={20}
            disabled={!canSend}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bannerIcon: {
    width: 14,
    height: 14,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xl - 4,
    paddingVertical: spacing.lg,
    gap: spacing.sm + 4,
  },
  listFilled: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 124,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'center',
  },
});