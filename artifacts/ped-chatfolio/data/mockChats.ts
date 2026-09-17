export type MessagePresentation = 'chat' | 'manuscript';
export type ChatSource = 'whatsapp' | 'mock';

export type ChatMessage = {
  id: string;
  sender: string;
  senderLabel: string;
  text: string;
  timestamp: string;
  date: string;
  source?: ChatSource;
};

export type ChatArchive = {
  id: string;
  title: string;
  participants: string;
  messageCount: number;
  updatedAt: string;
  preview: string;
  source: 'WhatsApp';
  messages: ChatMessage[];
};

export const mockChats: ChatArchive[] = [
  {
    id: 'studio-notes',
    title: 'Studio notes',
    participants: 'Chris, You',
    messageCount: 28,
    updatedAt: 'Today',
    preview: 'The first draft is quieter than we expected...',
    source: 'WhatsApp',
    messages: [
      {
        id: 'studio-1',
        sender: 'Chris',
        senderLabel: 'Chris',
        text: 'The first draft is quieter than we expected.',
        timestamp: '09:42',
        date: 'Tuesday, 15 September 2026',
      },
      {
        id: 'studio-2',
        sender: 'You',
        senderLabel: 'You',
        text: 'That might be the right kind of quiet. Let’s leave some room around it.',
        timestamp: '09:47',
        date: 'Tuesday, 15 September 2026',
      },
      {
        id: 'studio-3',
        sender: 'Chris',
        senderLabel: 'Chris',
        text: 'Agreed. I’ll bring the opening back to the image of the empty room.',
        timestamp: '10:03',
        date: 'Tuesday, 15 September 2026',
      },
      {
        id: 'studio-4',
        sender: 'You',
        senderLabel: 'You',
        text: 'Perfect. The silence should feel intentional, not unfinished.',
        timestamp: '10:11',
        date: 'Tuesday, 15 September 2026',
      },
    ],
  },
  {
    id: 'field-recording',
    title: 'Field recording',
    participants: 'Maya, Chris, You',
    messageCount: 64,
    updatedAt: 'Yesterday',
    preview: 'I found the voice memo from the train platform...',
    source: 'WhatsApp',
    messages: [
      {
        id: 'field-1',
        sender: 'Maya',
        senderLabel: 'Maya',
        text: 'I found the voice memo from the train platform.',
        timestamp: '18:22',
        date: 'Monday, 14 September 2026',
      },
      {
        id: 'field-2',
        sender: 'Chris',
        senderLabel: 'Chris',
        text: 'The one with the announcement underneath it?',
        timestamp: '18:24',
        date: 'Monday, 14 September 2026',
      },
      {
        id: 'field-3',
        sender: 'Maya',
        senderLabel: 'Maya',
        text: 'Yes. It makes the whole thing feel like it is already moving away.',
        timestamp: '18:29',
        date: 'Monday, 14 September 2026',
      },
      {
        id: 'field-4',
        sender: 'You',
        senderLabel: 'You',
        text: 'Keep that line. It belongs near the ending.',
        timestamp: '18:34',
        date: 'Monday, 14 September 2026',
      },
    ],
  },
  {
    id: 'sunday-walk',
    title: 'Sunday walk',
    participants: 'You, Noor',
    messageCount: 19,
    updatedAt: '12 Sep',
    preview: 'There is a bookshop on the corner that stays open late.',
    source: 'WhatsApp',
    messages: [
      {
        id: 'walk-1',
        sender: 'Noor',
        senderLabel: 'Noor',
        text: 'There is a bookshop on the corner that stays open late.',
        timestamp: '16:10',
        date: 'Saturday, 12 September 2026',
      },
      {
        id: 'walk-2',
        sender: 'You',
        senderLabel: 'You',
        text: 'The one with the blue sign? I have been meaning to go in.',
        timestamp: '16:12',
        date: 'Saturday, 12 September 2026',
      },
      {
        id: 'walk-3',
        sender: 'Noor',
        senderLabel: 'Noor',
        text: 'That’s the one. Let’s make it the last stop before dinner.',
        timestamp: '16:14',
        date: 'Saturday, 12 September 2026',
      },
    ],
  },
];

export type SearchResult = ChatMessage & {
  chatId: string;
  chatTitle: string;
};

export const allSearchResults: SearchResult[] = mockChats.flatMap((chat) =>
  chat.messages.map((message) => ({
    ...message,
    chatId: chat.id,
    chatTitle: chat.title,
  })),
);

export function formatAsManuscript(message: ChatMessage): string {
  return `${message.senderLabel}: ${message.text}`;
}

export function getChatById(id: string | undefined): ChatArchive {
  return mockChats.find((chat) => chat.id === id) ?? mockChats[0];
}