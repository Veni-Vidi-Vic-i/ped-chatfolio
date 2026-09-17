import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark } from '@/components/BrandMark';
import { IconButton } from '@/components/IconButton';
import { useChatLibrary, createLocalArchiveId } from '@/context/ChatLibraryContext';
import { useColors } from '@/hooks/useColors';

export default function ImportReviewScreen() {
  const colors = useColors();
  const { pendingImport, addArchive, clearPendingImport } = useChatLibrary();
  const [archiveName, setArchiveName] = useState(pendingImport?.defaultName ?? '');

  if (!pendingImport) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.missing}>
          <BrandMark compact />
          <Feather name="file-minus" size={28} color={colors.mutedForeground} />
          <Text style={[styles.missingTitle, { color: colors.foreground }]}>No import to review</Text>
          <Text style={[styles.missingText, { color: colors.mutedForeground }]}>
            Choose a WhatsApp export first, then return here to review it.
          </Text>
          <Pressable
            onPress={() => router.replace('/import')}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.primaryLabel, { color: colors.primaryForeground }]}>Choose a file</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const confirmImport = () => {
    const title = archiveName.trim() || pendingImport.defaultName;
    const archive = {
      id: createLocalArchiveId(),
      title,
      participants: pendingImport.participants.join(', '),
      messageCount: pendingImport.messages.length,
      updatedAt: 'Just now',
      preview: pendingImport.messages[0]?.text ?? 'Imported WhatsApp conversation',
      source: 'WhatsApp' as const,
      messages: pendingImport.messages,
    };
    addArchive(archive);
    clearPendingImport();
    router.replace({ pathname: '/reader/[id]', params: { id: archive.id } });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        bottomOffset={32}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandMark compact />
          <IconButton name="x" label="Close review" onPress={() => router.replace('/')} light />
        </View>

        <View style={styles.headingBlock}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>REVIEW / 04</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Name this archive</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            Check the details before adding this conversation to your local library.
          </Text>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>ARCHIVE NAME</Text>
        <TextInput
          accessibilityLabel="Archive name"
          autoCapitalize="sentences"
          onChangeText={setArchiveName}
          placeholder="Give this conversation a name"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.nameInput, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
          value={archiveName}
        />

        <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SummaryRow label="Source" value="WhatsApp · local file" colors={colors} />
          <SummaryRow label="Participants" value={pendingImport.participants.join(', ')} colors={colors} />
          <SummaryRow label="Messages" value={pendingImport.messages.length.toString()} colors={colors} />
          <SummaryRow label="First message" value={pendingImport.firstMessageDate} colors={colors} />
          <SummaryRow label="Last message" value={pendingImport.lastMessageDate} colors={colors} last />
        </View>

        {pendingImport.ignoredLineCount > 0 ? (
          <View style={[styles.info, { backgroundColor: colors.muted }]}>
            <Feather name="info" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              {pendingImport.ignoredLineCount} system or unsupported line{pendingImport.ignoredLineCount === 1 ? '' : 's'} were safely left out.
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add archive to library"
          onPress={confirmImport}
          style={({ pressed }) => [
            styles.confirmButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.confirmLabel, { color: colors.primaryForeground }]}>Add to library</Text>
          <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  colors,
  last = false,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 42 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  headingBlock: { marginTop: 42, marginBottom: 26 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.3 },
  heading: { fontSize: 34, lineHeight: 41, fontFamily: 'Inter_700Bold', letterSpacing: -1.2, marginTop: 8 },
  description: { maxWidth: 325, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular', marginTop: 10 },
  fieldLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1, marginBottom: 8 },
  nameInput: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontFamily: 'Inter_500Medium' },
  summary: { borderWidth: 1, paddingHorizontal: 15, marginTop: 25 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, paddingVertical: 14 },
  summaryLabel: { flex: 0.8, fontSize: 12, fontFamily: 'Inter_400Regular' },
  summaryValue: { flex: 1.4, textAlign: 'right', fontSize: 12, lineHeight: 17, fontFamily: 'Inter_600SemiBold' },
  info: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 18 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16, marginTop: 26 },
  confirmLabel: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  pressed: { opacity: 0.78 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, gap: 13 },
  missingTitle: { fontSize: 21, fontFamily: 'Inter_700Bold', marginTop: 12 },
  missingText: { textAlign: 'center', fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  primaryButton: { paddingHorizontal: 20, paddingVertical: 14, marginTop: 10 },
  primaryLabel: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});