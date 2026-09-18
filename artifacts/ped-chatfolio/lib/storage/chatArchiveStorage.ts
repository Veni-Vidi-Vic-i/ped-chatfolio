import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatArchive } from '@/data/mockChats';

const CHAT_ARCHIVES_KEY = 'ped-chatfolio.archives.v1';

function isStoredArchive(value: unknown): value is ChatArchive {
  if (!value || typeof value !== 'object') return false;
  const archive = value as Partial<ChatArchive>;
  return (
    typeof archive.id === 'string' &&
    typeof archive.title === 'string' &&
    typeof archive.participants === 'string' &&
    typeof archive.messageCount === 'number' &&
    typeof archive.updatedAt === 'string' &&
    typeof archive.preview === 'string' &&
    archive.source === 'WhatsApp' &&
    Array.isArray(archive.messages)
  );
}

export async function loadChatArchives(): Promise<ChatArchive[]> {
  try {
    const stored = await AsyncStorage.getItem(CHAT_ARCHIVES_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isStoredArchive) : [];
  } catch {
    return [];
  }
}

export async function saveChatArchives(archives: ChatArchive[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAT_ARCHIVES_KEY, JSON.stringify(archives));
  } catch {
    // Local persistence is best effort; the in-memory library remains usable.
  }
}