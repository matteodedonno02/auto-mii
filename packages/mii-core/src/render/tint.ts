import { SHEETS, tileRect, type SheetId } from './sheets.ts';

export interface CanvasSurface {
  width: number;
  height: number;
  getContext(type: '2d'): CanvasRenderingContext2D | null;
}

export type SurfaceFactory = (width: number, height: number) => CanvasSurface;

export interface TintCache {
  get(sheet: SheetId, tile: number, tint: string, source: CanvasImageSource): CanvasSurface;
  clear(): void;
}

const MAX_ENTRIES = 512;

/**
 * Multiply-tinted sprite cache. The sprite sheets are grayscale; the reference
 * renderer tints every colored part by multiplying it with the palette color.
 */
export function createTintCache(createSurface: SurfaceFactory): TintCache {
  const cache = new Map<string, CanvasSurface>();

  return {
    get(sheet, tile, tint, source) {
      const key = `${sheet}:${tile}:${tint}`;
      const hit = cache.get(key);
      if (hit) {
        return hit;
      }
      if (cache.size >= MAX_ENTRIES) {
        cache.clear();
      }
      const def = SHEETS[sheet];
      const rect = tileRect(sheet, tile);
      const surface = createSurface(def.tileWidth, def.tileHeight);
      const ctx = surface.getContext('2d');
      if (!ctx) {
        throw new Error('2D context unavailable for tinting');
      }
      ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, rect.sw, rect.sh);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, rect.sw, rect.sh);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, rect.sw, rect.sh);
      ctx.globalCompositeOperation = 'source-over';
      cache.set(key, surface);
      return surface;
    },
    clear() {
      cache.clear();
    },
  };
}
