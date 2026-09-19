import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { useLabelerStore } from './store'

const OTHER_REASON = copy.labeler.skipOther
const DEFAULT_REASON: string = copy.labeler.skipReasons[0]

export function SkipDialog() {
  const open = useLabelerStore((state) => state.skipRequest)
  return open ? <SkipDialogContent /> : null
}

function SkipDialogContent() {
  const cancelSkip = useLabelerStore((state) => state.cancelSkip)
  const confirmSkip = useLabelerStore((state) => state.confirmSkip)
  const [reason, setReason] = useState(DEFAULT_REASON)
  const [custom, setCustom] = useState('')

  const usesCustom = reason === OTHER_REASON
  const value = usesCustom ? custom.trim() : reason
  const canConfirm = value.length > 0

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onClick={cancelSkip}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          cancelSkip()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-title"
        className="w-full max-w-md rounded-lg border border-line bg-surface p-4 shadow-(--shadow-pop)"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="skip-title" className="text-sm font-semibold text-ink">
          {copy.labeler.skipTitle}
        </h2>

        <div role="radiogroup" aria-labelledby="skip-title" className="mt-3 flex flex-col gap-1.5">
          {[...copy.labeler.skipReasons, OTHER_REASON].map((option) => {
            const selected = reason === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setReason(option)}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
                  selected ? 'border-accent bg-accent-soft text-ink' : 'border-line text-muted hover:text-ink',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 rounded-full border',
                    selected ? 'border-accent bg-accent' : 'border-line-strong',
                  )}
                />
                {option}
              </button>
            )
          })}
        </div>

        {usesCustom ? (
          <label className="mt-3 flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-muted">{OTHER_REASON}</span>
            <textarea
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder={copy.labeler.skipOtherPlaceholder}
              rows={3}
              className="w-full resize-y rounded-md border border-line bg-surface-2 px-3 py-2 text-sm placeholder:text-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </label>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={cancelSkip}>{copy.labeler.cancel}</Button>
          <Button variant="primary" disabled={!canConfirm} onClick={() => confirmSkip(value)}>
            {copy.labeler.confirmSkip}
          </Button>
        </div>
      </div>
    </div>
  )
}
