import { useEffect } from 'react'
import { useLabelerStore } from './store'

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])
const ARROW_CONTROLS = '[role="radiogroup"], [role="slider"]'

export function useLabelerHotkeys(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }
      const target = event.target as HTMLElement | null
      const editable = Boolean(target && (target.isContentEditable || EDITABLE_TAGS.has(target.tagName)))
      const store = useLabelerStore.getState()

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        if (editable || target?.closest(ARROW_CONTROLS)) {
          return
        }
        event.preventDefault()
        if (event.key === 'ArrowRight') {
          store.next()
        } else if (event.key === 'ArrowLeft') {
          store.previous()
        } else {
          store.requestSkip()
        }
        return
      }

      if (event.key.toLowerCase() === 's' && !editable) {
        event.preventDefault()
        void store.saveCurrent()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
