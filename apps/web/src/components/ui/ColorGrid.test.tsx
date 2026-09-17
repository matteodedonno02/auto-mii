import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorGrid } from './ColorGrid'

const COLORS = ['#111111', '#332222', '#441111', '#BB6644']

describe('ColorGrid', () => {
  it('renders one radio per color and reports the selection', async () => {
    const onChange = vi.fn()
    render(
      <ColorGrid id="hair-color" label="Colore" colors={COLORS} value={0} onChange={onChange} names={['Nero', 'Scuro', 'Rosso', 'Caramello']} />,
    )

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(4)
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Nero')).toBeInTheDocument()

    await userEvent.click(radios[2])
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('moves the selection with arrow keys', async () => {
    const onChange = vi.fn()
    render(<ColorGrid id="eye-color" label="Colore" colors={COLORS} value={1} onChange={onChange} />)

    screen.getAllByRole('radio')[1].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith(2)
  })
})
