import {
  BLANK_HAIR_TILE,
  EYE_TILE,
  EYEBROW_TILE,
  HAIR_BG,
  HAIR_FG,
  LIP_TILE,
  NOSE_TILE,
  TINTED_LIP_TILES,
  facialFeatureTile,
} from '../tables/lookups.ts';
import {
  EYE_COLORS,
  GLASSES_COLORS,
  HAIR_COLORS,
  LIP_COLORS,
  SKIN_COLORS,
} from '../tables/palettes.ts';
import type { MiiData } from '../types.ts';
import type { SheetId } from './sheets.ts';

export interface DrawOp {
  sheet: SheetId;
  tile: number;
  /** top-left position in composition coordinates, before rotation/scaling */
  x: number;
  y: number;
  /** transform pivot inside the tile, in tile-local pixels */
  handleX: number;
  handleY: number;
  /** degrees, clockwise */
  rotation: number;
  scaleX: number;
  scaleY: number;
  /** multiply tint, `#rrggbb`, or null to draw the sprite as-is */
  tint: string | null;
}

/** Face crop of the composition space, as used by the reference renderer (`GRRLIB_CompoEnd(200, 160)`). */
export const FACE_BOX = { x: 200, y: 160, width: 180, height: 200 } as const;

function tileOf(table: readonly number[], index: number): number | null {
  const tile = table[index];
  return tile === undefined ? null : tile;
}

function colorOf(table: readonly string[], index: number): string {
  return table[index] ?? table[0];
}

/**
 * Pure draw list for one Mii, following the reference renderer (`miidraw.cpp`)
 * layer order, positions, pivots, scales and rotations exactly.
 */
export function buildRenderPlan(mii: MiiData): DrawOp[] {
  const ops: DrawOp[] = [];
  const skin = colorOf(SKIN_COLORS, mii.skinTone);
  const hair = colorOf(HAIR_COLORS, mii.hair.color);

  const hairForeground = tileOf(HAIR_FG, mii.hair.type);
  if (hairForeground === null) {
    return ops;
  }
  const hairBackground = HAIR_BG[hairForeground] ?? BLANK_HAIR_TILE;
  const hairFlipScale = mii.hair.flip === 1 ? 1 : -1;

  if (hairBackground !== BLANK_HAIR_TILE) {
    ops.push({
      sheet: 'hairs2',
      tile: hairBackground,
      x: 230,
      y: 210,
      handleX: 60,
      handleY: 0,
      rotation: 0,
      scaleX: hairFlipScale,
      scaleY: 1,
      tint: hair,
    });
  }

  ops.push({
    sheet: 'heads',
    tile: mii.faceType,
    x: 230,
    y: 200,
    handleX: 60,
    handleY: 60,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    tint: skin,
  });

  const featureTile = facialFeatureTile(mii.facialFeature, mii.faceType);
  if (mii.facialFeature === 2) {
    ops.push({
      sheet: 'features',
      tile: 32,
      x: 230,
      y: 200,
      handleX: 60,
      handleY: 60,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      tint: skin,
    });
  }
  ops.push({
    sheet: 'features',
    tile: featureTile,
    x: 230,
    y: 200,
    handleX: 60,
    handleY: 60,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    tint: skin,
  });

  if (mii.facialHair.beard > 0) {
    ops.push({
      sheet: 'beards',
      tile: (mii.facialHair.beard - 1) * 8 + mii.faceType,
      x: 230,
      y: 200,
      handleX: 60,
      handleY: 70,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      tint: colorOf(HAIR_COLORS, mii.facialHair.color),
    });
  }

  if (mii.mole.enabled === 1) {
    ops.push({
      sheet: 'mole',
      tile: 0,
      x: 252 + 4 * mii.mole.x,
      y: 212 + 2.8 * mii.mole.y,
      handleX: 6,
      handleY: 6,
      rotation: 0,
      scaleX: 0.2 + mii.mole.size * 0.1,
      scaleY: 0.2 + mii.mole.size * 0.1,
      tint: null,
    });
  }

  const eyeTile = tileOf(EYE_TILE, mii.eye.type);
  if (eyeTile !== null) {
    const eyeScale = 0.3 + mii.eye.size * 0.1;
    const eyeRotation = 11.25 * (7 - mii.eye.rotation);
    const eyeLayers: Array<{ sheet: SheetId; tint: string | null }> = [
      { sheet: 'eyes1', tint: null },
      { sheet: 'eyes2', tint: colorOf(EYE_COLORS, mii.eye.color) },
      { sheet: 'eyes3', tint: null },
    ];
    for (const layer of eyeLayers) {
      ops.push({
        sheet: layer.sheet,
        tile: eyeTile,
        x: 272 + 2.6 * mii.eye.x,
        y: 184 + 2.8 * mii.eye.y,
        handleX: 18,
        handleY: 36,
        rotation: eyeRotation,
        scaleX: eyeScale,
        scaleY: eyeScale,
        tint: layer.tint,
      });
      ops.push({
        sheet: layer.sheet,
        tile: 95 - eyeTile,
        x: 254 - 2.6 * mii.eye.x,
        y: 184 + 2.8 * mii.eye.y,
        handleX: 36,
        handleY: 36,
        rotation: -eyeRotation,
        scaleX: eyeScale,
        scaleY: eyeScale,
        tint: layer.tint,
      });
    }
  }

  const eyebrowTile = tileOf(EYEBROW_TILE, mii.eyebrow.type);
  if (eyebrowTile !== null) {
    const eyebrowScale = 0.3 + mii.eyebrow.size * 0.1;
    const eyebrowRotation = 11.25 * (11 - mii.eyebrow.rotation);
    const eyebrowY = 166 + 2.8 * (mii.eyebrow.y - 3);
    const eyebrowColor = colorOf(HAIR_COLORS, mii.eyebrow.color);
    ops.push({
      sheet: 'eyebrows',
      tile: eyebrowTile,
      x: 288 + 2.6 * mii.eyebrow.x,
      y: eyebrowY,
      handleX: 0,
      handleY: 54,
      rotation: eyebrowRotation,
      scaleX: eyebrowScale,
      scaleY: eyebrowScale,
      tint: eyebrowColor,
    });
    ops.push({
      sheet: 'eyebrows',
      tile: 53 - eyebrowTile,
      x: 256 - 2.6 * mii.eyebrow.x,
      y: eyebrowY,
      handleX: 36,
      handleY: 54,
      rotation: -eyebrowRotation,
      scaleX: eyebrowScale,
      scaleY: eyebrowScale,
      tint: eyebrowColor,
    });
  }

  const lipTile = tileOf(LIP_TILE, mii.mouth.type);
  if (lipTile !== null) {
    const lipScale = 0.2 + mii.mouth.size * 0.1;
    ops.push({
      sheet: 'lips',
      tile: lipTile,
      x: 260,
      y: 220 + 2.6 * mii.mouth.y,
      handleX: 30,
      handleY: 30,
      rotation: 0,
      scaleX: lipScale,
      scaleY: lipScale,
      tint: TINTED_LIP_TILES.includes(lipTile) ? colorOf(LIP_COLORS, mii.mouth.color) : null,
    });
  }

  if (mii.facialHair.mustache > 0) {
    ops.push({
      sheet: 'mustache',
      tile: mii.facialHair.mustache - 1,
      x: 260,
      y: 244 + 2.9 * mii.facialHair.y,
      handleX: 30,
      handleY: 10,
      rotation: 0,
      scaleX: 0.2 + mii.facialHair.size * 0.1,
      scaleY: 0.2 + mii.facialHair.size * 0.1,
      tint: colorOf(HAIR_COLORS, mii.facialHair.color),
    });
  }

  const noseTile = tileOf(NOSE_TILE, mii.nose.type);
  if (noseTile !== null) {
    ops.push({
      sheet: 'noses',
      tile: noseTile,
      x: 265,
      y: 220 + 2.6 * mii.nose.y,
      handleX: 25,
      handleY: 30,
      rotation: 0,
      scaleX: 0.2 + mii.nose.size * 0.1,
      scaleY: 0.2 + mii.nose.size * 0.1,
      tint: skin,
    });
  }

  ops.push({
    sheet: hairForeground < 56 ? 'hairs1' : 'hairs2',
    tile: hairForeground < 56 ? hairForeground : hairForeground - 56,
    x: 230,
    y: 190,
    handleX: 60,
    handleY: 0,
    rotation: 0,
    scaleX: hairFlipScale,
    scaleY: 1,
    tint: hair,
  });

  if (mii.glasses.type > 0) {
    const glassesScale = 0.1 + mii.glasses.size * 0.1;
    const glassesY = 195 + 2.6 * mii.glasses.y;
    const glassesColor = colorOf(GLASSES_COLORS, mii.glasses.color);
    if (mii.glasses.type < 6) {
      ops.push({
        sheet: 'glasses',
        tile: mii.glasses.type - 1,
        x: 200,
        y: glassesY,
        handleX: 90,
        handleY: 32,
        rotation: 0,
        scaleX: glassesScale,
        scaleY: glassesScale,
        tint: glassesColor,
      });
    } else {
      ops.push({
        sheet: 'glasses',
        tile: mii.glasses.type + 2,
        x: 200,
        y: glassesY,
        handleX: 90,
        handleY: 32,
        rotation: 0,
        scaleX: glassesScale,
        scaleY: glassesScale,
        tint: glassesColor,
      });
      ops.push({
        sheet: 'glasses',
        tile: mii.glasses.type - 1,
        x: 200,
        y: glassesY,
        handleX: 90,
        handleY: 32,
        rotation: 0,
        scaleX: glassesScale,
        scaleY: glassesScale,
        tint: null,
      });
    }
  }

  return ops;
}
