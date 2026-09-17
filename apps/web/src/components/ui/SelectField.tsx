import { CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { FieldRow } from './FieldRow'

export interface SelectOption {
  value: number
  label: string
}

export interface SelectFieldProps {
  id: string
  label: string
  value: number
  options: ReadonlyArray<SelectOption>
  onChange: (value: number) => void
  disabled?: boolean
  hint?: string
}

export function SelectField({ id, label, value, options, onChange, disabled, hint }: SelectFieldProps) {
  return (
    <FieldRow id={id} label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className={cn(
            'h-9 w-full appearance-none rounded-md border border-line bg-surface-2 pr-9 pl-3 text-sm text-ink transition-colors duration-150',
            'hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldRow>
  )
}
