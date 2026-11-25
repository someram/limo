import { View } from 'react-native';

import { usePalette } from '@/constants/theme';

type DecorativeHaloProps = {
  size: number;
  top: number;
};

export function DecorativeHalo({ size, top }: DecorativeHaloProps) {
  const palette = usePalette();
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: '50%',
        marginLeft: -size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.decorative,
      }}
    />
  );
}