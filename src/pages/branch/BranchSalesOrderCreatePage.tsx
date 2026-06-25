import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Box, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  defaultSoFormValues,
  emptySoDraftLine,
  linesToRequest,
  soDraftFormSchema,
  SoForm,
  useCreateSalesOrderDraftMutation,
  useCreateSalesOrderMutation,
} from '@/features/sales-order'
import type { SoDraftLine, SoFormValues } from '@/features/sales-order'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { useSession } from '@/shared/auth/session'
import { roleLabel } from '@/shared/config/session'
import { FgButton, FgPageHeader } from '@/shared/ui'

import { SoItemSearchPanel } from './SoItemSearchPanel'

const breadcrumbs = [{ label: '발주' }, { label: '발주 요청' }]

export function BranchSalesOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()

  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: session } = useSession()

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<SoFormValues>({
    defaultValues: defaultSoFormValues,
    resolver: zodResolver(soDraftFormSchema),
  })

  const [lines, setLines] = useState<SoDraftLine[]>([emptySoDraftLine()])
  const [linesError, setLinesError] = useState<string | null>(null)

  const createDraftMutation = useCreateSalesOrderDraftMutation()
  const createSalesOrderMutation = useCreateSalesOrderMutation()
  const isSubmitting = createDraftMutation.isPending || createSalesOrderMutation.isPending

  const notifyInvalid = () => {
    toast.error('필수 입력값을 확인해주세요.')
  }

  const submit = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)

    if (payloadLines.length === 0) {
      setLinesError('요청 품목을 1개 이상 추가하세요.')
      return
    }
    if (payloadLines.some((line) => line.quantity <= 0)) {
      setLinesError('모든 품목의 요청 수량을 1 이상으로 입력하세요.')
      return
    }

    setLinesError(null)

    try {
      const order = await createSalesOrderMutation.mutateAsync({
        lines: payloadLines,
        memo: values.memo,
        warehouseCode: values.warehouseCode,
      })
      toast.success(`${order.code} 발주 요청이 제출되었습니다.`)
      void navigate({ to: '/branch/sales-orders' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }, notifyInvalid)

  const handleDraftSave = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)

    if (payloadLines.some((line) => line.quantity <= 0)) {
      setLinesError('모든 품목의 요청 수량을 1 이상으로 입력하세요.')
      return
    }

    setLinesError(null)

    try {
      const draft = await createDraftMutation.mutateAsync({
        lines: payloadLines,
        memo: values.memo,
        warehouseCode: values.warehouseCode,
      })
      toast.success(`${draft.code} 임시저장되었습니다.`)
      void navigate({ to: '/branch/sales-orders' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }, notifyInvalid)

  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs} title="발주 요청 등록" />

      <form noValidate className="fg-content" onSubmit={submit}>
        <SoForm
          assigneeLabel={`${session?.name ?? '—'} / ${session?.tenancyName ?? '—'} · ${roleLabel(session?.userRole)}`}
          branchCode={session?.tenancyCode ?? '—'}
          branchName={session?.tenancyName ?? '—'}
          control={control}
          errors={errors}
          lineError={linesError}
          lines={lines}
          register={register}
          renderSearchPanel={(props) => (
            <SoItemSearchPanel {...props} warehouseCode={session?.tenancyCode ?? undefined} />
          )}
          warehouses={hqWarehouses}
          watch={watch}
          onLinesChange={setLines}
        />

        <div className="flex items-center justify-end gap-2.5">
          <FgButton type="button" variant="ghost" onClick={() => router.history.back()}>
            취소
          </FgButton>
          <FgButton
            disabled={isSubmitting}
            leftIcon={<Box aria-hidden className="h-4 w-4" />}
            type="button"
            onClick={handleDraftSave}
          >
            임시저장
          </FgButton>
          <FgButton
            disabled={isSubmitting}
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
