import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { FgBadge, FgButton, FgModal, FgNotice } from '@/shared/ui'

import { usePurchaseOrderProgressQuery } from '../api/use-purchase-order-progress-query'

type StepState = 'done' | 'active' | 'pending' | 'error'

const STEP_LABELS: [string, string, string] = ['입고 요청', '재고 입고', '입고 완료']

// progress/outcome → 3단계 상태. 1단계(입고 요청)는 모달 진입 시점에 이미 완료다.
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

export interface PoSagaProgressModalProps {
  code: string
  open: boolean
  /** 닫기/취소(실패·진행중 닫기). 폴링은 서버에서 계속된다. */
  onClose: () => void
  /** 입고 saga 성공 확정 시(완료 버튼). 부모가 갱신 처리. */
  onSuccess: () => void
}

/** 입고 saga 진행을 단계별 체크로 보여주는 모달 (진행 상태 폴링). */
export function PoSagaProgressModal({ code, open, onClose, onSuccess }: PoSagaProgressModalProps) {
  const { data: progress } = usePurchaseOrderProgressQuery(code, open)
  const outcome = progress?.outcome
  const states = deriveStepStates(outcome)
  const isSuccess = outcome === 'SUCCESS'
  const isFailed = outcome === 'FAILED'

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
      title="입고 처리"
      titleMeta={<FgBadge variant="outline">{code}</FgBadge>}
      onOpenChange={(next) => {
        if (!next && (isSuccess || isFailed)) onClose()
      }}
    >
      <div className="flex flex-col gap-5">
        <ol className="relative space-y-5 border-l border-line-soft pl-6">
          {STEP_LABELS.map((label, index) => {
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
            {progress?.failureReason ?? '입고 처리에 실패했습니다. 다시 시도해주세요.'}
          </FgNotice>
        ) : null}
      </div>
    </FgModal>
  )
}
