import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { usePalette, radius } from '@/constants/theme';

type IconName = ComponentProps<typeof SymbolView>['name'];
type IconButtonVariant = 'surface' | 'ghost' | 'light' | 'danger' | 'success';

type IconButtonProps = {
  name: IconName;
  label: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  name,
  label,
  onPress,
  variant = 'surface',
  size = 40,
  iconSize = 18,
  disabled = false,
  style,
}: IconButtonProps) {
  const palette = usePalette();

  const variants = {
    surface: { backgroundColor: palette.surfaceStrong, tint: palette.text },
    ghost: { backgroundColor: 'transparent', tint: palette.text },
    light: { backgroundColor: palette.accent, tint: palette.onAccent },
    danger: { backgroundColor: palette.danger, tint: palette.text },
    success: { backgroundColor: palette.success, tint: palette.text },
  } as const;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: variant === 'ghost' ? radius.full : radius.md,
          backgroundColor: variants[variant].backgroundColor,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <SymbolView
        name={name}
        tintColor={variants[variant].tint}
        size={iconSize}
        style={{ width: iconSize, height: iconSize }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});