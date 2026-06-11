import { Check, Lock } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgButton, FgInput } from '@/shared/ui'

import { isPasswordValid, PASSWORD_RULES } from '../model/password-rules'
import { PasswordVisibilityToggle } from './PasswordVisibilityToggle'

export interface PasswordChangeFormProps {
  onCancel: () => void
  onSuccess: () => void
}

interface PasswordFieldState {
  value: string
  visible: boolean
}

const initialField: PasswordFieldState = { value: '', visible: false }

export function PasswordChangeForm({ onCancel, onSuccess }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState(initialField)
  const [newPassword, setNewPassword] = useState(initialField)
  const [confirmPassword, setConfirmPassword] = useState(initialField)

  const ruleInput = {
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  }
  const confirmMismatch =
    confirmPassword.value.length > 0 && confirmPassword.value !== newPassword.value
  const canSubmit =
    currentPassword.value.length > 0 &&
    isPasswordValid(ruleInput) &&
    confirmPassword.value === newPassword.value &&
    confirmPassword.value.length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    onSuccess()
  }

  return (
    <form
      className="flex w-full max-w-auth-card-lg flex-col gap-5 rounded-modal bg-surface p-9 shadow-login"
      onSubmit={handleSubmit}
    >
      <FgInput
        autoComplete="current-password"
        inputClassName="tracking-widest"
        label="현재 비밀번호"
        leftIcon={<Lock aria-hidden className="h-5 w-5" />}
        placeholder="••••••••"
        rightIcon={
          <PasswordVisibilityToggle
            visible={currentPassword.visible}
            onToggle={() => setCurrentPassword((field) => ({ ...field, visible: !field.visible }))}
          />
        }
        size="lg"
        type={currentPassword.visible ? 'text' : 'password'}
        value={currentPassword.value}
        onChange={(event) => setCurrentPassword((field) => ({ ...field, value: event.target.value }))}
      />
      <FgInput
        autoComplete="new-password"
        inputClassName="tracking-widest"
        label="새 비밀번호"
        leftIcon={<Lock aria-hidden className="h-5 w-5" />}
        placeholder="••••••••"
        rightIcon={
          <PasswordVisibilityToggle
            visible={newPassword.visible}
            onToggle={() => setNewPassword((field) => ({ ...field, visible: !field.visible }))}
          />
        }
        size="lg"
        type={newPassword.visible ? 'text' : 'password'}
        value={newPassword.value}
        onChange={(event) => setNewPassword((field) => ({ ...field, value: event.target.value }))}
      />
      <FgInput
        autoComplete="new-password"
        error={confirmMismatch ? '새 비밀번호와 일치하지 않습니다.' : undefined}
        inputClassName="tracking-widest"
        label="새 비밀번호 확인"
        leftIcon={<Lock aria-hidden className="h-5 w-5" />}
        placeholder="••••••••"
        rightIcon={
          <PasswordVisibilityToggle
            visible={confirmPassword.visible}
            onToggle={() => setConfirmPassword((field) => ({ ...field, visible: !field.visible }))}
          />
        }
        size="lg"
        type={confirmPassword.visible ? 'text' : 'password'}
        value={confirmPassword.value}
        onChange={(event) => setConfirmPassword((field) => ({ ...field, value: event.target.value }))}
      />
      <div className="grid grid-cols-2 gap-x-7 gap-y-3.5 rounded-control-lg border border-dashed border-line px-5 py-4">
        {PASSWORD_RULES.map((rule) => {
          const satisfied = rule.isSatisfied(ruleInput)

          return (
            <span key={rule.id} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border transition-colors',
                  satisfied ? 'border-primary bg-primary text-surface' : 'border-line bg-surface text-transparent',
                )}
              >
                <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className={cn('text-label', satisfied ? 'font-semibold text-ink-2' : 'text-faint')}>
                {rule.label}
              </span>
            </span>
          )
        })}
      </div>
      <FgButton className="h-13 w-full text-body" disabled={!canSubmit} type="submit" variant="primary">
        변경
      </FgButton>
      <button
        className="mx-auto text-label text-muted transition-colors hover:text-ink-2"
        type="button"
        onClick={onCancel}
      >
        취소
      </button>
    </form>
  )
}
