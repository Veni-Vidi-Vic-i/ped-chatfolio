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
  diagnostics: WhatsAppParserDiagnostics;
};

export type WhatsAppParserDiagnostics = {
  inferredDateConvention: DateConvention;
  rejectedTimestampLines: WhatsAppRejectedTimestampLine[];
};

export type WhatsAppRejectedTimestampLine = {
  lineNumber: number;
  characterCount: number;
  timestampPrefixDetected: boolean;
  detectedDate: string | null;
  detectedTime: string | null;
  delimiterDetected: boolean;
  senderSeparatorDetected: boolean;
  timestampContextCodePoints: number[];
  delimiterContextCodePoints: number[];
  rejectedAt:
    | 'message-start-regex'
    | 'invalid-date'
    | 'missing-sender-separator'
    | 'known-system-message'
    | 'timestamped-system-line';
};

type MessageStart = {
  date: string;
  time: string;
  content: string;
};

type DateConvention = 'month-first' | 'day-first';

const STANDARD_MESSAGE_START =
  /^(?<date>\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(?<time>\d{1,2}:\d{2}(?:\s*[AaPp]\.?\s*[Mm]\.?)?)\s+-\s+(?<content>.+)$/;
const BRACKETED_MESSAGE_START =
  /^\[(?<date>\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(?<time>\d{1,2}:\d{2}(?:\s*[AaPp]\.?\s*[Mm]\.?)?)\]\s*-?\s*(?<content>.+)$/;
const DATE_TIME_PREFIX =
  /^(?:\[)?\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}/;
const STRUCTURAL_TIMESTAMP_PREFIX =
  /^\s*\[?\s*(?<date>\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{2,4})\s*,\s*(?<time>\d{1,2}\s*:\s*\d{2}(?:\s*[AaPp]\.??\s*[Mm]\.??)?)?/;
const DASH_DELIMITER = /\s[\-\u2010\u2011\u2012\u2013\u2014\u2212]\s/;

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

function parseDate(
  rawDate: string,
  convention: DateConvention,
): { dateKey: string; label: string } | null {
  const [dayText, monthText, yearText] = rawDate.split('/');
  const first = Number(dayText);
  const second = Number(monthText);
  const day = convention === 'month-first' ? second : first;
  const month = convention === 'month-first' ? first : second;
  const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

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

function inferDateConvention(rawDates: string[]): DateConvention {
  let hasMonthFirstEvidence = false;
  let hasDayFirstEvidence = false;

  for (const rawDate of rawDates) {
    const [firstText, secondText] = rawDate.split('/');
    const first = Number(firstText);
    const second = Number(secondText);
    if (first > 12 && second <= 12) hasDayFirstEvidence = true;
    if (second > 12 && first <= 12) hasMonthFirstEvidence = true;
  }

  // Ambiguous exports are conventionally emitted month-first by WhatsApp.
  return hasDayFirstEvidence && !hasMonthFirstEvidence ? 'day-first' : 'month-first';
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

function isKnownSystemMessage(content: string): boolean {
  return /^(?:messages and calls are|this message was deleted|you deleted this message|you changed the security code|security code changed|waiting for this message)/i.test(
    content.trim(),
  );
}

function codePointsAround(value: string, index: number): number[] {
  if (index < 0) return [];
  return Array.from(value.slice(Math.max(0, index - 4), index + 5)).map((character) =>
    character.codePointAt(0) ?? 0,
  );
}

function structuralTimestamp(line: string): {
  date: string | null;
  time: string | null;
  prefixDetected: boolean;
  timestampEnd: number;
} {
  const match = line.match(STRUCTURAL_TIMESTAMP_PREFIX);
  return {
    date: match?.groups?.date?.replace(/\s/g, '') ?? null,
    time: match?.groups?.time?.replace(/\s/g, '') ?? null,
    prefixDetected: Boolean(match),
    timestampEnd: match?.[0].length ?? -1,
  };
}

function createRejectedTimestampDiagnostic(
  line: string,
  lineNumber: number,
  rejectedAt: WhatsAppRejectedTimestampLine['rejectedAt'],
): WhatsAppRejectedTimestampLine | null {
  const timestamp = structuralTimestamp(line);
  if (!timestamp.prefixDetected) return null;

  const delimiterIndex = line.search(DASH_DELIMITER);
  const contentStart = timestamp.timestampEnd;
  const senderSeparatorIndex = line.indexOf(':', contentStart);
  return {
    lineNumber,
    characterCount: line.length,
    timestampPrefixDetected: true,
    detectedDate: timestamp.date,
    detectedTime: timestamp.time,
    delimiterDetected: delimiterIndex >= 0,
    senderSeparatorDetected: senderSeparatorIndex >= 0,
    timestampContextCodePoints: codePointsAround(line, Math.max(0, contentStart - 1)),
    delimiterContextCodePoints: codePointsAround(line, delimiterIndex),
    rejectedAt,
  };
}

export function parseWhatsAppExport(text: string): WhatsAppParseResult {
  const messages: ParsedWhatsAppMessage[] = [];
  const participants: string[] = [];
  let current: Omit<ParsedWhatsAppMessage, 'id'> | null = null;
  let ignoredLineCount = 0;
  const rejectedTimestampLines: WhatsAppRejectedTimestampLine[] = [];

  const flushCurrent = () => {
    if (!current) return;
    messages.push({
      ...current,
      id: `whatsapp-${current.dateKey}-${messages.length + 1}`,
    });
    current = null;
  };

  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const parsedStarts = lines
    .map((rawLine) => parseMessageStart(rawLine.replace(/[\u200e\u200f]/g, '').replace(/\u202f/g, ' ').trimEnd()))
    .filter((start): start is MessageStart => Boolean(start));
  const dateConvention = inferDateConvention(parsedStarts.map((start) => start.date));

  for (const [lineIndex, rawLine] of lines.entries()) {
    const lineNumber = lineIndex + 1;
    const line = rawLine.replace(/[\u200e\u200f]/g, '').replace(/\u202f/g, ' ').trimEnd();
    const start = parseMessageStart(line);

    if (start) {
      const date = parseDate(start.date, dateConvention);
      if (isKnownSystemMessage(start.content)) {
        const diagnostic = createRejectedTimestampDiagnostic(line, lineNumber, 'known-system-message');
        if (diagnostic) rejectedTimestampLines.push(diagnostic);
        flushCurrent();
        ignoredLineCount += 1;
        continue;
      }
      const senderAndText = splitSenderAndText(start.content);
      if (!date || !senderAndText) {
        const diagnostic = createRejectedTimestampDiagnostic(
          line,
          lineNumber,
          !date ? 'invalid-date' : 'missing-sender-separator',
        );
        if (diagnostic) rejectedTimestampLines.push(diagnostic);
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
      const diagnostic = createRejectedTimestampDiagnostic(line, lineNumber, 'timestamped-system-line');
      if (diagnostic) rejectedTimestampLines.push(diagnostic);
      flushCurrent();
      ignoredLineCount += 1;
      continue;
    }

    const diagnostic = createRejectedTimestampDiagnostic(line, lineNumber, 'message-start-regex');
    if (diagnostic) rejectedTimestampLines.push(diagnostic);

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
    diagnostics: {
      inferredDateConvention: dateConvention,
      rejectedTimestampLines,
    },
  };
}

export function archiveNameFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.txt$/i, '').trim();
  const withoutWhatsAppPrefix = withoutExtension.replace(/^WhatsApp\s+Chat\s*[-–—]\s*/i, '');
  return withoutWhatsAppPrefix || 'Imported WhatsApp chat';
}