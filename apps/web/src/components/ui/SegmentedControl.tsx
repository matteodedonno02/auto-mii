import { cn } from '@/lib/cn'
import { FieldRow } from './FieldRow'

export interface SegmentedOption {
  value: number
  label: string
}

export interface SegmentedControlProps {
  id: string
  label: string
  value: number
  options: ReadonlyArray<SegmentedOption>
  onChange: (value: number) => void
}

export function SegmentedControl({ id, label, value, options, onChange }: SegmentedControlProps) {
  const move = (delta: number) => {
    const current = options.findIndex((option) => option.value === value)
    const next = options[(current + delta + options.length) % options.length]
    if (next) {
      onChange(next.value)
    }
  }

  return (
    <FieldRow id={id} label={label}>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="inline-flex w-full rounded-full border border-line bg-surface-2 p-1"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault()
            move(1)
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault()
            move(-1)
          }
        }}
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={cn(
                'h-7 flex-1 rounded-full px-3 text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
                selected ? 'bg-surface text-ink shadow-(--shadow-card)' : 'text-muted hover:text-ink',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </FieldRow>
  )
}
