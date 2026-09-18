import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { IconButton } from '@/components/IconButton';
import { useChatLibrary } from '@/context/ChatLibraryContext';
import { useColors } from '@/hooks/useColors';
import {
  LocalTextFileError,
  readLocalTextFile,
} from '@/lib/import/readLocalTextFile';
import {
  archiveNameFromFileName,
  parseWhatsAppExport,
} from '@/lib/parsers/whatsapp';

export default function ImportScreen() {
  const colors = useColors();
  const { setPendingImport } = useChatLibrary();
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async () => {
    setError(null);
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset || !asset.name.toLowerCase().endsWith('.txt')) {
        setError('Choose a WhatsApp .txt export to continue.');
        return;
      }

      let text: string;
      try {
        const readResult = await readLocalTextFile(asset);
        text = readResult.text;
      } catch (readError) {
        if (readError instanceof LocalTextFileError) {
          if (readError.phase === 'copy') {
            setError('Android could not copy the selected file into app storage. Please select it again.');
          } else if (readError.phase === 'decode') {
            setError('The file was opened, but it could not be decoded as text.');
          } else {
            setError('The file was selected but could not be read on this device.');
          }
        } else {
          setError('The selected file could not be read on this device.');
        }
        return;
      }

      let parsed;
      try {
        parsed = parseWhatsAppExport(text);
        console.info('[PED Chatfolio import] WhatsApp parse completed', {
          characterCount: text.length,
          messageCount: parsed.messages.length,
          participantCount: parsed.participants.length,
          ignoredLineCount: parsed.ignoredLineCount,
          diagnostics: __DEV__ ? parsed.diagnostics : undefined,
        });
      } catch (parseError) {
        console.warn('[PED Chatfolio import] WhatsApp parse failed', {
          phase: 'parse',
          errorName: parseError instanceof Error ? parseError.name : 'UnknownError',
          characterCount: text.length,
        });
        setError('The file was read, but the WhatsApp conversation could not be parsed.');
        return;
      }

      if (!parsed.messages.length || !parsed.firstMessageDate || !parsed.lastMessageDate) {
        console.info('[PED Chatfolio import] WhatsApp parse found no messages', {
          characterCount: text.length,
          messageCount: parsed.messages.length,
          ignoredLineCount: parsed.ignoredLineCount,
        });
        setError('The file was read, but no WhatsApp messages were detected.');
        return;
      }

      setPendingImport({
        fileName: asset.name,
        fileSize: asset.size,
        messages: parsed.messages,
        participants: parsed.participants,
        firstMessageDate: parsed.firstMessageDate,
        lastMessageDate: parsed.lastMessageDate,
        defaultName: archiveNameFromFileName(asset.name),
        ignoredLineCount: parsed.ignoredLineCount,
      });
      router.push('/import-review');
    } catch {
      setError('That file could not be read. Make sure it is an exported WhatsApp .txt file.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BrandMark compact />
          <IconButton name="x" label="Close import" onPress={() => router.replace('/')} light />
        </View>

        <View style={styles.headingBlock}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>IMPORT / 03</Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>Bring a chat in</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            Add an exported WhatsApp conversation to begin building your personal archive.
          </Text>
        </View>

        <View style={[styles.dropzone, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <View style={[styles.fileIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="file-text" size={27} color={colors.primary} />
          </View>
          <Text style={[styles.dropTitle, { color: colors.foreground }]}>
            WhatsApp chat export
          </Text>
          <Text style={[styles.dropText, { color: colors.mutedForeground }]}>
            Select the .txt file exported from WhatsApp. It stays on this device.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose WhatsApp text export"
            disabled={isPicking}
            onPress={pickFile}
            style={({ pressed }) => [
              styles.chooseButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
              isPicking && styles.disabled,
            ]}
          >
            <Feather name={isPicking ? 'loader' : 'plus'} size={16} color={colors.primaryForeground} />
            <Text style={[styles.chooseLabel, { color: colors.primaryForeground }]}>
              {isPicking ? 'Reading file…' : 'Choose a .txt export'}
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={[styles.error, { backgroundColor: colors.muted }]}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.steps}>
          <Text style={[styles.stepsTitle, { color: colors.foreground }]}>How it will work</Text>
          {[
            ['01', 'Choose the exported .txt file'],
            ['02', 'Review the conversation details'],
            ['03', 'Save it to your local library'],
          ].map(([number, label]) => (
            <View key={number} style={[styles.step, { borderBottomColor: colors.border }]}>
              <Text style={[styles.stepNumber, { color: colors.accent }]}>{number}</Text>
              <Text style={[styles.stepLabel, { color: colors.foreground }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.futureNote, { backgroundColor: colors.muted }]}>
          <Feather name="info" size={16} color={colors.mutedForeground} />
          <Text style={[styles.futureText, { color: colors.mutedForeground }]}>
            Chat contents are read and parsed entirely on-device. Duplicate detection and incremental imports are not part of this phase.
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
  headingBlock: { marginTop: 42, marginBottom: 26 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.3 },
  heading: { fontSize: 34, lineHeight: 41, fontFamily: 'Inter_700Bold', letterSpacing: -1.2, marginTop: 8 },
  description: { maxWidth: 325, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular', marginTop: 10 },
  dropzone: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 32, borderWidth: 1, borderStyle: 'dashed' },
  fileIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  dropTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  dropText: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 7 },
  chooseButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 17, paddingVertical: 13, marginTop: 22 },
  chooseLabel: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.58 },
  error: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 18 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
  steps: { marginTop: 35 },
  stepsTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 17, borderBottomWidth: 1, paddingVertical: 16 },
  stepNumber: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  stepLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  futureNote: { flexDirection: 'row', gap: 10, padding: 15, marginTop: 30 },
  futureText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
});