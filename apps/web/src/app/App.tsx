import { ControlPanel } from '@/components/editor/ControlPanel'
import { SectionRail } from '@/components/editor/SectionRail'
import { StatusNotice } from '@/components/editor/StatusNotice'
import { BackgroundPicker } from '@/components/preview/BackgroundPicker'
import { MiiPreview } from '@/components/preview/MiiPreview'
import { useAutosave } from '@/lib/useAutosave'
import { AppHeader } from './AppHeader'

export function App() {
  useAutosave()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg text-ink lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      <AppHeader />
      <StatusNotice />
      <main className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
        <div className="flex shrink-0 flex-col gap-3 p-3 sm:p-5 lg:min-h-0 lg:flex-1">
          <MiiPreview className="h-[36dvh] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1" />
          <BackgroundPicker />
        </div>
        <div className="flex flex-col gap-3 border-t border-line p-3 sm:p-5 lg:min-h-0 lg:w-[400px] lg:shrink-0 lg:border-t-0 lg:border-l">
          <SectionRail />
          <ControlPanel />
        </div>
      </main>
    </div>
  )
}
