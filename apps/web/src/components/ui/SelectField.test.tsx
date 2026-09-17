import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from './SelectField'

const OPTIONS = [
  { value: 0, label: 'Non impostato' },
  { value: 1, label: 'Gennaio' },
  { value: 2, label: 'Febbraio' },
]

describe('SelectField', () => {
  it('renders options and reports changes', async () => {
    const onChange = vi.fn()
    render(<SelectField id="month" label="Mese" value={0} options={OPTIONS} onChange={onChange} />)

    const select = screen.getByLabelText('Mese')
    expect(screen.getAllByRole('option')).toHaveLength(3)

    await userEvent.selectOptions(select, '2')
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('disables the control and explains why', () => {
    render(
      <SelectField
        id="day"
        label="Giorno"
        value={0}
        options={OPTIONS}
        onChange={() => {}}
        disabled
        hint="Imposta prima il mese di nascita."
      />,
    )

    expect(screen.getByLabelText('Giorno')).toBeDisabled()
    expect(screen.getByText('Imposta prima il mese di nascita.')).toBeInTheDocument()
  })
})
