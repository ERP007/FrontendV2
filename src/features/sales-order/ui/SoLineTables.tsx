import { Lock } from 'lucide-react'

/** 요청 메모 박스 */
export function SoNoteBox({ note }: { note: string }) {
  return (
    <div className="mt-4 flex gap-3 rounded-control bg-background px-4 py-3.5">
      <span className="w-1 shrink-0 rounded-pill bg-primary" />
      <div>
        <p className="flex items-center gap-1.5 text-meta font-semibold text-faint">
          <Lock aria-hidden className="h-3 w-3" />
          요청 메모
        </p>
        <p className="mt-1 text-label font-medium text-ink-2">{note}</p>
      </div>
    </div>
  )
}
