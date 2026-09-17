import { cn } from '@/lib/cn'
import { FieldRow } from './FieldRow'

export interface SliderControlProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  /** Called when a continuous drag or key repeat starts. */
  onCommitStart?: () => void
  /** Called when the drag ends: the whole gesture is one undo step. */
  onCommitEnd?: () => void
  formatValue?: (value: number) => string
  className?: string
}

export function SliderControl({
  id,
  label,
  value,
  min,
  max,
  onChange,
  onCommitStart,
  onCommitEnd,
  formatValue,
  className,
}: SliderControlProps) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0

  return (
    <FieldRow
      id={id}
      label={label}
      htmlFor={id}
      className={className}
      end={<span className="font-mono text-xs text-ink tabular-nums">{formatValue ? formatValue(value) : value}</span>}
    >
      <input
        id={id}
        type="range"
        className="slider w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        style={{
          background: `linear-gradient(to right, var(--accent) ${percent}%, var(--line-strong) ${percent}%)`,
        }}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerDown={onCommitStart}
        onPointerUp={onCommitEnd}
        onKeyDown={onCommitStart}
        onKeyUp={onCommitEnd}
        onBlur={onCommitEnd}
      />
      <div className={cn('flex justify-between font-mono text-[10px] text-muted tabular-nums')}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </FieldRow>
  )
}
