import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultMii, decodeMii, encodeMii, validateMii } from 'mii-core'
import { setMiiField } from './paths'
import { useEditorStore } from './store'

const initial = createDefaultMii()

beforeEach(() => {
  useEditorStore.setState({
    mii: initial,
    sectionId: 'personal',
    stageId: 'chiaro',
    notice: null,
    past: [],
    future: [],
    pending: null,
  })
})

describe('editor store', () => {
  it('records one history step per discrete field change', () => {
    useEditorStore.getState().setField('height', 100)
    useEditorStore.getState().setField('build', 20)
    const state = useEditorStore.getState()
    expect(state.mii.height).toBe(100)
    expect(state.mii.build).toBe(20)
    expect(state.past).toHaveLength(2)
  })

  it('undoes and redoes changes', () => {
    useEditorStore.getState().setField('height', 100)
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().mii.height).toBe(initial.height)
    useEditorStore.getState().redo()
    expect(useEditorStore.getState().mii.height).toBe(100)
  })

  it('collapses a whole slider drag into a single undo step', () => {
    const { scratchField } = useEditorStore.getState()
    scratchField('height', 70)
    scratchField('height', 80)
    scratchField('height', 90)
    expect(useEditorStore.getState().past).toHaveLength(0)
    useEditorStore.getState().commitScratch()
    expect(useEditorStore.getState().past).toHaveLength(1)
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().mii.height).toBe(initial.height)
  })

  it('keeps randomized Miis inside the documented ranges', () => {
    for (let i = 0; i < 20; i++) {
      useEditorStore.setState({ mii: initial })
      useEditorStore.getState().randomize()
      expect(validateMii(useEditorStore.getState().mii)).toEqual([])
    }
  })

  it('round-trips edits through the file codec without losses', () => {
    useEditorStore.getState().setField('hair.type', 5)
    useEditorStore.getState().setField('name', 'Prova')
    const current = useEditorStore.getState().mii
    const decoded = decodeMii(encodeMii(current)).mii
    expect(decoded).toEqual(current)
    expect(decoded.hair.type).toBe(5)
    expect(decoded.name).toBe('Prova')
  })

  it('resets to a new Mii keeping the console ID', () => {
    useEditorStore.setState({ mii: setMiiField(initial, 'height', 120) })
    useEditorStore.getState().resetToNew()
    const state = useEditorStore.getState()
    expect(state.mii.height).toBe(initial.height)
    expect(Array.from(state.mii.consoleId)).toEqual(Array.from(initial.consoleId))
    expect(state.notice?.kind).toBe('success')
  })

  it('regenerates the Mii ID as a normal, current Mii', () => {
    useEditorStore.setState({ mii: { ...initial, miiType: 12, creationTicks: 1 } })
    useEditorStore.getState().regenerateId()
    const state = useEditorStore.getState()
    expect(state.mii.miiType).toBe(8)
    expect(state.mii.creationTicks).toBeGreaterThan(1)
  })
})
