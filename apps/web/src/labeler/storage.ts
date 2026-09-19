import { decodeMii, encodeMii } from 'mii-core'
import { bytesToHex, hexToBytes } from '@/lib/file'
import { LABELER_MODES, type EntryStatus, type LabelerDrafts, type LabelerMode, type LabelerStatuses } from './types'

const STORAGE_KEY = 'mii-builder.labeler'

export interface LabelerSnapshot {
  mode: LabelerMode
  drafts: LabelerDrafts
  statuses: LabelerStatuses
}

interface PersistedLabeler {
  schemaVersion: 1
  mode: string
  drafts: Record<string, Record<string, string>>
  statuses: Record<string, Record<string, EntryStatus>>
}

export function emptyDrafts(): LabelerDrafts {
  return { first: {}, second: {} }
}

export function emptyStatuses(): LabelerStatuses {
  return { first: {}, second: {} }
}

function isMode(value: unknown): value is LabelerMode {
  return typeof value === 'string' && (LABELER_MODES as readonly string[]).includes(value)
}

function isEntryStatus(value: unknown): value is EntryStatus {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const status = value as Partial<EntryStatus>
  if (status.kind === 'saved') {
    return true
  }
  return status.kind === 'skipped' && typeof (status as { reason?: unknown }).reason === 'string'
}

export function loadLabelerSnapshot(): LabelerSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<PersistedLabeler>
    if (parsed.schemaVersion !== 1) {
      return null
    }
    const drafts = emptyDrafts()
    const statuses = emptyStatuses()
    for (const mode of LABELER_MODES) {
      const modeDrafts = parsed.drafts?.[mode]
      if (modeDrafts) {
        for (const [id, hex] of Object.entries(modeDrafts)) {
          try {
            drafts[mode][id] = decodeMii(hexToBytes(hex)).mii
          } catch {
            continue
          }
        }
      }
      const modeStatuses = parsed.statuses?.[mode]
      if (modeStatuses) {
        for (const [id, status] of Object.entries(modeStatuses)) {
          if (isEntryStatus(status)) {
            statuses[mode][id] = status
          }
        }
      }
    }
    return { mode: isMode(parsed.mode) ? parsed.mode : 'first', drafts, statuses }
  } catch {
    return null
  }
}

export function saveLabelerSnapshot(snapshot: LabelerSnapshot): void {
  try {
    const persisted: PersistedLabeler = {
      schemaVersion: 1,
      mode: snapshot.mode,
      drafts: { first: {}, second: {} },
      statuses: { first: {}, second: {} },
    }
    for (const mode of LABELER_MODES) {
      for (const [id, mii] of Object.entries(snapshot.drafts[mode])) {
        persisted.drafts[mode][id] = bytesToHex(encodeMii(mii))
      }
      persisted.statuses[mode] = { ...snapshot.statuses[mode] }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  } catch {
    return
  }
}
