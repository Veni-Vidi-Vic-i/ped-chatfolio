import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { IconButton } from '@/components/IconButton';
import { useColors } from '@/hooks/useColors';

type SelectedFile = { name: string; size: string };

export default function ImportScreen() {
  const colors = useColors();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

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
            {selectedFile ? selectedFile.name : 'WhatsApp chat export'}
          </Text>
          <Text style={[styles.dropText, { color: colors.mutedForeground }]}>
            {selectedFile
              ? `${selectedFile.size} · ready for the next step`
              : 'Select the .txt file exported from WhatsApp'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose WhatsApp text export"
            onPress={() => setSelectedFile({ name: 'WhatsApp Chat — Studio.txt', size: '18 KB' })}
            style={({ pressed }) => [
              styles.chooseButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Feather name={selectedFile ? 'check' : 'plus'} size={16} color={colors.primaryForeground} />
            <Text style={[styles.chooseLabel, { color: colors.primaryForeground }]}>
              {selectedFile ? 'File selected' : 'Choose a .txt export'}
            </Text>
          </Pressable>
        </View>

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
            This foundation build stops at file selection. Parsing, duplicate detection and incremental imports come next.
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
  steps: { marginTop: 35 },
  stepsTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 17, borderBottomWidth: 1, paddingVertical: 16 },
  stepNumber: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  stepLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  futureNote: { flexDirection: 'row', gap: 10, padding: 15, marginTop: 30 },
  futureText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
});