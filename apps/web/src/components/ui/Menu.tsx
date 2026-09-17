import { CaretDown, type Icon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button, type ButtonVariant } from './Button'

export interface MenuItem {
  id: string
  label: string
  icon?: Icon
  onSelect: () => void
}

export interface MenuProps {
  label: string
  icon?: Icon
  items: readonly MenuItem[]
  variant?: ButtonVariant
  align?: 'start' | 'end'
  /** Collapses to an icon-only trigger below the `sm` breakpoint. */
  compact?: boolean
}

export function Menu({ label, icon: TriggerIcon, items, variant = 'secondary', align = 'end', compact = false }: MenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant={variant}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={cn(compact && 'w-9 px-0 sm:w-auto sm:px-3')}
      >
        {TriggerIcon ? <TriggerIcon size={16} weight="bold" aria-hidden="true" /> : null}
        <span className={cn(compact && 'hidden sm:inline')}>{label}</span>
        <CaretDown
          size={12}
          weight="bold"
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180', compact && 'hidden sm:block')}
        />
      </Button>
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 min-w-56 rounded-md border border-line bg-surface p-1 shadow-(--shadow-pop)',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-ink transition-colors duration-150',
                'hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
              )}
            >
              {item.icon ? <item.icon size={16} weight="bold" aria-hidden="true" className="text-muted" /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
