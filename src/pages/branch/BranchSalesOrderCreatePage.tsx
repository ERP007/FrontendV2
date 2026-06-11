import { useNavigate, useRouter } from '@tanstack/react-router'
import { AlertTriangle, Box, Calendar, Clock, Lock, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { emptySoDraftLine, MY_BRANCH, SoDraftLineEditor } from '@/features/sales-order'
import type { SoDraftLine } from '@/features/sales-order'
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

const receiveWarehouseOptions = [
  {
    label: `${MY_BRANCH.receiveWarehouseName} ${MY_BRANCH.receiveWarehouseCode}`,
    value: MY_BRANCH.receiveWarehouseCode,
  },
]

export function BranchSalesOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()

  const [desiredAt, setDesiredAt] = useState('')
  const [receiveWarehouse, setReceiveWarehouse] = useState<string>(MY_BRANCH.receiveWarehouseCode)
  const [note, setNote] = useState('')
  const [lines, setLines] = useState<SoDraftLine[]>([emptySoDraftLine()])
  const [formError, setFormError] = useState<string | null>(null)

  const urgentCount = lines.filter((line) => line.sku !== null && line.priority === 'URGENT').length
  const totalQuantity = lines.reduce((sum, line) => sum + (line.sku ? line.quantity : 0), 0)

  function handleSubmit() {
    const completed = lines.filter((line) => line.sku !== null)

    if (!desiredAt) {
      setFormError('도착 희망일을 선택하세요.')
      return
    }
    if (completed.length === 0) {
      setFormError('요청 품목을 1개 이상 추가하세요.')
      return
    }
    if (completed.some((line) => line.quantity <= 0)) {
      setFormError('모든 품목의 요청 수량을 1 이상으로 입력하세요.')
      return
    }

    setFormError(null)
    toast.success(`${DRAFT_REQ_NO} 발주 요청이 제출되었습니다. 본사 승인을 기다립니다.`)
    void navigate({ to: '/branch/sales-orders' })
  }

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
              onClick={handleSubmit}
            >
              요청 제출
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="발주 요청 등록"
      />

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
            label="도착 희망일"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            value={desiredAt}
            onChange={(event) => setDesiredAt(event.target.value)}
          />
          <FgSelect
            label="수신 창고"
            options={receiveWarehouseOptions}
            required
            value={receiveWarehouse}
            onValueChange={setReceiveWarehouse}
          />
          <FgTextarea
            label="메모"
            placeholder="요청 사유, 우선 출고 사항 등을 본사에 전달"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
      </FgCard>

      <SoDraftLineEditor lines={lines} onChange={setLines} />
      {formError ? <FgNotice tone="danger">{formError}</FgNotice> : null}

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
        <FgButton variant="ghost" onClick={() => router.history.back()}>
          취소
        </FgButton>
        <FgButton leftIcon={<Box aria-hidden className="h-4 w-4" />} onClick={handleDraftSave}>
          임시저장
        </FgButton>
        <FgButton
          leftIcon={<Send aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={handleSubmit}
        >
          요청 제출
        </FgButton>
      </div>
    </div>
  )
}
