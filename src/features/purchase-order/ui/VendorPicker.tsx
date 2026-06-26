import { Building2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'

import { usePurchaseOrderVendorsQuery } from '../api/use-purchase-order-vendors-query'

export interface VendorPickerProps {
  error?: string
  /** 수정 prefill: value(코드)에 해당하는 공급사명 초기 표시 */
  initialName?: string
  onChange: (code: string) => void
  value: string
}

export function VendorPicker({ error, initialName, onChange, value }: VendorPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(initialName ?? null)
  const debouncedQuery = useDebouncedValue(query, 300)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { data: vendors, isFetching } = usePurchaseOrderVendorsQuery(debouncedQuery.trim())
  const results = vendors ?? []

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div className="space-y-2">
      <span className="block text-label text-ink-2">
        공급사<span className="text-danger"> *</span>
      </span>
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            'flex h-11 items-center gap-3 rounded-control border bg-surface px-3.5 text-body transition-colors',
            error ? 'border-danger' : 'border-line',
          )}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-faint">
            <Building2 aria-hidden className="h-4 w-4" />
          </span>
          {value && selectedName && !open ? (
            <button
              className="min-w-0 flex-1 text-left"
              type="button"
              onClick={() => {
                setQuery(selectedName)
                setOpen(true)
              }}
            >
              <span className="block truncate text-body font-semibold text-ink">
                {selectedName}
                <span className="ml-1.5 text-meta font-medium text-faint">{value}</span>
              </span>
            </button>
          ) : (
            <input
              className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none ring-0 placeholder:text-faint focus:outline-none focus:ring-0"
              placeholder="공급사명 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setOpen(true)}
            />
          )}
        </div>
        {open ? (
          <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-control border border-line bg-surface shadow-popover">
            <p className="border-b border-line-soft px-3.5 py-2 text-meta font-semibold text-faint">
              {isFetching ? '검색 중…' : `검색 결과 ${results.length}건`}
            </p>
            <div className="max-h-72 overflow-y-auto">
              {results.map((vendor) => (
                <button
                  key={vendor.code}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-primary-soft"
                  data-testid="po-vendor-search-result"
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    onChange(vendor.code)
                    setSelectedName(vendor.name)
                    setQuery('')
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-label font-semibold text-ink">
                      {vendor.name}
                    </span>
                    <span className="block text-meta font-medium text-faint">{vendor.code}</span>
                  </span>
                  {!vendor.active ? (
                    <span className="shrink-0 text-meta font-semibold text-faint">비활성</span>
                  ) : null}
                </button>
              ))}
              {!isFetching && results.length === 0 ? (
                <p className="px-3.5 py-3 text-meta text-faint">일치하는 공급사가 없습니다</p>
              ) : null}
            </div>
            <button
              className="w-full border-t border-line-soft px-3.5 py-2 text-left text-meta font-semibold text-muted hover:text-ink-2"
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                setOpen(false)
              }}
            >
              닫기
            </button>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-meta font-medium text-danger">{error}</p> : null}
    </div>
  )
}
