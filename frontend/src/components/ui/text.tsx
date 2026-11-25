import { Text, type TextProps } from 'react-native';

import { usePalette, typography, type TextVariant } from '@/constants/theme';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
};

export function AppText({
  variant = 'body',
  color,
  style,
  ...rest
}: AppTextProps) {
  const palette = usePalette();
  return <Text style={[typography[variant], { color: color ?? palette.text }, style]} {...rest} />;
}