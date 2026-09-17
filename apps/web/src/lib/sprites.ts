import { useEffect, useState } from 'react'
import {
  SHEETS,
  SHEET_IDS,
  createTintCache,
  type SheetId,
  type SpriteAtlas,
  type SurfaceFactory,
  type TintCache,
} from 'mii-core'

const SPRITE_BASE = `${import.meta.env.BASE_URL}sprites/`

export const createSurface: SurfaceFactory = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

let tintCache: TintCache | null = null

export function getTintCache(): TintCache {
  tintCache ??= createTintCache(createSurface)
  return tintCache
}

export type SpriteStatus = 'loading' | 'ready' | 'error'

export interface SpriteState {
  status: SpriteStatus
  atlas: SpriteAtlas | null
}

let sheetsPromise: Promise<Record<SheetId, HTMLImageElement>> | null = null

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load ${src}`))
    image.src = src
  })
}

function loadSheets(): Promise<Record<SheetId, HTMLImageElement>> {
  sheetsPromise ??= Promise.all(
    SHEET_IDS.map(async (sheet) => [sheet, await loadImage(`${SPRITE_BASE}${SHEETS[sheet].file}`)] as const),
  )
    .then((entries) => Object.fromEntries(entries) as Record<SheetId, HTMLImageElement>)
    .catch((error: unknown) => {
      sheetsPromise = null
      throw error
    })
  return sheetsPromise
}

/** Loads the 14 sprite sheets once and shares them across every thumbnail and preview. */
export function useSpriteAtlas(): SpriteState & { retry: () => void } {
  const [state, setState] = useState<SpriteState>({ status: 'loading', atlas: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadSheets()
      .then((sheets) => {
        if (cancelled) {
          return
        }
        setState({
          status: 'ready',
          atlas: { get: (sheet) => sheets[sheet] },
        })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'error', atlas: null })
        }
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  return {
    ...state,
    retry: () => {
      setState({ status: 'loading', atlas: null })
      setAttempt((value) => value + 1)
    },
  }
}
