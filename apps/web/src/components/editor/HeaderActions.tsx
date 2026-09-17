import {
  ArrowClockwise,
  ArrowCounterClockwise,
  DiceFive,
  DownloadSimple,
  FileArrowDown,
  FloppyDisk,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useRef } from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { Menu, type MenuItem } from '@/components/ui/Menu'
import { copy } from '@/lib/i18n'
import {
  buildProjectJson,
  downloadBytes,
  downloadText,
  parseProjectJson,
  readFileBytes,
  sanitizeFileName,
} from '@/lib/file'
import { useEditorStore } from '@/lib/store'
import { MiiDecodeError, decodeMii, encodeMii, encodeRsd } from 'mii-core'

const PROJECT_EXTENSION = /\.json$/i

export function HeaderActions() {
  const mii = useEditorStore((state) => state.mii)
  const canUndo = useEditorStore((state) => state.past.length > 0)
  const canRedo = useEditorStore((state) => state.future.length > 0)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const randomize = useEditorStore((state) => state.randomize)
  const resetToNew = useEditorStore((state) => state.resetToNew)
  const loadMii = useEditorStore((state) => state.loadMii)
  const setNotice = useEditorStore((state) => state.setNotice)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const baseName = sanitizeFileName(mii.name)

  const importFile = async (file: File) => {
    try {
      if (PROJECT_EXTENSION.test(file.name)) {
        const project = parseProjectJson(await file.text())
        loadMii(project, { kind: 'success', message: copy.status.projectLoaded })
        return
      }
      const bytes = await readFileBytes(file)
      const { format, mii: imported } = decodeMii(bytes)
      loadMii(imported, { kind: 'success', message: `${copy.status.imported} (${format.toUpperCase()})` })
    } catch (error) {
      const code = error instanceof MiiDecodeError ? error.code : null
      const message = code
        ? copy.errors[code]
        : PROJECT_EXTENSION.test(file.name)
          ? copy.status.jsonError
          : copy.errors.read
      setNotice({ kind: 'error', message })
    }
  }

  const exportItems: MenuItem[] = [
    {
      id: 'mii',
      label: copy.header.exportMii,
      icon: FileArrowDown,
      onSelect: () => {
        downloadBytes(`${baseName}.mii`, encodeMii(mii))
        setNotice({ kind: 'success', message: copy.status.exportedMii })
      },
    },
    {
      id: 'rsd',
      label: copy.header.exportRsd,
      icon: FileArrowDown,
      onSelect: () => {
        downloadBytes(`${baseName}.rsd`, encodeRsd(mii))
        setNotice({ kind: 'success', message: copy.status.exportedRsd })
      },
    },
    {
      id: 'json',
      label: copy.header.exportJson,
      icon: FloppyDisk,
      onSelect: () => {
        downloadText(`${baseName}.mii.json`, buildProjectJson(mii))
        setNotice({ kind: 'success', message: copy.status.projectSaved })
      },
    },
  ]

  return (
    <div className="flex items-center gap-1">
      <IconButton label={copy.header.undo} onClick={undo} disabled={!canUndo}>
        <ArrowCounterClockwise size={17} weight="bold" />
      </IconButton>
      <IconButton label={copy.header.redo} onClick={redo} disabled={!canRedo}>
        <ArrowClockwise size={17} weight="bold" />
      </IconButton>

      <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line sm:block" />

      <IconButton label={copy.header.randomize} onClick={randomize}>
        <DiceFive size={17} weight="bold" />
      </IconButton>
      <IconButton label={copy.header.newMii} onClick={resetToNew} className="hidden sm:inline-flex">
        <Plus size={17} weight="bold" />
      </IconButton>

      <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line sm:block" />

      <IconButton label={copy.header.import} onClick={() => fileInputRef.current?.click()}>
        <UploadSimple size={17} weight="bold" />
      </IconButton>
      <Menu label={copy.header.export} icon={DownloadSimple} items={exportItems} variant="primary" compact />

      <input
        ref={fileInputRef}
        type="file"
        accept=".mii,.rsd,.mae,.miigx,.json"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) {
            void importFile(file)
          }
        }}
      />
    </div>
  )
}
