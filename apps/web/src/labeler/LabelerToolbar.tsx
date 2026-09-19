import { DotsThreeOutlineVertical, FloppyDisk, FolderOpen } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Menu, type MenuItem } from '@/components/ui/Menu'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { useLabelerStore } from './store'

export function LabelerToolbar() {
  const photos = useLabelerStore((state) => state.photos)
  const index = useLabelerStore((state) => state.index)
  const mode = useLabelerStore((state) => state.mode)
  const statuses = useLabelerStore((state) => state.statuses)
  const miiDirName = useLabelerStore((state) => state.miiDirName)
  const setMode = useLabelerStore((state) => state.setMode)
  const openPhotoDirectory = useLabelerStore((state) => state.openPhotoDirectory)
  const openMiiDirectory = useLabelerStore((state) => state.openMiiDirectory)
  const clearPhotos = useLabelerStore((state) => state.clearPhotos)
  const resetProgress = useLabelerStore((state) => state.resetProgress)
  const exportSkippedNotes = useLabelerStore((state) => state.exportSkippedNotes)
  const current = photos[index]

  const progress = useMemo(() => {
    let saved = 0
    let skipped = 0
    for (const photo of photos) {
      const status = statuses[mode][photo.id]
      if (status?.kind === 'saved') {
        saved += 1
      }
      if (status?.kind === 'skipped') {
        skipped += 1
      }
    }
    return { saved, skipped }
  }, [photos, mode, statuses])

  const status = current ? statuses[mode][current.id] : undefined
  const statusLabel =
    status?.kind === 'saved'
      ? copy.labeler.statusSaved
      : status?.kind === 'skipped'
        ? copy.labeler.statusSkipped
        : copy.labeler.statusPending

  const menuItems: MenuItem[] = [
    { id: 'notes', label: copy.labeler.exportNotes, onSelect: exportSkippedNotes },
    { id: 'reset', label: copy.labeler.resetProgress, onSelect: resetProgress },
    { id: 'remove', label: copy.labeler.removePhotos, onSelect: clearPhotos },
  ]

  return (
    <header className="z-30 flex min-h-16 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent font-display text-base font-extrabold text-accent-ink"
        >
          M
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-base font-bold tracking-tight whitespace-nowrap">
            {copy.labeler.title}
          </span>
          <span className="truncate text-[11px] text-muted">
            {copy.app.name} · {copy.labeler.tagline}
          </span>
        </div>
      </div>

      {current ? (
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1">
          <span className="font-mono text-[11px] text-ink tabular-nums">{current.id}</span>
          <span
            className={cn(
              'text-[11px] whitespace-nowrap',
              status?.kind === 'saved' ? 'text-accent' : status?.kind === 'skipped' ? 'text-danger' : 'text-muted',
            )}
          >
            {statusLabel}
          </span>
        </div>
      ) : null}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted whitespace-nowrap">
          <span className="font-mono text-ink tabular-nums">{copy.labeler.progress(progress.saved, photos.length)}</span>
          {progress.skipped > 0 ? ` · ${copy.labeler.progressSkipped(progress.skipped)}` : null}
        </span>

        <div
          role="group"
          aria-label={copy.labeler.modeSwitchLabel}
          className="flex rounded-full border border-line bg-surface-2 p-1"
        >
          <ModeButton active={mode === 'first'} label={copy.labeler.modeFirst} onClick={() => setMode('first')} />
          <ModeButton active={mode === 'second'} label={copy.labeler.modeSecond} onClick={() => setMode('second')} />
        </div>

        <Button onClick={() => void openPhotoDirectory()}>
          <FolderOpen size={16} weight="bold" aria-hidden="true" />
          <span className="hidden sm:inline">{copy.labeler.openPhotos}</span>
        </Button>
        <Button onClick={() => void openMiiDirectory()}>
          <FloppyDisk size={16} weight="bold" aria-hidden="true" />
          <span className="hidden max-w-32 truncate sm:inline">{miiDirName ?? copy.labeler.openMii}</span>
        </Button>
        <Menu label={copy.labeler.menu} icon={DotsThreeOutlineVertical} items={menuItems} compact />
      </div>
    </header>
  )
}

interface ModeButtonProps {
  active: boolean
  label: string
  onClick: () => void
}

function ModeButton({ active, label, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-7 rounded-full px-3 text-xs font-medium whitespace-nowrap transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
        active ? 'bg-surface text-ink shadow-(--shadow-card)' : 'text-muted hover:text-ink',
      )}
    >
      {label}
    </button>
  )
}
