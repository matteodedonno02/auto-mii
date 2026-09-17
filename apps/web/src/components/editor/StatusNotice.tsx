import { X } from '@phosphor-icons/react'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'
import { copy } from '@/lib/i18n'
import { useEditorStore } from '@/lib/store'

export function StatusNotice() {
  const notice = useEditorStore((state) => state.notice)
  const setNotice = useEditorStore((state) => state.setNotice)

  if (!notice) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'z-40 flex items-center gap-2 border-b px-3 py-2 text-sm sm:px-5',
        notice.kind === 'success' ? 'border-line bg-surface-2 text-ink' : 'border-danger/25 bg-danger-soft text-danger',
      )}
    >
      <span className="flex-1">{notice.message}</span>
      <IconButton label={copy.actions.dismiss} onClick={() => setNotice(null)}>
        <X size={15} weight="bold" />
      </IconButton>
    </div>
  )
}
