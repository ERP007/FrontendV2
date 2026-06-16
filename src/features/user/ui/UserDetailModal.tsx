import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  CalendarDays,
  Check,
  Clock,
  IdCard,
  KeyRound,
  Mail,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { roleLabel } from '@/shared/config/session'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import {
  FgAvatar,
  FgBadge,
  FgButton,
  FgInput,
  FgMeta,
  FgModal,
  FgNotice,
  FgSelect,
  FgStatusBadge,
} from '@/shared/ui'

import { RANK_OPTIONS } from '../model/types'
import {
  normalizeUserApiRole,
  userDetailFormSchema,
  type UserDetailFormInput,
} from '../model/user-schema'

import type { UserApiRole, UserDetailFormValues, UserDetailResponse, UserListItem } from '../model/types'
import type { UserTenancyOption } from '../model/user-tenancy'

const FORM_ID = 'user-detail-form'
const DEFAULT_FORM_VALUES: UserDetailFormValues = {
  email: '',
  name: '',
  position: '',
  role: 'BRANCH_STAFF',
  tenancyCode: '',
}

const defaultRoleOptions: UserApiRole[] = [
  'ADMIN',
  'HQ_MANAGER',
  'HQ_STAFF',
  'BRANCH_MANAGER',
  'BRANCH_STAFF',
  'WAREHOUSE_STAFF',
  'WAREHOUSE_MANAGER',
]

function toTenancySelectOption(option: UserTenancyOption) {
  return {
    label: option.label,
    supportingText: option.code,
    value: option.code,
  }
}

function toRoleOption(role: UserApiRole) {
  return {
    label: `${role} · ${roleLabel(role)}`,
    value: role,
  }
}

function toDateTime(value: string | null) {
  return value ? formatDateTime(value) : '-'
}

export interface UserDetailModalProps {
  detail?: UserDetailResponse
  errorMessage?: string | null
  loading?: boolean
  onClose: () => void
  onRetry: () => void
  onSubmit: (values: UserDetailFormValues) => Promise<void> | void
  open: boolean
  saving?: boolean
  saveErrorMessage?: string | null
  tenancyOptions: UserTenancyOption[]
  tenancyOptionsErrorMessage?: string | null
  tenancyOptionsLoading?: boolean
  user: UserListItem | null
}

export function UserDetailModal({
  detail,
  errorMessage,
  loading = false,
  onClose,
  onRetry,
  onSubmit,
  open,
  saving = false,
  saveErrorMessage,
  tenancyOptions: userTenancyOptions,
  tenancyOptionsErrorMessage,
  tenancyOptionsLoading = false,
  user,
}: UserDetailModalProps) {
  const formValues = useMemo<UserDetailFormInput>(
    () =>
      detail
        ? {
            email: detail.email,
            name: detail.name,
            position: detail.position ?? '',
            role: normalizeUserApiRole(detail.role) ?? detail.role,
            tenancyCode: detail.tenancyCode,
          }
        : DEFAULT_FORM_VALUES,
    [detail],
  )
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<UserDetailFormInput, unknown, UserDetailFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
    resolver: zodResolver(userDetailFormSchema),
  })

  useEffect(() => {
    reset(formValues)
  }, [formValues, reset])

  const role = useWatch({ control, name: 'role' })
  const normalizedRole = normalizeUserApiRole(role ?? '')

  const defaultTenancyOptions = useMemo(
    () => userTenancyOptions.map(toTenancySelectOption),
    [userTenancyOptions],
  )
  const tenancyOptions = useMemo(() => {
    if (!detail?.tenancyCode || defaultTenancyOptions.some((option) => option.value === detail.tenancyCode)) {
      return defaultTenancyOptions
    }

    return [
      {
        label: detail.tenancyName || detail.tenancyCode,
        supportingText: detail.tenancyCode,
        value: detail.tenancyCode,
      },
      ...defaultTenancyOptions,
    ]
  }, [defaultTenancyOptions, detail])

  const roleOptions = useMemo(() => {
    const options = defaultRoleOptions.map(toRoleOption)

    if (normalizedRole && !options.some((option) => option.value === normalizedRole)) {
      return [toRoleOption(normalizedRole), ...options]
    }

    return options
  }, [normalizedRole])

  const positionOptions = useMemo(() => {
    const options = RANK_OPTIONS.map((position) => ({ label: position, value: position }))

    if (detail?.position && !options.some((option) => option.value === detail.position)) {
      return [{ label: detail.position, value: detail.position }, ...options]
    }

    return options
  }, [detail])

  const titleMeta = user ? <FgBadge variant="default">{user.employeeNo.toUpperCase()}</FgBadge> : undefined
  const canSave = Boolean(detail) && !loading

  return (
    <FgModal
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-1.5 text-meta text-faint">
            <Clock aria-hidden className="h-3.5 w-3.5 shrink-0" />
            저장 시 사용자 기본 정보가 즉시 반영됩니다.
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <FgButton disabled={saving} onClick={onClose}>
              취소
            </FgButton>
            <FgButton
              disabled={!canSave}
              form={FORM_ID}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              loading={saving}
              type="submit"
              variant="primary"
            >
              저장
            </FgButton>
          </span>
        </div>
      }
      icon={<UserIcon aria-hidden className="h-5 w-5 text-primary" />}
      open={open}
      size="lg"
      title="사용자 상세"
      titleMeta={titleMeta}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose()
      }}
    >
      <form id={FORM_ID} className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {saveErrorMessage ? <FgNotice tone="danger">{saveErrorMessage}</FgNotice> : null}
        {tenancyOptionsLoading ? <FgNotice>소속 목록을 불러오는 중입니다.</FgNotice> : null}
        {tenancyOptionsErrorMessage ? (
          <FgNotice tone="danger">{tenancyOptionsErrorMessage}</FgNotice>
        ) : null}

        {loading && !detail ? (
          <FgNotice>사용자 상세 정보를 불러오는 중입니다.</FgNotice>
        ) : errorMessage ? (
          <div className="space-y-3">
            <FgNotice tone="danger">{errorMessage}</FgNotice>
            <FgButton
              leftIcon={<RefreshCw aria-hidden className="h-4 w-4" />}
              size="sm"
              onClick={onRetry}
            >
              다시 시도
            </FgButton>
          </div>
        ) : null}

        {detail ? (
          <>
            <section className="rounded-card border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <FgAvatar fallback={detail.name} size="lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-section text-ink">{detail.name}</strong>
                      <FgStatusBadge status={detail.status} />
                    </div>
                    <p className="mt-1 text-label text-muted">
                      {detail.employeeNo.toUpperCase()} · {roleLabel(detail.role)}
                    </p>
                  </div>
                </div>
                <div className="text-right text-label text-muted">
                  <span className="block">소속</span>
                  <strong className="mt-1 block text-body text-ink">{detail.tenancyName}</strong>
                </div>
              </div>
              <dl className="mt-5 grid gap-4 border-t border-line-soft pt-5 md:grid-cols-3">
                <FgMeta
                  icon={<CalendarDays aria-hidden className="h-3.5 w-3.5" />}
                  label="가입일"
                  value={formatDate(detail.createdAt ?? detail.joinedAt)}
                />
                <FgMeta
                  icon={<Clock aria-hidden className="h-3.5 w-3.5" />}
                  label="마지막 로그인"
                  value={toDateTime(detail.lastLoginAt)}
                />
                <FgMeta
                  icon={<KeyRound aria-hidden className="h-3.5 w-3.5" />}
                  label="비밀번호 변경"
                  value={toDateTime(detail.lastChangedPassAt)}
                />
              </dl>
            </section>

            <section className="grid grid-cols-2 gap-x-6 gap-y-5">
              <FgInput
                disabled
                label="사번"
                leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
                value={detail.employeeNo.toUpperCase()}
              />
              <FgInput
                error={errors.name?.message}
                label="이름"
                leftIcon={<UserIcon aria-hidden className="h-4 w-4" />}
                required
                {...register('name')}
              />
              <FgInput
                error={errors.email?.message}
                label="이메일"
                leftIcon={<Mail aria-hidden className="h-4 w-4" />}
                required
                type="email"
                {...register('email')}
              />
              <Controller
                control={control}
                name="tenancyCode"
                render={({ field }) => (
                  <FgSelect
                    error={errors.tenancyCode?.message}
                    label="소속"
                    leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
                    options={tenancyOptions}
                    placeholder="소속 선택"
                    required
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <FgSelect
                    error={errors.role?.message}
                    label="Role"
                    options={roleOptions}
                    required
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(normalizeUserApiRole(value) ?? value)}
                  />
                )}
              />
              <Controller
                control={control}
                name="position"
                render={({ field }) => (
                  <FgSelect
                    error={errors.position?.message}
                    label="직급"
                    options={positionOptions}
                    placeholder="직급 선택"
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </section>
          </>
        ) : null}
      </form>
    </FgModal>
  )
}
