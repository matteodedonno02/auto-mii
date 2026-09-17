import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 0, label: 'Maschio' },
  { value: 1, label: 'Femmina' },
]

describe('SegmentedControl', () => {
  it('reports the selected option', () => {
    const onChange = vi.fn()
    render(<SegmentedControl id="sex" label="Sesso" value={0} options={OPTIONS} onChange={onChange} />)

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { name: 'Maschio' })).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByRole('radio', { name: 'Femmina' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('wraps the selection with arrow keys', () => {
    const onChange = vi.fn()
    render(<SegmentedControl id="sex" label="Sesso" value={1} options={OPTIONS} onChange={onChange} />)

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(0)
  })
})
