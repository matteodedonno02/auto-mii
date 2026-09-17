import {
  EYE_TILE,
  EYEBROW_TILE,
  HAIR_FG,
  LIP_TILE,
  NOSE_TILE,
  TINTED_LIP_TILES,
  facialFeatureTile,
} from '../tables/lookups.ts';
import { EYE_COLORS, GLASSES_COLORS, HAIR_COLORS, LIP_COLORS, SKIN_COLORS } from '../tables/palettes.ts';
import type { MiiData } from '../types.ts';
import type { SheetId } from './sheets.ts';

export type FeatureKind =
  | 'head'
  | 'hair'
  | 'eyebrow'
  | 'eye'
  | 'nose'
  | 'mouth'
  | 'glasses'
  | 'mustache'
  | 'beard'
  | 'feature';

export interface TileLayer {
  sheet: SheetId;
  tile: number;
  tint: string | null;
}

function colorOf(table: readonly string[], index: number): string {
  return table[index] ?? table[0];
}

function tileOf(table: readonly number[], index: number): number | null {
  const tile = table[index];
  return tile === undefined ? null : tile;
}

/**
 * Layers needed to draw one feature value on its own, with the colors of the
 * given Mii. Used by option thumbnails and contact sheets; the full-face
 * compositor builds its own list with positions and transforms.
 */
export function featureLayers(kind: FeatureKind, value: number, mii: MiiData): TileLayer[] {
  const skin = colorOf(SKIN_COLORS, mii.skinTone);
  const hair = colorOf(HAIR_COLORS, mii.hair.color);

  switch (kind) {
    case 'head':
      return [{ sheet: 'heads', tile: value, tint: skin }];
    case 'hair': {
      const tile = tileOf(HAIR_FG, value);
      if (tile === null) {
        return [];
      }
      return [{ sheet: tile < 56 ? 'hairs1' : 'hairs2', tile: tile < 56 ? tile : tile - 56, tint: hair }];
    }
    case 'eyebrow': {
      const tile = tileOf(EYEBROW_TILE, value);
      if (tile === null) {
        return [];
      }
      return [{ sheet: 'eyebrows', tile, tint: colorOf(HAIR_COLORS, mii.eyebrow.color) }];
    }
    case 'eye': {
      const tile = tileOf(EYE_TILE, value);
      if (tile === null) {
        return [];
      }
      const eyeColor = colorOf(EYE_COLORS, mii.eye.color);
      return [
        { sheet: 'eyes1', tile, tint: null },
        { sheet: 'eyes2', tile, tint: eyeColor },
        { sheet: 'eyes3', tile, tint: null },
      ];
    }
    case 'nose': {
      const tile = tileOf(NOSE_TILE, value);
      return tile === null ? [] : [{ sheet: 'noses', tile, tint: skin }];
    }
    case 'mouth': {
      const tile = tileOf(LIP_TILE, value);
      if (tile === null) {
        return [];
      }
      return [
        {
          sheet: 'lips',
          tile,
          tint: TINTED_LIP_TILES.includes(tile) ? colorOf(LIP_COLORS, mii.mouth.color) : null,
        },
      ];
    }
    case 'glasses': {
      if (value <= 0) {
        return [];
      }
      const glassesColor = colorOf(GLASSES_COLORS, mii.glasses.color);
      if (value < 6) {
        return [{ sheet: 'glasses', tile: value - 1, tint: glassesColor }];
      }
      return [
        { sheet: 'glasses', tile: value + 2, tint: glassesColor },
        { sheet: 'glasses', tile: value - 1, tint: null },
      ];
    }
    case 'mustache':
      return value <= 0 ? [] : [{ sheet: 'mustache', tile: value - 1, tint: colorOf(HAIR_COLORS, mii.facialHair.color) }];
    case 'beard':
      return value <= 0
        ? []
        : [{ sheet: 'beards', tile: (value - 1) * 8 + mii.faceType, tint: colorOf(HAIR_COLORS, mii.facialHair.color) }];
    case 'feature': {
      const layers: TileLayer[] = [];
      if (value === 2) {
        layers.push({ sheet: 'features', tile: 32, tint: skin });
      }
      if (value !== 0) {
        layers.push({ sheet: 'features', tile: facialFeatureTile(value, mii.faceType), tint: skin });
      }
      return layers;
    }
  }
}
