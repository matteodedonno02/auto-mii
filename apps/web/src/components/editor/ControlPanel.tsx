import { Check, WarningCircle } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { validateMii } from 'mii-core'
import { FieldRenderer } from '@/components/editor/FieldRenderer'
import { Panel } from '@/components/ui/Panel'
import { SECTIONS } from '@/editor/sections'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { useEditorStore } from '@/lib/store'

const MAX_VISIBLE_ISSUES = 3

export function ControlPanel() {
  const sectionId = useEditorStore((state) => state.sectionId)
  const mii = useEditorStore((state) => state.mii)
  const section = SECTIONS.find((item) => item.id === sectionId) ?? SECTIONS[0]
  const issues = useMemo(() => validateMii(mii), [mii])
  const errors = issues.filter((issue) => issue.severity === 'error')
  const Icon = section.icon

  return (
    <Panel className="flex flex-col lg:min-h-0 lg:flex-1">
      <header className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <Icon size={18} weight="bold" aria-hidden="true" className="text-accent" />
        <h2 className="text-sm font-semibold text-ink">{section.label}</h2>
      </header>

      <div className="flex flex-col gap-6 px-4 py-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {section.fields.map((field, index) => (
          <FieldRenderer key={`${section.id}-${index}`} field={field} />
        ))}
        {section.id === 'info' ? (
          <p className="border-t border-line pt-4 text-xs leading-relaxed text-muted">{copy.app.disclaimer}</p>
        ) : null}
      </div>

      <footer
        className={cn(
          'flex items-start gap-2 border-t border-line px-4 py-3 text-xs',
          errors.length === 0 ? 'text-muted' : 'text-danger',
        )}
        role="status"
      >
        {errors.length === 0 ? (
          <>
            <Check size={14} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
            <span>{copy.status.valid}</span>
          </>
        ) : (
          <>
            <WarningCircle size={14} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">{copy.status.issues(errors.length)}</span>
              <ul className="flex flex-col gap-0.5">
                {errors.slice(0, MAX_VISIBLE_ISSUES).map((issue) => (
                  <li key={issue.path} className="font-mono text-[10px] tracking-tight">
                    {issue.path}: {issue.message}
                  </li>
                ))}
                {errors.length > MAX_VISIBLE_ISSUES ? (
                  <li className="text-[10px]">+{errors.length - MAX_VISIBLE_ISSUES}</li>
                ) : null}
              </ul>
            </div>
          </>
        )}
      </footer>
    </Panel>
  )
}
