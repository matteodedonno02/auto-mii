import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import type { TileLayer } from 'mii-core'
import { FieldRow } from './FieldRow'
import { SpriteThumb } from './SpriteThumb'

export interface OptionGridProps {
  id: string
  label: string
  count: number
  value: number
  columns: number
  layersFor: (index: number) => TileLayer[]
  onChange: (index: number) => void
  end?: React.ReactNode
}

export function OptionGrid({ id, label, count, value, columns, layersFor, onChange, end }: OptionGridProps) {
  const move = (delta: number) => {
    const next = Math.min(count - 1, Math.max(0, value + delta))
    if (next !== value) {
      onChange(next)
      const element = document.getElementById(`${id}-option-${next}`)
      element?.focus()
    }
  }

  return (
    <FieldRow id={id} label={label} end={end}>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            move(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            move(-1)
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            move(columns)
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            move(-columns)
          }
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          const selected = index === value
          return (
            <button
              key={index}
              id={`${id}-option-${index}`}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label} ${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(index)}
              className={cn(
                'aspect-square rounded-md border p-0.5 transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                selected
                  ? 'border-accent bg-accent-soft ring-1 ring-accent'
                  : 'border-line bg-surface-2 hover:border-line-strong',
              )}
            >
              <SpriteThumb
                layers={layersFor(index)}
                fallback={<X size={14} weight="bold" className="text-muted" aria-hidden="true" />}
              />
            </button>
          )
        })}
      </div>
    </FieldRow>
  )
}
