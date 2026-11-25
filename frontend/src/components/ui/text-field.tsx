import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/text';
import { usePalette, radius, spacing } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({ label, error, containerStyle, style, ...rest }: TextFieldProps) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      <AppText variant="caption" color={palette.textSecondary} style={styles.label}>
        {label}
      </AppText>

      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={palette.textTertiary}
        selectionColor={palette.accent}
        style={[
          styles.input,
          { backgroundColor: palette.surfaceMuted, color: palette.text, borderColor: palette.border },
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        {...rest}
      />

      {error ? (
        <AppText variant="caption" color={palette.danger} style={styles.error} selectable>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    height: 56,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  inputFocused: {},
  inputError: {},
  error: {
    marginTop: spacing.sm,
  },
});