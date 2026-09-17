import { useEffect, useRef, useState } from 'react'
import { renderMii } from 'mii-core'
import { Button } from '@/components/ui/Button'
import { CanvasStage } from '@/components/ui/CanvasStage'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { createSurface, getTintCache, useSpriteAtlas } from '@/lib/sprites'
import { getStage } from '@/lib/stages'
import { useEditorStore } from '@/lib/store'

const FACE_WIDTH = 180
const FACE_HEIGHT = 200

export interface MiiPreviewProps {
  className?: string
}

export function MiiPreview({ className }: MiiPreviewProps) {
  const mii = useEditorStore((state) => state.mii)
  const stageId = useEditorStore((state) => state.stageId)
  const stage = getStage(stageId)
  const { status, atlas, retry } = useSpriteAtlas()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = wrapperRef.current
    if (!element) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) {
        return
      }
      const scale = Math.min(rect.width / FACE_WIDTH, rect.height / FACE_HEIGHT)
      const width = Math.max(0, Math.floor(FACE_WIDTH * scale))
      setSize({ width, height: Math.round((width * FACE_HEIGHT) / FACE_WIDTH) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !atlas || size.width === 0) {
      return
    }
    const ratio = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = Math.round(size.width * ratio)
    canvas.height = Math.round(size.height * ratio)
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }
    renderMii(context, mii, {
      atlas,
      createSurface,
      width: size.width * ratio,
      tintCache: getTintCache(),
    })
  }, [mii, atlas, size])

  return (
    <div ref={wrapperRef} className={cn('grid min-h-0 w-full place-items-center', className)}>
      <CanvasStage
        backgroundClass={stage.surface}
        style={{ width: size.width || FACE_WIDTH, height: size.height || FACE_HEIGHT }}
      >
        {status === 'ready' && atlas ? (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={copy.preview.label}
            style={{ width: size.width, height: size.height }}
            className="block"
          />
        ) : null}

        {status === 'loading' ? (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <span aria-hidden="true" className="h-16 w-12 animate-pulse rounded-full bg-line-strong/50" />
            <p className="text-xs text-muted">{copy.status.spritesLoading}</p>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="flex max-w-[260px] flex-col items-center gap-3 px-4 text-center">
            <p className="text-xs text-muted">{copy.status.spritesError}</p>
            <p className="font-mono text-[10px] leading-relaxed text-muted">{copy.status.spritesMissing}</p>
            <Button variant="secondary" onClick={retry}>
              {copy.actions.retry}
            </Button>
          </div>
        ) : null}
      </CanvasStage>
    </div>
  )
}
