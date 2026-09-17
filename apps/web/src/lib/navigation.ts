export const SECTION_IDS = [
  'personal',
  'body',
  'face',
  'hair',
  'eyebrow',
  'eye',
  'nose',
  'mouth',
  'glasses',
  'facialHair',
  'mole',
  'info',
] as const

export type SectionId = (typeof SECTION_IDS)[number]
