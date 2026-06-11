import { Plus, Search, X } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatCurrency, formatNumber } from '@/shared/lib/format'
import { FgButton, FgCard } from '@/shared/ui'

import { PO_ITEM_CATALOG } from '../model/fixtures'
import { draftLineAmount, emptyDraftLine } from '../model/types'

import type { PoCatalogItem } from '../model/fixtures'
import type { PoDraftLine } from '../model/types'

const MAX_LINES = 50

function searchCatalog(query: string): PoCatalogItem[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return PO_ITEM_CATALOG.slice(0, 6)

  return PO_ITEM_CATALOG.filter(
    (item) => item.name.toLowerCase().includes(keyword) || item.sku.toLowerCase().includes(keyword),
  ).slice(0, 6)
}

export interface PoLineEditorProps {
  lines: PoDraftLine[]
  onChange: (lines: PoDraftLine[]) => void
}

export function PoLineEditor({ lines, onChange }: PoLineEditorProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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

  function selectItem(index: number, item: PoCatalogItem) {
    updateLine(index, {
      itemName: item.name,
      sku: item.sku,
      unit: item.unit,
      unitPrice: item.lastPrice,
    })
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
          const results = searchCatalog(line.itemName)

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
                      className="min-w-0 flex-1 bg-transparent text-label font-semibold text-ink outline-none placeholder:text-faint"
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
                    <p className="border-b border-line-soft px-3.5 py-2 text-meta font-semibold text-faint">
                      검색 결과 {results.length}건
                    </p>
                    {results.map((item) => (
                      <button
                        key={item.sku}
                        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-primary-soft"
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          selectItem(index, item)
                        }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-label font-semibold text-ink">{item.name}</span>
                          <span className="block text-meta font-medium text-faint">{item.sku}</span>
                        </span>
                        <span className="shrink-0 text-meta font-semibold text-muted">
                          재고 {formatNumber(item.hqStock)} {item.unit}
                        </span>
                      </button>
                    ))}
                    {results.length === 0 ? (
                      <p className="px-3.5 py-3 text-meta text-faint">일치하는 부품이 없습니다</p>
                    ) : null}
                    <button
                      className="w-full border-t border-line-soft px-3.5 py-2 text-left text-meta font-semibold text-muted hover:text-ink-2"
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        setActiveIndex(null)
                      }}
                    >
                      닫기
                    </button>
                  </div>
                ) : null}
              </div>
              <span className="w-14 text-center text-label font-semibold text-ink-2">
                {line.unit ?? '—'}
              </span>
              <input
                className="h-11 w-28 rounded-control border border-line bg-surface px-3 text-right text-label font-bold text-ink outline-none transition-colors focus:border-primary"
                min={0}
                type="number"
                value={line.quantity === 0 ? '' : line.quantity}
                onChange={(event) => updateLine(index, { quantity: Number(event.target.value) || 0 })}
              />
              <input
                className="h-11 w-32 rounded-control border border-line bg-surface px-3 text-right text-label font-bold text-ink outline-none transition-colors focus:border-primary"
                min={0}
                type="number"
                value={line.unitPrice === 0 ? '' : line.unitPrice}
                onChange={(event) => updateLine(index, { unitPrice: Number(event.target.value) || 0 })}
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
