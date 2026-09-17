import {
  Broom,
  Circle,
  Eye,
  Eyeglasses,
  Info,
  LineSegment,
  MarkerCircle,
  Ruler,
  Scissors,
  Smiley,
  Triangle,
  UserCircle,
} from '@phosphor-icons/react'
import {
  EYE_COLORS,
  FAVORITE_COLORS,
  FOREIGN_MII_TYPES,
  GLASSES_COLORS,
  GOLD_MII_TYPES,
  HAIR_COLORS,
  LIP_COLORS,
  MII_RCD_SIZE,
  SKIN_COLORS,
  type MiiData,
} from 'mii-core'
import { colorNames, copy, favoriteColorNames, monthNames } from '@/lib/i18n'
import { formatCreationDate, formatFileSize, formatHexBytes, formatMiiChecksum } from '@/lib/format'
import type { SectionConfig } from './types'

const dayOptions = Array.from({ length: 32 }, (_, day) => ({
  value: day,
  label: day === 0 ? copy.fields.notSet : String(day),
}))

const monthOptions = monthNames.map((label, value) => ({ value, label }))

const pantLabel = (miiType: number, favorite: number): string => {
  if (favorite === 1) {
    return copy.info.pantsFavorite
  }
  if (GOLD_MII_TYPES.includes(miiType)) {
    return copy.info.pantsGold
  }
  if (FOREIGN_MII_TYPES.includes(miiType)) {
    return copy.info.pantsForeign
  }
  return copy.info.pantsNormal
}

const miiTypeLabel = (miiType: number): string => {
  if (GOLD_MII_TYPES.includes(miiType)) {
    return copy.info.miiTypeGold
  }
  if (FOREIGN_MII_TYPES.includes(miiType)) {
    return copy.info.miiTypeForeign
  }
  return copy.info.miiTypeNormal
}

const zeroOnly = /^[0/]+$/

const reservedSummary = (mii: MiiData): string => {
  const entries = [
    ['personal', String(mii.reserved.personal)],
    ['head', mii.reserved.head.join('/')],
    ['hair', String(mii.reserved.hair)],
    ['eyebrow', mii.reserved.eyebrow.join('/')],
    ['eye', mii.reserved.eye.join('/')],
    ['nose', String(mii.reserved.nose)],
    ['glasses', String(mii.reserved.glasses)],
    ['mole', String(mii.reserved.mole)],
  ] satisfies Array<[string, string]>
  const nonZero = entries.filter(([, value]) => !zeroOnly.test(value))
  return nonZero.length === 0 ? '0' : nonZero.map(([label, value]) => `${label} ${value}`).join(' \u00b7 ')
}

export const SECTIONS: readonly SectionConfig[] = [
  {
    id: 'personal',
    label: copy.rail.personal,
    icon: UserCircle,
    fields: [
      { kind: 'text', path: 'name', label: copy.fields.name, maxLength: 10, placeholder: copy.header.namePlaceholder },
      { kind: 'text', path: 'creatorName', label: copy.fields.creatorName, maxLength: 10 },
      {
        kind: 'segmented',
        path: 'sex',
        label: copy.fields.sex,
        options: [
          { value: 0, label: copy.fields.male },
          { value: 1, label: copy.fields.female },
        ],
      },
      { kind: 'select', path: 'month', label: copy.fields.birthMonth, options: monthOptions },
      {
        kind: 'select',
        path: 'day',
        label: copy.fields.birthDay,
        options: dayOptions,
        dependsOn: { path: 'month', value: 1 },
        disabledHint: 'Imposta prima il mese di nascita.',
      },
      {
        kind: 'color',
        path: 'favColor',
        label: copy.fields.favColor,
        palette: FAVORITE_COLORS.map((color) => color.hex),
        names: favoriteColorNames,
      },
      { kind: 'toggle', path: 'favorite', label: copy.fields.favorite },
    ],
  },
  {
    id: 'body',
    label: copy.rail.body,
    icon: Ruler,
    fields: [
      { kind: 'slider', path: 'height', label: copy.fields.height, min: 0, max: 127 },
      { kind: 'slider', path: 'build', label: copy.fields.build, min: 0, max: 127 },
    ],
  },
  {
    id: 'face',
    label: copy.rail.face,
    icon: Circle,
    fields: [
      { kind: 'option', path: 'faceType', label: copy.fields.faceType, count: 8, feature: 'head', columns: 4 },
      { kind: 'color', path: 'skinTone', label: copy.fields.skinTone, palette: SKIN_COLORS },
      {
        kind: 'option',
        path: 'facialFeature',
        label: copy.fields.facialFeature,
        count: 12,
        feature: 'feature',
        columns: 6,
      },
    ],
  },
  {
    id: 'hair',
    label: copy.rail.hair,
    icon: Scissors,
    fields: [
      { kind: 'option', path: 'hair.type', label: copy.fields.hairType, count: 72, feature: 'hair', columns: 6 },
      { kind: 'color', path: 'hair.color', label: copy.fields.hairColor, palette: HAIR_COLORS, names: colorNames.hair },
      {
        kind: 'segmented',
        path: 'hair.flip',
        label: copy.fields.hairFlip,
        options: [
          { value: 0, label: copy.fields.normal },
          { value: 1, label: copy.fields.reversed },
        ],
      },
    ],
  },
  {
    id: 'eyebrow',
    label: copy.rail.eyebrow,
    icon: LineSegment,
    fields: [
      { kind: 'option', path: 'eyebrow.type', label: copy.fields.eyebrowType, count: 24, feature: 'eyebrow', columns: 6 },
      { kind: 'slider', path: 'eyebrow.rotation', label: copy.fields.rotation, min: 0, max: 11 },
      { kind: 'color', path: 'eyebrow.color', label: copy.fields.hairColor, palette: HAIR_COLORS, names: colorNames.hair },
      { kind: 'slider', path: 'eyebrow.size', label: copy.fields.size, min: 0, max: 8 },
      { kind: 'slider', path: 'eyebrow.x', label: copy.fields.spacing, min: 0, max: 12 },
      { kind: 'slider', path: 'eyebrow.y', label: copy.fields.verticalPosition, min: 3, max: 18 },
    ],
  },
  {
    id: 'eye',
    label: copy.rail.eye,
    icon: Eye,
    fields: [
      { kind: 'option', path: 'eye.type', label: copy.fields.eyeType, count: 48, feature: 'eye', columns: 6 },
      { kind: 'slider', path: 'eye.rotation', label: copy.fields.rotation, min: 0, max: 7 },
      { kind: 'color', path: 'eye.color', label: copy.fields.eyeColor, palette: EYE_COLORS, names: colorNames.eye },
      { kind: 'slider', path: 'eye.size', label: copy.fields.size, min: 0, max: 7 },
      { kind: 'slider', path: 'eye.x', label: copy.fields.spacing, min: 0, max: 12 },
      { kind: 'slider', path: 'eye.y', label: copy.fields.verticalPosition, min: 0, max: 18 },
    ],
  },
  {
    id: 'nose',
    label: copy.rail.nose,
    icon: Triangle,
    fields: [
      { kind: 'option', path: 'nose.type', label: copy.fields.noseType, count: 12, feature: 'nose', columns: 6 },
      { kind: 'slider', path: 'nose.size', label: copy.fields.size, min: 0, max: 8 },
      { kind: 'slider', path: 'nose.y', label: copy.fields.verticalPosition, min: 0, max: 18 },
    ],
  },
  {
    id: 'mouth',
    label: copy.rail.mouth,
    icon: Smiley,
    fields: [
      { kind: 'option', path: 'mouth.type', label: copy.fields.mouthType, count: 24, feature: 'mouth', columns: 6 },
      { kind: 'color', path: 'mouth.color', label: copy.fields.lipColor, palette: LIP_COLORS, names: colorNames.lip },
      { kind: 'slider', path: 'mouth.size', label: copy.fields.size, min: 0, max: 8 },
      { kind: 'slider', path: 'mouth.y', label: copy.fields.verticalPosition, min: 0, max: 18 },
    ],
  },
  {
    id: 'glasses',
    label: copy.rail.glasses,
    icon: Eyeglasses,
    fields: [
      { kind: 'option', path: 'glasses.type', label: copy.fields.glassesType, count: 9, feature: 'glasses', columns: 6 },
      {
        kind: 'color',
        path: 'glasses.color',
        label: copy.fields.glassesColor,
        palette: GLASSES_COLORS,
        names: colorNames.glasses,
      },
      { kind: 'slider', path: 'glasses.size', label: copy.fields.size, min: 0, max: 7 },
      { kind: 'slider', path: 'glasses.y', label: copy.fields.verticalPosition, min: 0, max: 20 },
    ],
  },
  {
    id: 'facialHair',
    label: copy.rail.facialHair,
    icon: Broom,
    fields: [
      { kind: 'option', path: 'facialHair.mustache', label: copy.fields.mustache, count: 4, feature: 'mustache', columns: 4 },
      { kind: 'option', path: 'facialHair.beard', label: copy.fields.beard, count: 4, feature: 'beard', columns: 4 },
      {
        kind: 'color',
        path: 'facialHair.color',
        label: copy.fields.facialHairColor,
        palette: HAIR_COLORS,
        names: colorNames.hair,
      },
      { kind: 'slider', path: 'facialHair.size', label: copy.fields.size, min: 0, max: 8 },
      { kind: 'slider', path: 'facialHair.y', label: copy.fields.verticalPosition, min: 0, max: 16 },
    ],
  },
  {
    id: 'mole',
    label: copy.rail.mole,
    icon: MarkerCircle,
    fields: [
      { kind: 'toggle', path: 'mole.enabled', label: copy.fields.moleEnabled },
      { kind: 'slider', path: 'mole.size', label: copy.fields.moleSize, min: 0, max: 8 },
      { kind: 'slider', path: 'mole.x', label: copy.fields.moleX, min: 0, max: 16 },
      { kind: 'slider', path: 'mole.y', label: copy.fields.moleY, min: 0, max: 30 },
    ],
  },
  {
    id: 'info',
    label: copy.rail.info,
    icon: Info,
    fields: [
      { kind: 'readonly', label: copy.info.miiType, value: (mii) => miiTypeLabel(mii.miiType) },
      { kind: 'readonly', label: copy.info.pants, value: (mii) => pantLabel(mii.miiType, mii.favorite) },
      { kind: 'readonly', label: copy.info.createdAt, value: (mii) => formatCreationDate(mii.creationTicks) },
      { kind: 'readonly', label: copy.info.consoleId, value: (mii) => formatHexBytes(mii.consoleId), mono: true },
      { kind: 'readonly', label: copy.info.fileSize, value: () => formatFileSize(MII_RCD_SIZE) },
      { kind: 'readonly', label: copy.info.checksum, value: (mii) => formatMiiChecksum(mii), mono: true },
      { kind: 'readonly', label: copy.info.reserved, value: (mii) => reservedSummary(mii), mono: true },
      { kind: 'button', label: copy.info.regenerateId, hint: copy.info.regenerateHint, action: 'regenerateId' },
    ],
  },
]
