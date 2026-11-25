import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { AppText } from '@/components/ui/text';
import { usePalette, spacing, statusLabels } from '@/constants/theme';
import type { Contact } from '@/types';

type ContactRowProps = {
  contact: Contact;
  onPress: () => void;
  onCall: () => void;
};

export function ContactRow({ contact, onPress, onCall }: ContactRowProps) {
  const palette = usePalette();
  const statusColor = palette[contact.status === 'online' ? 'online' : contact.status === 'busy' ? 'busy' : 'offline'];

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open chat with ${contact.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
        <Avatar name={contact.name} color={contact.color} size={48} />
        <View style={styles.info}>
          <AppText variant="headline" numberOfLines={1}>
            {contact.name}
          </AppText>
          <AppText variant="caption" color={statusColor}>
            {statusLabels[contact.status]}
          </AppText>
        </View>
      </Pressable>

      <IconButton
        name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
        label={`Video call ${contact.name}`}
        onPress={onCall}
        variant="surface"
        size={40}
        iconSize={18}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.65,
  },
});