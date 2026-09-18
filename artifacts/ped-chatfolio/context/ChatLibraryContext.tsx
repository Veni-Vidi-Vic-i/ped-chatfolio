import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { ChatArchive } from '@/data/mockChats';
import type { ParsedWhatsAppMessage } from '@/lib/parsers/whatsapp';
import { loadChatArchives, saveChatArchives } from '@/lib/storage/chatArchiveStorage';

export type PendingImport = {
  fileName: string;
  fileSize?: number;
  messages: ParsedWhatsAppMessage[];
  participants: string[];
  firstMessageDate: string;
  lastMessageDate: string;
  defaultName: string;
  ignoredLineCount: number;
};

type ChatLibraryContextValue = {
  archives: ChatArchive[];
  pendingImport: PendingImport | null;
  addArchive: (archive: ChatArchive) => void;
  updateArchive: (archive: ChatArchive) => void;
  deleteArchive: (id: string) => void;
  getArchiveById: (id: string | undefined) => ChatArchive | undefined;
  setPendingImport: (pending: PendingImport) => void;
  clearPendingImport: () => void;
};

const ChatLibraryContext = createContext<ChatLibraryContextValue | null>(null);

export function ChatLibraryProvider({ children }: PropsWithChildren) {
  const [archives, setArchives] = useState<ChatArchive[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pendingImport, setPendingImportState] = useState<PendingImport | null>(null);

  useEffect(() => {
    let active = true;
    loadChatArchives().then((storedArchives) => {
      if (!active) return;
      setArchives(storedArchives);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveChatArchives(archives);
  }, [archives, hydrated]);

  const value = useMemo<ChatLibraryContextValue>(
    () => ({
      archives,
      pendingImport,
      addArchive: (archive) => setArchives((current) => [archive, ...current]),
      updateArchive: (archive) => setArchives((current) => current.map((item) => item.id === archive.id ? archive : item)),
      deleteArchive: (id) => setArchives((current) => current.filter((archive) => archive.id !== id)),
      getArchiveById: (id) => archives.find((archive) => archive.id === id),
      setPendingImport: (pending) => setPendingImportState(pending),
      clearPendingImport: () => setPendingImportState(null),
    }),
    [archives, pendingImport],
  );

  return <ChatLibraryContext.Provider value={value}>{children}</ChatLibraryContext.Provider>;
}

export function useChatLibrary(): ChatLibraryContextValue {
  const context = useContext(ChatLibraryContext);
  if (!context) {
    throw new Error('useChatLibrary must be used inside ChatLibraryProvider');
  }
  return context;
}

export function createLocalArchiveId(): string {
  return `archive-${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`;
}