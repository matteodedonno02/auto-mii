import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { FieldRow } from './FieldRow'

export interface ColorGridProps {
  id: string
  label: string
  colors: readonly string[]
  value: number
  onChange: (index: number) => void
  names?: readonly string[]
}

function readableIconColor(hex: string): string {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#1A1A1C' : '#FFFFFF'
}

export function ColorGrid({ id, label, colors, value, onChange, names }: ColorGridProps) {
  const move = (delta: number) => {
    const next = (value + delta + colors.length) % colors.length
    onChange(next)
  }

  return (
    <FieldRow
      id={id}
      label={label}
      end={
        names?.[value] ? <span className="text-xs text-ink">{names[value]}</span> : null
      }
    >
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="flex flex-wrap gap-2"
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
        {colors.map((color, index) => {
          const selected = index === value
          const name = names?.[index]
          return (
            <button
              key={`${color}-${index}`}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name ?? `${label} ${index}`}
              tabIndex={selected ? 0 : -1}
              title={name}
              onClick={() => onChange(index)}
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full border transition-[box-shadow,transform] duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                selected
                  ? 'border-transparent ring-2 ring-accent ring-offset-2 ring-offset-surface'
                  : 'border-line hover:scale-105 motion-reduce:hover:scale-100',
              )}
              style={{ backgroundColor: color }}
            >
              {selected ? (
                <Check size={14} weight="bold" style={{ color: readableIconColor(color) }} aria-hidden="true" />
              ) : null}
            </button>
          )
        })}
      </div>
    </FieldRow>
  )
}
