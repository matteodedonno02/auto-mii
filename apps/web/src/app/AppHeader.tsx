import { Moon, Sun } from '@phosphor-icons/react'
import { HeaderActions } from '@/components/editor/HeaderActions'
import { IconButton } from '@/components/ui/IconButton'
import { copy } from '@/lib/i18n'
import { useEditorStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'

export function AppHeader() {
  const name = useEditorStore((state) => state.mii.name)
  const setField = useEditorStore((state) => state.setField)
  const theme = useTheme()

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent font-display text-base font-extrabold text-accent-ink"
        >
          M
        </span>
        <span className="hidden font-display text-lg font-bold tracking-tight whitespace-nowrap sm:block">
          {copy.app.name}
        </span>
        <span className="hidden text-xs text-muted whitespace-nowrap xl:inline">{copy.app.tagline}</span>
      </div>

      <label className="ml-2 hidden md:block">
        <span className="sr-only">{copy.header.nameLabel}</span>
        <input
          type="text"
          value={name}
          maxLength={10}
          placeholder={copy.header.namePlaceholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setField('name', event.target.value)}
          className="h-9 w-44 rounded-md border border-line bg-surface-2 px-3 text-sm transition-colors duration-150 placeholder:text-muted hover:border-line-strong focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <HeaderActions />
        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <IconButton
          className="hidden sm:inline-flex"
          label={theme.resolved === 'dark' ? copy.header.themeLight : copy.header.themeDark}
          onClick={theme.toggle}
        >
          {theme.resolved === 'dark' ? <Sun size={17} weight="bold" /> : <Moon size={17} weight="bold" />}
        </IconButton>
      </div>
    </header>
  )
}
