import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SliderControl } from './SliderControl'

describe('SliderControl', () => {
  it('shows the value and emits changes', async () => {
    const onChange = vi.fn()
    render(
      <SliderControl id="height" label="Altezza" value={64} min={0} max={127} onChange={onChange} />,
    )

    expect(screen.getByText('64')).toBeInTheDocument()
    const slider = screen.getByRole('slider', { name: 'Altezza' })
    fireEvent.change(slider, { target: { value: '100' } })
    expect(onChange).toHaveBeenCalledWith(100)
  })

  it('marks a drag as one commit gesture', async () => {
    const onCommitStart = vi.fn()
    const onCommitEnd = vi.fn()
    render(
      <SliderControl
        id="size"
        label="Dimensione"
        value={4}
        min={0}
        max={8}
        onChange={() => {}}
        onCommitStart={onCommitStart}
        onCommitEnd={onCommitEnd}
      />,
    )

    const slider = screen.getByRole('slider', { name: 'Dimensione' })
    fireEvent.pointerDown(slider)
    fireEvent.pointerUp(slider)
    expect(onCommitStart).toHaveBeenCalledTimes(1)
    expect(onCommitEnd).toHaveBeenCalledTimes(1)

    await userEvent.tab()
    expect(onCommitEnd).toHaveBeenCalledTimes(2)
  })
})
