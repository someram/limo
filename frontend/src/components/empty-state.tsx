import type { ComponentProps } from 'react';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { usePalette, spacing } from '@/constants/theme';

type EmptyStateProps = {
  icon: ComponentProps<typeof SymbolView>['name'];
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const palette = usePalette();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: palette.surfaceMuted }]}>
        <SymbolView name={icon} tintColor={palette.textTertiary} size={22} />
      </View>
      <AppText variant="headline" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="subhead" color={palette.textSecondary} style={styles.description}>
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 260,
  },
});