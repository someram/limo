import { SymbolView } from 'expo-symbols';
import { useRef, useState, type ComponentRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/text';
import { usePalette, radius, spacing } from '@/constants/theme';

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function Select<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
}: SelectProps<T>) {
  const palette = usePalette();
  const { width: windowWidth } = useWindowDimensions();
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number }>();

  const selected = options.find((option) => option.value === value) ?? options[0];

  function handleOpen() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  function handleSelect(nextValue: T) {
    setOpen(false);
    onChange(nextValue);
  }

  return (
    <>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
          pressed && styles.pressed,
        ]}>
        <AppText variant="body">{selected?.label}</AppText>
        <SymbolView
          name="chevron.down"
          tintColor={palette.textSecondary}
          size={11}
          style={styles.chevron}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          {anchor ? (
            <View
              style={[
                styles.menu,
                {
                  top: anchor.y + anchor.height + 6,
                  right: Math.max(spacing.lg, windowWidth - (anchor.x + anchor.width)),
                  minWidth: Math.max(anchor.width, 150),
                  backgroundColor: palette.surfaceStrong,
                  borderColor: palette.border,
                },
              ]}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelect(option.value)}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && { backgroundColor: palette.surface },
                    ]}>
                    <AppText
                      variant="body"
                      color={isSelected ? palette.text : palette.textSecondary}>
                      {option.label}
                    </AppText>
                    {isSelected ? (
                      <SymbolView
                        name="checkmark"
                        tintColor={palette.text}
                        size={13}
                        style={styles.checkmark}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chevron: {
    width: 11,
    height: 11,
  },
  pressed: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
  },
  checkmark: {
    width: 13,
    height: 13,
  },
});
