/**
 * Wii Mii data model (74-byte RCD / 76-byte RSD).
 *
 * Field order and naming follow `docs/MII_FORMAT_RESEARCH.md` (validated decoder in
 * Appendix B). Reserved/unknown bits are carried through unmodified so that a
 * decode -> encode round trip is byte-identical.
 */

export type Sex = 0 | 1;
export type Flag = 0 | 1;

export interface HairData {
  /** 0-71 */
  type: number;
  /** 0-7, index into HAIR_COLORS */
  color: number;
  /** 0 = normal part, 1 = reversed part */
  flip: Flag;
}

export interface EyebrowData {
  /** 0-23 */
  type: number;
  /** 0-11 */
  rotation: number;
  /** 0-7, index into HAIR_COLORS */
  color: number;
  /** 0-8 */
  size: number;
  /** 0-12, horizontal spacing step */
  x: number;
  /** 3-18, each step is 2.8 px */
  y: number;
}

export interface EyeData {
  /** 0-47 */
  type: number;
  /** 0-7 */
  rotation: number;
  /** 0-5, index into EYE_COLORS */
  color: number;
  /** 0-7 */
  size: number;
  /** 0-12, horizontal spacing step */
  x: number;
  /** 0-18, each step is 2.8 px */
  y: number;
}

export interface NoseData {
  /** 0-11 */
  type: number;
  /** 0-8 */
  size: number;
  /** 0-18, each step is 2.6 px */
  y: number;
}

export interface MouthData {
  /** 0-23 */
  type: number;
  /** 0-2, index into LIP_COLORS */
  color: number;
  /** 0-8 */
  size: number;
  /** 0-18, each step is 2.6 px */
  y: number;
}

export interface GlassesData {
  /** 0-8, 0 = none */
  type: number;
  /** 0-5, index into GLASSES_COLORS */
  color: number;
  /** 0-7 */
  size: number;
  /** 0-20, each step is 2.6 px */
  y: number;
}

export interface FacialHairData {
  /** 0-3, 0 = none */
  mustache: number;
  /** 0-3, 0 = none */
  beard: number;
  /** 0-7, index into HAIR_COLORS */
  color: number;
  /** 0-8, applies to the mustache */
  size: number;
  /** 0-16, each step is 2.9 px */
  y: number;
}

export interface MoleData {
  enabled: Flag;
  /** 0-8 */
  size: number;
  /** 0-16, each step is 4 px */
  x: number;
  /** 0-30, each step is 2.8 px */
  y: number;
}

/**
 * Reserved bits observed in real files (`sgango.mii` has all zero, Saburo has
 * non-zero values). They are never zeroed: preserve them on edit, copy them
 * from a known-good template on create.
 */
export interface ReservedBits {
  /** personal word, 1 bit */
  personal: number;
  /** head word, [3 bits, 1 bit] */
  head: number[];
  /** hair word, 5 bits */
  hair: number;
  /** eyebrow words, [1 bit, 6 bits] */
  eyebrow: number[];
  /** eye words, [2 bits, 1 bit, 5 bits] */
  eye: number[];
  /** nose word, 3 bits */
  nose: number;
  /** glasses word, 1 bit */
  glasses: number;
  /** mole word, 1 bit */
  mole: number;
}

export interface MiiData {
  /** max 10 UTF-16 code units */
  name: string;
  /** max 10 UTF-16 code units */
  creatorName: string;
  sex: Sex;
  /** 0-12, 0 = not set */
  month: number;
  /** 0-31, 0 = not set */
  day: number;
  /** 0-11, index into FAVORITE_COLORS */
  favColor: number;
  favorite: Flag;
  /** 0-127 */
  height: number;
  /** 0-127 */
  build: number;
  /** top 4 bits of the Mii ID: 0/1/4/5 gold, 12/13 foreign, else normal */
  miiType: number;
  /** 28 bits, 4-second ticks since 2006-01-01 UTC */
  creationTicks: number;
  /** 4 bytes, preserved */
  consoleId: Uint8Array;
  /** 0-7 */
  faceType: number;
  /** 0-5, index into SKIN_COLORS */
  skinTone: number;
  /** 0-11, wrinkles / makeup */
  facialFeature: number;
  /** 0 = allowed, 1 = off */
  mingle: Flag;
  downloaded: Flag;
  hair: HairData;
  eyebrow: EyebrowData;
  eye: EyeData;
  nose: NoseData;
  mouth: MouthData;
  glasses: GlassesData;
  facialHair: FacialHairData;
  mole: MoleData;
  reserved: ReservedBits;
}

export type MiiFileFormat = 'rcd' | 'rsd';

export interface DecodedMii {
  format: MiiFileFormat;
  mii: MiiData;
}

export interface ValidationIssue {
  /** dot path into MiiData, e.g. "eye.rotation" */
  path: string;
  message: string;
  severity: 'error' | 'warning';
}
