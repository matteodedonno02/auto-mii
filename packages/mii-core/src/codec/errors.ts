import type { MiiFileFormat } from '../types.ts';

export type MiiDecodeErrorCode = 'size' | 'unsupported-format' | 'rsd-crc';

export class MiiDecodeError extends Error {
  readonly code: MiiDecodeErrorCode;

  constructor(code: MiiDecodeErrorCode, message: string) {
    super(message);
    this.name = 'MiiDecodeError';
    this.code = code;
  }
}

export type MiiFormatGuess = MiiFileFormat | 'charinfo' | 'gen2' | 'unknown';

/**
 * The `.mii` extension is ambiguous (RCD vs Switch CHARINFO), so imports are
 * detected by size + content shape, never by extension.
 */
export function guessMiiFormat(bytes: Uint8Array): MiiFormatGuess {
  switch (bytes.length) {
    case 74:
      return 'rcd';
    case 76:
      return 'rsd';
    case 88:
      return 'charinfo';
    case 96:
      return 'gen2';
    default:
      return 'unknown';
  }
}
