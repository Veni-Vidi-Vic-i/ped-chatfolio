import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { ChatArchive } from '@/data/mockChats';

export function LibraryCard({ chat, onPress }: { chat: ChatArchive; onPress: () => void }) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${chat.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topline}>
        <View style={[styles.sourceMark, { backgroundColor: colors.secondary }]}>
          <Feather name="message-square" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.source, { color: colors.mutedForeground }]}>{chat.source}</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{chat.updatedAt}</Text>
        <Feather name="arrow-up-right" size={16} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{chat.title}</Text>
      <Text style={[styles.participants, { color: colors.accent }]}>{chat.participants}</Text>
      <Text numberOfLines={2} style={[styles.preview, { color: colors.mutedForeground }]}>
        {chat.preview}
      </Text>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{chat.messageCount} messages</Text>
        <Text style={[styles.open, { color: colors.primary }]}>Read archive</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 18, marginBottom: 12 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  topline: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  sourceMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  source: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.7, textTransform: 'uppercase' },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular', marginLeft: 'auto' },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 },
  participants: { marginTop: 7, fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  preview: { marginTop: 14, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, marginTop: 18, paddingTop: 13 },
  count: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  open: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
});