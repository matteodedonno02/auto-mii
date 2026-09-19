import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultMii, decodeMii } from 'mii-core'
import { downloadBytes, downloadText } from '@/lib/file'
import { useEditorStore } from '@/lib/store'
import { pickDirectory, readDirectoryMiis, writeMiiFile } from './fsa'
import { initialLabelerData, useLabelerStore } from './store'

vi.mock('./fsa', () => ({
  supportsDirectoryPicker: () => true,
  pickDirectory: vi.fn(),
  readDirectoryPhotos: vi.fn(),
  readDirectoryMiis: vi.fn(),
  writeMiiFile: vi.fn(async () => undefined),
}))

vi.mock('@/lib/file', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/file')>()
  return { ...actual, downloadBytes: vi.fn(), downloadText: vi.fn() }
})

function photo(name: string): { name: string; file: File } {
  return { name, file: new File(['photo'], name, { type: 'image/jpeg' }) }
}

function resetStores(): void {
  localStorage.clear()
  vi.clearAllMocks()
  useLabelerStore.setState(initialLabelerData())
  useEditorStore.setState({
    mii: createDefaultMii(),
    sectionId: 'personal',
    stageId: 'chiaro',
    notice: null,
    past: [],
    future: [],
    pending: null,
  })
}

describe('labeler store', () => {
  beforeEach(resetStores)

  it('loads photos sorted by id, skipping non-images', () => {
    useEditorStore.getState().setField('name', 'vecchio')
    useLabelerStore.getState().setFiles([photo('gold-010.jpg'), photo('gold-002.png'), photo('notes.txt')])
    const state = useLabelerStore.getState()
    expect(state.photos.map((item) => item.id)).toEqual(['gold-002', 'gold-010'])
    expect(state.index).toBe(0)
    expect(useEditorStore.getState().mii.name).toBe('')
    expect(useEditorStore.getState().past).toHaveLength(0)
  })

  it('keeps a separate draft per photo while navigating', () => {
    useLabelerStore.getState().setFiles([photo('gold-001.jpg'), photo('gold-002.jpg')])
    useEditorStore.getState().setField('hair.type', 7)
    useLabelerStore.getState().next()
    expect(useEditorStore.getState().mii.hair.type).toBe(12)
    useEditorStore.getState().setField('hair.type', 30)
    useLabelerStore.getState().previous()
    expect(useEditorStore.getState().mii.hair.type).toBe(7)
    useLabelerStore.getState().next()
    expect(useEditorStore.getState().mii.hair.type).toBe(30)
  })

  it('records a skip reason and advances', () => {
    useLabelerStore.getState().setFiles([photo('gold-001.jpg'), photo('gold-002.jpg')])
    useLabelerStore.getState().requestSkip()
    expect(useLabelerStore.getState().skipRequest).toBe(true)
    useLabelerStore.getState().confirmSkip('   ')
    expect(useLabelerStore.getState().skipRequest).toBe(true)
    useLabelerStore.getState().confirmSkip('Foto mossa')
    const state = useLabelerStore.getState()
    expect(state.skipRequest).toBe(false)
    expect(state.statuses.first['gold-001']).toEqual({ kind: 'skipped', reason: 'Foto mossa' })
    expect(state.index).toBe(1)
  })

  it('falls back to a download when no .mii directory is open', async () => {
    useLabelerStore.getState().setFiles([photo('gold-001.jpg'), photo('gold-002.jpg')])
    useEditorStore.getState().setField('hair.type', 7)
    await useLabelerStore.getState().saveCurrent()
    expect(downloadBytes).toHaveBeenCalledTimes(1)
    const [filename, bytes] = vi.mocked(downloadBytes).mock.calls[0]
    expect(filename).toBe('gold-001.mii')
    expect(decodeMii(bytes).mii.hair.type).toBe(7)
    const state = useLabelerStore.getState()
    expect(state.statuses.first['gold-001']).toEqual({ kind: 'saved' })
    expect(state.index).toBe(1)
  })

  it('writes into the opened directory and uses the .p2 name in second pass', async () => {
    vi.mocked(pickDirectory).mockResolvedValue({ name: 'mii' } as FileSystemDirectoryHandle)
    vi.mocked(readDirectoryMiis).mockResolvedValue([])
    useLabelerStore.getState().setFiles([photo('gold-001.jpg')])
    await useLabelerStore.getState().openMiiDirectory()
    useEditorStore.getState().setField('hair.type', 7)
    useLabelerStore.getState().setMode('second')
    useEditorStore.getState().setField('hair.type', 30)
    await useLabelerStore.getState().saveCurrent()
    expect(writeMiiFile).toHaveBeenCalledTimes(1)
    const [directory, filename, bytes] = vi.mocked(writeMiiFile).mock.calls[0]
    expect(directory).toBe(useLabelerStore.getState().miiDir)
    expect(filename).toBe('gold-001.p2.mii')
    expect(decodeMii(bytes).mii.hair.type).toBe(30)
    expect(useLabelerStore.getState().statuses.second['gold-001']).toEqual({ kind: 'saved' })
  })

  it('restores the last draft from disk when opening the .mii directory', async () => {
    const base = createDefaultMii()
    const diskMii = { ...base, hair: { ...base.hair, type: 30 } }
    vi.mocked(pickDirectory).mockResolvedValue({ name: 'mii' } as FileSystemDirectoryHandle)
    vi.mocked(readDirectoryMiis).mockResolvedValue([{ id: 'gold-001', mode: 'first', mii: diskMii }])
    useLabelerStore.getState().setFiles([photo('gold-001.jpg')])
    await useLabelerStore.getState().openMiiDirectory()
    const state = useLabelerStore.getState()
    expect(state.miiDirName).toBe('mii')
    expect(state.statuses.first['gold-001']).toEqual({ kind: 'saved' })
    expect(useEditorStore.getState().mii.hair.type).toBe(30)
  })

  it('never leaks first-pass drafts into the second pass', () => {
    useLabelerStore.getState().setFiles([photo('gold-001.jpg')])
    useEditorStore.getState().setField('hair.type', 7)
    useLabelerStore.getState().setMode('second')
    expect(useEditorStore.getState().mii.hair.type).toBe(12)
    useEditorStore.getState().setField('hair.type', 30)
    useLabelerStore.getState().setMode('first')
    expect(useEditorStore.getState().mii.hair.type).toBe(7)
    useLabelerStore.getState().setMode('second')
    expect(useEditorStore.getState().mii.hair.type).toBe(30)
  })

  it('round-trips drafts and statuses through local storage', () => {
    useLabelerStore.getState().setFiles([photo('gold-001.jpg')])
    useEditorStore.getState().setField('hair.type', 7)
    useLabelerStore.getState().requestSkip()
    useLabelerStore.getState().confirmSkip('Foto sfocata')
    useLabelerStore.getState().goTo(0)
    const restored = initialLabelerData()
    expect(restored.drafts.first['gold-001'].hair.type).toBe(7)
    expect(restored.statuses.first['gold-001']).toEqual({ kind: 'skipped', reason: 'Foto sfocata' })
  })

  it('exports skipped notes as JSON', () => {
    useLabelerStore.getState().setFiles([photo('gold-001.jpg')])
    useLabelerStore.getState().requestSkip()
    useLabelerStore.getState().confirmSkip('Volto non visibile')
    useLabelerStore.getState().exportSkippedNotes()
    expect(downloadText).toHaveBeenCalledTimes(1)
    const [filename, text] = vi.mocked(downloadText).mock.calls[0]
    expect(filename).toBe('gold-skipped.json')
    expect(JSON.parse(text).skipped[0]).toMatchObject({ id: 'gold-001', reason: 'Volto non visibile' })
  })
})
