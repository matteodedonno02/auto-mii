export const STAGE_IDS = ['chiaro', 'notte', 'cielo', 'menta', 'trasparente'] as const

export type StageId = (typeof STAGE_IDS)[number]

export interface StagePreset {
  id: StageId
  /** Tailwind classes for the stage frame surface. */
  surface: string
  /** Swatch color for the picker; null renders the checkerboard. */
  swatch: string | null
}

export const STAGES: readonly StagePreset[] = [
  { id: 'chiaro', surface: 'bg-[#F2F2F0]', swatch: '#F2F2F0' },
  { id: 'notte', surface: 'bg-[#17171A]', swatch: '#17171A' },
  { id: 'cielo', surface: 'bg-[#CDE6F5]', swatch: '#CDE6F5' },
  { id: 'menta', surface: 'bg-[#D6EFE5]', swatch: '#D6EFE5' },
  { id: 'trasparente', surface: 'stage-checker', swatch: null },
]

export function getStage(id: StageId): StagePreset {
  return STAGES.find((stage) => stage.id === id) ?? STAGES[0]
}
