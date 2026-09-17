import { decodeMii, encodeMii, validateMii, type MiiData } from 'mii-core'
import { bytesToHex, hexToBytes } from './file'
import type { SectionId } from './navigation'
import { SECTION_IDS } from './navigation'
import type { StageId } from './stages'
import { STAGE_IDS } from './stages'

const STORAGE_KEY = 'mii-builder.editor'

interface PersistedEditor {
  schemaVersion: 1
  miiRcd: string
  sectionId: string
  stageId: string
  savedAt: string
}

export interface PersistedEditorState {
  mii: MiiData
  sectionId: SectionId
  stageId: StageId
}

function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value)
}

function isStageId(value: string): value is StageId {
  return (STAGE_IDS as readonly string[]).includes(value)
}

/**
 * Autosave stores the encoded RCD as hex: reloading goes through the codec, so
 * a stale or corrupted entry can never produce a Mii the editor cannot encode.
 */
export function loadEditorState(): PersistedEditorState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<PersistedEditor>
    if (parsed.schemaVersion !== 1 || typeof parsed.miiRcd !== 'string') {
      return null
    }
    const mii = decodeMii(hexToBytes(parsed.miiRcd)).mii
    if (validateMii(mii).some((issue) => issue.severity === 'error')) {
      return null
    }
    return {
      mii,
      sectionId: isSectionId(parsed.sectionId ?? '') ? (parsed.sectionId as SectionId) : 'personal',
      stageId: isStageId(parsed.stageId ?? '') ? (parsed.stageId as StageId) : 'chiaro',
    }
  } catch {
    return null
  }
}

export function saveEditorState(state: PersistedEditorState): void {
  try {
    const persisted: PersistedEditor = {
      schemaVersion: 1,
      miiRcd: bytesToHex(encodeMii(state.mii)),
      sectionId: state.sectionId,
      stageId: state.stageId,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  } catch {
    /* storage full or unavailable: autosave is best effort */
  }
}
