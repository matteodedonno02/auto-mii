import { NORMAL_MII_TYPE } from '../tables/constants.ts';
import type { MiiData } from '../types.ts';

export const CREATION_EPOCH_MS = Date.UTC(2006, 0, 1);
const TICK_MS = 4000;
const MAX_TICKS = 0x0fffffff;

export function creationTicksFromDate(date: Date): number {
  const ticks = Math.floor((date.getTime() - CREATION_EPOCH_MS) / TICK_MS);
  return Math.max(0, Math.min(MAX_TICKS, ticks));
}

export function dateFromCreationTicks(ticks: number): Date {
  return new Date(CREATION_EPOCH_MS + ticks * TICK_MS);
}

export interface DefaultMiiOptions {
  now?: Date;
  consoleId?: Uint8Array;
  rng?: () => number;
}

/**
 * Template for a brand-new Mii. Reserved bits start at zero (like `sgango.mii`,
 * a user-created file); real Nintendo files with non-zero reserved bits keep
 * them through import/export. The Mii ID gets type 8 (normal, gray pants) plus
 * the current time in 4-second ticks.
 */
export function createDefaultMii(options: DefaultMiiOptions = {}): MiiData {
  const now = options.now ?? new Date();
  const rng = options.rng ?? Math.random;
  const consoleId =
    options.consoleId ??
    Uint8Array.from([Math.floor(rng() * 256), Math.floor(rng() * 256), Math.floor(rng() * 256), Math.floor(rng() * 256)]);

  return {
    name: '',
    creatorName: '',
    sex: 0,
    month: 0,
    day: 0,
    favColor: 0,
    favorite: 0,
    height: 64,
    build: 64,
    miiType: NORMAL_MII_TYPE,
    creationTicks: creationTicksFromDate(now),
    consoleId,
    faceType: 0,
    skinTone: 0,
    facialFeature: 0,
    mingle: 0,
    downloaded: 0,
    hair: { type: 12, color: 1, flip: 0 },
    eyebrow: { type: 0, rotation: 6, color: 1, size: 4, x: 2, y: 10 },
    eye: { type: 0, rotation: 4, color: 0, size: 4, x: 2, y: 12 },
    nose: { type: 0, size: 4, y: 9 },
    mouth: { type: 21, color: 0, size: 4, y: 13 },
    glasses: { type: 0, color: 0, size: 4, y: 10 },
    facialHair: { mustache: 0, beard: 0, color: 0, size: 4, y: 10 },
    mole: { enabled: 0, size: 4, x: 2, y: 20 },
    reserved: {
      personal: 0,
      head: [0, 0],
      hair: 0,
      eyebrow: [0, 0],
      eye: [0, 0, 0],
      nose: 0,
      glasses: 0,
      mole: 0,
    },
  };
}
