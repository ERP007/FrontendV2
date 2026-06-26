import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Info, Loader2, Package, Pencil, Power, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatCurrency, formatDate, formatNumber } from '@/shared/lib/format'
import {
  FgBadge,
  FgButton,
  FgDataTable,
  FgEmptyState,
  FgInput,
  FgModal,
  FgNotice,
  FgSelect,
} from '@/shared/ui'
import type { FgSelectOption } from '@/shared/ui'

import { itemDetailFormSchema } from '../model/item-schema'
import { resolveItemStockStatus } from '../model/types'

import type { ItemDetail, ItemDetailFormValues, ItemStockRow, ItemStockStatus } from '../model/types'

const FORM_ID = 'item-detail-form'
const READ_ONLY_CONTROL_CLASS = '!border-faint !bg-line !text-ink-2'

const emptyValues: ItemDetailFormValues = {
  categoryCode: '',
  name: '',
  safetyStock: 0,
  subCategoryCode: '',
  unit: 'EA',
  unitPrice: 0,
}

const stockStatusMeta = {
  LOW: { label: '부족', variant: 'warning' },
  NORMAL: { label: '정상', variant: 'success' },
} as const satisfies Record<ItemStockStatus, { label: string; variant: 'danger' | 'success' | 'warning' }>

function toFormValues(detail: ItemDetail): ItemDetailFormValues {
  return {
    categoryCode: detail.categoryCode,
    name: detail.name,
    safetyStock: detail.safetyStock,
    subCategoryCode: detail.subCategoryCode,
    unit: detail.unit,
    unitPrice: detail.unitPrice,
  }
}

function ensureOption(options: FgSelectOption[], value: string | undefined, label: string | undefined) {
  if (!value || options.some((option) => option.value === value)) {
    return options
  }

  return [{ label: label || value, value }, ...options]
}

function ItemActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <FgBadge dot variant="success">
      활성
    </FgBadge>
  ) : (
    <FgBadge dot variant="off">
      비활성
    </FgBadge>
  )
}

function ItemStockStatusBadge({ row }: { row: ItemStockRow }) {
  const status = resolveItemStockStatus(row)
  const meta = stockStatusMeta[status]

  return (
    <FgBadge className="whitespace-nowrap" dot variant={meta.variant}>
      {meta.label}
    </FgBadge>
  )
}

export interface ItemDetailModalProps {
  canManage: boolean
  detail: ItemDetail | null
  formError?: string | null
  isCategoryLoading?: boolean
  isLoading?: boolean
  isStatusChanging?: boolean
  isStockLoading?: boolean
  isSubCategoryLoading?: boolean
  isSubmitting?: boolean
  isUnitLoading?: boolean
  majorCategoryOptions: FgSelectOption[]
  onCategoryChange?: (categoryCode: string) => void
  onClose: () => void
  onSubmit?: (values: ItemDetailFormValues) => Promise<void> | void
  onToggleActive?: (detail: ItemDetail) => Promise<void> | void
  onWarehouseChange?: (warehouseCode: string) => void
  open: boolean
  stockRows: ItemStockRow[]
  stockEmptyDescription?: string
  stockErrorMessage?: string | null
  stockScopeLabel?: string
  subCategoryOptions: FgSelectOption[]
  unitOptions: FgSelectOption[]
  warehouseOptions?: FgSelectOption[]
  warehouseValue?: string
}

export function ItemDetailModal({
  canManage,
  detail,
  formError,
  isCategoryLoading = false,
  isLoading = false,
  isStatusChanging = false,
  isStockLoading = false,
  isSubCategoryLoading = false,
  isSubmitting = false,
  isUnitLoading = false,
  majorCategoryOptions,
  onCategoryChange,
  onClose,
  onSubmit,
  onToggleActive,
  onWarehouseChange,
  open,
  stockRows,
  stockEmptyDescription = '조회 가능한 창고 재고가 없습니다',
  stockErrorMessage,
  stockScopeLabel,
  subCategoryOptions,
  unitOptions,
  warehouseOptions = [],
  warehouseValue,
}: ItemDetailModalProps) {
  const [editingSku, setEditingSku] = useState<string | null>(null)
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<ItemDetailFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(itemDetailFormSchema),
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (detail) {
      reset(toFormValues(detail))
      onCategoryChange?.(detail.categoryCode)
      return
    }

    reset(emptyValues)
  }, [detail, onCategoryChange, open, reset])

  const selectedCategoryCode = useWatch({ control, name: 'categoryCode' })
  const selectedUnit = useWatch({ control, name: 'unit' }) || detail?.unit || 'EA'
  const canEnterEdit = canManage && Boolean(detail?.active)
  const isEditing = open && Boolean(detail?.sku) && editingSku === detail?.sku
  const canEdit = canEnterEdit && isEditing
  const lockedControlClassName = canEdit ? READ_ONLY_CONTROL_CLASS : undefined
  const hasWarehouseFilter = canManage && warehouseOptions.length > 0 && Boolean(onWarehouseChange)
  const displayedStockRows = stockErrorMessage ? [] : stockRows
  const categoryOptions = useMemo(
    () => ensureOption(majorCategoryOptions, detail?.categoryCode, detail?.categoryName),
    [detail?.categoryCode, detail?.categoryName, majorCategoryOptions],
  )
  const normalizedSubCategoryOptions = useMemo(
    () => ensureOption(subCategoryOptions, detail?.subCategoryCode, detail?.subCategoryName),
    [detail?.subCategoryCode, detail?.subCategoryName, subCategoryOptions],
  )
  const normalizedUnitOptions = useMemo(
    () => ensureOption(unitOptions, detail?.unit, detail?.unit),
    [detail?.unit, unitOptions],
  )

  const stockColumns = useMemo<ColumnDef<ItemStockRow>[]>(
    () => [
      {
        accessorKey: 'warehouseName',
        cell: ({ row }) => (
          <span>
            <span className="block font-bold text-ink">{row.original.warehouseName}</span>
            <span className="block text-meta font-medium text-faint">{row.original.warehouseCode}</span>
          </span>
        ),
        header: '창고/지점',
      },
      {
        accessorKey: 'currentStock',
        cell: ({ row }) => (
          <span className="font-bold text-ink">{formatNumber(row.original.currentStock)}</span>
        ),
        header: '현재고',
        meta: { align: 'right' },
        size: 90,
      },
      {
        accessorKey: 'safetyStock',
        cell: ({ row }) => (
          <span className="font-semibold text-ink-2">{formatNumber(row.original.safetyStock)}</span>
        ),
        header: '안전재고',
        meta: { align: 'right' },
        size: 100,
      },
      {
        cell: ({ row }) => <ItemStockStatusBadge row={row.original} />,
        header: '상태',
        id: 'status',
        meta: { align: 'center', cellClassName: 'whitespace-nowrap', headClassName: 'whitespace-nowrap' },
        size: 112,
      },
    ],
    [],
  )

  async function submit(values: ItemDetailFormValues) {
    if (!canEdit || !onSubmit) {
      return
    }

    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
      })
      setEditingSku(null)
    } catch {
      // The parent owns API error presentation. Keep edit mode open.
    }
  }

  function renderStartEditButton(size: 'md' | 'sm'): ReactNode {
    if (!detail?.active) {
      return null
    }

    return (
      <FgButton
        leftIcon={<Pencil aria-hidden className="h-4 w-4" />}
        disabled={isStatusChanging || isSubmitting || isEditing}
        size={size}
        type="button"
        variant="soft"
        onClick={(event) => {
          event.preventDefault()
          setEditingSku(detail.sku)
        }}
      >
        수정
      </FgButton>
    )
  }

  function renderSaveButton(size: 'md' | 'sm'): ReactNode {
    if (!detail?.active || !isEditing) {
      return null
    }

    return (
      <FgButton
        form={FORM_ID}
        leftIcon={<Check aria-hidden className="h-4 w-4" />}
        loading={isSubmitting}
        disabled={!onSubmit || isStatusChanging}
        size={size}
        type="submit"
        variant="primary"
      >
        저장
      </FgButton>
    )
  }

  function renderCancelEditButton(size: 'md' | 'sm'): ReactNode {
    if (!isEditing) {
      return null
    }

    return (
      <FgButton
        disabled={isSubmitting}
        size={size}
        type="button"
        onClick={() => {
          if (detail) {
            reset(toFormValues(detail))
            onCategoryChange?.(detail.categoryCode)
          }
          setEditingSku(null)
        }}
      >
        취소
      </FgButton>
    )
  }

  function renderStatusButton(size: 'md' | 'sm'): ReactNode {
    if (!detail) {
      return null
    }

    return (
      <FgButton
        disabled={!onToggleActive || isSubmitting || isEditing}
        leftIcon={detail.active ? <Power aria-hidden className="h-4 w-4" /> : <RotateCcw aria-hidden className="h-4 w-4" />}
        loading={isStatusChanging}
        size={size}
        type="button"
        variant={detail.active ? 'danger' : 'soft'}
        onClick={() => {
          if (onToggleActive) void onToggleActive(detail)
        }}
      >
        {detail.active ? '비활성화' : '활성화'}
      </FgButton>
    )
  }

  function closeModal() {
    setEditingSku(null)
    onClose()
  }

  const headerActions = detail && canManage ? (
    <>
      {isEditing ? renderCancelEditButton('sm') : null}
      {isEditing ? renderSaveButton('sm') : renderStartEditButton('sm')}
      {!isEditing ? renderStatusButton('sm') : null}
    </>
  ) : null

  const footer = (
    <>
      <FgButton type="button" onClick={closeModal}>닫기</FgButton>
      {detail && canManage ? (
        <>
          {renderCancelEditButton('md')}
          {renderSaveButton('md')}
        </>
      ) : null}
    </>
  )

  return (
    <FgModal
      className="fg-modal-fixed-scroll"
      footer={footer}
      headerActions={headerActions}
      open={open}
      size="lg"
      title={canManage ? '부품 상세' : '부품 상세 조회'}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal()
      }}
    >
      {isLoading ? (
        <FgEmptyState
          description="잠시만 기다려 주세요"
          icon={<Loader2 aria-hidden className="h-6 w-6 animate-spin" />}
          title="부품 상세를 불러오는 중입니다"
        />
      ) : detail ? (
        <div className="space-y-6">
          <section className="rounded-control border border-line bg-background px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-body font-semibold text-muted">{detail.sku}</span>
              <ItemActiveBadge active={detail.active} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Package aria-hidden className="h-5 w-5 text-primary" />
              <h3 className="text-section-title text-ink">{detail.name}</h3>
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-label font-medium text-muted">
              <span>{detail.categoryName}</span>
              <span className="text-faint">·</span>
              <span>{detail.subCategoryName}</span>
              <span className="text-faint">·</span>
              <span>{detail.unit}</span>
              <span className="text-faint">·</span>
              <span>안전재고 기준 {formatNumber(detail.safetyStock)}</span>
              <span className="text-faint">·</span>
              <span>{formatCurrency(detail.unitPrice)}</span>
            </p>
          </section>

          {formError ? <FgNotice tone="danger">{formError}</FgNotice> : null}
          {!detail.active && canManage ? (
            <FgNotice tone="warning">비활성 부품은 기본 정보를 수정할 수 없습니다. 활성 복귀 후 수정하세요.</FgNotice>
          ) : null}

          <section className="rounded-control border border-line bg-background px-6 py-8">
            <h3 className="text-subtitle text-ink">기본 정보</h3>
            <form
              className="mt-8 grid grid-cols-1 gap-x-6 gap-y-9 lg:grid-cols-2"
              id={FORM_ID}
              onSubmit={handleSubmit(submit)}
            >
              <FgInput
                controlClassName={lockedControlClassName}
                disabled
                inputClassName="font-semibold"
                label="부품 코드"
                rightIcon={<span className="text-meta font-semibold text-muted">읽기전용</span>}
                value={detail.sku}
              />
              <FgInput
                disabled={!canEdit}
                error={errors.name?.message}
                label="부품명"
                required={canEdit}
                {...register('name')}
              />
              {canEdit ? (
                <Controller
                  control={control}
                  name="categoryCode"
                  render={({ field }) => (
                    <FgSelect
                      disabled={isCategoryLoading}
                      error={errors.categoryCode?.message}
                      label="대분류"
                      options={categoryOptions}
                      placeholder={isCategoryLoading ? '대분류 불러오는 중' : '대분류 선택'}
                      required
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value)
                        setValue('subCategoryCode', '', { shouldValidate: false })
                        onCategoryChange?.(value)
                      }}
                    />
                  )}
                />
              ) : (
                <FgInput
                  disabled
                  label="대분류"
                  value={detail.categoryName}
                />
              )}
              {canEdit ? (
                <Controller
                  control={control}
                  name="subCategoryCode"
                  render={({ field }) => (
                    <FgSelect
                      disabled={!selectedCategoryCode || isSubCategoryLoading}
                      error={errors.subCategoryCode?.message}
                      label="중분류"
                      options={normalizedSubCategoryOptions}
                      placeholder={isSubCategoryLoading ? '중분류 불러오는 중' : '중분류 선택'}
                      required
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              ) : (
                <FgInput
                  disabled
                  label="중분류"
                  value={detail.subCategoryName}
                />
              )}
              <FgInput
                disabled={!canEdit}
                error={errors.safetyStock?.message}
                inputClassName="text-right font-bold"
                label="안전재고 기준"
                min={0}
                required={canEdit}
                rightIcon={<span className="text-meta font-semibold text-faint">{selectedUnit}</span>}
                step={1}
                type="number"
                {...register('safetyStock', { valueAsNumber: true })}
              />
              {canEdit ? (
                <Controller
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <FgSelect
                      disabled={isUnitLoading}
                      error={errors.unit?.message}
                      label="단위"
                      options={normalizedUnitOptions}
                      placeholder={isUnitLoading ? '단위 불러오는 중' : '단위 선택'}
                      required
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              ) : (
                <FgInput
                  disabled
                  label="단위"
                  value={detail.unit}
                />
              )}
              <FgInput
                controlClassName={lockedControlClassName}
                disabled
                label="등록일"
                value={formatDate(detail.createdAt)}
              />
              <FgInput
                controlClassName={lockedControlClassName}
                disabled
                label="최근 수정일"
                value={formatDate(detail.updatedAt)}
              />
              <FgInput
                disabled={!canEdit}
                error={errors.unitPrice?.message}
                inputClassName="text-right font-bold"
                label="기준 단가"
                min={0}
                required={canEdit}
                rightIcon={<span className="text-meta font-semibold text-faint">원</span>}
                rootClassName="lg:col-start-2"
                step={1}
                type="number"
                {...register('unitPrice', { valueAsNumber: true })}
              />
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-subtitle text-ink">{canManage ? '창고별 재고' : '우리 지점 재고'}</h3>
              {stockScopeLabel ? (
                <FgBadge variant="outline">{stockScopeLabel}</FgBadge>
              ) : null}
            </div>
            {stockErrorMessage ? <FgNotice tone="danger">{stockErrorMessage}</FgNotice> : null}
            <FgDataTable
              columns={stockColumns}
              data={displayedStockRows}
              emptyState={
                <FgEmptyState
                  description={isStockLoading ? '잠시만 기다려 주세요' : stockEmptyDescription}
                  icon={isStockLoading ? <Loader2 aria-hidden className="h-6 w-6 animate-spin" /> : undefined}
                  title={isStockLoading ? '재고를 불러오는 중입니다' : '표시할 재고가 없습니다'}
                />
              }
              header={
                <>
                  <span>
                    전체 <strong className="text-ink">{formatNumber(displayedStockRows.length)}</strong>개 창고
                  </span>
                  {hasWarehouseFilter ? (
                    <FgSelect
                      className="w-48"
                      options={warehouseOptions}
                      placeholder="창고 선택"
                      value={warehouseValue}
                      onValueChange={onWarehouseChange}
                    />
                  ) : null}
                </>
              }
            />
            <FgNotice tone="info" icon={<Info aria-hidden className="h-4 w-4" />}>
              재고 추가·조정은 IV-02에서 처리합니다.
            </FgNotice>
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          {formError ? <FgNotice tone="danger">{formError}</FgNotice> : null}
          <FgEmptyState
            description="목록에서 부품을 다시 선택해 주세요"
            title="선택된 부품이 없습니다"
          />
        </div>
      )}
    </FgModal>
  )
}
