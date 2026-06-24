import { Plus, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { formatCurrency } from '@/shared/lib/format'
import { FgButton, FgCard } from '@/shared/ui'

import { draftLineAmount, emptyDraftLine } from '../model/ui-types'

import type { PoDraftLine } from '../model/ui-types'

const MAX_LINES = 100

export interface PoLineSearchPanelProps {
  onSelect: (patch: Partial<PoDraftLine>) => void
  query: string
}

export interface PoLineEditorProps {
  lines: PoDraftLine[]
  onChange: (lines: PoDraftLine[]) => void
  renderSearchPanel: (props: PoLineSearchPanelProps) => ReactNode
}

export function PoLineEditor({ lines, onChange, renderSearchPanel }: PoLineEditorProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const searchRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    if (activeIndex === null) return
    function handlePointerDown(event: MouseEvent) {
      const node = searchRefs.current[activeIndex as number]
      if (node && !node.contains(event.target as Node)) {
        setActiveIndex(null)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [activeIndex])

  function updateLine(index: number, patch: Partial<PoDraftLine>) {
    onChange(lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)))
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, lineIndex) => lineIndex !== index))
  }

  function addLine() {
    if (lines.length >= MAX_LINES) return
    onChange([...lines, emptyDraftLine()])
  }

  function handleSelect(index: number, patch: Partial<PoDraftLine>) {
    updateLine(index, patch)
    setActiveIndex(null)
  }

  return (
    <FgCard>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-section text-ink">주문 품목</h2>
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
        <span className="w-28 text-right">수량</span>
        <span className="w-32 text-right">단가</span>
        <span className="w-32 text-right">금액</span>
        <span className="w-8" />
      </div>

      <div className="divide-y divide-line-soft border-x border-b border-line">
        {lines.map((line, index) => {
          const isActive = activeIndex === index

          return (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <div
                ref={(node) => {
                  searchRefs.current[index] = node
                }}
                className="relative flex-1"
              >
                <div className="flex h-12 items-center gap-2.5 rounded-control border border-line bg-surface px-3 transition-colors">
                  <Search aria-hidden className="h-4 w-4 shrink-0 text-faint" />
                  {line.sku && !isActive ? (
                    <button
                      className="min-w-0 flex-1 text-left"
                      type="button"
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="block truncate text-label font-bold text-ink">{line.itemName}</span>
                      <span className="block text-meta font-medium text-faint">{line.sku}</span>
                    </button>
                  ) : (
                    <input
                      aria-label={`주문 품목 ${index + 1} 검색`}
                      className="min-w-0 flex-1 bg-transparent text-label font-semibold text-ink outline-none ring-0 placeholder:text-faint focus:outline-none focus:ring-0"
                      placeholder="부품명 또는 코드 검색"
                      value={line.itemName}
                      onChange={(event) =>
                        updateLine(index, { itemName: event.target.value, sku: null, unit: null })
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
                aria-label={`주문 품목 ${index + 1} 수량`}
                className="h-11 w-28 rounded-control border border-line bg-surface px-3 text-right text-label font-bold text-ink outline-none transition-colors focus:border-primary"
                inputMode="numeric"
                type="text"
                value={line.quantity === 0 ? '' : line.quantity}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '')
                  updateLine(index, { quantity: digits ? Number(digits) : 0 })
                }}
              />
              <input
                aria-label={`주문 품목 ${index + 1} 단가`}
                className="h-11 w-32 rounded-control border border-line bg-surface px-3 text-right text-label font-bold text-ink outline-none transition-colors focus:border-primary"
                inputMode="numeric"
                type="text"
                value={line.unitPrice === 0 ? '' : line.unitPrice}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '')
                  updateLine(index, { unitPrice: digits ? Number(digits) : 0 })
                }}
              />
              <span className="w-32 text-right text-label font-bold text-ink">
                {formatCurrency(draftLineAmount(line))}
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
          className="flex w-full items-center justify-center gap-2 border-dashed py-3.5 text-label font-semibold text-primary-strong transition-colors hover:bg-primary-soft disabled:text-faint"
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
