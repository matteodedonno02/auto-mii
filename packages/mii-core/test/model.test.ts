import { describe, expect, it } from 'vitest';
import {
  createDefaultMii,
  randomizeMii,
  validateMii,
  type MiiData,
} from '../src/index.ts';

describe('createDefaultMii', () => {
  it('produces a Mii that passes validation', () => {
    const mii = createDefaultMii({ now: new Date('2026-09-17T10:00:00Z') });
    expect(validateMii(mii)).toEqual([]);
    expect(mii.miiType).toBe(8);
    expect(mii.consoleId).toHaveLength(4);
    expect(mii.creationTicks).toBeGreaterThan(0);
  });
});

describe('validateMii', () => {
  it('accepts the default template and flags out-of-range edits', () => {
    const base: MiiData = createDefaultMii();
    expect(validateMii(base)).toEqual([]);

    const broken: MiiData = {
      ...base,
      hair: { ...base.hair, type: 200 },
      eye: { ...base.eye, rotation: 9 },
      name: 'a'.repeat(11),
    };
    const paths = validateMii(broken).map((issue) => issue.path);
    expect(paths).toContain('hair.type');
    expect(paths).toContain('eye.rotation');
    expect(paths).toContain('name');
  });

  it('flags reserved values that no longer fit their bit width', () => {
    const base: MiiData = createDefaultMii();
    const broken: MiiData = { ...base, reserved: { ...base.reserved, hair: 64 } };
    expect(validateMii(broken).map((issue) => issue.path)).toContain('reserved.hair');
  });
});

describe('randomizeMii', () => {
  it('stays inside every documented range', () => {
    const base = createDefaultMii();
    let seed = 1;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 50; i++) {
      const mii = randomizeMii(base, rng);
      expect(validateMii(mii)).toEqual([]);
    }
  });

  it('keeps the identity fields untouched', () => {
    const base = createDefaultMii();
    const mii = randomizeMii(base, () => 0.42);
    expect(mii.creationTicks).toBe(base.creationTicks);
    expect(Array.from(mii.consoleId)).toEqual(Array.from(base.consoleId));
    expect(mii.miiType).toBe(base.miiType);
  });
});
