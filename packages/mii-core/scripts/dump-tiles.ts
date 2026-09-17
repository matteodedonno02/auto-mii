/**
 * Debug helper: writes contact sheets of raw sprite tiles at 4x so the sprite
 * orientation can be compared against rendered output.
 *
 * Usage: pnpm --filter mii-core exec tsx scripts/dump-tiles.ts eyebrows 0,15,5 eyes1 43,52
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { SHEETS, tileRect, type SheetId } from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const spritesDir = join(repoRoot, 'assets', 'renderMii_sprites');
const SCALE = 4;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: dump-tiles <sheet> <tiles,comma,separated> [sheet tiles ...]');
  process.exit(1);
}

interface Job {
  sheet: SheetId;
  tiles: number[];
}

const jobs: Job[] = [];
for (let i = 0; i < args.length; i += 2) {
  jobs.push({ sheet: args[i] as SheetId, tiles: args[i + 1].split(',').map(Number) });
}

async function main(): Promise<void> {
  const outDir = join(here, '..', '.out', 'tiles');
  mkdirSync(outDir, { recursive: true });

  for (const job of jobs) {
    const def = SHEETS[job.sheet];
    const image = await loadImage(join(spritesDir, def.file));
    const tileW = def.tileWidth * SCALE;
    const tileH = def.tileHeight * SCALE;
    const canvas = createCanvas(tileW * job.tiles.length, tileH);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#303038';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    job.tiles.forEach((tile, index) => {
      const rect = tileRect(job.sheet, tile);
      ctx.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, index * tileW, 0, tileW, tileH);
      ctx.fillStyle = '#FF4D2E';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(String(tile), index * tileW + 8, 24);
    });
    const out = join(outDir, `${job.sheet}.png`);
    writeFileSync(out, canvas.toBuffer('image/png'));
    console.log(`${job.sheet}: tiles [${job.tiles.join(', ')}] -> ${out}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
