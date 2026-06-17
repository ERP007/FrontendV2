import { Plus, Search, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgCard, FgSelect } from '@/shared/ui'

import { emptySoDraftLine, SO_PRIORITY_LABELS } from '../model/so-ui-model'

import type { SoLine, SoPriority } from '../model/so-ui-model'

const MAX_LINES = 50

export interface SoLineSearchPanelProps {
  onSelect: (patch: Partial<SoLine>) => void
  query: string
}

function stockTone(stock: number, safety: number): { className: string; label: string } {
  if (stock >= safety) return { className: 'text-success', label: '충분' }
  if (stock >= safety * 0.8) return { className: 'text-warning', label: '근접' }
  return { className: 'text-danger', label: '부족' }
}

const priorityOptions = (Object.keys(SO_PRIORITY_LABELS) as SoPriority[]).map((priority) => ({
  label: SO_PRIORITY_LABELS[priority],
  value: priority,
}))

export interface SoLineEditorProps {
  lines: SoLine[]
  onChange: (lines: SoLine[]) => void
  renderSearchPanel: (props: SoLineSearchPanelProps) => ReactNode
}

export function SoLineEditor({ lines, onChange, renderSearchPanel }: SoLineEditorProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  function updateLine(index: number, patch: Partial<SoLine>) {
    onChange(lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)))
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, lineIndex) => lineIndex !== index))
  }

  function addLine() {
    if (lines.length >= MAX_LINES) return
    onChange([...lines, emptySoDraftLine()])
  }

  function handleSelect(index: number, patch: Partial<SoLine>) {
    const duplicate =
      patch.itemCode != null &&
      lines.some((line, lineIndex) => lineIndex !== index && line.itemCode === patch.itemCode)
    if (duplicate) {
      toast.error('이미 추가된 부품입니다.')
      return
    }
    updateLine(index, patch)
    setActiveIndex(null)
  }

  return (
    <FgCard>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-section text-ink">요청 품목</h2>
          <span className="rounded-pill bg-line-soft px-2.5 py-1 text-badge text-muted">
            {lines.length} / {MAX_LINES} 라인
          </span>
        </div>
        <FgButton
          disabled={lines.length >= MAX_LINES}
          leftIcon={<Plus aria-hidden className="h-4 w-4" />}
          size="sm"
          variant="soft"
          onClick={addLine}
        >
          라인 추가
        </FgButton>
      </div>

      <div className="flex items-center gap-3 rounded-t-control border border-line bg-background px-4 py-3 text-table text-faint">
        <span className="flex-1">부품</span>
        <span className="w-14 text-center">단위</span>
        <span className="w-24 text-right">요청 수량</span>
        <span className="w-24 text-right">현재고</span>
        <span className="w-28 text-right">안전재고</span>
        <span className="w-28 text-center">우선순위</span>
        <span className="w-8" />
      </div>

      <div className="divide-y divide-line-soft border-x border-b border-line">
        {lines.map((line, index) => {
          const isActive = activeIndex === index
          const tone =
            line.branchStock !== null && line.safetyStock !== null
              ? stockTone(line.branchStock, line.safetyStock)
              : null

          return (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <div className="relative flex-1">
                <div
                  className={cn(
                    'flex h-12 items-center gap-2.5 rounded-control border bg-surface px-3 transition-colors',
                    isActive ? 'border-1.5 border-primary' : 'border-line',
                  )}
                >
                  <Search aria-hidden className="h-4 w-4 shrink-0 text-faint" />
                  {line.itemCode && !isActive ? (
                    <button
                      className="min-w-0 flex-1 text-left"
                      type="button"
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="block truncate text-label font-bold text-ink">{line.itemName}</span>
                      <span className="block text-meta font-medium text-faint">{line.itemCode}</span>
                    </button>
                  ) : (
                    <input
                      className="min-w-0 flex-1 bg-transparent text-label font-semibold text-ink outline-none placeholder:text-faint"
                      placeholder="부품명 또는 코드 검색"
                      value={line.itemName}
                      onChange={(event) =>
                        updateLine(index, {
                          branchStock: null,
                          itemName: event.target.value,
                          safetyStock: null,
                          itemCode: null,
                          unit: null,
                        })
                      }
                      onFocus={() => setActiveIndex(index)}
                    />
                  )}
                </div>
                {isActive ? (
                  <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-control border border-line bg-surface shadow-popover">
                    {renderSearchPanel({
                      onSelect: (patch) => handleSelect(index, patch),
                      query: line.itemName,
                    })}
                  </div>
                ) : null}
              </div>
              <span className="w-14 text-center text-label font-semibold text-ink-2">
                {line.unit ?? '—'}
              </span>
              <input
                className="h-11 w-24 rounded-control border border-line bg-surface px-3 text-right text-label font-bold text-ink outline-none transition-colors focus:border-primary"
                min={0}
                type="number"
                value={line.quantity === 0 ? '' : line.quantity}
                onChange={(event) => updateLine(index, { quantity: Number(event.target.value) || 0 })}
              />
              <span className="w-24 text-right">
                {line.branchStock !== null && tone ? (
                  <>
                    <span className={cn('text-label font-bold', tone.className)}>
                      {formatNumber(line.branchStock)}
                      <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
                    </span>
                    <span className={cn('block text-meta font-semibold', tone.className)}>{tone.label}</span>
                  </>
                ) : (
                  <span className="text-label font-medium text-faint">—</span>
                )}
              </span>
              <span className="w-28 text-right">
                {line.safetyStock !== null ? (
                  <span className="text-label font-bold text-ink">
                    {formatNumber(line.safetyStock)}
                    <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
                  </span>
                ) : (
                  <span className="text-label font-medium text-faint">—</span>
                )}
              </span>
              <span className="w-28">
                <FgSelect
                  className={cn(line.priority === 'URGENT' && '[&_button]:border-danger-bg [&_button]:bg-danger-bg [&_button]:text-danger')}
                  options={priorityOptions}
                  value={line.priority}
                  onValueChange={(value) => updateLine(index, { priority: value as SoPriority })}
                />
              </span>
              <button
                aria-label="라인 삭제"
                className="flex h-8 w-8 items-center justify-center rounded-control text-faint transition-colors hover:bg-danger-bg hover:text-danger"
                type="button"
                onClick={() => removeLine(index)}
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          )
        })}
        <button
          className="flex w-full items-center justify-center gap-2 py-3.5 text-label font-semibold text-primary-strong transition-colors hover:bg-primary-soft disabled:text-faint"
          disabled={lines.length >= MAX_LINES}
          type="button"
          onClick={addLine}
        >
          <Plus aria-hidden className="h-4 w-4" />
          라인 추가
        </button>
      </div>
    </FgCard>
  )
}
