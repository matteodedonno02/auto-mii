import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { STAGES } from '@/lib/stages'
import { useEditorStore } from '@/lib/store'

export function BackgroundPicker() {
  const stageId = useEditorStore((state) => state.stageId)
  const setStage = useEditorStore((state) => state.setStage)

  return (
    <div role="radiogroup" aria-label={copy.stage.label} className="flex items-center justify-center gap-2.5">
      {STAGES.map((stage) => {
        const selected = stage.id === stageId
        const label = copy.stage[stage.id]
        return (
          <button
            key={stage.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setStage(stage.id)}
            className={cn(
              'h-6 w-6 overflow-hidden rounded-full border transition-transform duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              selected
                ? 'border-transparent ring-2 ring-accent ring-offset-2 ring-offset-bg'
                : 'border-line hover:scale-105 motion-reduce:hover:scale-100',
            )}
            style={stage.swatch ? { backgroundColor: stage.swatch } : undefined}
          >
            {stage.swatch === null ? <span className="stage-checker block h-full w-full" aria-hidden="true" /> : null}
          </button>
        )
      })}
    </div>
  )
}
