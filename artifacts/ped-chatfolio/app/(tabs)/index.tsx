import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { IconButton } from '@/components/IconButton';
import { LibraryCard } from '@/components/LibraryCard';
import { useChatLibrary } from '@/context/ChatLibraryContext';
import { useColors } from '@/hooks/useColors';

export default function LibraryScreen() {
  const colors = useColors();
  const { archives } = useChatLibrary();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BrandMark />
          <IconButton name="search" label="Search archives" onPress={() => router.push('/search')} light />
        </View>

        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>LIBRARY / 01</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Your archive</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            A considered place for the conversations you want to keep close.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Import a chat archive"
          onPress={() => router.push('/import')}
          style={({ pressed }) => [
            styles.importCard,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.importCopy}>
            <Text style={[styles.importEyebrow, { color: colors.accent }]}>ADD TO LIBRARY</Text>
            <Text style={[styles.importTitle, { color: colors.primaryForeground }]}>Import a chat archive</Text>
            <Text style={[styles.importDescription, { color: colors.primaryForeground }]}>
              Start with a WhatsApp .txt export.
            </Text>
          </View>
          <View style={[styles.importIcon, { backgroundColor: colors.accent }]}>
            <Feather name="arrow-up-right" size={21} color={colors.primaryForeground} />
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent conversations</Text>
          <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
            {archives.length.toString().padStart(2, '0')} ARCHIVES
          </Text>
        </View>

        {archives.map((chat) => (
          <LibraryCard
            key={chat.id}
            chat={chat}
            onPress={() => router.push({ pathname: '/reader/[id]', params: { id: chat.id } })}
          />
        ))}

        <View style={[styles.note, { borderTopColor: colors.border }]}>
          <Feather name="archive" size={16} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Your library is local to this device for now.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  intro: { marginTop: 45, marginBottom: 27 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.3 },
  heading: { fontSize: 38, lineHeight: 44, fontFamily: 'Inter_700Bold', letterSpacing: -1.5, marginTop: 8 },
  description: { maxWidth: 310, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular', marginTop: 12 },
  importCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, marginBottom: 35 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  importCopy: { flex: 1, paddingRight: 14 },
  importEyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  importTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginTop: 11, letterSpacing: -0.3 },
  importDescription: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6, opacity: 0.8 },
  importIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  sectionMeta: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, paddingTop: 16, marginTop: 10 },
  noteText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
