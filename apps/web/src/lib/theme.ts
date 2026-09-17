import { useCallback, useEffect, useState } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'mii-builder.theme'

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function systemTheme(): ResolvedTheme {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useTheme(): { choice: ThemeChoice; resolved: ResolvedTheme; toggle: () => void } {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice)
  const [systemDark, setSystemDark] = useState(() => systemTheme() === 'dark')

  const resolved: ResolvedTheme = choice === 'system' ? (systemDark ? 'dark' : 'light') : choice

  useEffect(() => {
    if (choice === 'system') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = choice
    }
    try {
      if (choice === 'system') {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, choice)
      }
    } catch {
      /* storage unavailable: the toggle still works for this session */
    }
  }, [choice])

  useEffect(() => {
    if (choice !== 'system') {
      return
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [choice])

  const toggle = useCallback(() => {
    setChoice(resolved === 'dark' ? 'light' : 'dark')
  }, [resolved])

  return { choice, resolved, toggle }
}
