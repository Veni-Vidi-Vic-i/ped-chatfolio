import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { ChatArchive } from '@/data/mockChats';
import type { ParsedWhatsAppMessage } from '@/lib/parsers/whatsapp';

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
  getArchiveById: (id: string | undefined) => ChatArchive | undefined;
  setPendingImport: (pending: PendingImport) => void;
  clearPendingImport: () => void;
};

const ChatLibraryContext = createContext<ChatLibraryContextValue | null>(null);

export function ChatLibraryProvider({ children, initialArchives }: PropsWithChildren<{ initialArchives: ChatArchive[] }>) {
  const [archives, setArchives] = useState<ChatArchive[]>(initialArchives);
  const [pendingImport, setPendingImportState] = useState<PendingImport | null>(null);

  const value = useMemo<ChatLibraryContextValue>(
    () => ({
      archives,
      pendingImport,
      addArchive: (archive) => setArchives((current) => [archive, ...current]),
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