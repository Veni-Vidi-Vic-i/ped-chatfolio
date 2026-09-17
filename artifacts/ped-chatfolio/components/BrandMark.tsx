import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();

  return (
    <View style={styles.wrapper}>
      <View style={styles.mark} accessibilityLabel="PED Corps mark">
        <View style={[styles.markLine, { backgroundColor: colors.accent }]} />
        <View style={[styles.markLine, styles.markLineShort, { backgroundColor: colors.primary }]} />
      </View>
      <View>
        <Text style={[styles.name, { color: colors.foreground }]}>PED Chatfolio</Text>
        {!compact ? (
          <Text style={[styles.subline, { color: colors.mutedForeground }]}>
            A PED Corps product
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 22, height: 24, justifyContent: 'center', gap: 4 },
  markLine: { height: 8, width: 18, transform: [{ rotate: '-18deg' }] },
  markLineShort: { width: 12, alignSelf: 'flex-end' },
  name: { fontSize: 17, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  subline: { marginTop: 2, fontSize: 10, fontFamily: 'Inter_500Medium', letterSpacing: 0.5, textTransform: 'uppercase' },
});