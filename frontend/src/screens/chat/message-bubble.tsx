import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { usePalette } from '@/constants/theme';
import type { ChatMessage } from '@/types';
import { formatClockTime } from '@/utils/format';

type MessageBubbleProps = {
  message: ChatMessage;
  mine: boolean;
};

export function MessageBubble({ message, mine }: MessageBubbleProps) {
  const palette = usePalette();
  const timeColor = mine ? palette.onAccent : palette.textTertiary;

  return (
    <View style={[
      styles.bubble,
      mine ? styles.mine : styles.theirs,
      { backgroundColor: mine ? palette.text : palette.surfaceMuted },
    ]}>
      <AppText style={[styles.text, mine && styles.textMine, { color: mine ? palette.onAccent : undefined }]}>
        {message.text}
      </AppText>
      <AppText
        variant="tiny"
        color={timeColor}
        style={[styles.time, mine && styles.timeMine]}>
        {formatClockTime(message.createdAt)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderCurve: 'continuous',
  },
  mine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 16,
    lineHeight: 23,
  },
  textMine: {},
  time: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
  },
  timeMine: {
    textAlign: 'right',
  },
});