import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  FACE_BOX,
  buildRenderPlan,
  createDefaultMii,
  decodeMii,
  tileRect,
  type MiiData,
} from '../src/index.ts';

function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));
}

describe('tileRect', () => {
  it('maps tile indices to sheet rectangles', () => {
    expect(tileRect('hairs1', 0)).toEqual({ sx: 0, sy: 0, sw: 120, sh: 120 });
    expect(tileRect('hairs1', 9)).toEqual({ sx: 120, sy: 120, sw: 120, sh: 120 });
    expect(tileRect('eyebrows', 53)).toEqual({ sx: 288, sy: 270, sw: 36, sh: 54 });
    expect(tileRect('eyes1', 95)).toEqual({ sx: 270, sy: 810, sw: 54, sh: 54 });
  });
});

describe('buildRenderPlan', () => {
  const sgango: MiiData = decodeMii(fixture('sgango.mii')).mii;

  it('draws hair background first and hair foreground last when there are no glasses', () => {
    const plan = buildRenderPlan(sgango);
    expect(plan[0].sheet).toBe('hairs2');
    expect(plan[0].tile).toBe(18);
    expect(plan[plan.length - 1].sheet).toBe('hairs1');
  });

  it('lays the twelve reference layers in order', () => {
    const plan = buildRenderPlan(sgango);
    const layers = plan.map((op) => op.sheet);
    expect(layers.indexOf('heads')).toBeLessThan(layers.indexOf('features'));
    expect(layers.indexOf('features')).toBeLessThan(layers.indexOf('beards'));
    expect(layers.indexOf('beards')).toBeLessThan(layers.indexOf('eyes1'));
    expect(layers.indexOf('eyes3')).toBeLessThan(layers.indexOf('eyebrows'));
    expect(layers.indexOf('eyebrows')).toBeLessThan(layers.indexOf('lips'));
    expect(layers.indexOf('lips')).toBeLessThan(layers.indexOf('noses'));
    expect(layers.indexOf('noses')).toBeLessThan(layers.indexOf('hairs1'));
  });

  it('maps sgango hair type 50 to foreground tile 19 tinted with hair color 0', () => {
    const plan = buildRenderPlan(sgango);
    const hairForeground = plan.find((op) => op.sheet === 'hairs1');
    expect(hairForeground).toMatchObject({
      tile: 19,
      x: 230,
      y: 190,
      handleX: 60,
      handleY: 0,
      scaleX: -1,
      tint: '#111111',
    });
    const hairBackground = plan.find((op) => op.sheet === 'hairs2');
    expect(hairBackground).toMatchObject({ tile: 18, tint: '#111111' });
  });

  it('mirrors the eye layers around the face center', () => {
    const plan = buildRenderPlan(sgango);
    const eyes2 = plan.filter((op) => op.sheet === 'eyes2');
    expect(eyes2).toHaveLength(2);
    const [first, second] = eyes2;
    expect(first.tile).toBe(43);
    expect(second.tile).toBe(52);
    expect(first.tint).toBe('#888940');
    expect(second.tint).toBe('#888940');
    expect(first.rotation).toBeCloseTo(33.75);
    expect(second.rotation).toBeCloseTo(-33.75);
    expect(first.x + first.handleX + second.x + second.handleX).toBeCloseTo(580, 5);
  });

  it('omits optional parts and uses the blank feature tile for facialFeature 0', () => {
    const base = createDefaultMii();
    const plain: MiiData = {
      ...base,
      facialFeature: 0,
      hair: { ...base.hair, type: 32 },
      glasses: { ...base.glasses, type: 0 },
      facialHair: { ...base.facialHair, mustache: 0, beard: 0 },
      mole: { ...base.mole, enabled: 0 },
    };
    const plan = buildRenderPlan(plain);
    expect(plan.some((op) => op.sheet === 'glasses')).toBe(false);
    expect(plan.some((op) => op.sheet === 'mole')).toBe(false);
    expect(plan.some((op) => op.sheet === 'beards')).toBe(false);
    expect(plan.some((op) => op.sheet === 'mustache')).toBe(false);
    const feature = plan.find((op) => op.sheet === 'features');
    expect(feature?.tile).toBe(39);
    const hairOps = plan.filter((op) => op.sheet === 'hairs1' || op.sheet === 'hairs2');
    const hairForeground = hairOps[hairOps.length - 1];
    expect(hairForeground?.tile).toBe(12);
    expect(hairForeground?.sheet).toBe('hairs1');
  });

  it('draws sunglasses lenses under the frame, both tinted as documented', () => {
    const base = createDefaultMii();
    const sunglasses: MiiData = { ...base, glasses: { type: 8, color: 2, size: 4, y: 10 } };
    const plan = buildRenderPlan(sunglasses);
    const glasses = plan.filter((op) => op.sheet === 'glasses');
    expect(glasses.map((op) => op.tile)).toEqual([10, 7]);
    expect(glasses[0].tint).toBe('#AB4E37');
    expect(glasses[1].tint).toBeNull();
  });

  it('keeps the face box constant for the reference crop', () => {
    expect(FACE_BOX).toEqual({ x: 200, y: 160, width: 180, height: 200 });
  });
});
