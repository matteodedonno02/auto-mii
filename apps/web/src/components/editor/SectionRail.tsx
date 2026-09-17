import { SECTIONS } from '@/editor/sections'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { useEditorStore } from '@/lib/store'

export function SectionRail() {
  const sectionId = useEditorStore((state) => state.sectionId)
  const setSection = useEditorStore((state) => state.setSection)

  return (
    <nav
      aria-label={copy.rail.label}
      className="flex shrink-0 gap-1 overflow-x-auto pb-1 lg:grid lg:grid-cols-6 lg:gap-1.5 lg:overflow-visible lg:pb-0"
    >
      {SECTIONS.map((section) => {
        const active = section.id === sectionId
        const Icon = section.icon
        return (
          <button
            key={section.id}
            type="button"
            aria-current={active ? 'true' : undefined}
            aria-label={section.label}
            title={section.label}
            onClick={() => setSection(section.id)}
            className={cn(
              'relative grid h-10 w-10 shrink-0 place-items-center rounded-md transition-colors duration-150 lg:h-9 lg:w-full',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
            )}
          >
            <Icon size={20} weight="bold" aria-hidden="true" />
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
              />
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}
