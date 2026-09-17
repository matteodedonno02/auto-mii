import { memo, useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { getTintCache, useSpriteAtlas } from '@/lib/sprites'
import { SHEETS, tileRect, type TileLayer } from 'mii-core'

export interface SpriteThumbProps {
  layers: readonly TileLayer[]
  /** Shown when the feature has no sprite (for example "no glasses"). */
  fallback: React.ReactNode
  className?: string
}

const BOX = 48

function layersKey(layers: readonly TileLayer[]): string {
  return layers.map((layer) => `${layer.sheet}:${layer.tile}:${layer.tint ?? '-'}`).join('|')
}

function SpriteThumbInner({ layers, fallback, className }: SpriteThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { status, atlas } = useSpriteAtlas()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !atlas || layers.length === 0) {
      return
    }
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)

    const first = SHEETS[layers[0].sheet]
    const scale = Math.min(canvas.width / first.tileWidth, canvas.height / first.tileHeight)
    const tint = getTintCache()

    for (const layer of layers) {
      const image = atlas.get(layer.sheet)
      const rect = tileRect(layer.sheet, layer.tile)
      const width = rect.sw * scale
      const height = rect.sh * scale
      const x = (canvas.width - width) / 2
      const y = (canvas.height - height) / 2
      if (layer.tint) {
        const tinted = tint.get(layer.sheet, layer.tile, layer.tint, image)
        context.drawImage(tinted as unknown as CanvasImageSource, 0, 0, rect.sw, rect.sh, x, y, width, height)
      } else {
        context.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, x, y, width, height)
      }
    }
  }, [layers, atlas, status])

  if (layers.length === 0) {
    return <span className={cn('grid h-full w-full place-items-center', className)}>{fallback}</span>
  }

  return <canvas ref={canvasRef} width={BOX} height={BOX} aria-hidden="true" className={cn('h-full w-full', className)} />
}

/**
 * Draws one feature (one or more stacked tiles) on its own, tinted with the
 * current Mii colors. Redraws only when the drawn layers actually change.
 */
export const SpriteThumb = memo(
  SpriteThumbInner,
  (previous, next) => layersKey(previous.layers) === layersKey(next.layers),
)
