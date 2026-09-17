import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { OptionGrid } from './OptionGrid'

function ControlledGrid({ onChange }: { onChange?: (value: number) => void }) {
  const [value, setValue] = useState(0)
  return (
    <OptionGrid
      id="hair-type"
      label="Tipo"
      count={8}
      value={value}
      columns={4}
      layersFor={() => []}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

describe('OptionGrid', () => {
  it('renders every option with radio semantics', async () => {
    const onChange = vi.fn()
    render(<ControlledGrid onChange={onChange} />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(8)
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(radios[3])
    expect(onChange).toHaveBeenCalledWith(3)
    expect(screen.getAllByRole('radio')[3]).toHaveAttribute('aria-checked', 'true')
  })

  it('navigates with arrow keys, rowwise for the column count', async () => {
    const onChange = vi.fn()
    render(<ControlledGrid onChange={onChange} />)

    screen.getAllByRole('radio')[0].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(1)

    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith(5)
  })
})
