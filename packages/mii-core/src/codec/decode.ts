import { BitReader } from './bits.ts';
import { miiCrc16 } from './crc.ts';
import { MiiDecodeError, guessMiiFormat } from './errors.ts';
import type { DecodedMii, Flag, MiiData, Sex } from '../types.ts';

export function decodeName(bytes: Uint8Array, offset: number): string {
  const units: number[] = [];
  for (let i = 0; i < 10; i++) {
    const unit = (bytes[offset + i * 2] << 8) | bytes[offset + i * 2 + 1];
    if (unit === 0) {
      break;
    }
    units.push(unit);
  }
  return String.fromCharCode(...units);
}

/**
 * Decodes a 74-byte RCD or 76-byte RSD record. Reserved bits are preserved in
 * `mii.reserved` so that encode(decode(bytes)) === bytes.
 */
export function decodeMii(bytes: Uint8Array): DecodedMii {
  const guess = guessMiiFormat(bytes);
  if (guess === 'charinfo') {
    throw new MiiDecodeError(
      'unsupported-format',
      'This is an 88-byte Switch CHARINFO file, not a Wii Mii. Only Wii RCD/RSD files are supported.',
    );
  }
  if (guess === 'gen2') {
    throw new MiiDecodeError(
      'unsupported-format',
      'This is a 96-byte 3DS/Wii U file, not a Wii Mii. Only Wii RCD/RSD files are supported.',
    );
  }
  if (guess !== 'rcd' && guess !== 'rsd') {
    throw new MiiDecodeError(
      'size',
      `Unrecognized Mii file: expected 74 bytes (RCD) or 76 bytes (RSD), got ${bytes.length}.`,
    );
  }

  if (guess === 'rsd' && miiCrc16(bytes) !== 0) {
    throw new MiiDecodeError('rsd-crc', 'RSD checksum mismatch: the file is corrupted or was truncated.');
  }

  const personal = new BitReader(bytes.subarray(0x00, 0x02));
  const reservedPersonal = personal.read(1);
  const sex = personal.read(1) as Sex;
  const month = personal.read(4);
  const day = personal.read(5);
  const favColor = personal.read(4);
  const favorite = personal.read(1) as Flag;

  const head = new BitReader(bytes.subarray(0x20, 0x22));
  const faceType = head.read(3);
  const skinTone = head.read(3);
  const facialFeature = head.read(4);
  const reservedHeadA = head.read(3);
  const mingle = head.read(1) as Flag;
  const reservedHeadB = head.read(1);
  const downloaded = head.read(1) as Flag;

  const hair = new BitReader(bytes.subarray(0x22, 0x24));
  const hairType = hair.read(7);
  const hairColor = hair.read(3);
  const hairFlip = hair.read(1) as Flag;
  const reservedHair = hair.read(5);

  const eyebrow = new BitReader(bytes.subarray(0x24, 0x28));
  const eyebrowType = eyebrow.read(5);
  const reservedEyebrowA = eyebrow.read(1);
  const eyebrowRotation = eyebrow.read(4);
  const reservedEyebrowB = eyebrow.read(6);
  const eyebrowColor = eyebrow.read(3);
  const eyebrowSize = eyebrow.read(4);
  const eyebrowY = eyebrow.read(5);
  const eyebrowX = eyebrow.read(4);

  const eye = new BitReader(bytes.subarray(0x28, 0x2c));
  const eyeType = eye.read(6);
  const reservedEyeA = eye.read(2);
  const eyeRotation = eye.read(3);
  const eyeY = eye.read(5);
  const eyeColor = eye.read(3);
  const reservedEyeB = eye.read(1);
  const eyeSize = eye.read(3);
  const eyeX = eye.read(4);
  const reservedEyeC = eye.read(5);

  const nose = new BitReader(bytes.subarray(0x2c, 0x2e));
  const noseType = nose.read(4);
  const noseSize = nose.read(4);
  const noseY = nose.read(5);
  const reservedNose = nose.read(3);

  const mouthReader = new BitReader(bytes.subarray(0x2e, 0x30));
  const mouthType = mouthReader.read(5);
  const mouthColor = mouthReader.read(2);
  const mouthSize = mouthReader.read(4);
  const mouthY = mouthReader.read(5);

  const glasses = new BitReader(bytes.subarray(0x30, 0x32));
  const glassesType = glasses.read(4);
  const glassesColor = glasses.read(3);
  const reservedGlasses = glasses.read(1);
  const glassesSize = glasses.read(3);
  const glassesY = glasses.read(5);

  const facialHair = new BitReader(bytes.subarray(0x32, 0x34));
  const mustacheType = facialHair.read(2);
  const beardType = facialHair.read(2);
  const facialHairColor = facialHair.read(3);
  const facialHairSize = facialHair.read(4);
  const facialHairY = facialHair.read(5);

  const mole = new BitReader(bytes.subarray(0x34, 0x36));
  const moleEnabled = mole.read(1) as Flag;
  const moleSize = mole.read(4);
  const moleY = mole.read(5);
  const moleX = mole.read(5);
  const reservedMole = mole.read(1);

  const miiId = (bytes[0x18] << 24) | (bytes[0x19] << 16) | (bytes[0x1a] << 8) | bytes[0x1b];

  const mii: MiiData = {
    name: decodeName(bytes, 0x02),
    creatorName: decodeName(bytes, 0x36),
    sex,
    month,
    day,
    favColor,
    favorite,
    height: bytes[0x16],
    build: bytes[0x17],
    miiType: (miiId >>> 28) & 0xf,
    creationTicks: miiId & 0x0fffffff,
    consoleId: bytes.slice(0x1c, 0x20),
    faceType,
    skinTone,
    facialFeature,
    mingle,
    downloaded,
    hair: { type: hairType, color: hairColor, flip: hairFlip },
    eyebrow: {
      type: eyebrowType,
      rotation: eyebrowRotation,
      color: eyebrowColor,
      size: eyebrowSize,
      x: eyebrowX,
      y: eyebrowY,
    },
    eye: { type: eyeType, rotation: eyeRotation, color: eyeColor, size: eyeSize, x: eyeX, y: eyeY },
    nose: { type: noseType, size: noseSize, y: noseY },
    mouth: { type: mouthType, color: mouthColor, size: mouthSize, y: mouthY },
    glasses: { type: glassesType, color: glassesColor, size: glassesSize, y: glassesY },
    facialHair: {
      mustache: mustacheType,
      beard: beardType,
      color: facialHairColor,
      size: facialHairSize,
      y: facialHairY,
    },
    mole: { enabled: moleEnabled, size: moleSize, x: moleX, y: moleY },
    reserved: {
      personal: reservedPersonal,
      head: [reservedHeadA, reservedHeadB],
      hair: reservedHair,
      eyebrow: [reservedEyebrowA, reservedEyebrowB],
      eye: [reservedEyeA, reservedEyeB, reservedEyeC],
      nose: reservedNose,
      glasses: reservedGlasses,
      mole: reservedMole,
    },
  };

  return { format: guess, mii };
}
