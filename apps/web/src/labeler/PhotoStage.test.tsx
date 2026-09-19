import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { copy } from '@/lib/i18n'
import { PhotoStage } from './PhotoStage'
import { initialLabelerData, useLabelerStore } from './store'

function photo(name: string): { name: string; file: File } {
  return { name, file: new File(['photo'], name, { type: 'image/jpeg' }) }
}

describe('PhotoStage', () => {
  beforeEach(() => {
    localStorage.clear()
    useLabelerStore.setState(initialLabelerData())
  })

  it('shows the drop instructions when no photos are loaded', () => {
    render(<PhotoStage />)
    expect(screen.getByText(copy.labeler.photoEmpty)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.labeler.openPhotos })).toBeInTheDocument()
  })

  it('loads dropped photos into the store', () => {
    render(<PhotoStage />)
    const file = new File(['photo'], 'gold-007.jpg', { type: 'image/jpeg' })
    fireEvent.drop(screen.getByText(copy.labeler.photoEmpty), { dataTransfer: { files: [file] } })
    expect(useLabelerStore.getState().photos.map((item) => item.id)).toEqual(['gold-007'])
  })

  it('shows the current photo with zoom controls', () => {
    useLabelerStore.getState().setFiles([photo('gold-007.jpg')])
    render(<PhotoStage />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'gold-007.jpg')
    expect(screen.getByRole('button', { name: copy.labeler.zoomIn })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.labeler.zoomFit })).toBeInTheDocument()
  })
})
