import { CaretLeft, CaretRight, FloppyDisk, Prohibit } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { copy } from '@/lib/i18n'
import { useLabelerStore } from './store'

export function LabelerFooter() {
  const count = useLabelerStore((state) => state.photos.length)
  const index = useLabelerStore((state) => state.index)
  const mode = useLabelerStore((state) => state.mode)
  const busy = useLabelerStore((state) => state.busy)
  const next = useLabelerStore((state) => state.next)
  const previous = useLabelerStore((state) => state.previous)
  const saveCurrent = useLabelerStore((state) => state.saveCurrent)
  const requestSkip = useLabelerStore((state) => state.requestSkip)
  const hasPhoto = count > 0

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <IconButton
          label={copy.labeler.back}
          variant="secondary"
          onClick={previous}
          disabled={!hasPhoto || index === 0}
        >
          <CaretLeft size={16} weight="bold" />
        </IconButton>
        <IconButton
          label={copy.labeler.forward}
          variant="secondary"
          onClick={next}
          disabled={!hasPhoto || index >= count - 1}
        >
          <CaretRight size={16} weight="bold" />
        </IconButton>
        <Button variant="primary" className="flex-1" onClick={() => void saveCurrent()} disabled={!hasPhoto || busy}>
          <FloppyDisk size={16} weight="bold" aria-hidden="true" />
          {copy.labeler.save}
        </Button>
        <Button variant="secondary" onClick={requestSkip} disabled={!hasPhoto}>
          <Prohibit size={16} weight="bold" aria-hidden="true" />
          {copy.labeler.skip}
        </Button>
      </div>
      <p className="text-center text-[11px] text-muted">
        {mode === 'second' ? copy.labeler.modeSecondHint : copy.labeler.shortcuts}
      </p>
    </div>
  )
}
