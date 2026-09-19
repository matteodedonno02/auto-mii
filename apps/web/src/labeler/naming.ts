import type { LabelerMode } from './types'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'] as const

const MODE_SUFFIX: Record<LabelerMode, string> = { first: '', second: '.p2' }

export function isImageFileName(name: string): boolean {
  const lower = name.toLowerCase()
  return IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

export function photoIdFromName(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}

export function miiFileName(id: string, mode: LabelerMode): string {
  return `${id}${MODE_SUFFIX[mode]}.mii`
}

export function parseMiiFileName(name: string): { id: string; mode: LabelerMode } | null {
  if (!name.toLowerCase().endsWith('.mii')) {
    return null
  }
  const base = name.slice(0, -4)
  if (base.toLowerCase().endsWith('.p2')) {
    const id = base.slice(0, -3)
    return id.length > 0 ? { id, mode: 'second' } : null
  }
  return base.length > 0 ? { id: base, mode: 'first' } : null
}
