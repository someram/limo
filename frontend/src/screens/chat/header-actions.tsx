import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import type { CallKind, Contact } from '@/types';

type ChatHeaderActionsProps = {
  contact: Contact;
};

export function ChatHeaderActions({ contact }: ChatHeaderActionsProps) {
  function startCall(kind: CallKind) {
    router.push({
      pathname: '/call/[id]',
      params: { id: contact.id, kind, direction: 'outgoing' },
    });
  }

  return (
    <View style={styles.container}>
      <IconButton
        name={{ ios: 'phone.fill', android: 'phone', web: 'phone' }}
        label={`Audio call ${contact.name}`}
        onPress={() => startCall('audio')}
        variant="ghost"
        size={36}
        iconSize={19}
      />
      <IconButton
        name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
        label={`Video call ${contact.name}`}
        onPress={() => startCall('video')}
        variant="ghost"
        size={36}
        iconSize={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
