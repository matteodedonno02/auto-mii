import type { MiiData } from 'mii-core'

export type MiiFieldPath = DeepKeys<MiiData>

type Primitive = number | string | boolean | Uint8Array

export type DeepKeys<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K
    : T[K] extends readonly unknown[]
      ? K
      : `${K}.${DeepKeys<T[K]>}`
}[keyof T & string]

function walk(mii: MiiData, path: string): Record<string, unknown> {
  const keys = path.split('.')
  let cursor: Record<string, unknown> = mii as unknown as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    cursor = cursor[keys[i]] as Record<string, unknown>
  }
  return cursor
}

export function getMiiField<T = unknown>(mii: MiiData, path: MiiFieldPath): T {
  const keys = path.split('.')
  return walk(mii, path)[keys[keys.length - 1]] as T
}

/** Immutable deep update: clones along the path, leaves the rest shared. */
export function setMiiField<T>(mii: MiiData, path: MiiFieldPath, value: T): MiiData {
  const keys = path.split('.')
  const clone = { ...mii } as unknown as Record<string, unknown>
  let cursor = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const next = { ...(cursor[key] as Record<string, unknown>) }
    cursor[key] = next
    cursor = next
  }
  cursor[keys[keys.length - 1]] = value
  return clone as unknown as MiiData
}
