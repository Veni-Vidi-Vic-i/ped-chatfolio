import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { IconButton } from '@/components/IconButton';
import type { SearchResult } from '@/data/mockChats';
import { useChatLibrary } from '@/context/ChatLibraryContext';
import { useColors } from '@/hooks/useColors';

export default function SearchScreen() {
  const colors = useColors();
  const { archives } = useChatLibrary();
  const [query, setQuery] = useState<string>('');
  const results = useMemo(() => {
    const allResults: SearchResult[] = archives.flatMap((chat) =>
      chat.messages.map((message) => ({
        ...message,
        chatId: chat.id,
        chatTitle: chat.title,
      })),
    );
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allResults.slice(0, 4);
    return allResults.filter((result) =>
      `${result.text} ${result.senderLabel} ${result.chatTitle}`.toLowerCase().includes(normalized),
    );
  }, [archives, query]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <BrandMark compact />
          <IconButton name="x" label="Clear search" onPress={() => setQuery('')} light />
        </View>
        <View style={styles.headingBlock}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>SEARCH / 02</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Find a moment</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            Search across the words, people and archives in your library.
          </Text>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search library"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Try “quiet”, “Maya” or “bookshop”"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            value={query}
          />
          {query ? (
            <Pressable accessibilityLabel="Clear query" onPress={() => setQuery('')}>
              <Feather name="x-circle" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>
            {query ? 'Matches' : 'Recent passages'}
          </Text>
          <Text style={[styles.resultMeta, { color: colors.mutedForeground }]}>
            {results.length.toString().padStart(2, '0')} FOUND
          </Text>
        </View>

        {results.length ? (
          results.map((result) => (
            <Pressable
              key={result.id}
              accessibilityRole="button"
              accessibilityLabel={`Open result from ${result.chatTitle}`}
              onPress={() => router.push({ pathname: '/reader/[id]', params: { id: result.chatId } })}
              style={({ pressed }) => [
                styles.result,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.resultTopline}>
                <Text style={[styles.chatName, { color: colors.accent }]}>{result.chatTitle}</Text>
                <Text style={[styles.resultDate, { color: colors.mutedForeground }]}>{result.date}</Text>
              </View>
              <Text style={[styles.resultText, { color: colors.foreground }]}>{result.text}</Text>
              <View style={styles.resultFooter}>
                <Text style={[styles.sender, { color: colors.mutedForeground }]}>{result.senderLabel}</Text>
                <Feather name="arrow-up-right" size={15} color={colors.primary} />
              </View>
            </Pressable>
          ))
        ) : (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Feather name="search" size={21} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing found yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try a different word or search one of your people.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  headingBlock: { marginTop: 42, marginBottom: 25 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.3 },
  heading: { fontSize: 34, lineHeight: 41, fontFamily: 'Inter_700Bold', letterSpacing: -1.2, marginTop: 8 },
  description: { maxWidth: 320, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular', marginTop: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 15, borderWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', paddingVertical: 14 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 34, marginBottom: 14 },
  resultTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  resultMeta: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  result: { borderWidth: 1, padding: 16, marginBottom: 10 },
  pressed: { opacity: 0.74 },
  resultTopline: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  chatName: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.2 },
  resultDate: { flex: 1, textAlign: 'right', fontSize: 10, fontFamily: 'Inter_400Regular' },
  resultText: { fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular', marginTop: 14 },
  resultFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  sender: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  empty: { alignItems: 'center', padding: 34, borderWidth: 1, marginTop: 4 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 14 },
  emptyText: { maxWidth: 230, textAlign: 'center', fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular', marginTop: 7 },
});