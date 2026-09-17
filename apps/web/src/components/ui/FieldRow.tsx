import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface FieldRowProps {
  id: string
  label: string
  /** When set the label becomes a real <label> for that control. */
  htmlFor?: string
  /** Short value readout aligned with the label (sliders, counters). */
  end?: ReactNode
  hint?: string
  children: ReactNode
  className?: string
}

export function FieldRow({ id, label, htmlFor, end, hint, children, className }: FieldRowProps) {
  const labelClass = 'text-[13px] font-medium text-muted'
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className={labelClass}>
            {label}
          </label>
        ) : (
          <span id={`${id}-label`} className={labelClass}>
            {label}
          </span>
        )}
        {end}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}
