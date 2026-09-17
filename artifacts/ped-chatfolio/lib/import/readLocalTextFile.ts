import type { DocumentPickerAsset } from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';

export type LocalTextFileReadResult = {
  text: string;
  sourceUriScheme: string;
  resolvedUriScheme: string;
  characterCount: number;
};

export type LocalTextFileErrorPhase = 'copy' | 'read' | 'decode';

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

function safeCacheFileName(fileName: string): string {
  const cleaned = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  return cleaned || 'whatsapp-export.txt';
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
    copyToCacheDirectory: true,
  });

  let readableFile = new File(asset.uri);
  if (sourceUriScheme === 'content') {
    const cacheFile = new File(
      Paths.cache,
      `ped-chatfolio-${Date.now()}-${safeCacheFileName(asset.name)}`,
    );
    try {
      await readableFile.copy(cacheFile);
      readableFile = cacheFile;
      console.info('[PED Chatfolio import] copied content URI to cache', {
        resolvedUriScheme: uriScheme(readableFile.uri),
      });
    } catch (error) {
      console.warn('[PED Chatfolio import] content URI copy failed', {
        phase: 'copy',
        uriScheme: sourceUriScheme,
        errorName: errorName(error),
      });
      throw new LocalTextFileError('copy', 'The selected Android file could not be copied into app cache.');
    }
  }

  let text: string;
  try {
    text = await readableFile.text();
    console.info('[PED Chatfolio import] file read succeeded', {
      readApi: 'File.text',
      resolvedUriScheme: uriScheme(readableFile.uri),
      characterCount: text.length,
    });
  } catch (error) {
    console.warn('[PED Chatfolio import] file read failed', {
      phase: 'read',
      resolvedUriScheme: uriScheme(readableFile.uri),
      errorName: errorName(error),
    });
    throw new LocalTextFileError('read', 'The selected file could not be read on this device.');
  }

  if (typeof text !== 'string') {
    console.warn('[PED Chatfolio import] text decoding failed', {
      phase: 'decode',
      resolvedUriScheme: uriScheme(readableFile.uri),
    });
    throw new LocalTextFileError('decode', 'The selected file could not be decoded as text.');
  }

  return {
    text,
    sourceUriScheme,
    resolvedUriScheme: uriScheme(readableFile.uri),
    characterCount: text.length,
  };
}