import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Clock, IdCard, Lock, Mail, User as UserIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { ROLE_LABELS } from '@/shared/config/session'
import type { UserRole } from '@/shared/config/session'
import { FgButton, FgInput, FgModal, FgNotice, FgSegmentedControl, FgSelect } from '@/shared/ui'

import { RANK_OPTIONS } from '../model/types'
import { getUserTenancyRoles } from '../model/user-tenancy'
import { userFormSchema } from '../model/user-schema'

import type { UserFormValues } from '../model/types'
import type { UserTenancyOption } from '../model/user-tenancy'

const FORM_ID = 'user-create-form'

const createRoleValues: UserRole[] = ['ADMIN', 'HQ_MANAGER', 'HQ_STAFF', 'BRANCH_MANAGER', 'BRANCH_STAFF']
const rankOptions = RANK_OPTIONS.map((rank) => ({ label: rank, value: rank }))

function toTenancySelectOption(option: UserTenancyOption) {
  return {
    label: option.label,
    supportingText: option.code,
    value: option.code,
  }
}

function toCreateRoleOption(nextRole: UserRole) {
  return {
    label: `${nextRole} · ${ROLE_LABELS[nextRole]}`,
    value: nextRole,
  }
}

export interface UserCreateModalProps {
  /** 자동 채번된 다음 사번 (예: HMC0011) */
  errorMessage?: string | null
  loading?: boolean
  nextEmpNo: string
  onClose: () => void
  onSubmit: (values: UserFormValues) => Promise<void> | void
  open: boolean
  tenancyOptions: UserTenancyOption[]
  tenancyOptionsErrorMessage?: string | null
  tenancyOptionsLoading?: boolean
}

export function UserCreateModal({
  errorMessage,
  loading = false,
  nextEmpNo,
  onClose,
  onSubmit,
  open,
  tenancyOptions,
  tenancyOptionsErrorMessage,
  tenancyOptionsLoading = false,
}: UserCreateModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<UserFormValues>({
    defaultValues: {
      email: '',
      empNo: nextEmpNo,
      initialPassword: '',
      name: '',
      passwordMode: 'AUTO',
      rank: '',
      role: 'BRANCH_STAFF',
      tenancyCode: '',
    },
    resolver: zodResolver(userFormSchema),
  })

  const passwordMode = useWatch({ control, name: 'passwordMode' })
  const role = useWatch({ control, name: 'role' })
  const tenancyCode = useWatch({ control, name: 'tenancyCode' })

  const tenancySelectOptions = useMemo(
    () => tenancyOptions.map(toTenancySelectOption),
    [tenancyOptions],
  )
  const roleOptions = useMemo(
    () => (tenancyCode ? getUserTenancyRoles(tenancyCode) : createRoleValues).map(toCreateRoleOption),
    [tenancyCode],
  )

  useEffect(() => {
    if (open) {
      reset({
        email: '',
        empNo: nextEmpNo,
        initialPassword: '',
        name: '',
        passwordMode: 'AUTO',
        rank: '',
        role: 'BRANCH_STAFF',
        tenancyCode: '',
      })
    }
  }, [nextEmpNo, open, reset])

  useEffect(() => {
    const nextRole = roleOptions[0]?.value

    if (nextRole && !roleOptions.some((option) => option.value === role)) {
      setValue('role', nextRole as UserRole)
    }
  }, [role, roleOptions, setValue])

  return (
    <FgModal
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-meta text-faint">
            <Clock aria-hidden className="h-3.5 w-3.5" />
            등록 후 첫 로그인 시 비밀번호 변경이 강제됩니다.
          </span>
          <span className="flex items-center gap-2">
            <FgButton disabled={loading} onClick={onClose}>
              취소
            </FgButton>
            <FgButton
              form={FORM_ID}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              loading={loading}
              type="submit"
              variant="primary"
            >
              등록
            </FgButton>
          </span>
        </div>
      }
      open={open}
      size="lg"
      title="사용자 추가"
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) onClose()
      }}
    >
      <form className="grid grid-cols-2 gap-x-6 gap-y-5" id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        {errorMessage ? (
          <FgNotice className="col-span-2" tone="danger">
            {errorMessage}
          </FgNotice>
        ) : null}
        {tenancyOptionsLoading ? (
          <FgNotice className="col-span-2">소속 목록을 불러오는 중입니다.</FgNotice>
        ) : null}
        {tenancyOptionsErrorMessage ? (
          <FgNotice className="col-span-2" tone="danger">
            {tenancyOptionsErrorMessage}
          </FgNotice>
        ) : null}
        <FgInput
          error={errors.empNo?.message}
          hint="자동 채번된 사번입니다."
          label="사번"
          leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
          required
          {...register('empNo')}
        />
        <FgInput
          error={errors.name?.message}
          label="이름"
          leftIcon={<UserIcon aria-hidden className="h-4 w-4" />}
          placeholder="홍길동"
          required
          {...register('name')}
        />
        <FgInput
          error={errors.email?.message}
          label="이메일"
          leftIcon={<Mail aria-hidden className="h-4 w-4" />}
          placeholder="name@hyundaiparts.com"
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
              options={tenancySelectOptions}
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
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <div className="space-y-2">
          <span className="block text-label text-ink-2">초기 비밀번호 발급 방식</span>
          <Controller
            control={control}
            name="passwordMode"
            render={({ field }) => (
              <FgSegmentedControl
                className="grid-cols-2"
                options={[
                  { label: '자동 발급', value: 'AUTO' },
                  { label: '직접 입력', value: 'MANUAL' },
                ]}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="rank"
          render={({ field }) => (
            <FgSelect
              label="직급"
              options={rankOptions}
              placeholder="직급 선택"
              value={field.value || undefined}
              onValueChange={field.onChange}
            />
          )}
        />
        <FgInput
          disabled={passwordMode === 'AUTO'}
          error={errors.initialPassword?.message}
          hint={passwordMode === 'AUTO' ? '자동 발급 시 이메일로 임시 비밀번호가 전송됩니다.' : undefined}
          inputClassName="tracking-widest"
          label="초기 비밀번호"
          leftIcon={<Lock aria-hidden className="h-4 w-4" />}
          placeholder="••••••••"
          required={passwordMode === 'MANUAL'}
          type="password"
          {...register('initialPassword')}
        />
      </form>
    </FgModal>
  )
}
