import type { ChatMessage } from '@/data/mockChats';

export type ParsedWhatsAppMessage = Omit<ChatMessage, 'source'> & {
  source: 'whatsapp';
  dateKey: string;
};

export type WhatsAppParseResult = {
  messages: ParsedWhatsAppMessage[];
  participants: string[];
  ignoredLineCount: number;
  firstMessageDate: string | null;
  lastMessageDate: string | null;
};

type MessageStart = {
  date: string;
  time: string;
  content: string;
};

const STANDARD_MESSAGE_START =
  /^(?<date>\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(?<time>\d{1,2}:\d{2}(?:\s*[AaPp]\.?\s*[Mm]\.?)?)\s+-\s+(?<content>.+)$/;
const BRACKETED_MESSAGE_START =
  /^\[(?<date>\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(?<time>\d{1,2}:\d{2}(?:\s*[AaPp]\.?\s*[Mm]\.?)?)\]\s*(?<content>.+)$/;
const DATE_TIME_PREFIX =
  /^(?:\[)?\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}/;

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function parseMessageStart(line: string): MessageStart | null {
  const match = line.match(STANDARD_MESSAGE_START) ?? line.match(BRACKETED_MESSAGE_START);
  if (!match?.groups?.date || !match.groups.time || !match.groups.content) return null;
  return {
    date: match.groups.date,
    time: match.groups.time.replace(/\s+/g, ' ').replace(/\./g, '').trim().toUpperCase(),
    content: match.groups.content,
  };
}

function parseDate(rawDate: string): { dateKey: string; label: string } | null {
  const parts = rawDate.split('/');
  if (parts.length !== 3) return null;

  const first = Number(parts[0]);
  const second = Number(parts[1]);
  const yearText = parts[2];

  const year =
    yearText.length === 2
      ? 2000 + Number(yearText)
      : Number(yearText);

  if (
    !Number.isInteger(first) ||
    !Number.isInteger(second) ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  let day: number;
  let month: number;

  /*
   * WhatsApp exports can use either:
   * DD/MM/YY
   * MM/DD/YY
   *
   * If one component is greater than 12, we can determine
   * the format safely.
   */
  if (first > 12 && second <= 12) {
    // DD/MM/YY
    day = first;
    month = second;
  } else if (second > 12 && first <= 12) {
    // MM/DD/YY
    month = first;
    day = second;
  } else {
    /*
     * Ambiguous dates such as 8/4/26 could mean
     * 8 April or August 4.
     *
     * For now, default to MM/DD/YY because the current
     * export has been identified as using that format.
     */
    month = first;
    day = second;
  }

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  const dateKey =
    `${year.toString().padStart(4, '0')}-` +
    `${month.toString().padStart(2, '0')}-` +
    `${day.toString().padStart(2, '0')}`;

  const label =
    `${weekdayNames[parsed.getDay()]}, ` +
    `${day} ${monthNames[month - 1]} ${year}`;

  return { dateKey, label };
}

function splitSenderAndText(content: string): { sender: string; text: string } | null {
  const separatorIndex = content.indexOf(':');
  if (separatorIndex <= 0) return null;
  const sender = content.slice(0, separatorIndex).trim();
  if (!sender) return null;
  return {
    sender,
    text: content.slice(separatorIndex + 1).trim(),
  };
}

function isTimestampedSystemLine(line: string): boolean {
  return DATE_TIME_PREFIX.test(line);
}

export function parseWhatsAppExport(text: string): WhatsAppParseResult {
  const messages: ParsedWhatsAppMessage[] = [];
  const participants: string[] = [];
  let current: Omit<ParsedWhatsAppMessage, 'id'> | null = null;
  let ignoredLineCount = 0;

  const flushCurrent = () => {
    if (!current) return;
    messages.push({
      ...current,
      id: `whatsapp-${current.dateKey}-${messages.length + 1}`,
    });
    current = null;
  };

  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f]/g, '').replace(/\u202f/g, ' ').trimEnd();
    const start = parseMessageStart(line);

    if (start) {
      const date = parseDate(start.date);
      const senderAndText = splitSenderAndText(start.content);
      if (!date || !senderAndText) {
        flushCurrent();
        ignoredLineCount += 1;
        continue;
      }

      flushCurrent();
      current = {
        sender: senderAndText.sender,
        senderLabel: senderAndText.sender,
        text: senderAndText.text,
        timestamp: start.time,
        date: date.label,
        dateKey: date.dateKey,
        source: 'whatsapp',
      };
      if (!participants.includes(senderAndText.sender)) {
        participants.push(senderAndText.sender);
      }
      continue;
    }

    if (isTimestampedSystemLine(line)) {
      flushCurrent();
      ignoredLineCount += 1;
      continue;
    }

    if (current) {
      current.text = `${current.text}\n${line}`;
    } else if (line.trim()) {
      ignoredLineCount += 1;
    }
  }

  flushCurrent();

  return {
    messages,
    participants,
    ignoredLineCount,
    firstMessageDate: messages[0]?.date ?? null,
    lastMessageDate: messages.at(-1)?.date ?? null,
  };
}

export function archiveNameFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.txt$/i, '').trim();
  const withoutWhatsAppPrefix = withoutExtension.replace(/^WhatsApp\s+Chat\s*[-–—]\s*/i, '');
  return withoutWhatsAppPrefix || 'Imported WhatsApp chat';
}