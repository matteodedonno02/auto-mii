import { describe, expect, it } from 'vitest'
import { createDefaultMii } from 'mii-core'
import { getMiiField, setMiiField } from './paths'

describe('mii field paths', () => {
  it('reads nested fields', () => {
    const mii = createDefaultMii()
    expect(getMiiField<number>(mii, 'hair.type')).toBe(mii.hair.type)
    expect(getMiiField<string>(mii, 'name')).toBe('')
  })

  it('writes immutably, sharing untouched branches', () => {
    const mii = createDefaultMii()
    const updated = setMiiField(mii, 'eye.size', 7)
    expect(updated.eye.size).toBe(7)
    expect(updated.hair).toBe(mii.hair)
    expect(mii.eye.size).not.toBe(7)
    expect(updated).not.toBe(mii)
  })

  it('keeps typed arrays intact through updates', () => {
    const mii = createDefaultMii()
    const updated = setMiiField(mii, 'height', 100)
    expect(Array.from(updated.consoleId)).toEqual(Array.from(mii.consoleId))
  })
})
