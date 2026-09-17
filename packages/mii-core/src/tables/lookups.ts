/**
 * Tile lookup arrays from WiiBrew "Rendering Miis" / libmii (transcribed in
 * `docs/MII_FORMAT_RESEARCH.md` section 13.1). Mii data values are in-game order;
 * these arrays translate them to tile order on the sprite sheets.
 */

export const HAIR_FG: readonly number[] = [
  59, 42, 65, 49, 40, 44, 52, 47, 45, 63, 51, 54, 36, 37, 48, 70, 61, 56, 64, 43, 53, 58, 50, 27,
  69, 41, 39, 46, 66, 71, 33, 11, 12, 0, 35, 57, 30, 14, 25, 4, 1, 31, 26, 24, 3, 6, 62, 13, 15,
  7, 19, 2, 17, 67, 29, 20, 9, 34, 18, 8, 22, 60, 23, 55, 21, 32, 16, 28, 10, 38, 5, 68,
];

export const HAIR_BG: readonly number[] = [
  56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 16, 56, 56, 56, 56, 56, 17, 18, 56, 19, 20, 56,
  56, 56, 21, 56, 56, 56, 56, 56, 56, 56, 56, 56, 22, 23, 56, 56, 24, 25, 56, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 56, 56, 48, 49, 50, 51, 52, 53, 56,
];

export const EYEBROW_TILE: readonly number[] = [
  1, 3, 14, 15, 11, 10, 0, 6, 8, 4, 13, 12, 2, 19, 16, 18, 22, 9, 21, 5, 17, 7, 20, 23,
];

export const EYE_TILE: readonly number[] = [
  2, 6, 0, 42, 1, 24, 29, 36, 3, 16, 45, 13, 17, 26, 46, 9, 8, 5, 33, 14, 11, 20, 44, 18, 30, 21, 7,
  10, 34, 41, 31, 32, 15, 12, 19, 23, 27, 28, 38, 4, 22, 25, 39, 43, 37, 40, 35, 47,
];

export const NOSE_TILE: readonly number[] = [5, 0, 2, 3, 7, 6, 4, 10, 8, 9, 1, 11];

export const LIP_TILE: readonly number[] = [
  6, 1, 14, 16, 17, 5, 10, 12, 7, 13, 8, 19, 23, 11, 22, 18, 9, 15, 21, 2, 20, 3, 4, 0,
];

/** Hair background tile 56 is blank: nothing is drawn. */
export const BLANK_HAIR_TILE = 56;

/** Lip tiles that carry a lip color; the others are drawn untinted. */
export const TINTED_LIP_TILES: readonly number[] = [1, 6, 11, 17, 19];

export const HAIR_COUNT = 72;
export const EYEBROW_COUNT = 24;
export const EYE_COUNT = 48;
export const NOSE_COUNT = 12;
export const MOUTH_COUNT = 24;
export const GLASSES_COUNT = 9;
export const FACIAL_FEATURE_COUNT = 12;
export const MUSTACHE_COUNT = 4;
export const BEARD_COUNT = 4;
export const FACE_COUNT = 8;
export const SKIN_TONE_COUNT = 6;

export function facialFeatureTile(feature: number, faceType: number): number {
  switch (feature) {
    case 0:
      return 39;
    case 1:
    case 2:
      return faceType;
    case 3:
      return 33;
    case 4:
      return 34;
    case 5:
      return 35;
    case 6:
      return 36;
    case 7:
      return 40 + faceType;
    case 8:
      return 38;
    case 9:
      return 8 + faceType;
    case 10:
      return 16 + faceType;
    case 11:
      return 24 + faceType;
    default:
      return 39;
  }
}
