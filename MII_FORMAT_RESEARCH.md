# Wii Mii File Format — Research Notes

Reverse-engineering notes for `sgango.mii`, validated against public documentation, multiple open-source parsers, and real-world Mii files.

- **Research date:** 2026-09-17
- **Primary sample:** `sgango.mii` (74 bytes, in this folder)
- **Verification sample:** `mii_000.rsd` (76 bytes, Wii Sports CPU Mii "さぶろう" / *Saburo*), downloaded from the MiiDataFiles archive
- **Tools used:** PowerShell `Format-Hex`, Python 3.12 (via `uv`), `kaitaistruct`, and the mii2studio reference parser

---

## Table of contents

1. [TL;DR](#1-tldr)
2. [The sample file](#2-the-sample-file)
3. [Byte layout of a Wii Mii (74 bytes, RCD)](#3-byte-layout-of-a-wii-mii-74-bytes-rcd)
4. [How the bit packing works](#4-how-the-bit-packing-works)
5. [Field meanings, ranges and enums](#5-field-meanings-ranges-and-enums)
6. [sgango.mii fully decoded](#6-sgangomii-fully-decoded)
7. [Mii file format family](#7-mii-file-format-family)
8. [The RSD checksum (CRC-16)](#8-the-rsd-checksum-crc-16)
9. [Editor implementation notes](#9-editor-implementation-notes)
10. [Pitfalls discovered during research](#10-pitfalls-discovered-during-research)
11. [Verification log](#11-verification-log)
12. [Sources checked](#12-sources-checked)
- [Appendix A — Annotated hex dump of sgango.mii](#appendix-a--annotated-hex-dump-of-sgangomii)
- [Appendix B — Validated Python decoder](#appendix-b--validated-python-decoder)
- [Appendix C — Research scripts and how they were run](#appendix-c--research-scripts-and-how-they-were-run)

---

## 1. TL;DR

- A Wii Mii file is a **fixed 74-byte record** officially called **RCD** (Revolution Character Data). The `.mii` extension used here is **unofficial**.
- The record contains **no magic number and no checksum**. You identify it by its size and content shape (e.g. valid UTF-16BE name at offset `0x02`).
- Text fields are **UTF-16 big-endian**, null-terminated, maximum 10 characters:
  - Mii name at `0x02`..`0x15`
  - Creator name at `0x36`..`0x49`
- Everything else is packed into **16-bit big-endian words**. Inside each word, fields are read **MSB-first** (the Wii CPU is big-endian PowerPC, and the bitfields match that). This is the single most important rule and the most common source of bugs.
- The **RSD** variant = RCD + a **2-byte CRC-16/CCITT "Mii checksum"** appended at the end (76 bytes total). Wii games (e.g. Wii Sports) store Miis as RSD; if you modify the data you must regenerate this checksum or the game rejects the Mii.
- `sgango.mii` is a valid RCD: female Mii, birthday January 1, favorite color sky blue, name "sgango", created 2026-09-05 10:27:48 UTC.

## 2. The sample file

```
Offset     00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F   ASCII
00000000   44 2C 00 73 00 67 00 61 00 6E 00 67 00 6F 00 00   D,.s.g.a.n.g.o..
00000010   00 00 00 00 00 00 3F 3F 89 B9 34 C9 C2 DD 4D F5   ......??........
00000020   82 00 64 00 19 80 08 A2 AC 8C 68 40 04 48 AC 8D   ..d.......h@.H..
00000030   00 8A B0 8A A5 04 00 00 00 00 00 00 00 00 00 00   ................
00000040   00 00 00 00 00 00 00 00 00 00                     ..........
```

Size: **74 bytes** → RCD (no checksum). File `LastWriteTime`: 2026-09-05 12:28 local.

## 3. Byte layout of a Wii Mii (74 bytes, RCD)

| Offset | Size | Contents |
|---|---|---|
| `0x00` | 2 | Personal word: sex, birthday, favorite color, favorite flag |
| `0x02` | 20 | Mii name (UTF-16BE, max 10 chars) |
| `0x16` | 1 | Height (0–127) |
| `0x17` | 1 | Build / weight (0–127) |
| `0x18` | 4 | Mii ID (origin/pants type + creation timestamp) |
| `0x1C` | 4 | Console ID (derived from creator's MAC address) |
| `0x20` | 2 | Head word: face, skin, wrinkles/makeup, mingling, download flag |
| `0x22` | 2 | Hair word |
| `0x24` | 4 | Eyebrows (two 16-bit words) |
| `0x28` | 4 | Eyes (two 16-bit words) |
| `0x2C` | 2 | Nose |
| `0x2E` | 2 | Mouth |
| `0x30` | 2 | Glasses |
| `0x32` | 2 | Facial hair (mustache/beard) |
| `0x34` | 2 | Mole |
| `0x36` | 20 | Creator name (UTF-16BE, max 10 chars) |
| `0x4A` | — | End of record |

### 3.1 Bit-packed words in detail

Field order below is **MSB to LSB** within each word (read left to right in the byte stream). `unused`/`unknown` bits are reserved; see [Pitfalls](#10-pitfalls-discovered-during-research).

**`0x00` — personal word**

| Field | Width | Range | Notes |
|---|---|---|---|
| unknown | 1 | 0 | Always 0 in all observed files |
| sex | 1 | 0–1 | 0 = male, 1 = female |
| birth month | 4 | 0–12 | 0 = no birthday set |
| birth day | 5 | 0–31 | 0 = no birthday set |
| favorite color | 4 | 0–11 | see palette below |
| favorite | 1 | 0–1 | favorite Miis get red pants and appear more often |

**`0x20` — head word**

| Field | Width | Range | Default |
|---|---|---|---|
| face type | 3 | 0–7 | 0 |
| skin tone | 3 | 0–5 | 0 |
| wrinkles / makeup | 4 | 0–11 | 0 |
| unknown | 3 | — | see pitfalls |
| mingling (0 = on, 1 = off) | 1 | 0–1 | CPU Miis are 1 (off) |
| unknown | 1 | — | |
| downloaded | 1 | 0–1 | set for Check Mii Out Channel Miis |

**`0x22` — hair word**

| Field | Width | Range | Default |
|---|---|---|---|
| hair type | 7 | 0–71 | depends on sex |
| hair color | 3 | 0–7 | 1 |
| hair flip | 1 | 0–1 | 0 |
| unknown | 5 | — | |

**`0x24` — eyebrows (32 bits)**

| Field | Width | Range | Default |
|---|---|---|---|
| eyebrow type | 5 | 0–23 | depends on sex |
| unknown | 1 | — | |
| eyebrow rotation | 4 | 0–11 | depends on type |
| unknown | 6 | — | |
| eyebrow color | 3 | 0–7 | 1 |
| eyebrow size | 4 | 0–8 | 4 |
| eyebrow Y position | 5 | 3–18 | 10 |
| eyebrow X spacing | 4 | 0–12 | 2 |

**`0x28` — eyes (32 bits)**

| Field | Width | Range | Default |
|---|---|---|---|
| eye type | 6 | 0–47 | depends on sex |
| unknown | 2 | — | |
| eye rotation | 3 | 0–7 | depends on type |
| eye Y position | 5 | 0–18 | 12 |
| eye color | 3 | 0–5 | 0 |
| unknown | 1 | — | |
| eye size | 3 | 0–7 | 4 |
| eye X spacing | 4 | 0–12 | 2 |
| unknown | 5 | — | |

**`0x2C` — nose**

| Field | Width | Range | Default |
|---|---|---|---|
| nose type | 4 | 0–11 | 1 |
| nose size | 4 | 0–8 | 4 |
| nose Y position | 5 | 0–18 | 9 |
| unknown | 3 | — | |

**`0x2E` — mouth**

| Field | Width | Range | Default |
|---|---|---|---|
| mouth type | 5 | 0–23 | 23 |
| mouth (lipstick) color | 2 | 0–2 | 0 |
| mouth size | 4 | 0–8 | 4 |
| mouth Y position | 5 | 0–18 | 13 |

**`0x30` — glasses**

| Field | Width | Range | Default |
|---|---|---|---|
| glasses type | 4 | 0–8 | 0 (none) |
| glasses color | 3 | 0–5 | 0 |
| unknown | 1 | — | |
| glasses size | 3 | 0–7 | 4 |
| glasses Y position | 5 | 0–20 | 10 |

**`0x32` — facial hair**

| Field | Width | Range | Default |
|---|---|---|---|
| mustache type | 2 | 0–3 | 0 |
| beard type | 2 | 0–3 | 0 |
| facial hair color | 3 | 0–7 | 0 |
| mustache size | 4 | 0–8 | 4 |
| mustache Y position | 5 | 0–16 | 10 |

**`0x34` — mole**

| Field | Width | Range | Default |
|---|---|---|---|
| mole enabled | 1 | 0–1 | 0 |
| mole size | 4 | 0–8 | 4 |
| mole Y position | 5 | 0–30 | 20 |
| mole X position | 5 | 0–16 | 2 |
| unknown | 1 | — | |

## 4. How the bit packing works

Rule: **concatenate the bytes of the word in file order, most-significant bit first, then slice fields from the left.**

Worked example for bytes `44 2C` (start of `sgango.mii`):

```
44 2C  =  0100 0100 0010 1100
          ^ ^^^^ ^^^^^ ^^^^ ^
          | |    |     |    └ favorite = 0
          | |    |     └───── favorite color = 0110b = 6 (sky blue)
          | |    └─────────── day = 00001b = 1
          | └──────────────── month = 0001b = 1 (January)
          └────────────────── sex = 1 (female); leading bit = unknown (0)
```

In Python:

```python
def read_bits(data, pos, n):        # MSB-first across bytes
    v = 0
    for i in range(pos, pos + n):
        v = (v << 1) | ((data[i // 8] >> (7 - (i % 8))) & 1)
    return v

sex = read_bits(word, 1, 1)
month = read_bits(word, 2, 4)
day = read_bits(word, 6, 5)
fav = read_bits(word, 11, 4)
```

The same rule applies to all 16-bit words and to the two 32-bit groups (eyebrows, eyes): they are just 32 consecutive bits.

**Unused bits must be skipped at the correct position** — e.g. the eyebrow word is `type(5) + unknown(1) + rotation(4) + unknown(6) + ...`, not `type(5) + rotation(5) + ...`. On `sgango.mii` both interpretations happen to give the same numbers because its reserved bits are zero, but this will not hold for every Mii (Saburo has non-zero reserved bits).

## 5. Field meanings, ranges and enums

**Gender.** `0` = male, `1` = female.

**Birthday.** Month `0` and day `0` mean "not set" (standard on most CPU/system Miis). Month range `1–12`, day range `1–31`.

**Favorite color palette** (editor order):

| Value | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Color | red | orange | yellow | lime green | forest green | royal blue | sky blue | pink | purple | brown | white | black |

**Mii ID (`0x18`, 4 bytes).** A 32-bit big-endian value:
- Top 4 bits = Mii type / origin. `0,1,4,5` = special Miis (gold pants); `12,13` = not local, received from another console (blue pants, not editable); everything else = normal (gray pants). A favorite Mii gets red pants regardless.
- Low 28 bits = creation time, in **4-second ticks since 2006-01-01 00:00 UTC**. Seconds = value × 4.

For `sgango.mii`: `89 B9 34 C9` → type `8` (normal/gray), ticks `163132617` → 2026-09-05 10:27:48 UTC (see [Verification log](#11-verification-log)).

**Console ID (`0x1C`, 4 bytes).** Identifies the creator's console: first byte is a checksum-8 of the first three bytes of the console MAC address; last three bytes are the last three bytes of that MAC.

**Height / build (`0x16`/`0x17`).** 0–127 each, default 64/64. The Mii Channel clamps values over 127.

**Face feature indices.** Nothing in this format is a picture: every feature field is an index into tables owned by the game/editor renderer (hair meshes, eye textures, etc.). Hair type (0–71) and eyebrow/eye/nose/mouth "types" are **not in display order**; the valid index set and the editor layout are separate things. You do not need the tables to edit data, but you do need them to render.

## 6. sgango.mii fully decoded

| Field | Raw (offset) | Value |
|---|---|---|
| Name | `0x02` | `sgango` |
| Creator name | `0x36` | *(empty)* |
| Sex | `0x00` | female |
| Birthday | `0x00` | January 1 |
| Favorite color | `0x00` | sky blue (6) |
| Favorite | `0x00` | no |
| Height / build | `0x16`/`0x17` | 63 / 63 |
| Mii type | `0x18` | 8 — normal (gray pants) |
| Creation time | `0x18` | 163132617 ticks → 2026-09-05 10:27:48 UTC |
| Console ID | `0x1C` | `C2 DD 4D F5` |
| Face / skin / wrinkles | `0x20` | 4 / 0 / 8 |
| Mingling / downloaded | `0x20` | mingling allowed (0) / not downloaded |
| Hair | `0x22` | type 50, color 0, no flip |
| Eyebrows | `0x24` | type 3, rotation 6, color 0, size 4, X 2, Y 10 |
| Eyes | `0x28` | type 43, rotation 4, color 3, size 4, X 2, Y 12 |
| Nose | `0x2C` | type 0, size 4, Y 9 |
| Mouth | `0x2E` | type 21, color 2, size 4, Y 13 |
| Glasses | `0x30` | type 0 (none), color 0, size 4, Y 10 |
| Facial hair | `0x32` | mustache 2, beard 3, color 0, size 4, Y 10 |
| Mole | `0x34` | enabled, size 4, X 2, Y 20 |
| Reserved bits | various | all 0 in this file |

If this Mii were saved as RSD, the two checksum bytes to append would be `C9 54` (computed, see below).

## 7. Mii file format family

From the MiiDataFiles archive README (and confirmed by file sizes in the archive):

| Format | Size | Checksum | Where seen |
|---|---|---|---|
| **RCD** (Revolution Character Data) | 74 B | none | `.mii`, `.mae`, `.miigx`, `.ncd` files on PC / homebrew |
| **RSD** (Revolution Store Data) | 76 B | 2-byte Mii CRC at end | inside Wii games/saves (e.g. Wii Sports) |
| **CFSD / FFSD** (3DS / Wii U) | 96 B | 2 `00` bytes + 2-byte CRC | 3DS/Wii U games, amiibo; 4th byte is `30` (3DS) or `40` (Wii U) |
| **NFSD** ("SwitchDB") | compact | two CRCs + console ID | Switch system Mii database |
| **CHARINFO** (Switch game format) | 88 B | none | Switch games (also `.mii` in Mario Golf: Super Rush!) |
| **MNMS** | text/hex in local storage | n/a | Nintendo's official online Mii Studio |

Key caution: the **`.mii` extension is ambiguous**. It is unofficial for RCD *and* officially used by Mario Golf: Super Rush for Switch CHARINFO data. Detect by size + content, not by extension.

Format naming origin: Nintendo's September 2020 leaks confirmed "Revolution Character Data" / "Revolution Store Data"; the 3DS/Wii U names follow the same CoreData/StoreData pattern.

## 8. The RSD checksum (CRC-16)

RSD appends a 2-byte **big-endian** checksum to the 74-byte RCD. The algorithm is the "Mii CRC16" — CRC-16/CCITT (polynomial `0x1021`, initial value `0x0000`) with 16 extra zero-bit augmentations at the end. Reference implementation (adapted from the WiiBrew Java listing):

```python
def mii_crc16(data):
    crc = 0
    for b in data:
        for bit in range(7, -1, -1):
            crc = (((crc << 1) | ((b >> bit) & 1)) ^ (0x1021 if (crc & 0x8000) else 0)) & 0xFFFF
    for _ in range(16):
        crc = ((crc << 1) ^ (0x1021 if (crc & 0x8000) else 0)) & 0xFFFF
    return crc
```

Properties, verified against a real Nintendo-authored file:

- For a valid RSD, `mii_crc16(whole_76_byte_file) == 0`. This is the easiest validity check.
- Equivalently: `mii_crc16(first_74_bytes)` equals the stored 2 bytes (big-endian).
- `mii_000.rsd` (Saburo): stored `38 E2`; recomputed `38E2`; full-file check `0x0000`. Big-endian confirmed (little-endian interpretation does not match).
- `sgango.mii`: `mii_crc16(first 74 bytes) = 0xC954` → RSD form would end with `C9 54`.

The Wii's Wiimote Mii storage uses the same CRC in 750-byte blocks (two blocks of 10 Miis + CRC each), which is where the algorithm is documented.

## 9. Editor implementation notes

Parsing:
1. Read the file. If 74 bytes → RCD. If 76 bytes → RSD; verify/reserve the last 2 bytes.
2. Decode names as UTF-16BE at `0x02` and `0x36` (10 chars, `\0`-padded).
3. Decode each 16-bit word MSB-first (see the table in section 3 and Appendix B for a working implementation).
4. Validate ranges (section 3.1). Out-of-range values make the Wii treat the Mii as invalid.

Editing/writing:
1. **Preserve reserved/unknown bits from the source file.** Real Nintendo Miis have non-zero values there (Saburo has `unknown_2=7`, `unknown_6=15`, `unknown_9=9`, `unknown_12=1`). Forcing them to zero rewrites data the format owner did not document. If you create a Mii from scratch, copy them from a known-good template (or leave 0 and test).
2. Keep reserved bits inside each word at their correct widths when patching fields; write whole 16-bit/32-bit words rather than individual bytes.
3. Regenerate the CRC16 only if you are writing RSD (games require it). RCD (`.miigx`/`.mae`) needs no checksum.
4. Name field: max 10 UTF-16 code units, padded with `\0`; second 10-char field is the creator name.
5. Mii ID: if you expose "create new Mii", either preserve the original ID or generate a sane one (type bits + current time as 4-second ticks since 2006-01-01 UTC). Changing top bits controls special/foreign/normal pants behavior — avoid type values `12/13` unless intentional (they mark a Mii non-editable on console).
6. Height/build: clamp to 0–127.
7. Favorite color: clamp to 0–11 (documented oddities: value 15 combined with the favorite bit produces a gray shirt on console).
8. Round-trip test: decode → re-encode unchanged bytes and compare; then test a one-field change against a real game (e.g., import via SaveGame Manager GX, `.miigx` route) or against mii2studio/Mii Studio rendering.

## 10. Pitfalls discovered during research

1. **Bit order is MSB-first inside big-endian words.** The libmii C library (`loadMii`) reads the first word MSB-first but later words LSB-first, which produces out-of-range values on real files (e.g. hair type 100, valid range 0–71). Its face-feature parsing is unreliable; do not use it as the reference.
2. **The newer Kaitai spec in mii2studio (`mii_data_wii.ksy`) is 1 bit short** in its `head_data` definition (15 bits instead of 16; it omits one reserved bit). The generated parser then desynchronizes for the rest of the file: on `sgango.mii` it reported eye rotation 18 (valid range 0–7) and read garbage for hair/creator. The older `gen1_wii.py` (also in mii2studio, same layout as WiiBrew) is correct and was used as the reference here.
3. **Reserved bits are not always zero** (see Saburo above). Preserve them.
4. **Mole X/Y order.** The buggy new spec lists mole as X then Y; the correct layout (WiiBrew and `gen1_wii.py`) is **Y (5 bits) then X (5 bits)**. On `sgango.mii` the wrong order reads x=20 (out of the 0–16 range) while the correct order gives the defaults x=2, y=20, and on Saburo it gives x=2, y=20 as well.
5. **`.mii` extension ambiguity** (RCD vs Switch CHARINFO) — see section 7.
6. **Two interpretations can accidentally agree** when a Mii has zero reserved bits (as `sgango.mii` does). Always test an editor against files with non-zero reserved bits.

## 11. Verification log

1. **Raw inspection** — `Format-Hex sgango.mii`: 74 bytes, ASCII-visible "sgango" as UTF-16BE at `0x02`.
2. **First decode pass** — hand-derived field widths from the WiiBrew struct order; decoded all fields; checked every value against documented ranges and defaults. Also computed the creation timestamp: `163132617 × 4 s` after 2006-01-01 = **2026-09-05 10:27:48 UTC**, within ~1 minute of the file's modification date (2026-09-05 12:28 local, i.e. UTC+2), strong evidence the whole decode is correct.
3. **Cross-check with libmii logic** — its LSB-first reading of later words produced hair type 100 (> 71) and other out-of-range values, identifying that implementation as buggy.
4. **Cross-check with mii2studio Kaitai parser** — ran `mii_data_wii.py` (via `uv run --with kaitaistruct`) on the sample; after its 15-bit `head_data` field it produced out-of-range values (eye rotation 18), identifying the spec bug. The older `gen1_wii.py` in the same repo matched all previously decoded values.
5. **Real-world validation** — downloaded `mii_000.rsd` (Wii Sports CPU Mii "さぶろう", RFL-000 Saburo) from the MiiDataFiles archive:
   - size 76, name decodes correctly as UTF-16BE hiragana;
   - fields decode to sensible values within all documented ranges (e.g. eyebrow rotation 5, eye rotation 3, mouth size 3), with defaults 64/64 height/build;
   - stored checksum `38 E2` equals recomputed CRC16 of the first 74 bytes (big-endian), and `crc16(full file) == 0`, validating the checksum algorithm against Nintendo-authored data.
6. **Final decoder** — a corrected Python decoder (Appendix B) reproducing all of the above; tested against both `sgango.mii` and `mii_000.rsd`.

Artifacts used during research are listed in Appendix C.

## 12. Sources checked

| Source | What it is | What was checked | Reliability |
|---|---|---|---|
| [wiibrew.org/wiki/Mii_data](https://wiibrew.org/wiki/Mii_data) | Community wiki, last edited 2026-04-12 | Full 74-byte `MII_DATA_STRUCT`, field ranges, UTF-16BE note, Mii ID flags/pants logic, CRC16 code | Primary reference. Its field ordering matches real files, but several "unknown" comments show the page is partly WIP |
| [github.com/HEYimHeroic/mii2studio](https://github.com/HEYimHeroic/mii2studio) — `gen1_wii.py` | Wii parser shipped in mii2studio (tooling associated with the Mii Library) | Exact bit widths/order per field; confirmed against both sample files | Authoritative for the common/visible fields |
| [mii2studio `mii_data_wii.ksy` / `.py`](https://raw.githubusercontent.com/HEYimHeroic/mii2studio/master/mii_data_wii.ksy) | Newer Kaitai Struct description, generated parser | Ran the generated parser on the sample; found it desynchronizes (15-bit head word) | **Do not use** as-is; newer and more documented, but buggy |
| [github.com/HEYimHeroic/MiiDataFiles](https://github.com/HEYimHeroic/MiiDataFiles) (archived read-only 2025-11-15) | Archive of every downloadable Mii data file in various formats | README's format taxonomy (RCD/RSD/CFSD/FFSD/NFSD/CHARINFO/MNMS), extension notes, tools (My Avatar Editor, RSDmaker); downloaded `mii_000.rsd` for checksum validation | High. Downloaded sample used as ground truth |
| [github.com/matthewbauer/libmii](https://github.com/matthewbauer/libmii) (source/mii.c) | C library reading Wiimote/RFL_DB.dat Miis | Compared parsing logic field by field | **Buggy bit order** for words after the first; not used |
| [deepwiki.com/matthewbauer/libmii/2.2-loading-mii-data](https://deepwiki.com/matthewbauer/libmii/2.2-loading-mii-data) | AI-generated summary of libmii | Cross-reference for libmii behavior | Informational only |
| [wiibrew.org/wiki/Libmii](https://wiibrew.org/wiki/Libmii) | Wiki page for libmii | Background on usage | Informational |
| [github.com/Kinnay/NintendoClients](https://github.com/Kinnay/NintendoClients) — `nintendo/miis.py` | Wii U/3DS/Switch Mii formats, CRC usage | Compared bitfield sizes and CRC check pattern (`crc16(data) != 0`) — same CRC family | High for gen2 formats; consulted via search result excerpt |
| [github.com/HEnquist/miitools](https://github.com/HEnquist/miitools) | Python Mii tooling (mii2png lineage) | Referenced in search results for Wii-format parsing | Reference only, not deeply verified |
| [github.com/HEYimHeroic/MiiStudioMiiLoader](https://github.com/HEYimHeroic/MiiStudioMiiLoader) | Tool to load Miis into Nintendo's Mii Studio | Context for the MNMS target format | Reference |
| [miilibrary.com](https://www.miilibrary.com/) | Mii Library — canonical Mii archive with renders | Context: the data files above back this site | Reference |
| [kaitai.io](https://kaitai.io/) / [ide.kaitai.io](https://ide.kaitai.io/) | Structure description language / IDE | Used via `kaitaistruct` to execute mii2studio's spec | Tooling |
| WiiBrew CRC references ([CCITT article](http://www.joegeluso.com/software/articles/ccitt.htm), [CRC snippet](https://pastebin.com/8eTJQjgp)) | Linked from the WiiBrew page | Context for the CRC-16/CCITT variant | Informational |

Search queries used to locate these sources: "mii file format parser python github wiibrew bitfield month day favorite color" and repository API/tree lookups for `HEYimHeroic/mii2studio` and `HEYimHeroic/MiiDataFiles`.

---

## Appendix A — Annotated hex dump of sgango.mii

```
0x00  44 2C              personal word: female, Jan 1, fav=6 (sky blue), not favorite
0x02  00 73 00 67 ...    "sgango" UTF-16BE (10-char field), NUL padded
0x16  3F                 height = 63
0x17  3F                 build  = 63
0x18  89 B9 34 C9        Mii ID: type 8 (normal), creation ticks 163132617
0x1C  C2 DD 4D F5        console ID
0x20  82 00              face=4, skin=0, wrinkles/makeup=8, mingling on, not downloaded
0x22  64 00              hair: type=50, color=0, no flip
0x24  19 80 08 A2        eyebrows: type=3, rotation=6, color=0, size=4, X=2, Y=10
0x28  AC 8C 68 40        eyes: type=43, rotation=4, color=3, size=4, X=2, Y=12
0x2C  04 48              nose: type=0, size=4, Y=9
0x2E  AC 8D              mouth: type=21, color=2, size=4, Y=13
0x30  00 8A              glasses: none, size=4, Y=10
0x32  B0 8A              facial hair: mustache=2, beard=3, color=0, size=4, Y=10
0x34  A5 04              mole: on, size=4, X=2, Y=20
0x36  00 ... (20 bytes)  creator name: empty
```

## Appendix B — Validated Python decoder

Tested against `sgango.mii` and `mii_000.rsd` (Saburo). Handles both RCD (74 B) and RSD (76 B, verifies CRC).

```python
import sys

class BitReader:
    def __init__(self, data):
        self.data = data
        self.pos = 0

    def read(self, n):
        v = 0
        for _ in range(n):
            v = (v << 1) | ((self.data[self.pos // 8] >> (7 - (self.pos % 8))) & 1)
            self.pos += 1
        return v


def mii_crc16(data):
    crc = 0
    for b in data:
        for bit in range(7, -1, -1):
            crc = (((crc << 1) | ((b >> bit) & 1)) ^ (0x1021 if (crc & 0x8000) else 0)) & 0xFFFF
    for _ in range(16):
        crc = ((crc << 1) ^ (0x1021 if (crc & 0x8000) else 0)) & 0xFFFF
    return crc


MONTHS = ["none", "January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
COLORS = ["red", "orange", "yellow", "lime green", "forest green", "royal blue",
          "sky blue", "pink", "purple", "brown", "white", "black"]


def decode(data):
    if len(data) == 76 and mii_crc16(data) == 0:
        data = data[:74]
    f = {}
    r = BitReader(data[0x00:0x02])
    f["unused"] = r.read(1)
    f["sex"] = r.read(1)
    f["month"] = r.read(4)
    f["day"] = r.read(5)
    f["fav_color"] = r.read(4)
    f["favorite"] = r.read(1)

    f["name"] = data[0x02:0x16].decode("utf-16-be").rstrip("\0")
    f["height"] = data[0x16]
    f["build"] = data[0x17]
    mii_id = int.from_bytes(data[0x18:0x1C], "big")
    f["mii_type"] = mii_id >> 28
    f["creation_ticks"] = mii_id & 0x0FFFFFFF
    f["console_id"] = data[0x1C:0x20].hex(" ")

    r = BitReader(data[0x20:0x22])
    f["face_type"] = r.read(3)
    f["skin_tone"] = r.read(3)
    f["facial_feature"] = r.read(4)
    f["unknown_2"] = r.read(3)
    f["mingle"] = r.read(1)
    f["unknown_3"] = r.read(1)
    f["downloaded"] = r.read(1)

    r = BitReader(data[0x22:0x24])
    f["hair_type"] = r.read(7)
    f["hair_color"] = r.read(3)
    f["hair_flip"] = r.read(1)
    f["unknown_4"] = r.read(5)

    r = BitReader(data[0x24:0x28])
    f["eyebrow_type"] = r.read(5)
    f["unknown_5"] = r.read(1)
    f["eyebrow_rotation"] = r.read(4)
    f["unknown_6"] = r.read(6)
    f["eyebrow_color"] = r.read(3)
    f["eyebrow_size"] = r.read(4)
    f["eyebrow_y"] = r.read(5)
    f["eyebrow_x"] = r.read(4)

    r = BitReader(data[0x28:0x2C])
    f["eye_type"] = r.read(6)
    f["unknown_7"] = r.read(2)
    f["eye_rotation"] = r.read(3)
    f["eye_y"] = r.read(5)
    f["eye_color"] = r.read(3)
    f["unknown_8"] = r.read(1)
    f["eye_size"] = r.read(3)
    f["eye_x"] = r.read(4)
    f["unknown_9"] = r.read(5)

    r = BitReader(data[0x2C:0x2E])
    f["nose_type"] = r.read(4)
    f["nose_size"] = r.read(4)
    f["nose_y"] = r.read(5)
    f["unknown_10"] = r.read(3)

    r = BitReader(data[0x2E:0x30])
    f["mouth_type"] = r.read(5)
    f["mouth_color"] = r.read(2)
    f["mouth_size"] = r.read(4)
    f["mouth_y"] = r.read(5)

    r = BitReader(data[0x30:0x32])
    f["glasses_type"] = r.read(4)
    f["glasses_color"] = r.read(3)
    f["unknown_11"] = r.read(1)
    f["glasses_size"] = r.read(3)
    f["glasses_y"] = r.read(5)

    r = BitReader(data[0x32:0x34])
    f["mustache_type"] = r.read(2)
    f["beard_type"] = r.read(2)
    f["facial_hair_color"] = r.read(3)
    f["facial_hair_size"] = r.read(4)
    f["facial_hair_y"] = r.read(5)

    r = BitReader(data[0x34:0x36])
    f["mole_enabled"] = r.read(1)
    f["mole_size"] = r.read(4)
    f["mole_y"] = r.read(5)
    f["mole_x"] = r.read(5)
    f["unknown_12"] = r.read(1)

    f["creator_name"] = data[0x36:0x4A].decode("utf-16-be").rstrip("\0")
    return f


if __name__ == "__main__":
    raw = open(sys.argv[1], "rb").read()
    f = decode(raw)
    print("file            =", len(raw), "bytes")
    if len(raw) == 76:
        print("rsd checksum    =", raw[-2:].hex(" "),
              "(crc16 over all 76 bytes = %04x)" % mii_crc16(raw))
    print("name            =", repr(f["name"]))
    print("creator name    =", repr(f["creator_name"]))
    print("sex             =", "female" if f["sex"] else "male")
    print("birthday        =", MONTHS[f["month"]], f["day"])
    print("favorite color  =", COLORS[f["fav_color"]] if f["fav_color"] < 12 else f["fav_color"])
    print("favorite        =", bool(f["favorite"]))
    print("height / build  =", f["height"], "/", f["build"])
    print("mii id          = type", f["mii_type"], "creation ticks", f["creation_ticks"])
    print("console id      =", f["console_id"])
    print("face/skin/feat  =", f["face_type"], "/", f["skin_tone"], "/", f["facial_feature"])
    print("mingle/download =", f["mingle"], "/", f["downloaded"])
    print("hair            = type", f["hair_type"], "color", f["hair_color"], "flip", f["hair_flip"])
    print("eyebrows        =", f["eyebrow_type"], f["eyebrow_rotation"], f["eyebrow_color"],
          f["eyebrow_size"], f["eyebrow_x"], f["eyebrow_y"])
    print("eyes            =", f["eye_type"], f["eye_rotation"], f["eye_color"],
          f["eye_size"], f["eye_x"], f["eye_y"])
    print("nose            =", f["nose_type"], f["nose_size"], f["nose_y"])
    print("mouth           =", f["mouth_type"], f["mouth_color"], f["mouth_size"], f["mouth_y"])
    print("glasses         =", f["glasses_type"], f["glasses_color"], f["glasses_size"], f["glasses_y"])
    print("facial hair     =", f["mustache_type"], f["beard_type"], f["facial_hair_color"],
          f["facial_hair_size"], f["facial_hair_y"])
    print("mole            =", "on" if f["mole_enabled"] else "off",
          f["mole_size"], f["mole_x"], f["mole_y"])
    print("unknown bits    =", [(k, v) for k, v in f.items() if k.startswith("unknown")])
```

## Appendix C — Research scripts and how they were run

All temporary scripts live in `C:\Users\matteo\AppData\Local\Temp\opencode\` (outside this folder; safe to delete). They can be copied here if wanted.

| Script | Purpose | Command |
|---|---|---|
| `decode_mii.py` | First-pass decoder (superseded by `mii_decoder.py`) | `python decode_mii.py sgango.mii` |
| `mii_decoder.py` | Final validated decoder (Appendix B) | `python mii_decoder.py <file>` |
| `crc_test.py` | Computes CRC16 for RCD/RSD variants | `python crc_test.py <file>` |
| `verify_rsd.py` | Checks stored checksum vs computed, prints name | `python verify_rsd.py <file.rsd>` |
| `run_ref.py` + `mii_data_wii.py` | Runs mii2studio's Kaitai parser for comparison | `uv run --with kaitaistruct python run_ref.py <file>` |
| `mii_000.rsd` | Real-world verification sample (Wii Sports Saburo) | downloaded from MiiDataFiles |

Environment notes: Python 3.12.13 (uv-managed); `kaitaistruct` installed on the fly with `uv run --with kaitaistruct` (the base Python is externally managed, so plain `pip install` is blocked).
