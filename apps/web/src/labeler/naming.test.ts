import { describe, expect, it } from 'vitest'
import { isImageFileName, miiFileName, parseMiiFileName, photoIdFromName } from './naming'

describe('labeler file naming', () => {
  it('derives the pair id from the photo basename', () => {
    expect(photoIdFromName('gold-001.jpg')).toBe('gold-001')
    expect(photoIdFromName('gold-002')).toBe('gold-002')
  })

  it('recognizes image files case-insensitively', () => {
    expect(isImageFileName('gold-001.JPG')).toBe(true)
    expect(isImageFileName('gold-001.jpeg')).toBe(true)
    expect(isImageFileName('gold-001.png')).toBe(true)
    expect(isImageFileName('gold-001.webp')).toBe(true)
    expect(isImageFileName('gold-001.mii')).toBe(false)
    expect(isImageFileName('gold-001')).toBe(false)
  })

  it('builds the .mii name for each pass', () => {
    expect(miiFileName('gold-001', 'first')).toBe('gold-001.mii')
    expect(miiFileName('gold-001', 'second')).toBe('gold-001.p2.mii')
  })

  it('parses .mii names back to id and pass', () => {
    expect(parseMiiFileName('gold-001.mii')).toEqual({ id: 'gold-001', mode: 'first' })
    expect(parseMiiFileName('gold-001.p2.mii')).toEqual({ id: 'gold-001', mode: 'second' })
    expect(parseMiiFileName('gold-001.P2.MII')).toEqual({ id: 'gold-001', mode: 'second' })
    expect(parseMiiFileName('gold-001.png')).toBeNull()
    expect(parseMiiFileName('.mii')).toBeNull()
  })
})
