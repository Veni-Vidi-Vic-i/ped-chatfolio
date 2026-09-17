import type { DocumentPickerAsset } from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export type LocalTextFileReadResult = {
  text: string;
  sourceUriScheme: string;
  resolvedUriScheme: string;
  characterCount: number;
};

export type LocalTextFileErrorPhase = 'read' | 'decode';

export class LocalTextFileError extends Error {
  constructor(
    public readonly phase: LocalTextFileErrorPhase,
    message: string,
  ) {
    super(message);
    this.name = 'LocalTextFileError';
  }
}

function uriScheme(uri: string): string {
  return uri.split(':', 1)[0]?.toLowerCase() || 'unknown';
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

export async function readLocalTextFile(
  asset: DocumentPickerAsset,
): Promise<LocalTextFileReadResult> {
  const sourceUriScheme = uriScheme(asset.uri);

  console.info('[PED Chatfolio import] selected file', {
    fileName: asset.name,
    mimeType: asset.mimeType ?? 'unknown',
    fileSize: asset.size ?? null,
    uriScheme: sourceUriScheme,
    platform: Platform.OS,
  });

  let text: string;
  let resolvedUriScheme = sourceUriScheme;

  try {
    // WEB / REPLIT PREVIEW
    // DocumentPicker exposes the browser File object as asset.file.
    if (Platform.OS === 'web') {
      if (!asset.file) {
        throw new Error('Browser File object is unavailable.');
      }

      text = await asset.file.text();
      resolvedUriScheme = 'browser-file';

      console.info('[PED Chatfolio import] web file read succeeded', {
        readApi: 'asset.file.text',
        characterCount: text.length,
      });
    }

    // NATIVE ANDROID / IOS
    else {
      const readableFile = new File(asset.uri);

      text = await readableFile.text();
      resolvedUriScheme = uriScheme(readableFile.uri);

      console.info('[PED Chatfolio import] native file read succeeded', {
        readApi: 'File.text',
        sourceUriScheme,
        resolvedUriScheme,
        characterCount: text.length,
      });
    }
  } catch (error) {
    console.warn('[PED Chatfolio import] file read failed', {
      phase: 'read',
      platform: Platform.OS,
      sourceUriScheme,
      errorName: errorName(error),
    });

    throw new LocalTextFileError(
      'read',
      'The selected file could not be read on this device.',
    );
  }

  if (typeof text !== 'string') {
    throw new LocalTextFileError(
      'decode',
      'The selected file could not be decoded as text.',
    );
  }

  return {
    text,
    sourceUriScheme,
    resolvedUriScheme,
    characterCount: text.length,
  };
}