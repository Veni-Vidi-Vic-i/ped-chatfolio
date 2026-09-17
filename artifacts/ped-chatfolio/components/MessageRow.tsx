import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { ChatMessage, MessagePresentation } from '@/data/mockChats';

export function MessageRow({
  message,
  presentation = 'chat',
}: {
  message: ChatMessage;
  presentation?: MessagePresentation;
}) {
  const colors = useColors();
  const isYou = message.senderLabel === 'You';

  if (presentation === 'manuscript') {
    return (
      <Text style={[styles.manuscript, { color: colors.foreground }]}>
        <Text style={[styles.manuscriptSender, { color: colors.accent }]}>{message.senderLabel}: </Text>
        {message.text}
      </Text>
    );
  }

  return (
    <View style={[styles.messageRow, isYou && styles.messageRowYou]}>
      <View
        style={[
          styles.bubble,
          { backgroundColor: isYou ? colors.primary : colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sender, { color: isYou ? colors.primaryForeground : colors.accent }]}>
          {message.senderLabel}
        </Text>
        <Text style={[styles.message, { color: isYou ? colors.primaryForeground : colors.foreground }]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, { color: isYou ? colors.primaryForeground : colors.mutedForeground }]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

export function ManuscriptLine({ message }: { message: ChatMessage }) {
  return <MessageRow message={message} presentation="manuscript" />;
}

const styles = StyleSheet.create({
  messageRow: { alignItems: 'flex-start', marginBottom: 14 },
  messageRowYou: { alignItems: 'flex-end' },
  bubble: { maxWidth: '88%', minWidth: 132, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 9, borderWidth: 1 },
  sender: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.4, marginBottom: 6 },
  message: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  timestamp: { fontSize: 10, fontFamily: 'Inter_500Medium', alignSelf: 'flex-end', marginTop: 8, opacity: 0.76 },
  manuscript: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 27, marginBottom: 11 },
  manuscriptSender: { fontFamily: 'Inter_700Bold' },
});