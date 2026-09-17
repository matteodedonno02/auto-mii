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
import { MAX_NAME_UNITS } from '../codec/constants.ts';
import type { MiiData, ValidationIssue } from '../types.ts';

interface FieldRange {
  path: string;
  min: number;
  max: number;
}

/** Ranges from `docs/MII_FORMAT_RESEARCH.md` section 3.1. Out-of-range values make the console reject the Mii. */
const RANGES: readonly FieldRange[] = [
  { path: 'month', min: 0, max: 12 },
  { path: 'day', min: 0, max: 31 },
  { path: 'favColor', min: 0, max: FAVORITE_COLOR_COUNT - 1 },
  { path: 'height', min: 0, max: 127 },
  { path: 'build', min: 0, max: 127 },
  { path: 'miiType', min: 0, max: 15 },
  { path: 'creationTicks', min: 0, max: 0x0fffffff },
  { path: 'faceType', min: 0, max: FACE_COUNT - 1 },
  { path: 'skinTone', min: 0, max: SKIN_TONE_COUNT - 1 },
  { path: 'facialFeature', min: 0, max: FACIAL_FEATURE_COUNT - 1 },
  { path: 'hair.type', min: 0, max: HAIR_COUNT - 1 },
  { path: 'hair.color', min: 0, max: HAIR_COLOR_COUNT - 1 },
  { path: 'hair.flip', min: 0, max: 1 },
  { path: 'eyebrow.type', min: 0, max: EYEBROW_COUNT - 1 },
  { path: 'eyebrow.rotation', min: 0, max: 11 },
  { path: 'eyebrow.color', min: 0, max: HAIR_COLOR_COUNT - 1 },
  { path: 'eyebrow.size', min: 0, max: 8 },
  { path: 'eyebrow.x', min: 0, max: 12 },
  { path: 'eyebrow.y', min: 3, max: 18 },
  { path: 'eye.type', min: 0, max: EYE_COUNT - 1 },
  { path: 'eye.rotation', min: 0, max: 7 },
  { path: 'eye.color', min: 0, max: EYE_COLOR_COUNT - 1 },
  { path: 'eye.size', min: 0, max: 7 },
  { path: 'eye.x', min: 0, max: 12 },
  { path: 'eye.y', min: 0, max: 18 },
  { path: 'nose.type', min: 0, max: NOSE_COUNT - 1 },
  { path: 'nose.size', min: 0, max: 8 },
  { path: 'nose.y', min: 0, max: 18 },
  { path: 'mouth.type', min: 0, max: MOUTH_COUNT - 1 },
  { path: 'mouth.color', min: 0, max: LIP_COLOR_COUNT - 1 },
  { path: 'mouth.size', min: 0, max: 8 },
  { path: 'mouth.y', min: 0, max: 18 },
  { path: 'glasses.type', min: 0, max: GLASSES_COUNT - 1 },
  { path: 'glasses.color', min: 0, max: GLASSES_COLOR_COUNT - 1 },
  { path: 'glasses.size', min: 0, max: 7 },
  { path: 'glasses.y', min: 0, max: 20 },
  { path: 'facialHair.mustache', min: 0, max: MUSTACHE_COUNT - 1 },
  { path: 'facialHair.beard', min: 0, max: BEARD_COUNT - 1 },
  { path: 'facialHair.color', min: 0, max: HAIR_COLOR_COUNT - 1 },
  { path: 'facialHair.size', min: 0, max: 8 },
  { path: 'facialHair.y', min: 0, max: 16 },
  { path: 'mole.size', min: 0, max: 8 },
  { path: 'mole.x', min: 0, max: 16 },
  { path: 'mole.y', min: 0, max: 30 },
];

function readPath(mii: MiiData, path: string): number {
  let value: unknown = mii;
  for (const key of path.split('.')) {
    value = (value as Record<string, unknown>)[key];
  }
  return value as number;
}

function readReserved(mii: MiiData, path: string, index: number | undefined): number {
  const raw = readPath(mii, path);
  if (index === undefined) {
    return raw;
  }
  const list = (mii.reserved as unknown as Record<string, unknown>)[path.split('.').pop() ?? ''] as number[];
  return list[index] ?? 0;
}

const RESERVED_WIDTHS: ReadonlyArray<{ path: string; width: number; index?: number }> = [
  { path: 'reserved.personal', width: 1 },
  { path: 'reserved.head', width: 3, index: 0 },
  { path: 'reserved.head', width: 1, index: 1 },
  { path: 'reserved.hair', width: 5 },
  { path: 'reserved.eyebrow', width: 1, index: 0 },
  { path: 'reserved.eyebrow', width: 6, index: 1 },
  { path: 'reserved.eye', width: 2, index: 0 },
  { path: 'reserved.eye', width: 1, index: 1 },
  { path: 'reserved.eye', width: 5, index: 2 },
  { path: 'reserved.nose', width: 3 },
  { path: 'reserved.glasses', width: 1 },
  { path: 'reserved.mole', width: 1 },
];

export function validateMii(mii: MiiData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (mii.name.length > MAX_NAME_UNITS) {
    issues.push({ path: 'name', message: `Name is longer than ${MAX_NAME_UNITS} characters.`, severity: 'error' });
  }
  if (mii.creatorName.length > MAX_NAME_UNITS) {
    issues.push({
      path: 'creatorName',
      message: `Creator name is longer than ${MAX_NAME_UNITS} characters.`,
      severity: 'error',
    });
  }
  if (mii.consoleId.length !== 4) {
    issues.push({ path: 'consoleId', message: 'Console ID must be exactly 4 bytes.', severity: 'error' });
  }
  if (mii.month === 0 && mii.day !== 0) {
    issues.push({ path: 'day', message: 'Day is set without a month.', severity: 'warning' });
  }

  for (const range of RANGES) {
    const value = readPath(mii, range.path);
    if (!Number.isInteger(value) || value < range.min || value > range.max) {
      issues.push({
        path: range.path,
        message: `${range.path} must be an integer between ${range.min} and ${range.max} (got ${value}).`,
        severity: 'error',
      });
    }
  }

  for (const reserved of RESERVED_WIDTHS) {
    const value = readReserved(mii, reserved.path, reserved.index);
    const max = (1 << reserved.width) - 1;
    if (!Number.isInteger(value) || value < 0 || value > max) {
      issues.push({
        path: reserved.path,
        message: `Reserved value must fit in ${reserved.width} bit(s) (0-${max}).`,
        severity: 'error',
      });
    }
  }

  return issues;
}
