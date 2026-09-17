import { writeWord } from './bits.ts';
import { MII_RCD_SIZE, MII_RSD_SIZE, MAX_NAME_UNITS } from './constants.ts';
import { miiCrc16 } from './crc.ts';
import type { MiiData } from '../types.ts';

export function encodeName(name: string): Uint8Array {
  const bytes = new Uint8Array(MAX_NAME_UNITS * 2);
  const units = Math.min(name.length, MAX_NAME_UNITS);
  for (let i = 0; i < units; i++) {
    const unit = name.charCodeAt(i);
    bytes[i * 2] = (unit >> 8) & 0xff;
    bytes[i * 2 + 1] = unit & 0xff;
  }
  return bytes;
}

/** Encodes a 74-byte RCD record. Reserved bits are written back untouched. */
export function encodeMii(mii: MiiData): Uint8Array {
  const bytes = new Uint8Array(MII_RCD_SIZE);

  writeWord(bytes, 0x00, 2, (w) => {
    w.write(mii.reserved.personal, 1);
    w.write(mii.sex, 1);
    w.write(mii.month, 4);
    w.write(mii.day, 5);
    w.write(mii.favColor, 4);
    w.write(mii.favorite, 1);
  });

  bytes.set(encodeName(mii.name), 0x02);
  bytes[0x16] = mii.height & 0x7f;
  bytes[0x17] = mii.build & 0x7f;

  const miiId = ((mii.miiType & 0xf) * 0x10000000 + (mii.creationTicks & 0x0fffffff)) >>> 0;
  bytes[0x18] = (miiId >>> 24) & 0xff;
  bytes[0x19] = (miiId >>> 16) & 0xff;
  bytes[0x1a] = (miiId >>> 8) & 0xff;
  bytes[0x1b] = miiId & 0xff;
  bytes.set(mii.consoleId.slice(0, 4), 0x1c);

  writeWord(bytes, 0x20, 2, (w) => {
    w.write(mii.faceType, 3);
    w.write(mii.skinTone, 3);
    w.write(mii.facialFeature, 4);
    w.write(mii.reserved.head[0] ?? 0, 3);
    w.write(mii.mingle, 1);
    w.write(mii.reserved.head[1] ?? 0, 1);
    w.write(mii.downloaded, 1);
  });

  writeWord(bytes, 0x22, 2, (w) => {
    w.write(mii.hair.type, 7);
    w.write(mii.hair.color, 3);
    w.write(mii.hair.flip, 1);
    w.write(mii.reserved.hair, 5);
  });

  writeWord(bytes, 0x24, 4, (w) => {
    w.write(mii.eyebrow.type, 5);
    w.write(mii.reserved.eyebrow[0] ?? 0, 1);
    w.write(mii.eyebrow.rotation, 4);
    w.write(mii.reserved.eyebrow[1] ?? 0, 6);
    w.write(mii.eyebrow.color, 3);
    w.write(mii.eyebrow.size, 4);
    w.write(mii.eyebrow.y, 5);
    w.write(mii.eyebrow.x, 4);
  });

  writeWord(bytes, 0x28, 4, (w) => {
    w.write(mii.eye.type, 6);
    w.write(mii.reserved.eye[0] ?? 0, 2);
    w.write(mii.eye.rotation, 3);
    w.write(mii.eye.y, 5);
    w.write(mii.eye.color, 3);
    w.write(mii.reserved.eye[1] ?? 0, 1);
    w.write(mii.eye.size, 3);
    w.write(mii.eye.x, 4);
    w.write(mii.reserved.eye[2] ?? 0, 5);
  });

  writeWord(bytes, 0x2c, 2, (w) => {
    w.write(mii.nose.type, 4);
    w.write(mii.nose.size, 4);
    w.write(mii.nose.y, 5);
    w.write(mii.reserved.nose, 3);
  });

  writeWord(bytes, 0x2e, 2, (w) => {
    w.write(mii.mouth.type, 5);
    w.write(mii.mouth.color, 2);
    w.write(mii.mouth.size, 4);
    w.write(mii.mouth.y, 5);
  });

  writeWord(bytes, 0x30, 2, (w) => {
    w.write(mii.glasses.type, 4);
    w.write(mii.glasses.color, 3);
    w.write(mii.reserved.glasses, 1);
    w.write(mii.glasses.size, 3);
    w.write(mii.glasses.y, 5);
  });

  writeWord(bytes, 0x32, 2, (w) => {
    w.write(mii.facialHair.mustache, 2);
    w.write(mii.facialHair.beard, 2);
    w.write(mii.facialHair.color, 3);
    w.write(mii.facialHair.size, 4);
    w.write(mii.facialHair.y, 5);
  });

  writeWord(bytes, 0x34, 2, (w) => {
    w.write(mii.mole.enabled, 1);
    w.write(mii.mole.size, 4);
    w.write(mii.mole.y, 5);
    w.write(mii.mole.x, 5);
    w.write(mii.reserved.mole, 1);
  });

  bytes.set(encodeName(mii.creatorName), 0x36);
  return bytes;
}

/** Encodes a 76-byte RSD record: RCD + big-endian CRC-16. */
export function encodeRsd(mii: MiiData): Uint8Array {
  const rcd = encodeMii(mii);
  const crc = miiCrc16(rcd);
  const rsd = new Uint8Array(MII_RSD_SIZE);
  rsd.set(rcd, 0);
  rsd[74] = (crc >> 8) & 0xff;
  rsd[75] = crc & 0xff;
  return rsd;
}

/** Recomputes the CRC of a 74/76-byte buffer, writing it in RSD form if needed. */
export function withFreshChecksum(rcd: Uint8Array): Uint8Array {
  const crc = miiCrc16(rcd.subarray(0, MII_RCD_SIZE));
  const out = new Uint8Array(MII_RSD_SIZE);
  out.set(rcd.subarray(0, MII_RCD_SIZE), 0);
  out[74] = (crc >> 8) & 0xff;
  out[75] = crc & 0xff;
  return out;
}
