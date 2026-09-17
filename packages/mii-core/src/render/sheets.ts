export type SheetId =
  | 'heads'
  | 'hairs1'
  | 'hairs2'
  | 'eyebrows'
  | 'eyes1'
  | 'eyes2'
  | 'eyes3'
  | 'noses'
  | 'lips'
  | 'glasses'
  | 'beards'
  | 'mustache'
  | 'features'
  | 'mole';

export interface SheetDef {
  file: string;
  tileWidth: number;
  tileHeight: number;
  columns: number;
}

/**
 * Sheet geometry verified against `docs/MII_FORMAT_RESEARCH.md` section 13.1 and the
 * tile sizes used by the reference renderer (`miidraw.cpp`, `GRRLIB_InitTileSet`).
 */
export const SHEETS: Record<SheetId, SheetDef> = {
  heads: { file: 'mii_heads.png', tileWidth: 120, tileHeight: 120, columns: 4 },
  hairs1: { file: 'mii_hairs1.png', tileWidth: 120, tileHeight: 120, columns: 8 },
  hairs2: { file: 'mii_hairs2.png', tileWidth: 120, tileHeight: 120, columns: 8 },
  eyebrows: { file: 'mii_eyebrows.png', tileWidth: 36, tileHeight: 54, columns: 9 },
  eyes1: { file: 'mii_eyes1.png', tileWidth: 54, tileHeight: 54, columns: 6 },
  eyes2: { file: 'mii_eyes2.png', tileWidth: 54, tileHeight: 54, columns: 6 },
  eyes3: { file: 'mii_eyes3.png', tileWidth: 54, tileHeight: 54, columns: 6 },
  noses: { file: 'mii_noses.png', tileWidth: 50, tileHeight: 50, columns: 6 },
  lips: { file: 'mii_lips.png', tileWidth: 60, tileHeight: 60, columns: 5 },
  glasses: { file: 'mii_glasses.png', tileWidth: 180, tileHeight: 72, columns: 4 },
  beards: { file: 'mii_beards.png', tileWidth: 120, tileHeight: 140, columns: 8 },
  mustache: { file: 'mii_mustache.png', tileWidth: 60, tileHeight: 60, columns: 3 },
  features: { file: 'mii_features.png', tileWidth: 120, tileHeight: 120, columns: 8 },
  mole: { file: 'mii_mole.png', tileWidth: 12, tileHeight: 12, columns: 1 },
};

export const SHEET_IDS = Object.keys(SHEETS) as SheetId[];

export interface TileRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function tileRect(sheet: SheetId, tile: number): TileRect {
  const def = SHEETS[sheet];
  const column = tile % def.columns;
  const row = Math.floor(tile / def.columns);
  return {
    sx: column * def.tileWidth,
    sy: row * def.tileHeight,
    sw: def.tileWidth,
    sh: def.tileHeight,
  };
}
