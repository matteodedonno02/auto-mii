import { decodeMii, encodeMii, type MiiData } from 'mii-core'

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error('Invalid hex string')
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function sanitizeFileName(name: string, fallback = 'mii'): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
  return cleaned.length > 0 ? cleaned : fallback
}

export function downloadBytes(filename: string, bytes: Uint8Array, type = 'application/octet-stream'): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type })
  downloadBlob(filename, blob)
}

export function downloadText(filename: string, text: string, type = 'application/json'): void {
  downloadBlob(filename, new Blob([text], { type }))
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function readFileBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

export const PROJECT_SCHEMA_VERSION = 1

interface ProjectFile {
  schemaVersion: number
  createdAt: string
  modifiedAt: string
  miiRcd: string
}

export function buildProjectJson(mii: MiiData, now = new Date()): string {
  const project: ProjectFile = {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: now.toISOString(),
    modifiedAt: now.toISOString(),
    miiRcd: bytesToHex(encodeMii(mii)),
  }
  return JSON.stringify(project, null, 2)
}

export function parseProjectJson(text: string): MiiData {
  const parsed: unknown = JSON.parse(text)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Project file is not an object')
  }
  const project = parsed as Partial<ProjectFile>
  if (project.schemaVersion !== PROJECT_SCHEMA_VERSION || typeof project.miiRcd !== 'string') {
    throw new Error('Unsupported project schema')
  }
  return decodeMii(hexToBytes(project.miiRcd)).mii
}
