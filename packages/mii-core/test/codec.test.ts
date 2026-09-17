import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  MiiDecodeError,
  decodeMii,
  encodeMii,
  encodeRsd,
  guessMiiFormat,
  miiCrc16,
  validateMii,
} from '../src/index.ts';

function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));
}

const sgango = fixture('sgango.mii');
const saburo = fixture('mii_000.rsd');

describe('CRC-16', () => {
  it('matches the documented sgango checksum', () => {
    expect(miiCrc16(sgango)).toBe(0xc954);
  });

  it('verifies the Nintendo-authored RSD file', () => {
    expect(miiCrc16(saburo)).toBe(0);
    expect((saburo[74] << 8) | saburo[75]).toBe(miiCrc16(saburo.subarray(0, 74)));
  });
});

describe('decodeMii', () => {
  it('decodes sgango.mii exactly as documented', () => {
    const { format, mii } = decodeMii(sgango);
    expect(format).toBe('rcd');
    expect(mii).toMatchObject({
      name: 'sgango',
      creatorName: '',
      sex: 1,
      month: 1,
      day: 1,
      favColor: 6,
      favorite: 0,
      height: 63,
      build: 63,
      miiType: 8,
      creationTicks: 163132617,
      faceType: 4,
      skinTone: 0,
      facialFeature: 8,
      mingle: 0,
      downloaded: 0,
      hair: { type: 50, color: 0, flip: 0 },
      eyebrow: { type: 3, rotation: 6, color: 0, size: 4, x: 2, y: 10 },
      eye: { type: 43, rotation: 4, color: 3, size: 4, x: 2, y: 12 },
      nose: { type: 0, size: 4, y: 9 },
      mouth: { type: 21, color: 2, size: 4, y: 13 },
      glasses: { type: 0, color: 0, size: 4, y: 10 },
      facialHair: { mustache: 2, beard: 3, color: 0, size: 4, y: 10 },
      mole: { enabled: 1, size: 4, x: 2, y: 20 },
    });
    expect(Array.from(mii.consoleId)).toEqual([0xc2, 0xdd, 0x4d, 0xf5]);
    expect(mii.reserved.head).toEqual([0, 0]);
    expect(mii.reserved.eye).toEqual([0, 0, 0]);
  });

  it('decodes a real RSD file and preserves reserved bits', () => {
    const { format, mii } = decodeMii(saburo);
    expect(format).toBe('rsd');
    expect(mii.name.length).toBeGreaterThan(0);
    expect(mii.reserved.head[0]).toBeGreaterThan(0);
    expect(validateMii(mii).filter((issue) => issue.severity === 'error')).toEqual([]);
  });

  it('rejects unsupported formats with a clear error', () => {
    expect(() => decodeMii(new Uint8Array(88))).toThrowError(MiiDecodeError);
    expect(() => decodeMii(new Uint8Array(88))).toThrowError(/CHARINFO/);
    expect(() => decodeMii(new Uint8Array(96))).toThrowError(/3DS/);
    expect(() => decodeMii(new Uint8Array(12))).toThrowError(/74 bytes/);
  });

  it('rejects an RSD with a broken checksum', () => {
    const corrupted = saburo.slice();
    corrupted[10] ^= 0xff;
    expect(() => decodeMii(corrupted)).toThrowError(/checksum/i);
  });
});

describe('encodeMii', () => {
  it('round-trips sgango.mii byte for byte', () => {
    const { mii } = decodeMii(sgango);
    expect(Array.from(encodeMii(mii))).toEqual(Array.from(sgango));
  });

  it('round-trips the Nintendo RSD payload byte for byte', () => {
    const { mii } = decodeMii(saburo);
    expect(Array.from(encodeMii(mii))).toEqual(Array.from(saburo.subarray(0, 74)));
  });

  it('produces a valid RSD with the documented checksum bytes', () => {
    const { mii } = decodeMii(sgango);
    const rsd = encodeRsd(mii);
    expect(rsd.length).toBe(76);
    expect(rsd[74]).toBe(0xc9);
    expect(rsd[75]).toBe(0x54);
    expect(miiCrc16(rsd)).toBe(0);
    expect(decodeMii(rsd).mii).toEqual(mii);
  });

  it('truncates names to 10 code units', () => {
    const { mii } = decodeMii(sgango);
    const long = { ...mii, name: 'abcdefghijklmnop' };
    expect(decodeMii(encodeMii(long)).mii.name).toBe('abcdefghij');
  });
});

describe('guessMiiFormat', () => {
  it('detects by size, not extension', () => {
    expect(guessMiiFormat(sgango)).toBe('rcd');
    expect(guessMiiFormat(saburo)).toBe('rsd');
    expect(guessMiiFormat(new Uint8Array(88))).toBe('charinfo');
    expect(guessMiiFormat(new Uint8Array(96))).toBe('gen2');
    expect(guessMiiFormat(new Uint8Array(10))).toBe('unknown');
  });
});
