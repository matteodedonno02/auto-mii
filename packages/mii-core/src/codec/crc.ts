/**
 * Mii CRC-16: CRC-16/CCITT (poly 0x1021, init 0x0000, no reflection) with 16
 * trailing zero-bit augmentations. This is the exact recurrence used by the
 * validated reference decoder (`docs/MII_FORMAT_RESEARCH.md` Appendix B): the data
 * bit is shifted in at the LSB while the polynomial is applied from the old MSB.
 *
 * A file is a valid RSD when `miiCrc16(wholeFile) === 0`, or equivalently when
 * the last two big-endian bytes equal `miiCrc16(first74Bytes)`. Verified against
 * `sgango.mii` (0xC954) and Nintendo-authored `mii_000.rsd`.
 */
export function miiCrc16(data: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    for (let bit = 7; bit >= 0; bit--) {
      const msb = crc & 0x8000;
      crc = ((crc << 1) | ((byte >> bit) & 1)) & 0xffff;
      if (msb) {
        crc ^= 0x1021;
      }
    }
  }
  for (let i = 0; i < 16; i++) {
    const msb = crc & 0x8000;
    crc = (crc << 1) & 0xffff;
    if (msb) {
      crc ^= 0x1021;
    }
  }
  return crc;
}
