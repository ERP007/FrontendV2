import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { AlertTriangle, Box, Calendar, Clock, Lock, Send } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  emptySoDraftLine,
  MY_BRANCH,
  SoDraftLineEditor,
  soDraftFormSchema,
} from '@/features/sales-order'
import type { SoDraftFormValues, SoDraftLine } from '@/features/sales-order'
import { useHqWarehousesQuery } from '@/features/warehouse'
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

export function BranchSalesOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()

  const { data: hqWarehouses } = useHqWarehousesQuery()

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
              요청자 · 정유진 / {MY_BRANCH.name} · 서비스 매니저
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-2">
              <span className="block text-label text-ink-2">요청 지점</span>
              <div className="flex h-11 items-center justify-between gap-3 rounded-control border border-line bg-background px-3.5 text-body">
                <span className="font-semibold text-ink">
                  {MY_BRANCH.name}
                  <span className="ml-1.5 text-meta font-medium text-faint">
                    {MY_BRANCH.code} · {MY_BRANCH.region}
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

        <SoDraftLineEditor lines={lines} onChange={setLines} />
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
