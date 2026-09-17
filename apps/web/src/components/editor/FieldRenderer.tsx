import { featureLayers, type TileLayer } from 'mii-core'
import { Button } from '@/components/ui/Button'
import { ColorGrid } from '@/components/ui/ColorGrid'
import { FieldRow } from '@/components/ui/FieldRow'
import { OptionGrid } from '@/components/ui/OptionGrid'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SelectField } from '@/components/ui/SelectField'
import { SliderControl } from '@/components/ui/SliderControl'
import { TextField } from '@/components/ui/TextField'
import { Toggle } from '@/components/ui/Toggle'
import type { FieldConfig } from '@/editor/types'
import { cn } from '@/lib/cn'
import { getMiiField } from '@/lib/paths'
import { useEditorStore } from '@/lib/store'

export interface FieldRendererProps {
  field: FieldConfig
}

function fieldId(field: FieldConfig): string {
  if (field.kind === 'button' || field.kind === 'readonly') {
    return `field-${field.label.toLowerCase().replace(/\W+/g, '-')}`
  }
  return `field-${field.path.replace(/\./g, '-')}`
}

export function FieldRenderer({ field }: FieldRendererProps) {
  const mii = useEditorStore((state) => state.mii)
  const setField = useEditorStore((state) => state.setField)
  const scratchField = useEditorStore((state) => state.scratchField)
  const commitScratch = useEditorStore((state) => state.commitScratch)
  const regenerateId = useEditorStore((state) => state.regenerateId)

  const id = fieldId(field)

  switch (field.kind) {
    case 'text':
      return (
        <TextField
          id={id}
          label={field.label}
          value={getMiiField<string>(mii, field.path)}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(value) => setField(field.path, value)}
        />
      )

    case 'slider':
      return (
        <SliderControl
          id={id}
          label={field.label}
          value={getMiiField<number>(mii, field.path)}
          min={field.min}
          max={field.max}
          onChange={(value) => scratchField(field.path, value)}
          onCommitEnd={commitScratch}
        />
      )

    case 'option': {
      const value = getMiiField<number>(mii, field.path)
      return (
        <OptionGrid
          id={id}
          label={field.label}
          count={field.count}
          value={value}
          columns={field.columns}
          layersFor={(index): TileLayer[] => featureLayers(field.feature, index, mii)}
          onChange={(next) => setField(field.path, next)}
          end={<span className="font-mono text-xs text-ink tabular-nums">{value}</span>}
        />
      )
    }

    case 'color':
      return (
        <ColorGrid
          id={id}
          label={field.label}
          colors={field.palette}
          names={field.names}
          value={getMiiField<number>(mii, field.path)}
          onChange={(index) => setField(field.path, index)}
        />
      )

    case 'toggle':
      return (
        <Toggle
          id={id}
          label={field.label}
          checked={getMiiField<number>(mii, field.path) === 1}
          onChange={(checked) => setField(field.path, checked ? 1 : 0)}
        />
      )

    case 'segmented':
      return (
        <SegmentedControl
          id={id}
          label={field.label}
          value={getMiiField<number>(mii, field.path)}
          options={field.options}
          onChange={(value) => setField(field.path, value)}
        />
      )

    case 'select': {
      const disabled = field.dependsOn ? getMiiField<number>(mii, field.dependsOn.path) !== field.dependsOn.value : false
      return (
        <SelectField
          id={id}
          label={field.label}
          value={getMiiField<number>(mii, field.path)}
          options={field.options}
          disabled={disabled}
          hint={disabled ? field.disabledHint : undefined}
          onChange={(value) => setField(field.path, value)}
        />
      )
    }

    case 'readonly': {
      const value = field.value(mii)
      return (
        <FieldRow id={id} label={field.label}>
          <p className={cn('text-sm text-ink', field.mono && 'font-mono text-xs tracking-tight break-all')}>{value}</p>
        </FieldRow>
      )
    }

    case 'button':
      return (
        <div className="flex flex-col items-start gap-2">
          <Button onClick={regenerateId}>{field.label}</Button>
          {field.hint ? <p className="text-xs text-muted">{field.hint}</p> : null}
        </div>
      )
  }
}
