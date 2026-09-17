/**
 * Renders a Mii file to PNG with @napi-rs/canvas, reusing the exact browser
 * compositor from mii-core. Used to validate the sprite geometry against the
 * reference renderer; not part of the app bundle.
 *
 * Usage: pnpm --filter mii-core visual:sgango
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import {
  SHEET_IDS,
  SHEETS,
  createTintCache,
  decodeMii,
  faceBoxSize,
  renderMii,
  type CanvasSurface,
  type SheetId,
  type SpriteAtlas,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const spritesDir = join(repoRoot, 'assets', 'renderMii_sprites');

const args = process.argv.slice(2);
const input = args[0] ? resolve(repoRoot, args[0]) : join(repoRoot, 'sgango.mii');
const outArg = args[1];
const name = input.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '');
const outFile = outArg ?? join(here, '..', '.out', `${name}.png`);
const width = Number(args[2] ?? 540);

function createSurface(w: number, h: number): CanvasSurface {
  return createCanvas(w, h) as unknown as CanvasSurface;
}

async function main(): Promise<void> {
  const bytes = new Uint8Array(readFileSync(input));
  const { format, mii } = decodeMii(bytes);

  const images = new Map<SheetId, Awaited<ReturnType<typeof loadImage>>>();
  for (const sheet of SHEET_IDS) {
    images.set(sheet, await loadImage(join(spritesDir, SHEETS[sheet].file)));
  }
  const atlas: SpriteAtlas = {
    get: (sheet) => images.get(sheet) as unknown as CanvasImageSource,
  };

  const size = faceBoxSize(width);
  const canvas = createCanvas(size.width, size.height);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  renderMii(ctx, mii, {
    atlas,
    createSurface,
    width,
    background: '#F2F2F0',
    tintCache: createTintCache(createSurface),
  });

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, canvas.toBuffer('image/png'));
  console.log(`${input} (${format}, ${bytes.length} B) -> ${outFile} (${size.width}x${size.height})`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
