import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { AlertTriangle, Box, Calendar, Clock, Lock, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useItemsInfiniteQuery } from '@/features/item'
import type { ItemListItem } from '@/features/item'
import {
  emptySoDraftLine,
  SoDraftLineEditor,
  soDraftFormSchema,
} from '@/features/sales-order'
import type { SoDraftFormValues, SoDraftLine } from '@/features/sales-order'
import { useMeQuery } from '@/features/user'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { roleLabel } from '@/shared/config/session'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { formatNumber } from '@/shared/lib/format'
import {
  FgBadge,
  FgButton,
  FgCard,
  FgInput,
  FgNotice,
  FgPageHeader,
  FgSelect,
  FgTextarea,
} from '@/shared/ui'

const DRAFT_REQ_NO = 'REQ-2026-0513'

const breadcrumbs = [{ label: '발주' }, { label: '내 지점 발주 요청' }, { label: '신규 등록' }]

const emptyDraftValues: SoDraftFormValues = {
  desiredAt: '',
  note: '',
  receiveWarehouse: '',
}

function itemToLinePatch(item: ItemListItem): Partial<SoDraftLine> {
  return {
    branchStock: null,
    itemName: item.name,
    safetySource: null,
    safetyStock: item.safetyStock,
    sku: item.sku,
    unit: item.unit,
  }
}

interface ItemSearchPanelProps {
  onSelect: (patch: Partial<SoDraftLine>) => void
  query: string
}

function ItemSearchPanel({ onSelect, query }: ItemSearchPanelProps) {
  const debouncedQuery = useDebouncedValue(query, 300)
  const search = debouncedQuery.trim()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useItemsInfiniteQuery({ search: search || undefined })

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '40px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const items = data?.pages.flatMap((page) => page.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0
  const isInitialLoading = isFetching && !data

  return (
    <div className="max-h-72 overflow-y-auto">
      <p className="border-b border-line-soft px-3.5 py-2 text-meta font-semibold text-faint">
        검색 결과 {formatNumber(totalElements)}건
      </p>
      {items.map((item) => (
        <button
          key={item.sku}
          className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-primary-soft"
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect(itemToLinePatch(item))
          }}
        >
          <span className="min-w-0">
            <span className="block truncate text-label font-semibold text-ink">{item.name}</span>
            <span className="block text-meta font-medium text-faint">{item.sku}</span>
          </span>
          <span className="shrink-0 text-meta font-semibold text-muted">
            안전재고 {formatNumber(item.safetyStock)} {item.unit}
          </span>
        </button>
      ))}
      {isInitialLoading ? (
        <p className="px-3.5 py-3 text-meta text-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="px-3.5 py-3 text-meta text-faint">일치하는 부품이 없습니다</p>
      ) : null}
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage ? (
        <p className="px-3.5 py-2 text-meta text-faint">더 불러오는 중…</p>
      ) : null}
    </div>
  )
}

export function BranchSalesOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()

  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: me } = useMeQuery()

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SoDraftFormValues>({
    defaultValues: emptyDraftValues,
    resolver: zodResolver(soDraftFormSchema),
  })

  const [lines, setLines] = useState<SoDraftLine[]>([emptySoDraftLine()])
  const [linesError, setLinesError] = useState<string | null>(null)

  const urgentCount = lines.filter((line) => line.sku !== null && line.priority === 'URGENT').length
  const totalQuantity = lines.reduce((sum, line) => sum + (line.sku ? line.quantity : 0), 0)

  const submit = handleSubmit(() => {
    const completed = lines.filter((line) => line.sku !== null)

    if (completed.length === 0) {
      setLinesError('요청 품목을 1개 이상 추가하세요.')
      return
    }
    if (completed.some((line) => line.quantity <= 0)) {
      setLinesError('모든 품목의 요청 수량을 1 이상으로 입력하세요.')
      return
    }

    setLinesError(null)
    toast.success(`${DRAFT_REQ_NO} 발주 요청이 제출되었습니다. 본사 승인을 기다립니다.`)
    void navigate({ to: '/branch/sales-orders' })
  })

  function handleDraftSave() {
    toast.success('임시저장되었습니다.')
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton leftIcon={<Box aria-hidden className="h-4 w-4" />} onClick={handleDraftSave}>
              임시저장
            </FgButton>
            <FgButton
              leftIcon={<Send aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={submit}
            >
              요청 제출
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="발주 요청 등록"
      />

      <form className="fg-content" onSubmit={submit}>
        <FgCard>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-section text-ink">요청 정보</h2>
              <FgBadge variant="outline">{DRAFT_REQ_NO} (임시)</FgBadge>
            </div>
            <span className="text-meta font-medium text-faint">
              요청자 · {me?.name ?? '—'} / {me?.tenancyName ?? '—'} · {roleLabel(me?.role)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-2">
              <span className="block text-label text-ink-2">요청 지점</span>
              <div className="flex h-11 items-center justify-between gap-3 rounded-control border border-line bg-background px-3.5 text-body">
                <span className="font-semibold text-ink">
                  {me?.tenancyName ?? '—'}
                  <span className="ml-1.5 text-meta font-medium text-faint">
                    {me?.tenancyCode ?? '—'}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-meta font-semibold text-faint">
                  <Lock aria-hidden className="h-3 w-3" />
                  자동
                </span>
              </div>
            </div>
            <FgInput
              error={errors.desiredAt?.message}
              label="도착 희망일"
              leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
              required
              type="date"
              {...register('desiredAt')}
            />
            <Controller
              control={control}
              name="receiveWarehouse"
              render={({ field }) => (
                <FgSelect
                  error={errors.receiveWarehouse?.message}
                  label="수신 창고"
                  options={
                    hqWarehouses?.map((warehouse) => ({
                      label: warehouse.name,
                      supportingText: warehouse.code,
                      value: warehouse.code,
                    })) ?? []
                  }
                  placeholder="수신 창고를 선택하세요"
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <FgTextarea
              error={errors.note?.message}
              label="메모"
              placeholder="요청 사유, 우선 출고 사항 등을 본사에 전달"
              rows={3}
              {...register('note')}
            />
          </div>
        </FgCard>

        <SoDraftLineEditor
          lines={lines}
          renderSearchPanel={(props) => <ItemSearchPanel {...props} />}
          onChange={setLines}
        />
        {linesError ? <FgNotice tone="danger">{linesError}</FgNotice> : null}

        <FgCard className="flex items-center justify-between gap-4" compact>
          <span className="flex items-center gap-1.5 text-label font-medium text-muted">
            <Clock aria-hidden className="h-4 w-4 text-faint" />
            제출 후 본사 승인까지 평균 9시간 · 총 {formatNumber(totalQuantity)} EA
          </span>
          <span
            className={
              urgentCount > 0
                ? 'flex items-center gap-2 rounded-control border border-danger-bg bg-danger-bg px-3.5 py-2 text-label font-bold text-danger'
                : 'text-label font-medium text-faint'
            }
          >
            {urgentCount > 0 ? <AlertTriangle aria-hidden className="h-4 w-4" /> : null}
            긴급 품목 수 {urgentCount}건
          </span>
        </FgCard>

        <div className="flex items-center justify-end gap-2.5">
          <FgButton type="button" variant="ghost" onClick={() => router.history.back()}>
            취소
          </FgButton>
          <FgButton
            leftIcon={<Box aria-hidden className="h-4 w-4" />}
            type="button"
            onClick={handleDraftSave}
          >
            임시저장
          </FgButton>
          <FgButton
            leftIcon={<Send aria-hidden className="h-4 w-4" />}
            type="submit"
            variant="primary"
          >
            요청 제출
          </FgButton>
        </div>
      </form>
    </div>
  )
}
