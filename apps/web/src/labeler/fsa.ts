import { decodeMii } from 'mii-core'
import { isImageFileName, parseMiiFileName } from './naming'
import type { DiskMii } from './types'

interface DirectoryPickerOptions {
  id?: string
  mode?: 'read' | 'readwrite'
}

interface PickerWindow {
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>
}

export interface DirectoryFile {
  name: string
  file: File
}

export function supportsDirectoryPicker(): boolean {
  return typeof (window as PickerWindow).showDirectoryPicker === 'function'
}

export async function pickDirectory(id: string, mode: 'read' | 'readwrite'): Promise<FileSystemDirectoryHandle | null> {
  const picker = window as PickerWindow
  if (!picker.showDirectoryPicker) {
    return null
  }
  try {
    return await picker.showDirectoryPicker({ id, mode })
  } catch {
    return null
  }
}

async function listFiles(directory: FileSystemDirectoryHandle): Promise<DirectoryFile[]> {
  const files: DirectoryFile[] = []
  for await (const [name, handle] of directory.entries()) {
    if (handle.kind === 'file') {
      files.push({ name, file: await handle.getFile() })
    }
  }
  return files
}

export async function readDirectoryPhotos(directory: FileSystemDirectoryHandle): Promise<DirectoryFile[]> {
  const files = await listFiles(directory)
  return files.filter(({ name }) => isImageFileName(name))
}

export async function readDirectoryMiis(directory: FileSystemDirectoryHandle): Promise<DiskMii[]> {
  const files = await listFiles(directory)
  const result: DiskMii[] = []
  for (const { name, file } of files) {
    const parsed = parseMiiFileName(name)
    if (!parsed) {
      continue
    }
    try {
      const { mii } = decodeMii(new Uint8Array(await file.arrayBuffer()))
      result.push({ id: parsed.id, mode: parsed.mode, mii })
    } catch {
      continue
    }
  }
  return result
}

export async function writeMiiFile(
  directory: FileSystemDirectoryHandle,
  name: string,
  bytes: Uint8Array,
): Promise<void> {
  const handle = await directory.getFileHandle(name, { create: true })
  const writable = await handle.createWritable()
  await writable.write(bytes as unknown as BufferSource)
  await writable.close()
}
