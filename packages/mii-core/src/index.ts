export * from './types.ts';

export { BitReader, BitWriter, writeWord } from './codec/bits.ts';
export { MII_RCD_SIZE, MII_RSD_SIZE, MAX_NAME_UNITS } from './codec/constants.ts';
export { miiCrc16 } from './codec/crc.ts';
export { decodeMii, decodeName } from './codec/decode.ts';
export { encodeMii, encodeRsd, encodeName, withFreshChecksum } from './codec/encode.ts';
export { MiiDecodeError, guessMiiFormat } from './codec/errors.ts';
export type { MiiDecodeErrorCode, MiiFormatGuess } from './codec/errors.ts';
export { validateMii } from './codec/validate.ts';

export {
  BLANK_HAIR_TILE,
  BEARD_COUNT,
  EYE_COUNT,
  EYEBROW_COUNT,
  FACIAL_FEATURE_COUNT,
  FACE_COUNT,
  GLASSES_COUNT,
  HAIR_COUNT,
  HAIR_BG,
  HAIR_FG,
  LIP_TILE,
  MOUTH_COUNT,
  MUSTACHE_COUNT,
  NOSE_COUNT,
  NOSE_TILE,
  SKIN_TONE_COUNT,
  TINTED_LIP_TILES,
  EYE_TILE,
  EYEBROW_TILE,
  facialFeatureTile,
} from './tables/lookups.ts';

export {
  EYE_COLORS,
  EYE_COLOR_COUNT,
  FAVORITE_COLORS,
  FAVORITE_COLOR_COUNT,
  GLASSES_COLORS,
  GLASSES_COLOR_COUNT,
  HAIR_COLORS,
  HAIR_COLOR_COUNT,
  LIP_COLORS,
  LIP_COLOR_COUNT,
  SKIN_COLORS,
} from './tables/palettes.ts';

export {
  CREATION_TICK_MS,
  FOREIGN_MII_TYPES,
  GOLD_MII_TYPES,
  NORMAL_MII_TYPE,
} from './tables/constants.ts';

export {
  CREATION_EPOCH_MS,
  createDefaultMii,
  creationTicksFromDate,
  dateFromCreationTicks,
} from './model/defaults.ts';
export type { DefaultMiiOptions } from './model/defaults.ts';
export { randomizeMii } from './model/sample.ts';

export { SHEETS, SHEET_IDS, tileRect } from './render/sheets.ts';
export type { SheetDef, SheetId, TileRect } from './render/sheets.ts';
export { FACE_BOX, buildRenderPlan } from './render/plan.ts';
export type { DrawOp } from './render/plan.ts';
export { featureLayers } from './render/preview.ts';
export type { FeatureKind, TileLayer } from './render/preview.ts';
export { DEFAULT_RENDER_WIDTH, faceBoxSize, renderMii } from './render/renderMii.ts';
export type { RenderMiiOptions, SpriteAtlas } from './render/renderMii.ts';
export { createTintCache } from './render/tint.ts';
export type { CanvasSurface, SurfaceFactory, TintCache } from './render/tint.ts';
