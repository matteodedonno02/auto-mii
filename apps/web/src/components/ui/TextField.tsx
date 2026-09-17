import { cn } from '@/lib/cn'
import { FieldRow } from './FieldRow'

export interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  placeholder?: string
  className?: string
}

export function TextField({ id, label, value, onChange, maxLength, placeholder, className }: TextFieldProps) {
  return (
    <FieldRow
      id={id}
      label={label}
      htmlFor={id}
      className={className}
      end={
        <span className="font-mono text-[10px] text-muted tabular-nums">
          {value.length}/{maxLength}
        </span>
      }
    >
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-9 w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-ink transition-colors duration-150',
          'placeholder:text-muted hover:border-line-strong',
          'focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        )}
      />
    </FieldRow>
  )
}
