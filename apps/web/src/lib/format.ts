import { dateFromCreationTicks, encodeMii, miiCrc16, type MiiData } from 'mii-core'

const dateFormatter = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' })

export function formatCreationDate(ticks: number): string {
  return dateFormatter.format(dateFromCreationTicks(ticks))
}

export function formatHexBytes(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')
}

export function formatFileSize(byteLength: number): string {
  return `${byteLength} byte`
}

export function formatMiiChecksum(mii: MiiData): string {
  const crc = miiCrc16(encodeMii(mii))
  return `0x${crc.toString(16).toUpperCase().padStart(4, '0')}`
}
