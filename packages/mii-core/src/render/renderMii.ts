import { FACE_BOX, buildRenderPlan, type DrawOp } from './plan.ts';
import { tileRect, type SheetId } from './sheets.ts';
import { createTintCache, type SurfaceFactory, type TintCache } from './tint.ts';
import type { MiiData } from '../types.ts';

export interface SpriteAtlas {
  get(sheet: SheetId): CanvasImageSource;
}

export interface RenderMiiOptions {
  atlas: SpriteAtlas;
  /** Creates offscreen canvases for tinting (browser: `document.createElement('canvas')`). */
  createSurface: SurfaceFactory;
  /** Output width in CSS pixels; the height follows the 180:200 face ratio. */
  width?: number;
  /** Fill color behind the Mii, or null for a transparent background. */
  background?: string | null;
  /** Reuse the tint cache across frames. */
  tintCache?: TintCache;
}

export const DEFAULT_RENDER_WIDTH = 360;

export function faceBoxSize(width: number): { width: number; height: number } {
  return { width, height: Math.round((width * FACE_BOX.height) / FACE_BOX.width) };
}

/**
 * Draws one Mii face into `ctx`. The canvas must already be sized by the caller
 * (including device pixel ratio); `width` maps the 180x200 face box onto it.
 */
export function renderMii(ctx: CanvasRenderingContext2D, mii: MiiData, options: RenderMiiOptions): void {
  const width = options.width ?? DEFAULT_RENDER_WIDTH;
  const background = options.background ?? null;
  const tintCache = options.tintCache ?? createTintCache(options.createSurface);
  const { width: canvasWidth, height: canvasHeight } = ctx.canvas;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const scale = width / FACE_BOX.width;
  ctx.setTransform(scale, 0, 0, scale, -FACE_BOX.x * scale, -FACE_BOX.y * scale);
  for (const op of buildRenderPlan(mii)) {
    drawOp(ctx, op, options.atlas, tintCache);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawOp(
  ctx: CanvasRenderingContext2D,
  op: DrawOp,
  atlas: SpriteAtlas,
  tintCache: TintCache,
): void {
  const source = atlas.get(op.sheet);
  const rect = tileRect(op.sheet, op.tile);

  ctx.save();
  ctx.translate(op.x + op.handleX, op.y + op.handleY);
  if (op.rotation !== 0) {
    ctx.rotate((op.rotation * Math.PI) / 180);
  }
  ctx.scale(op.scaleX, op.scaleY);
  if (op.tint) {
    const tinted = tintCache.get(op.sheet, op.tile, op.tint, source);
    ctx.drawImage(
      tinted as unknown as CanvasImageSource,
      0,
      0,
      rect.sw,
      rect.sh,
      -op.handleX,
      -op.handleY,
      rect.sw,
      rect.sh,
    );
  } else {
    ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, -op.handleX, -op.handleY, rect.sw, rect.sh);
  }
  ctx.restore();
}
