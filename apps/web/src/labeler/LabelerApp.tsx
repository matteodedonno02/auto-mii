import { ControlPanel } from '@/components/editor/ControlPanel'
import { SectionRail } from '@/components/editor/SectionRail'
import { MiiPreview } from '@/components/preview/MiiPreview'
import { LabelerFooter } from './LabelerFooter'
import { LabelerNotice } from './LabelerNotice'
import { LabelerToolbar } from './LabelerToolbar'
import { PhotoStage } from './PhotoStage'
import { SkipDialog } from './SkipDialog'
import { useLabelerHotkeys } from './useLabelerHotkeys'

export function LabelerApp() {
  useLabelerHotkeys()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg text-ink lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      <LabelerToolbar />
      <LabelerNotice />
      <main className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row">
        <div className="flex shrink-0 flex-col p-3 sm:p-5 lg:min-h-0 lg:flex-1">
          <PhotoStage className="h-[52dvh] lg:h-auto lg:min-h-0 lg:flex-1" />
        </div>
        <div className="flex flex-col gap-3 border-t border-line p-3 sm:p-5 lg:min-h-0 lg:w-[400px] lg:shrink-0 lg:border-t-0 lg:border-l">
          <MiiPreview className="h-[26dvh] shrink-0 lg:h-[200px]" />
          <SectionRail />
          <ControlPanel />
          <LabelerFooter />
        </div>
      </main>
      <SkipDialog />
    </div>
  )
}
