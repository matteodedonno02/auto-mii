import { useEffect } from 'react'
import { saveEditorState } from './persistence'
import { useEditorStore } from './store'

const AUTOSAVE_DELAY_MS = 400

/** Debounced autosave: encodes the current Mii into localStorage after edits settle. */
export function useAutosave(): void {
  useEffect(() => {
    let timeout: number | undefined
    const unsubscribe = useEditorStore.subscribe((state, previous) => {
      if (state.mii === previous.mii && state.sectionId === previous.sectionId && state.stageId === previous.stageId) {
        return
      }
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        saveEditorState({ mii: state.mii, sectionId: state.sectionId, stageId: state.stageId })
      }, AUTOSAVE_DELAY_MS)
    })
    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [])
}
