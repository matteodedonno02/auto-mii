import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { TextField } from './TextField'

function ControlledField() {
  const [value, setValue] = useState('')
  return <TextField id="name" label="Nome" value={value} onChange={setValue} maxLength={10} />
}

describe('TextField', () => {
  it('counts characters and enforces the 10 code unit limit', async () => {
    render(<ControlledField />)

    const input = screen.getByLabelText('Nome')
    expect(screen.getByText('0/10')).toBeInTheDocument()

    await userEvent.type(input, 'abcdefghijkl')
    expect(input).toHaveValue('abcdefghij')
    expect(screen.getByText('10/10')).toBeInTheDocument()
  })
})
