import type { MiiData } from 'mii-core'

export const LABELER_MODES = ['first', 'second'] as const

export type LabelerMode = (typeof LABELER_MODES)[number]

export interface LabelerPhoto {
  id: string
  name: string
  url: string
}

export interface PendingPhoto {
  name: string
  file: File
}

export interface LabelerNotice {
  kind: 'success' | 'error'
  message: string
}

export type EntryStatus = { kind: 'saved' } | { kind: 'skipped'; reason: string }

export type LabelerDrafts = Record<LabelerMode, Record<string, MiiData>>

export type LabelerStatuses = Record<LabelerMode, Record<string, EntryStatus>>

export interface DiskMii {
  id: string
  mode: LabelerMode
  mii: MiiData
}

export interface SkippedNote {
  id: string
  photo: string
  mode: LabelerMode
  reason: string
}
