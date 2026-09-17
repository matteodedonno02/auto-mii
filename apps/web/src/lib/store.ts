import { create } from 'zustand'
import {
  NORMAL_MII_TYPE,
  createDefaultMii,
  creationTicksFromDate,
  randomizeMii,
  type MiiData,
} from 'mii-core'
import { copy } from './i18n'
import type { SectionId } from './navigation'
import { setMiiField, type MiiFieldPath } from './paths'
import * as persistence from './persistence'
import type { StageId } from './stages'

const HISTORY_LIMIT = 100

export interface Notice {
  kind: 'success' | 'error'
  message: string
}

interface EditorState {
  mii: MiiData
  sectionId: SectionId
  stageId: StageId
  notice: Notice | null
  past: MiiData[]
  future: MiiData[]
  /** Snapshot taken at the start of a continuous edit (slider drag). */
  pending: MiiData | null

  setField: <T>(path: MiiFieldPath, value: T) => void
  scratchField: <T>(path: MiiFieldPath, value: T) => void
  commitScratch: () => void
  undo: () => void
  redo: () => void
  randomize: () => void
  resetToNew: () => void
  regenerateId: () => void
  loadMii: (mii: MiiData, notice?: Notice) => void
  setSection: (sectionId: SectionId) => void
  setStage: (stageId: StageId) => void
  setNotice: (notice: Notice | null) => void
}

function pushPast(past: MiiData[], snapshot: MiiData): MiiData[] {
  const next = past.length >= HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT + 1) : past.slice()
  next.push(snapshot)
  return next
}

const restored = persistence.loadEditorState()

export const useEditorStore = create<EditorState>((set) => ({
  mii: restored?.mii ?? createDefaultMii(),
  sectionId: restored?.sectionId ?? 'personal',
  stageId: restored?.stageId ?? 'chiaro',
  notice: null,
  past: [],
  future: [],
  pending: null,

  setField: (path, value) =>
    set((state) => ({
      mii: setMiiField(state.mii, path, value),
      past: pushPast(state.past, state.mii),
      future: [],
      pending: null,
    })),

  scratchField: (path, value) =>
    set((state) => ({
      mii: setMiiField(state.mii, path, value),
      pending: state.pending ?? state.mii,
    })),

  commitScratch: () =>
    set((state) => {
      if (state.pending === null || state.pending === state.mii) {
        return { pending: null }
      }
      return { past: pushPast(state.past, state.pending), future: [], pending: null }
    }),

  undo: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1]
      if (previous === undefined) {
        return state
      }
      return {
        mii: previous,
        past: state.past.slice(0, -1),
        future: [state.mii, ...state.future],
        pending: null,
      }
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0]
      if (next === undefined) {
        return state
      }
      return {
        mii: next,
        past: pushPast(state.past, state.mii),
        future: state.future.slice(1),
        pending: null,
      }
    }),

  randomize: () =>
    set((state) => ({
      mii: randomizeMii(state.mii),
      past: pushPast(state.past, state.mii),
      future: [],
      pending: null,
    })),

  resetToNew: () =>
    set((state) => ({
      mii: createDefaultMii({ consoleId: state.mii.consoleId }),
      past: pushPast(state.past, state.mii),
      future: [],
      pending: null,
      notice: { kind: 'success', message: copy.status.newMii },
    })),

  loadMii: (mii, notice) =>
    set((state) => ({
      mii,
      past: pushPast(state.past, state.mii),
      future: [],
      pending: null,
      notice: notice ?? null,
    })),

  regenerateId: () =>
    set((state) => ({
      mii: {
        ...state.mii,
        miiType: NORMAL_MII_TYPE,
        creationTicks: creationTicksFromDate(new Date()),
      },
      past: pushPast(state.past, state.mii),
      future: [],
      pending: null,
    })),

  setSection: (sectionId) => set({ sectionId }),
  setStage: (stageId) => set({ stageId }),
  setNotice: (notice) => set({ notice }),
}))
