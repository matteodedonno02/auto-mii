import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CanvasStageProps {
  /** Background classes for the stage surface (color or `.stage-checker`). */
  backgroundClass: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function CanvasStage({ backgroundClass, children, className, style }: CanvasStageProps) {
  return (
    <div
      style={style}
      className={cn(
        'relative grid place-items-center overflow-hidden rounded-lg border border-line shadow-(--shadow-card)',
        backgroundClass,
        className,
      )}
    >
      {children}
    </div>
  )
}
