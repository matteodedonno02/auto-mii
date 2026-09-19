import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/figtree'
import '@fontsource-variable/baloo-2'
import '@fontsource-variable/jetbrains-mono'
import '@/index.css'
import { LabelerApp } from './LabelerApp'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container missing')
}

createRoot(container).render(
  <StrictMode>
    <LabelerApp />
  </StrictMode>,
)
