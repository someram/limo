import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { radius } from '@/constants/theme';
import { initialsFor } from '@/utils/format';

type AvatarProps = {
  name: string;
  color: string;
  size?: number;
};

export function Avatar({ name, color, size = 48 }: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}>
      <AppText
        style={[
          styles.initials,
          { fontSize: Math.round(size * 0.34), lineHeight: Math.round(size * 0.42) },
        ]}>
        {initialsFor(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  initials: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});