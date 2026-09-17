import {
  BEARD_COUNT,
  EYE_COUNT,
  EYEBROW_COUNT,
  FACIAL_FEATURE_COUNT,
  FACE_COUNT,
  GLASSES_COUNT,
  HAIR_COUNT,
  MOUTH_COUNT,
  MUSTACHE_COUNT,
  NOSE_COUNT,
  SKIN_TONE_COUNT,
} from '../tables/lookups.ts';
import {
  EYE_COLOR_COUNT,
  FAVORITE_COLOR_COUNT,
  GLASSES_COLOR_COUNT,
  HAIR_COLOR_COUNT,
  LIP_COLOR_COUNT,
} from '../tables/palettes.ts';
import type { Flag, MiiData, Sex } from '../types.ts';

/**
 * Uniform sampler over the valid ranges (plan section 4.2, "campionamento
 * uniforme"). Sex constraints and rotation/type dependencies are not modeled
 * yet: they belong to the shared sampler milestone and must be added here once
 * transcribed, so that the editor randomize and the dataset generator stay in
 * sync.
 */
export function randomizeMii(base: MiiData, rng: () => number = Math.random): MiiData {
  const pick = (max: number) => Math.floor(rng() * (max + 1));
  const month = pick(12);

  return {
    ...base,
    sex: pick(1) as Sex,
    month,
    day: month === 0 ? 0 : pick(31),
    favColor: pick(FAVORITE_COLOR_COUNT - 1),
    favorite: pick(1) as Flag,
    height: pick(127),
    build: pick(127),
    faceType: pick(FACE_COUNT - 1),
    skinTone: pick(SKIN_TONE_COUNT - 1),
    facialFeature: pick(FACIAL_FEATURE_COUNT - 1),
    hair: {
      type: pick(HAIR_COUNT - 1),
      color: pick(HAIR_COLOR_COUNT - 1),
      flip: pick(1) as Flag,
    },
    eyebrow: {
      type: pick(EYEBROW_COUNT - 1),
      rotation: pick(11),
      color: pick(HAIR_COLOR_COUNT - 1),
      size: pick(8),
      x: pick(12),
      y: 3 + pick(15),
    },
    eye: {
      type: pick(EYE_COUNT - 1),
      rotation: pick(7),
      color: pick(EYE_COLOR_COUNT - 1),
      size: pick(7),
      x: pick(12),
      y: pick(18),
    },
    nose: { type: pick(NOSE_COUNT - 1), size: pick(8), y: pick(18) },
    mouth: {
      type: pick(MOUTH_COUNT - 1),
      color: pick(LIP_COLOR_COUNT - 1),
      size: pick(8),
      y: pick(18),
    },
    glasses: {
      type: pick(GLASSES_COUNT - 1),
      color: pick(GLASSES_COLOR_COUNT - 1),
      size: pick(7),
      y: pick(20),
    },
    facialHair: {
      mustache: pick(MUSTACHE_COUNT - 1),
      beard: pick(BEARD_COUNT - 1),
      color: pick(HAIR_COLOR_COUNT - 1),
      size: pick(8),
      y: pick(16),
    },
    mole: { enabled: pick(1) as Flag, size: pick(8), x: pick(16), y: pick(30) },
  };
}
