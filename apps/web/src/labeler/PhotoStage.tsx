import {
  ArrowsOutSimple,
  FolderOpen,
  ImageSquare,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import type { DragEvent, PointerEvent, WheelEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { useLabelerStore } from './store'
import type { LabelerPhoto } from './types'

const MIN_ZOOM = 1
const MAX_ZOOM = 6
const ZOOM_STEP = 1.25

export interface PhotoStageProps {
  className?: string
}

export function PhotoStage({ className }: PhotoStageProps) {
  const photos = useLabelerStore((state) => state.photos)
  const index = useLabelerStore((state) => state.index)
  const setFiles = useLabelerStore((state) => state.setFiles)
  const openPhotoDirectory = useLabelerStore((state) => state.openPhotoDirectory)
  const current = photos[index]
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const applyFiles = (files: File[]) => {
    if (files.length > 0) {
      setFiles(files.map((file) => ({ name: file.name, file })))
    }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    applyFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <div className={cn('flex min-h-0 flex-col gap-2', className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-surface-2',
          dragOver ? 'border-accent ring-2 ring-accent/30' : 'border-line',
        )}
      >
        {current ? (
          <ZoomablePhoto key={current.id} photo={current} />
        ) : (
          <div className="grid h-full place-items-center p-6">
            <div className="flex max-w-sm flex-col items-center gap-3 text-center">
              <ImageSquare size={40} weight="duotone" aria-hidden="true" className="text-muted" />
              <p className="text-sm font-medium text-ink">{copy.labeler.photoEmpty}</p>
              <p className="text-xs leading-relaxed text-muted">{copy.labeler.photoHint}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="primary" onClick={() => void openPhotoDirectory()}>
                  <FolderOpen size={16} weight="bold" aria-hidden="true" />
                  {copy.labeler.openPhotos}
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <UploadSimple size={16} weight="bold" aria-hidden="true" />
                  {copy.labeler.choosePhotos}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ''
          applyFiles(files)
        }}
      />
    </div>
  )
}

interface ZoomablePhotoProps {
  photo: LabelerPhoto
}

function ZoomablePhoto({ photo }: ZoomablePhotoProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)

  const resetView = () => {
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
  }

  const changeZoom = (factor: number) => {
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value * factor)))
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    changeZoom(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= MIN_ZOOM || (event.target as HTMLElement).closest('button')) {
      return
    }
    dragOrigin.current = { x: event.clientX - offset.x, y: event.clientY - offset.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current
    if (!origin) {
      return
    }
    setOffset({ x: event.clientX - origin.x, y: event.clientY - origin.y })
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={resetView}
      className="absolute inset-0 grid place-items-center"
    >
      <img
        src={photo.url}
        alt={photo.name}
        draggable={false}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        className={cn(
          'max-h-full max-w-full select-none object-contain',
          !dragging && 'transition-transform duration-100',
          zoom > MIN_ZOOM && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
        )}
      />

      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-line bg-surface/90 p-1 backdrop-blur">
        <IconButton
          label={copy.labeler.zoomOut}
          onClick={() => changeZoom(1 / ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
        >
          <MagnifyingGlassMinus size={16} weight="bold" />
        </IconButton>
        <IconButton label={copy.labeler.zoomIn} onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM}>
          <MagnifyingGlassPlus size={16} weight="bold" />
        </IconButton>
        <IconButton label={copy.labeler.zoomFit} onClick={resetView}>
          <ArrowsOutSimple size={16} weight="bold" />
        </IconButton>
      </div>

      <div className="absolute bottom-2 left-2 flex max-w-[80%] items-center gap-2 rounded-md border border-line bg-surface/90 px-2 py-1 backdrop-blur">
        <span className="font-mono text-[11px] text-ink tabular-nums">{photo.id}</span>
        <span className="truncate text-[11px] text-muted">{photo.name}</span>
      </div>
    </div>
  )
}
