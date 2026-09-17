import { cn } from '@/lib/cn'
import { FieldRow } from './FieldRow'

export interface ToggleProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}

export function Toggle({ id, label, checked, onChange, hint }: ToggleProps) {
  return (
    <FieldRow id={id} label={label} hint={hint}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full border transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-2',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-surface shadow-(--shadow-card) transition-transform duration-150',
            checked ? 'translate-x-5 bg-accent-ink' : 'translate-x-0',
          )}
        />
      </button>
    </FieldRow>
  )
}
