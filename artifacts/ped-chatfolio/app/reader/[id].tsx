import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '@/components/IconButton';
import { MessageRow } from '@/components/MessageRow';
import { getChatById } from '@/data/mockChats';
import { useChatLibrary } from '@/context/ChatLibraryContext';
import { useColors } from '@/hooks/useColors';

export default function ChatReaderScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getArchiveById } = useChatLibrary();
  const chat = getArchiveById(id) ?? getChatById(id);
  let previousDate = '';

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <IconButton name="arrow-left" label="Back to library" onPress={() => router.back()} light />
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.foreground }]}>{chat.title}</Text>
          <Text style={[styles.headerMeta, { color: colors.mutedForeground }]}>{chat.participants}</Text>
        </View>
        <View style={[styles.headerSource, { backgroundColor: colors.secondary }]}>
          <Feather name="message-square" size={14} color={colors.primary} />
        </View>
      </View>

      <View style={[styles.rule, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        <View style={styles.readerIntro}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>CHAT READER / ARCHIVE</Text>
          <Text style={[styles.readerTitle, { color: colors.foreground }]}>A conversation, kept.</Text>
          <Text style={[styles.readerDescription, { color: colors.mutedForeground }]}>
            {chat.messageCount} messages · imported from {chat.source}
          </Text>
        </View>
        {chat.messages.map((message) => {
          const showDate = previousDate !== message.date;
          previousDate = message.date;
          return (
            <View key={message.id}>
              {showDate ? (
                <View style={styles.dateSeparator}>
                  <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>{message.date}</Text>
                  <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
                </View>
              ) : null}
              <MessageRow message={message} />
            </View>
          );
        })}
        <View style={[styles.endNote, { borderTopColor: colors.border }]}>
          <Feather name="book-open" size={15} color={colors.mutedForeground} />
          <Text style={[styles.endText, { color: colors.mutedForeground }]}>
            This transcript is ready for a future Story Mode presentation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 15, gap: 12 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  headerMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  headerSource: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  rule: { height: 1, marginHorizontal: 20 },
  messages: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
  readerIntro: { marginBottom: 28 },
  eyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  readerTitle: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.8, marginTop: 9 },
  readerDescription: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 7 },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 17, marginTop: 5 },
  dateLine: { height: 1, flex: 1 },
  dateLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.7 },
  endNote: { flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, paddingTop: 16, marginTop: 12 },
  endText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
});