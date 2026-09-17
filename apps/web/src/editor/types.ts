import type { Icon } from '@phosphor-icons/react'
import type { FeatureKind, MiiData } from 'mii-core'
import type { SectionId } from '@/lib/navigation'
import type { MiiFieldPath } from '@/lib/paths'

export interface TextFieldConfig {
  kind: 'text'
  path: MiiFieldPath
  label: string
  maxLength: number
  placeholder?: string
}

export interface SliderFieldConfig {
  kind: 'slider'
  path: MiiFieldPath
  label: string
  min: number
  max: number
}

export interface OptionFieldConfig {
  kind: 'option'
  path: MiiFieldPath
  label: string
  count: number
  feature: FeatureKind
  columns: number
}

export interface ColorFieldConfig {
  kind: 'color'
  path: MiiFieldPath
  label: string
  palette: readonly string[]
  names?: readonly string[]
}

export interface ToggleFieldConfig {
  kind: 'toggle'
  path: MiiFieldPath
  label: string
}

export interface SegmentedFieldConfig {
  kind: 'segmented'
  path: MiiFieldPath
  label: string
  options: ReadonlyArray<{ value: number; label: string }>
}

export interface SelectFieldConfig {
  kind: 'select'
  path: MiiFieldPath
  label: string
  options: ReadonlyArray<{ value: number; label: string }>
  /** Disables the select while the dependency does not match. */
  dependsOn?: { path: MiiFieldPath; value: number }
  disabledHint?: string
}

export interface ReadonlyFieldConfig {
  kind: 'readonly'
  label: string
  value: (mii: MiiData) => string
  mono?: boolean
}

export interface ButtonFieldConfig {
  kind: 'button'
  label: string
  hint?: string
  action: 'regenerateId'
}

export type FieldConfig =
  | TextFieldConfig
  | SliderFieldConfig
  | OptionFieldConfig
  | ColorFieldConfig
  | ToggleFieldConfig
  | SegmentedFieldConfig
  | SelectFieldConfig
  | ReadonlyFieldConfig
  | ButtonFieldConfig

export interface SectionConfig {
  id: SectionId
  label: string
  icon: Icon
  fields: readonly FieldConfig[]
}
