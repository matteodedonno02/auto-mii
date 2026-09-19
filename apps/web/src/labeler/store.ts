import { create } from 'zustand'
import { createDefaultMii, encodeMii } from 'mii-core'
import { downloadBytes, downloadText } from '@/lib/file'
import { copy } from '@/lib/i18n'
import { useEditorStore } from '@/lib/store'
import {
  pickDirectory,
  readDirectoryMiis,
  readDirectoryPhotos,
  supportsDirectoryPicker,
  writeMiiFile,
} from './fsa'
import { isImageFileName, miiFileName, photoIdFromName } from './naming'
import { emptyDrafts, emptyStatuses, loadLabelerSnapshot, saveLabelerSnapshot } from './storage'
import { LABELER_MODES } from './types'
import type {
  DiskMii,
  EntryStatus,
  LabelerDrafts,
  LabelerMode,
  LabelerNotice,
  LabelerPhoto,
  LabelerStatuses,
  PendingPhoto,
  SkippedNote,
} from './types'

export interface LabelerData {
  photos: LabelerPhoto[]
  index: number
  mode: LabelerMode
  drafts: LabelerDrafts
  statuses: LabelerStatuses
  photoDir: FileSystemDirectoryHandle | null
  photoDirName: string | null
  miiDir: FileSystemDirectoryHandle | null
  miiDirName: string | null
  notice: LabelerNotice | null
  busy: boolean
  skipRequest: boolean
}

interface LabelerActions {
  setFiles: (files: PendingPhoto[]) => void
  clearPhotos: () => void
  openPhotoDirectory: () => Promise<void>
  openMiiDirectory: () => Promise<void>
  registerDrafts: (entries: DiskMii[]) => void
  goTo: (index: number) => void
  next: () => void
  previous: () => void
  setMode: (mode: LabelerMode) => void
  saveCurrent: () => Promise<void>
  requestSkip: () => void
  cancelSkip: () => void
  confirmSkip: (reason: string) => void
  resetProgress: () => void
  exportSkippedNotes: () => void
  setNotice: (notice: LabelerNotice | null) => void
}

export type LabelerState = LabelerData & LabelerActions

export function initialLabelerData(): LabelerData {
  const snapshot = loadLabelerSnapshot()
  return {
    photos: [],
    index: 0,
    mode: snapshot?.mode ?? 'first',
    drafts: snapshot?.drafts ?? emptyDrafts(),
    statuses: snapshot?.statuses ?? emptyStatuses(),
    photoDir: null,
    photoDirName: null,
    miiDir: null,
    miiDirName: null,
    notice: null,
    busy: false,
    skipRequest: false,
  }
}

function activePhoto(state: LabelerData): LabelerPhoto | null {
  return state.photos[state.index] ?? null
}

function captureDraft(state: LabelerData): LabelerDrafts {
  const photo = activePhoto(state)
  if (!photo) {
    return state.drafts
  }
  return {
    ...state.drafts,
    [state.mode]: { ...state.drafts[state.mode], [photo.id]: useEditorStore.getState().mii },
  }
}

function loadDraft(mode: LabelerMode, id: string, drafts: LabelerDrafts): void {
  const mii = drafts[mode][id] ?? createDefaultMii()
  useEditorStore.setState({ mii, past: [], future: [], pending: null, notice: null })
}

function persist(state: LabelerData): void {
  saveLabelerSnapshot({ mode: state.mode, drafts: state.drafts, statuses: state.statuses })
}

function withStatus(
  statuses: LabelerStatuses,
  mode: LabelerMode,
  id: string,
  status: EntryStatus,
): LabelerStatuses {
  return { ...statuses, [mode]: { ...statuses[mode], [id]: status } }
}

function skippedNotes(state: LabelerData): SkippedNote[] {
  const notes: SkippedNote[] = []
  for (const mode of LABELER_MODES) {
    for (const photo of state.photos) {
      const status = state.statuses[mode][photo.id]
      if (status?.kind === 'skipped') {
        notes.push({ id: photo.id, photo: photo.name, mode, reason: status.reason })
      }
    }
  }
  return notes
}

export const useLabelerStore = create<LabelerState>((set, get) => ({
  ...initialLabelerData(),

  setFiles: (files) => {
    const state = get()
    for (const photo of state.photos) {
      URL.revokeObjectURL(photo.url)
    }
    const seen = new Set<string>()
    const photos: LabelerPhoto[] = []
    let duplicates = 0
    for (const item of files) {
      if (!isImageFileName(item.name)) {
        continue
      }
      const id = photoIdFromName(item.name)
      if (seen.has(id)) {
        duplicates += 1
        continue
      }
      seen.add(id)
      photos.push({ id, name: item.name, url: URL.createObjectURL(item.file) })
    }
    photos.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    const notice: LabelerNotice =
      photos.length === 0
        ? { kind: 'error', message: copy.labeler.noPhotos }
        : duplicates > 0
          ? { kind: 'error', message: copy.labeler.duplicates(duplicates) }
          : { kind: 'success', message: copy.labeler.photosLoaded(photos.length) }
    const drafts = state.drafts
    if (photos[0]) {
      loadDraft(state.mode, photos[0].id, drafts)
    }
    set({ photos, index: 0, drafts, notice, skipRequest: false })
    persist(get())
  },

  clearPhotos: () => {
    const state = get()
    for (const photo of state.photos) {
      URL.revokeObjectURL(photo.url)
    }
    set({ photos: [], index: 0, photoDir: null, photoDirName: null, notice: null, skipRequest: false })
  },

  openPhotoDirectory: async () => {
    if (!supportsDirectoryPicker()) {
      set({ notice: { kind: 'error', message: copy.labeler.noDirectoryApi } })
      return
    }
    const directory = await pickDirectory('gold-photos', 'read')
    if (!directory) {
      return
    }
    try {
      const files = await readDirectoryPhotos(directory)
      get().setFiles(files.map(({ name, file }) => ({ name, file })))
      set({ photoDir: directory, photoDirName: directory.name })
    } catch {
      set({ notice: { kind: 'error', message: copy.labeler.photoDirError } })
    }
  },

  openMiiDirectory: async () => {
    if (!supportsDirectoryPicker()) {
      set({ notice: { kind: 'error', message: copy.labeler.noDirectoryApi } })
      return
    }
    const directory = await pickDirectory('gold-mii', 'readwrite')
    if (!directory) {
      return
    }
    try {
      const entries = await readDirectoryMiis(directory)
      get().registerDrafts(entries)
      set({
        miiDir: directory,
        miiDirName: directory.name,
        notice: { kind: 'success', message: copy.labeler.miiDirLoaded(entries.length) },
      })
    } catch {
      set({ notice: { kind: 'error', message: copy.labeler.miiDirError } })
    }
  },

  registerDrafts: (entries) => {
    const state = get()
    const drafts: LabelerDrafts = { first: { ...state.drafts.first }, second: { ...state.drafts.second } }
    const statuses: LabelerStatuses = { first: { ...state.statuses.first }, second: { ...state.statuses.second } }
    for (const entry of entries) {
      if (drafts[entry.mode][entry.id] === undefined) {
        drafts[entry.mode][entry.id] = entry.mii
      }
      if (statuses[entry.mode][entry.id] === undefined) {
        statuses[entry.mode][entry.id] = { kind: 'saved' }
      }
    }
    const photo = activePhoto(state)
    if (photo && state.drafts[state.mode][photo.id] === undefined && drafts[state.mode][photo.id] !== undefined) {
      loadDraft(state.mode, photo.id, drafts)
    }
    set({ drafts, statuses })
    persist(get())
  },

  goTo: (target) => {
    const state = get()
    if (state.photos.length === 0) {
      return
    }
    const index = Math.min(Math.max(target, 0), state.photos.length - 1)
    const drafts = captureDraft(state)
    const photo = state.photos[index]
    loadDraft(state.mode, photo.id, drafts)
    set({ index, drafts, skipRequest: false })
    persist(get())
  },

  next: () => get().goTo(get().index + 1),

  previous: () => get().goTo(get().index - 1),

  setMode: (mode) => {
    const state = get()
    if (mode === state.mode) {
      return
    }
    const drafts = captureDraft(state)
    const photo = activePhoto(state)
    if (photo) {
      loadDraft(mode, photo.id, drafts)
    }
    set({ mode, drafts, skipRequest: false })
    persist(get())
  },

  saveCurrent: async () => {
    const state = get()
    const photo = activePhoto(state)
    if (!photo || state.busy) {
      return
    }
    const drafts = captureDraft(state)
    const mii = drafts[state.mode][photo.id]
    if (!mii) {
      return
    }
    const filename = miiFileName(photo.id, state.mode)
    const bytes = encodeMii(mii)
    set({ drafts, busy: true })
    try {
      if (state.miiDir) {
        await writeMiiFile(state.miiDir, filename, bytes)
        set({
          statuses: withStatus(get().statuses, state.mode, photo.id, { kind: 'saved' }),
          notice: { kind: 'success', message: copy.labeler.savedToDir(filename) },
          busy: false,
        })
      } else {
        downloadBytes(filename, bytes)
        set({
          statuses: withStatus(get().statuses, state.mode, photo.id, { kind: 'saved' }),
          notice: { kind: 'success', message: copy.labeler.downloaded(filename) },
          busy: false,
        })
      }
      persist(get())
      get().next()
    } catch {
      set({ busy: false, notice: { kind: 'error', message: copy.labeler.saveError } })
    }
  },

  requestSkip: () => {
    if (activePhoto(get())) {
      set({ skipRequest: true })
    }
  },

  cancelSkip: () => set({ skipRequest: false }),

  confirmSkip: (reason) => {
    const state = get()
    const photo = activePhoto(state)
    const trimmed = reason.trim()
    if (!photo || trimmed.length === 0) {
      return
    }
    const drafts = captureDraft(state)
    const statuses = withStatus(state.statuses, state.mode, photo.id, { kind: 'skipped', reason: trimmed })
    set({
      drafts,
      statuses,
      skipRequest: false,
      notice: { kind: 'success', message: copy.labeler.skipped(photo.id) },
    })
    persist(get())
    get().next()
  },

  resetProgress: () => {
    const state = get()
    const drafts: LabelerDrafts = { ...state.drafts, [state.mode]: {} }
    const statuses: LabelerStatuses = { ...state.statuses, [state.mode]: {} }
    const photo = activePhoto(state)
    if (photo) {
      loadDraft(state.mode, photo.id, drafts)
    }
    set({ drafts, statuses, notice: { kind: 'success', message: copy.labeler.progressReset } })
    persist(get())
  },

  exportSkippedNotes: () => {
    const notes = skippedNotes(get())
    if (notes.length === 0) {
      set({ notice: { kind: 'error', message: copy.labeler.noSkipped } })
      return
    }
    downloadText('gold-skipped.json', JSON.stringify({ generatedAt: new Date().toISOString(), skipped: notes }, null, 2))
    set({ notice: { kind: 'success', message: copy.labeler.notesExported(notes.length) } })
  },

  setNotice: (notice) => set({ notice }),
}))
