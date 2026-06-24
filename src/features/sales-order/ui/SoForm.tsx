import { AlertTriangle, Lock } from 'lucide-react'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'
import type { ReactNode } from 'react'

import { formatNumber } from '@/shared/lib/format'
import { FgCard, FgNotice, FgSelect, FgTextarea } from '@/shared/ui'

import type { SoLine } from '../model/ui-types'
import type { SoFormValues } from '../model/so-draft-schema'
import { SoLineEditor } from './SoLineEditor'
import type { SoLineSearchPanelProps } from './SoLineEditor'

export interface SoFormWarehouseOption {
  code: string
  name: string
}

export interface SoFormProps {
  assigneeLabel: string
  branchCode: string
  branchName: string
  control: Control<SoFormValues>
  errors: FieldErrors<SoFormValues>
  lineError: string | null
  lines: SoLine[]
  onLinesChange: (lines: SoLine[]) => void
  register: UseFormRegister<SoFormValues>
  renderSearchPanel: (props: SoLineSearchPanelProps) => ReactNode
  warehouses: SoFormWarehouseOption[] | undefined
  watch: UseFormWatch<SoFormValues>
}

export function SoForm({
  assigneeLabel,
  branchCode,
  branchName,
  control,
  errors,
  lineError,
  lines,
  onLinesChange,
  register,
  renderSearchPanel,
  warehouses,
  watch,
}: SoFormProps) {
  const urgentCount = lines.filter(
    (line) => line.itemCode !== null && line.priority === 'URGENT',
  ).length
  const totalQuantity = lines.reduce((sum, line) => sum + (line.itemCode ? line.quantity : 0), 0)
  const filledUnits = Array.from(
    new Set(
      lines
        .filter((line) => line.itemCode !== null && line.unit)
        .map((line) => line.unit as string),
    ),
  )
  const totalUnitLabel = filledUnits.length === 1 ? filledUnits[0] : '(복합)'

  return (
    <>
      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-section text-ink">요청 정보</h2>
          </div>
          <span className="text-meta font-medium text-faint">요청자 · {assigneeLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <span className="block text-label text-ink-2">요청 지점</span>
            <div className="flex h-11 items-center justify-between gap-3 rounded-control border border-line bg-background px-3.5 text-body">
              <span className="font-semibold text-ink">
                {branchName}
                <span className="ml-1.5 text-meta font-medium text-faint">{branchCode}</span>
              </span>
              <span className="flex items-center gap-1 text-meta font-semibold text-faint">
                <Lock aria-hidden className="h-3 w-3" />
                자동
              </span>
            </div>
          </div>
          <Controller
            control={control}
            name="warehouseCode"
            render={({ field }) => (
              <FgSelect
                error={errors.warehouseCode?.message}
                label="수신 창고"
                options={
                  warehouses?.map((warehouse) => ({
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
            error={errors.memo?.message}
            label="메모"
            labelTrailing={`${(watch('memo') ?? '').length} / 500`}
            maxLength={500}
            placeholder="요청 사유, 우선 출고 사항 등을 본사에 전달"
            rows={3}
            {...register('memo')}
          />
        </div>
      </FgCard>

      <SoLineEditor lines={lines} renderSearchPanel={renderSearchPanel} onChange={onLinesChange} />
      {lineError ? <FgNotice tone="danger">{lineError}</FgNotice> : null}

      <FgCard className="flex items-center justify-between gap-4" compact>
        <span className="text-label font-medium text-muted">
          총 {formatNumber(totalQuantity)} {totalUnitLabel}
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
    </>
  )
}
