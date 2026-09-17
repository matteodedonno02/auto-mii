import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from './Toggle'

function ControlledToggle({ initial = false, onChange }: { initial?: boolean; onChange?: (value: boolean) => void }) {
  const [checked, setChecked] = useState(initial)
  return (
    <Toggle
      id="mole"
      label="Mostra neo"
      checked={checked}
      onChange={(value) => {
        setChecked(value)
        onChange?.(value)
      }}
    />
  )
}

describe('Toggle', () => {
  it('exposes a switch with the label and toggles on click', async () => {
    const onChange = vi.fn()
    render(<ControlledToggle onChange={onChange} />)

    const toggle = screen.getByRole('switch', { name: 'Mostra neo' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
