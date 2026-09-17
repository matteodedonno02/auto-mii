import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface PanelProps {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, actions, children, className }: PanelProps) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface shadow-(--shadow-card)', className)}>
      {title || actions ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          {title ? <h2 className="text-sm font-semibold text-ink">{title}</h2> : <span />}
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  )
}
