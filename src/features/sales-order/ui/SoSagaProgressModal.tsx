import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { useEffect } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgBadge, FgButton, FgModal, FgNotice } from '@/shared/ui'

import { invalidateSalesOrder } from '../api/so-cache'
import { useSalesOrderProgressQuery } from '../api/use-sales-order-progress-query'

export type SoSagaMode = 'OUTBOUND' | 'INBOUND'

type StepState = 'done' | 'active' | 'pending' | 'error'

const STEP_LABELS: Record<SoSagaMode, [string, string, string]> = {
  OUTBOUND: ['승인 완료', '재고 출고', '출고 완료'],
  INBOUND: ['입고 요청', '재고 입고', '입고 완료'],
}

const MODAL_TITLE: Record<SoSagaMode, string> = {
  OUTBOUND: '출고 처리',
  INBOUND: '입고 처리',
}

// progress/outcome → 3단계 상태. 1단계(승인/요청)는 모달 진입 시점에 이미 완료다.
function deriveStepStates(
  outcome: 'PENDING' | 'SUCCESS' | 'FAILED' | undefined,
): [StepState, StepState, StepState] {
  if (outcome === 'SUCCESS') return ['done', 'done', 'done']
  if (outcome === 'FAILED') return ['done', 'error', 'pending']
  return ['done', 'active', 'pending'] // 폴링 진행중(또는 첫 응답 전)
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <CheckCircle2 aria-hidden className="h-5 w-5 text-success" />
  if (state === 'active') return <Loader2 aria-hidden className="h-5 w-5 animate-spin text-primary" />
  if (state === 'error') return <XCircle aria-hidden className="h-5 w-5 text-danger" />
  return <Circle aria-hidden className="h-5 w-5 text-faint" />
}

export interface SoSagaProgressModalProps {
  code: string
  mode: SoSagaMode
  open: boolean
  /** 닫기/취소 (실패·진행중 닫기). 폴링은 서버에서 계속된다. */
  onClose: () => void
  /** saga 성공 확정 시(완료 버튼). 부모가 이동/갱신 처리. */
  onSuccess: () => void
}

/** 출고/입고 saga 진행을 단계별 체크로 보여주는 모달 (SO #10 폴링). */
export function SoSagaProgressModal({ code, mode, open, onClose, onSuccess }: SoSagaProgressModalProps) {
  const queryClient = useQueryClient()
  const { data: progress } = useSalesOrderProgressQuery(code, open)
  const outcome = progress?.outcome
  const states = deriveStepStates(outcome)
  const labels = STEP_LABELS[mode]
  const isSuccess = outcome === 'SUCCESS'
  const isFailed = outcome === 'FAILED'

  // saga 성공 확정 시 발주 현황 상세·목록 캐시를 다시 무효화한다.
  useEffect(() => {
    if (isSuccess) invalidateSalesOrder(queryClient, code)
  }, [isSuccess, code, queryClient])

  return (
    <FgModal
      footer={
        isSuccess ? (
          <FgButton variant="primary" onClick={onSuccess}>
            완료
          </FgButton>
        ) : isFailed ? (
          <FgButton variant="danger" onClick={onClose}>
            닫기
          </FgButton>
        ) : (
          <FgButton disabled>처리 중…</FgButton>
        )
      }
      open={open}
      size="md"
      title={MODAL_TITLE[mode]}
      titleMeta={<FgBadge variant="outline">{code}</FgBadge>}
      onOpenChange={(next) => {
        // 진행중에는 닫기 차단(실수 방지). 성공/실패면 닫기 허용.
        if (!next && (isSuccess || isFailed)) onClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <ol className="relative space-y-5 border-l border-line-soft pl-6">
          {labels.map((label, index) => {
            const state = states[index]
            return (
              <li key={label} className="relative">
                <span className="absolute -left-[31px] top-0 flex items-center justify-center bg-surface">
                  <StepIcon state={state} />
                </span>
                <span
                  className={cn(
                    'text-body font-semibold',
                    state === 'done' && 'text-ink',
                    state === 'active' && 'text-primary-strong',
                    state === 'error' && 'text-danger',
                    state === 'pending' && 'text-faint',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>

        {isFailed ? (
          <FgNotice tone="danger">
            {progress?.failureReason ?? '처리에 실패했습니다. 다시 시도해주세요.'}
          </FgNotice>
        ) : null}
      </div>
    </FgModal>
  )
}
