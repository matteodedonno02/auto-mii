/**
 * MSB-first bit reader/writer for big-endian 16/32-bit words.
 *
 * The Wii is big-endian PowerPC: inside every word, fields are read from the
 * most significant bit of the first byte in file order. This is the single
 * most important rule of the format (`docs/MII_FORMAT_RESEARCH.md` section 4).
 */

export class BitReader {
  readonly data: Uint8Array;
  position = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  read(width: number): number {
    let value = 0;
    for (let i = 0; i < width; i++) {
      const byte = this.data[this.position >> 3];
      if (byte === undefined) {
        throw new RangeError(`BitReader exhausted at bit ${this.position}`);
      }
      value = (value << 1) | ((byte >> (7 - (this.position & 7))) & 1);
      this.position++;
    }
    return value;
  }

  skip(width: number): number {
    return this.read(width);
  }
}

export class BitWriter {
  readonly bits: number[] = [];

  write(value: number, width: number): void {
    for (let i = width - 1; i >= 0; i--) {
      this.bits.push((value >> i) & 1);
    }
  }

  get length(): number {
    return this.bits.length;
  }

  toBytes(): Uint8Array {
    if (this.bits.length % 8 !== 0) {
      throw new RangeError(`BitWriter holds ${this.bits.length} bits, not a whole number of bytes`);
    }
    const bytes = new Uint8Array(this.bits.length / 8);
    for (let i = 0; i < this.bits.length; i++) {
      if (this.bits[i]) {
        bytes[i >> 3] |= 1 << (7 - (i & 7));
      }
    }
    return bytes;
  }
}

export function writeWord(
  target: Uint8Array,
  offset: number,
  byteLength: number,
  write: (writer: BitWriter) => void,
): void {
  const writer = new BitWriter();
  write(writer);
  const bytes = writer.toBytes();
  if (bytes.length !== byteLength) {
    throw new RangeError(`Expected ${byteLength} bytes for word at 0x${offset.toString(16)}, got ${bytes.length}`);
  }
  target.set(bytes, offset);
}
